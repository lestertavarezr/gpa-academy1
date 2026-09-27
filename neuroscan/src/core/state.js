import { isValidTime } from "./dates.js";

export const STATE_VERSION = 2;
export const APP_ID = "NEURO//SCAN";
export const MAX_BACKUP_BYTES = 1_000_000;
const CONFIDENCE = ["Baja", "Media", "Alta"];
const REFLECTION_LIMITS = { reading: 55, finding: 60 };

export function defaultState() {
  return {
    version: STATE_VERSION,
    updatedAt: 0,
    epoch: 0,
    done: [],
    answers: {},
    choices: {},
    current: 0,
    selected: null,
    mode: "practice",
    reflections: {},
    srs: {},
    sessionQueue: [],
    sessionDone: [],
    sessionAnswers: {},
    sessionDay: "",
    sessionModule: null,
    activityDays: [],
    reminderPrefs: { enabled: false, time: "19:00" },
    xpTotal: 0,
    sessionXP: 0,
    dailyBonusDay: "",
    dailyBonusClaimed: false,
    streakBonuses: [],
  };
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const finite = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// v1 (the original single-file app) had no `version` field; its shape is otherwise a subset of v2.
export function migrateState(raw) {
  if (!isObject(raw)) return {};
  const version = Number.isInteger(raw.version) ? raw.version : 1;
  if (version > STATE_VERSION) throw new Error(`Versión de progreso no soportada: ${version}`);
  let state = { ...raw };
  if (version < 2) state = { ...state, version: 2, updatedAt: 0 };
  return state;
}

// Rebuilds state from untrusted input (localStorage, host widget state, backups, server).
// Only keys that are valid challenge ids survive, which also drops `__proto__`-style keys.
export function sanitizeState(input, { challengeCount }) {
  const raw = migrateState(input);
  const base = defaultState();
  const validId = (id) => Number.isInteger(id) && id >= 1 && id <= challengeCount;
  const ids = (list) => (Array.isArray(list) ? [...new Set(list.filter(validId))] : []);
  const perId = (obj, pick) => {
    const out = {};
    if (!isObject(obj)) return out;
    for (const [key, value] of Object.entries(obj)) {
      const id = Number(key);
      if (!validId(id)) continue;
      const clean = pick(value);
      if (clean !== undefined) out[id] = clean;
    }
    return out;
  };
  const score = (v) => (v === 100 || v === 0 ? v : undefined);

  const state = {
    ...base,
    updatedAt: Math.max(0, finite(raw.updatedAt)),
    epoch: Math.max(0, finite(raw.epoch)),
    done: ids(raw.done),
    answers: perId(raw.answers, score),
    choices: perId(raw.choices, (v) => (Number.isInteger(v) && v >= 0 && v <= 3 ? v : undefined)),
    current: Number.isInteger(raw.current) ? Math.max(0, Math.min(challengeCount - 1, raw.current)) : 0,
    selected: Number.isInteger(raw.selected) && raw.selected >= 0 && raw.selected <= 3 ? raw.selected : null,
    mode: raw.mode === "exam" ? "exam" : "practice",
    reflections: perId(raw.reflections, (v) => {
      if (!isObject(v)) return undefined;
      const entry = {};
      for (const [field, limit] of Object.entries(REFLECTION_LIMITS)) {
        if (typeof v[field] === "string" && v[field]) entry[field] = v[field].slice(0, limit);
      }
      if (CONFIDENCE.includes(v.confidence)) entry.confidence = v.confidence;
      return Object.keys(entry).length ? entry : undefined;
    }),
    srs: perId(raw.srs, (v) => {
      if (!isObject(v)) return undefined;
      return {
        streak: Math.max(0, Math.trunc(finite(v.streak))),
        interval: Math.max(0, Math.trunc(finite(v.interval))),
        dueAt: Math.max(0, finite(v.dueAt)),
        reviews: Math.max(0, Math.trunc(finite(v.reviews))),
      };
    }),
    sessionQueue: ids(raw.sessionQueue),
    sessionDone: ids(raw.sessionDone),
    sessionAnswers: perId(raw.sessionAnswers, score),
    sessionDay: typeof raw.sessionDay === "string" && DAY_RE.test(raw.sessionDay) ? raw.sessionDay : "",
    sessionModule: Number.isInteger(raw.sessionModule) && raw.sessionModule >= 0 ? raw.sessionModule : null,
    activityDays: Array.isArray(raw.activityDays)
      ? [...new Set(raw.activityDays.filter((d) => typeof d === "string" && DAY_RE.test(d)))].sort().slice(-90)
      : [],
    reminderPrefs: {
      enabled: isObject(raw.reminderPrefs) && raw.reminderPrefs.enabled === true,
      time: isObject(raw.reminderPrefs) && isValidTime(raw.reminderPrefs.time) ? raw.reminderPrefs.time : "19:00",
    },
    xpTotal: Math.max(0, Math.trunc(finite(raw.xpTotal))),
    sessionXP: Math.max(0, Math.trunc(finite(raw.sessionXP))),
    dailyBonusDay: typeof raw.dailyBonusDay === "string" && DAY_RE.test(raw.dailyBonusDay) ? raw.dailyBonusDay : "",
    dailyBonusClaimed: raw.dailyBonusClaimed === true,
    streakBonuses: Array.isArray(raw.streakBonuses) ? [...new Set(raw.streakBonuses.filter((d) => [3, 7, 14, 30].includes(d)))] : [],
  };
  // v1 kept progress in `done` without SRS cards; schedule those for review immediately.
  if (state.done.length && !Object.keys(state.srs).length) {
    for (const id of state.done) state.srs[id] = { streak: 0, interval: 0, dueAt: 1, reviews: 0 };
  }
  return state;
}

// Merges `local` with a sanitized state from another device. A reset bumps `epoch`, and the
// higher epoch wins outright so a deliberate reset is not undone by the other device's history.
// Within an epoch, learning history (per-card SRS,
// answers, reflections) takes the side with more reviews of that card; the active session comes
// from whichever device wrote last. Reminder prefs stay local because notification permission
// and push subscriptions are per device. XP takes the max: the two totals may already overlap,
// so summing would double count.
export function mergeStates(local, remote) {
  const a = local;
  const b = remote;
  if (a.epoch !== b.epoch) return { ...(a.epoch > b.epoch ? a : b), reminderPrefs: a.reminderPrefs };
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const merged = { ...newer, reminderPrefs: a.reminderPrefs };
  merged.done = [...new Set([...a.done, ...b.done])].sort((x, y) => x - y);
  merged.srs = {};
  merged.answers = {};
  merged.choices = {};
  merged.reflections = {};
  const ids = new Set([...Object.keys(a.srs), ...Object.keys(b.srs), ...Object.keys(a.answers), ...Object.keys(b.answers)]);
  for (const id of ids) {
    const ca = a.srs[id];
    const cb = b.srs[id];
    let winner;
    if (ca && cb) {
      winner = ca.reviews !== cb.reviews ? (ca.reviews > cb.reviews ? a : b) : ca.dueAt >= cb.dueAt ? a : b;
    } else {
      winner = ca ? a : cb ? b : a.answers[id] !== undefined ? a : b;
    }
    const loser = winner === a ? b : a;
    if (winner.srs[id]) merged.srs[id] = winner.srs[id];
    for (const field of ["answers", "choices", "reflections"]) {
      const value = winner[field][id] ?? loser[field][id];
      if (value !== undefined) merged[field][id] = value;
    }
  }
  merged.activityDays = [...new Set([...a.activityDays, ...b.activityDays])].sort().slice(-90);
  merged.streakBonuses = [...new Set([...a.streakBonuses, ...b.streakBonuses])].sort((x, y) => x - y);
  merged.xpTotal = Math.max(a.xpTotal, b.xpTotal);
  const bonusDay = [a, b].filter((s) => s.dailyBonusClaimed).map((s) => s.dailyBonusDay).sort().at(-1);
  if (bonusDay && bonusDay >= newer.dailyBonusDay) {
    merged.dailyBonusDay = bonusDay;
    merged.dailyBonusClaimed = true;
  }
  merged.updatedAt = Math.max(a.updatedAt, b.updatedAt);
  return merged;
}

export function exportPayload(state, now = new Date()) {
  return { app: APP_ID, version: STATE_VERSION, exportedAt: now.toISOString(), state };
}

export function parseBackup(text, { challengeCount }) {
  if (typeof text !== "string" || text.length > MAX_BACKUP_BYTES) throw new Error("El respaldo supera el límite de 1 MB.");
  const payload = JSON.parse(text);
  if (!isObject(payload) || payload.app !== APP_ID || ![1, 2].includes(payload.version) || !isObject(payload.state)) {
    throw new Error("Formato no válido");
  }
  const state = payload.version === 1 ? { ...payload.state, version: 1 } : payload.state;
  return sanitizeState(state, { challengeCount });
}
