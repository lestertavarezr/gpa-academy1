// Registro de decisiones del alumno e informe exportable para el docente.
// El informe es un JSON que el panel docente (docente.html) sabe leer.

import { LMS } from "./lms.js";

const LOG_KEY = "gpa-guardia-quirofano-log-v1";
const MAX_LOG = 500;

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const Report = {
  /**
   * Registra una decisión. `kind` identifica el punto de decisión dentro de
   * la misión (identity, equipment, challenge, event:gasa, pause:identity…).
   */
  log({
    mission,
    module,
    missionTitle,
    kind,
    question,
    answer,
    correct,
    mode,
  }) {
    const entry = {
      m: mission,
      mod: module,
      mt: missionTitle,
      k: kind,
      q: String(question || "").slice(0, 160),
      a: String(answer || "").slice(0, 200),
      ok: !!correct,
      g: mode === "guardia" ? 1 : 0,
      t: Date.now(),
    };
    const log = read(LOG_KEY) || [];
    log.push(entry);
    write(LOG_KEY, log.slice(-MAX_LOG));
    LMS.interaction({
      id: `m${String(mission + 1).padStart(2, "0")}-${kind}`,
      question: `${missionTitle}: ${question}`,
      answer,
      correct,
    });
  },

  logMayo({ asked, picked, ok }) {
    const log = read(LOG_KEY) || [];
    log.push({
      mayo: 1,
      k: asked,
      a: picked || "tiempo",
      ok: !!ok,
      t: Date.now(),
    });
    write(LOG_KEY, log.slice(-MAX_LOG));
  },

  entries() {
    return read(LOG_KEY) || [];
  },

  /** Construye el informe completo del alumno. */
  build({ name, missions, best, stars, progress }) {
    const log = this.entries();
    return {
      app: "guardia-quirofano",
      version: 1,
      exportedAt: new Date().toISOString(),
      student: {
        name: name || LMS.learnerName || "Sin nombre",
        lmsId: LMS.learnerId || null,
      },
      missions: missions.map((m, i) => ({
        index: i,
        module: m.module,
        title: m.title,
        best: Number(best[i]) || 0,
        stars: Number(stars[i]) || 0,
        guardia: (progress.guardia || []).includes(i),
      })),
      decisions: log.filter((e) => !e.mayo),
      mayo: {
        best: progress.mayoBest || 0,
        picks: log
          .filter((e) => e.mayo)
          .map(({ k, a, ok, t }) => ({ asked: k, picked: a, ok, t })),
      },
      medals: Object.keys(progress.medals || {}),
      streak: progress.streak || 0,
      lastDay: progress.lastDay || null,
    };
  },

  download(report) {
    const blob = new Blob([JSON.stringify(report, null, 1)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a"),
      slug = report.student.name
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^\w]+/g, "-")
        .toLowerCase();
    a.href = url;
    a.download = `informe-guardia-${slug || "alumno"}-${report.exportedAt.slice(0, 10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
