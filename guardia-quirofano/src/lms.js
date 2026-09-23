// Adaptador SCORM 1.2 / 2004. Si el juego se abre dentro de una LMS que
// expone la API SCORM, este módulo:
//  - toma el nombre del alumno,
//  - restaura su progreso desde cmi.suspend_data (y aísla el de otros alumnos
//    que usen el mismo navegador),
//  - envía la nota, el estado y cada decisión como interacción,
//  - guarda el tiempo de sesión al salir.
// Sin LMS, todo sigue funcionando con el almacenamiento local del navegador.
//
// Debe importarse antes que el resto del juego: restaura el almacenamiento
// antes de que nadie lo lea.

const SYNC_KEYS = {
  b: "gpa-guardia-quirofano-best-v4",
  s: "gpa-guardia-quirofano-stars-v1",
  p: "gpa-guardia-quirofano-progress-v1",
  m: "gpa-guardia-quirofano-mode",
};
const LOCAL_ONLY = [
  "gpa-guardia-quirofano-save-v4",
  "gpa-guardia-quirofano-log-v1",
];

function findApi(start) {
  let win = start;
  for (let i = 0; win && i < 12; i++) {
    try {
      if (win.API_1484_11) return { version: "2004", api: win.API_1484_11 };
      if (win.API) return { version: "1.2", api: win.API };
    } catch {
      return null; // ventana de otro origen
    }
    if (win.parent === win) break;
    win = win.parent;
  }
  return null;
}

const found =
  findApi(window) || (window.opener ? findApi(window.opener) : null);
const is2004 = found?.version === "2004";
const api = found?.api;
let connected = !1;
let interactionCount = 0;
const started = Date.now();

function call(name12, name2004, ...args) {
  try {
    return api[is2004 ? name2004 : name12](...args);
  } catch {
    return "";
  }
}
const get = (k12, k2004) =>
  call("LMSGetValue", "GetValue", is2004 ? k2004 : k12);
const set = (k12, k2004, v) =>
  call("LMSSetValue", "SetValue", is2004 ? k2004 : k12, String(v));
const commit = () => call("LMSCommit", "Commit", "");

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}
function writeLocal(key, value) {
  try {
    value == null
      ? localStorage.removeItem(key)
      : localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function duration12(ms) {
  const s = Math.floor(ms / 1000),
    h = String(Math.floor(s / 3600)).padStart(4, "0"),
    m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  return `${h}:${m}:${String(s % 60).padStart(2, "0")}`;
}
function duration2004(ms) {
  const s = Math.floor(ms / 1000);
  return `PT${Math.floor(s / 3600)}H${Math.floor((s % 3600) / 60)}M${s % 60}S`;
}

if (api) {
  const ok = String(call("LMSInitialize", "Initialize", "")) === "true";
  connected = ok;
  if (ok) {
    // El progreso de la LMS manda: en un ordenador compartido, el
    // almacenamiento local puede ser de otro alumno.
    let snapshot = null;
    try {
      snapshot = JSON.parse(
        get("cmi.suspend_data", "cmi.suspend_data") || "null",
      );
    } catch {}
    for (const [short, key] of Object.entries(SYNC_KEYS))
      writeLocal(key, snapshot?.[short] ?? null);
    const owner = get("cmi.core.student_id", "cmi.learner_id");
    readLocal("gpa-guardia-quirofano-owner") !== owner &&
      LOCAL_ONLY.forEach((k) => writeLocal(k, null));
    writeLocal("gpa-guardia-quirofano-owner", owner);
    interactionCount =
      Number(get("cmi.interactions._count", "cmi.interactions._count")) || 0;
    const status = get("cmi.core.lesson_status", "cmi.completion_status");
    (!status || status === "not attempted" || status === "unknown") &&
      (is2004
        ? set("", "cmi.completion_status", "incomplete")
        : set("cmi.core.lesson_status", "", "incomplete"));
    commit();
  }
}

// La LMS da el nombre como «Apellido, Nombre».
function learnerName() {
  if (!connected) return "";
  const raw = get("cmi.core.student_name", "cmi.learner_name") || "";
  const [last, first] = raw.split(",").map((s) => s.trim());
  return first ? `${first} ${last}` : raw;
}

export const LMS = {
  connected,
  version: found?.version || null,
  learnerName: learnerName(),
  learnerId: connected ? get("cmi.core.student_id", "cmi.learner_id") : "",

  /** Guarda el progreso en la LMS (medallas, mejores notas, modo). */
  saveProgress() {
    if (!connected) return;
    const snapshot = {};
    for (const [short, key] of Object.entries(SYNC_KEYS))
      snapshot[short] = readLocal(key);
    let text = JSON.stringify(snapshot);
    // SCORM 1.2 admite 4096 caracteres: si no cabe, se descartan las fechas.
    if (!is2004 && text.length > 4000 && snapshot.p?.medals) {
      snapshot.p = {
        ...snapshot.p,
        medals: Object.fromEntries(
          Object.keys(snapshot.p.medals).map((k) => [k, 1]),
        ),
      };
      text = JSON.stringify(snapshot);
    }
    set("cmi.suspend_data", "cmi.suspend_data", text);
    commit();
  },

  /** Nota 0-100 y estado a partir de las misiones requeridas. */
  report({ score, done, required, passingScore }) {
    if (!connected) return;
    const s = Math.round(score);
    set("cmi.core.score.min", "cmi.score.min", 0);
    set("cmi.core.score.max", "cmi.score.max", 100);
    set("cmi.core.score.raw", "cmi.score.raw", s);
    is2004 && set("", "cmi.score.scaled", (s / 100).toFixed(2));
    const complete = done >= required;
    if (is2004) {
      set("", "cmi.completion_status", complete ? "completed" : "incomplete");
      set(
        "",
        "cmi.success_status",
        complete ? (s >= passingScore ? "passed" : "failed") : "unknown",
      );
    } else
      set(
        "cmi.core.lesson_status",
        "",
        complete ? (s >= passingScore ? "passed" : "failed") : "incomplete",
      );
    commit();
  },

  /** Una decisión del alumno como interacción SCORM (informes de la LMS). */
  interaction({ id, question, answer, correct }) {
    if (!connected) return;
    const n = interactionCount++,
      base = `cmi.interactions.${n}`,
      safeId = id.replace(/[^\w.-]/g, "_").slice(0, 250);
    set(`${base}.id`, `${base}.id`, safeId);
    set(`${base}.type`, `${base}.type`, "fill-in");
    set(
      `${base}.student_response`,
      `${base}.learner_response`,
      String(answer).slice(0, 250),
    );
    set(
      `${base}.result`,
      `${base}.result`,
      correct ? "correct" : is2004 ? "incorrect" : "wrong",
    );
    is2004 && set("", `${base}.description`, String(question).slice(0, 250));
    is2004 &&
      set("", `${base}.timestamp`, new Date().toISOString().slice(0, 19));
  },

  finish() {
    if (!connected) return;
    // El progreso ya se guardó al terminar cada misión, medalla o partida;
    // no se vuelve a escribir aquí para no pisarlo con un estado local vacío.
    const t = Date.now() - started;
    set(
      "cmi.core.session_time",
      "cmi.session_time",
      is2004 ? duration2004(t) : duration12(t),
    );
    set("cmi.core.exit", "cmi.exit", "suspend");
    commit();
    call("LMSFinish", "Terminate", "");
    connected = !1;
    this.connected = !1;
  },
};

connected && window.addEventListener("pagehide", () => LMS.finish());
