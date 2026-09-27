// Compact progress encoding for LMS storage. SCORM 1.2 caps cmi.suspend_data at 4096
// characters, so the full state (~15 KB with reflections) is squeezed into short arrays.
// Decoding returns a raw state that callers must still pass through sanitizeState.
export const SCORM12_LIMIT = 4096;
const MINUTE = 60_000;
const DAY = 86_400_000;
const CONFIDENCE = ["", "Baja", "Media", "Alta"];

const dayNumber = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY);
};
const dayKey = (n) => new Date(n * DAY).toISOString().slice(0, 10);

export function encodeCompact(state, { limit = SCORM12_LIMIT } = {}) {
  const payload = {
    v: 1,
    u: Math.round(state.updatedAt / 1000),
    // [id, streak, interval, dueAt in minutes (rounded up so "due now" stays due), reviews, last answer, last choice]
    c: state.done.map((id) => {
      const card = state.srs[id] || {};
      const answer = state.answers[id];
      return [id, card.streak || 0, card.interval || 0, Math.ceil((card.dueAt || 0) / MINUTE), card.reviews || 0, answer === 100 ? 1 : answer === 0 ? 0 : -1, state.choices[id] ?? -1];
    }),
    a: state.activityDays.slice(-40).map(dayNumber),
    x: state.xpTotal,
    sx: state.sessionXP,
    b: [state.dailyBonusDay ? dayNumber(state.dailyBonusDay) : 0, state.dailyBonusClaimed ? 1 : 0],
    sb: state.streakBonuses,
    s: [state.sessionDay ? dayNumber(state.sessionDay) : 0, state.sessionModule ?? -1, state.current, state.selected ?? -1, state.mode === "exam" ? 1 : 0],
    q: state.sessionQueue,
    k: state.sessionDone,
    r: state.sessionDone.map((id) => (state.sessionAnswers[id] === 100 ? 1 : 0)),
    f: {},
  };
  // Reflections are the only optional part: keep the current session's first, then the most
  // recent ids, for as long as they fit.
  const reflectionIds = [...new Set([...state.sessionDone, ...Object.keys(state.reflections).map(Number).sort((a, b) => b - a)])];
  let text = JSON.stringify(payload);
  for (const id of reflectionIds) {
    const r = state.reflections[id];
    if (!r) continue;
    payload.f[id] = [r.reading || "", r.finding || "", Math.max(0, CONFIDENCE.indexOf(r.confidence || ""))];
    const next = JSON.stringify(payload);
    if (next.length > limit) delete payload.f[id];
    else text = next;
  }
  return text;
}

export function decodeCompact(text) {
  const p = JSON.parse(text);
  if (!p || p.v !== 1 || !Array.isArray(p.c)) throw new Error("Formato de progreso desconocido");
  const entries = (list, fn) => Object.fromEntries(list.map(fn).filter(Boolean));
  const [sessionDay, sessionModule, current, selected, exam] = Array.isArray(p.s) ? p.s : [];
  const done = Array.isArray(p.k) ? p.k : [];
  const sessionBits = Array.isArray(p.r) ? p.r : [];
  return {
    version: 2,
    updatedAt: (Number(p.u) || 0) * 1000,
    done: p.c.map((e) => e[0]),
    srs: entries(p.c, ([id, streak, interval, due, reviews]) => [id, { streak, interval, dueAt: due * MINUTE, reviews }]),
    answers: entries(p.c, ([id, , , , , answer]) => answer >= 0 && [id, answer ? 100 : 0]),
    choices: entries(p.c, ([id, , , , , , choice]) => choice >= 0 && [id, choice]),
    reflections: entries(Object.entries(p.f || {}), ([id, [reading, finding, conf]]) => [id, { reading, finding, confidence: CONFIDENCE[conf] || "" }]),
    activityDays: (Array.isArray(p.a) ? p.a : []).map(dayKey),
    xpTotal: p.x,
    sessionXP: p.sx,
    dailyBonusDay: Array.isArray(p.b) && p.b[0] ? dayKey(p.b[0]) : "",
    dailyBonusClaimed: Array.isArray(p.b) && p.b[1] === 1,
    streakBonuses: p.sb,
    sessionDay: sessionDay ? dayKey(sessionDay) : "",
    sessionModule: sessionModule >= 0 ? sessionModule : null,
    current,
    selected: selected >= 0 ? selected : null,
    mode: exam ? "exam" : "practice",
    sessionQueue: p.q,
    sessionDone: done,
    sessionAnswers: entries(done, (id, i) => [id, sessionBits[i] ? 100 : 0]),
  };
}
