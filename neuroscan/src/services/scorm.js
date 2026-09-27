import { SCORM12_LIMIT, decodeCompact, encodeCompact } from "../core/compact.js";

const COMMIT_DELAY_MS = 2000;

// SCORM 1.2 discovery: the LMS exposes `API` on an ancestor frame, or on the opener when
// the package is launched in a new window.
export function findScormApi(win = globalThis.window) {
  const search = (start) => {
    let w = start;
    for (let depth = 0; w && depth < 10; depth++) {
      try {
        if (w.API && typeof w.API.LMSInitialize === "function") return w.API;
      } catch {
        // Cross-origin ancestor: keep climbing.
      }
      if (w.parent === w) break;
      w = w.parent;
    }
    return null;
  };
  return search(win) ?? (win?.opener ? search(win.opener) : null);
}

// Grade = share of the cases whose latest answer was right, so it grows with the work done.
// Status stays "incomplete" on purpose: Moodle reopens a completed attempt in read-only review
// mode, and a new attempt starts with empty suspend_data, which would lock learners out of their
// spaced-repetition history. Completion is tracked through the grade instead ("grade to pass").
export function scormProgress(state, challengeCount) {
  const correct = Object.values(state.answers).filter((score) => score === 100).length;
  return { score: Math.round((correct / challengeCount) * 100), status: "incomplete" };
}

export function sessionTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.min(9999, Math.floor(total / 3600))).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// Progress store backed by the LMS (cmi.suspend_data). It deliberately never falls back to
// localStorage for loading: on a shared computer that would show another learner's progress.
export function createScormStore({ api, challengeCount, clock = Date.now, commitDelay = COMMIT_DELAY_MS, target = globalThis }) {
  const ok = (result) => String(result) === "true";
  if (!ok(api.LMSInitialize("")) && String(api.LMSGetLastError()) !== "101") return null;
  const startedAt = clock();
  const reviewMode = ["review", "browse"].includes(api.LMSGetValue("cmi.core.lesson_mode"));
  let timer = null;
  let finished = false;

  const set = (element, value) => ok(api.LMSSetValue(element, String(value)));
  const commit = () => {
    clearTimeout(timer);
    timer = null;
    if (!finished) api.LMSCommit("");
  };

  function finish() {
    if (finished) return;
    if (!reviewMode) {
      set("cmi.core.session_time", sessionTime(clock() - startedAt));
      set("cmi.core.exit", "suspend");
    }
    commit();
    api.LMSFinish("");
    finished = true;
  }
  target.addEventListener?.("pagehide", finish);
  target.addEventListener?.("beforeunload", finish);

  return {
    finish,
    load() {
      const data = api.LMSGetValue("cmi.suspend_data");
      if (!data) return null;
      try {
        return decodeCompact(data);
      } catch {
        return null;
      }
    },
    save(state) {
      if (finished) return { ok: false, message: "La sesión con Moodle se cerró. Vuelve a abrir la actividad para seguir guardando." };
      if (reviewMode) return { ok: false, message: "Estás en modo revisión de Moodle: lo que hagas en esta visita no se guardará." };
      const data = encodeCompact(state, { limit: SCORM12_LIMIT });
      const saved = data.length <= SCORM12_LIMIT && set("cmi.suspend_data", data);
      const { score, status } = scormProgress(state, challengeCount);
      set("cmi.core.score.min", 0);
      set("cmi.core.score.max", 100);
      set("cmi.core.score.raw", score);
      set("cmi.core.lesson_status", status);
      set("cmi.core.exit", "suspend");
      if (!timer) timer = setTimeout(commit, commitDelay);
      return saved
        ? { ok: true }
        : { ok: false, message: `Moodle no aceptó tu progreso (error ${api.LMSGetLastError()}). Exporta un respaldo para no perderlo.` };
    },
    onHostUpdate() {},
  };
}
