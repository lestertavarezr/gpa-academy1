import { optionOrder } from "./shuffle.js";

export const DIFFICULTIES = ["Básica", "Intermedia", "Avanzada"];

// Authored content keeps the correct option wherever the author put it; the display order is
// shuffled per challenge. `order[displayIndex]` maps back to the authored index for analytics.
export function buildChallenges(authored) {
  return authored.map((c) => {
    const order = optionOrder(c.id, c.options.length);
    return {
      ...c,
      order,
      options: order.map((i) => c.options[i]),
      answer: order.indexOf(c.answer),
    };
  });
}

// Returns a list of human-readable problems; an empty list means the content is publishable.
export function validateContent({ modules, challenges, media }) {
  const errors = [];
  const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
  if (!Array.isArray(modules) || !modules.length || !modules.every(nonEmpty)) errors.push("modules.json: debe ser una lista de nombres no vacíos");
  if (!Array.isArray(challenges)) return [...errors, "challenges.json: debe ser una lista"];
  challenges.forEach((c, index) => {
    const where = `desafío #${c?.id ?? `(posición ${index})`}`;
    if (c.id !== index + 1) errors.push(`${where}: los ids deben ser consecutivos desde 1 (se esperaba ${index + 1})`);
    if (!Number.isInteger(c.module) || c.module < 0 || c.module >= modules.length) errors.push(`${where}: módulo inexistente (${c.module})`);
    if (!DIFFICULTIES.includes(c.difficulty)) errors.push(`${where}: dificultad debe ser una de ${DIFFICULTIES.join(", ")}`);
    for (const field of ["title", "caseText", "question", "competency", "explanation", "source"]) {
      if (!nonEmpty(c[field])) errors.push(`${where}: el campo "${field}" está vacío`);
    }
    if (!Array.isArray(c.options) || c.options.length !== 4 || !c.options.every(nonEmpty)) {
      errors.push(`${where}: debe tener exactamente 4 opciones no vacías`);
    } else if (new Set(c.options.map((o) => o.trim().toLowerCase())).size !== 4) {
      errors.push(`${where}: hay opciones repetidas`);
    }
    if (!Number.isInteger(c.answer) || c.answer < 0 || c.answer > 3) errors.push(`${where}: "answer" debe ser un índice entre 0 y 3`);
    if (!Array.isArray(c.media)) {
      errors.push(`${where}: "media" debe ser una lista`);
    } else {
      if (new Set(c.media).size !== c.media.length) errors.push(`${where}: imagen repetida en "media"`);
      for (const key of c.media) if (!media?.[key]) errors.push(`${where}: imagen desconocida "${key}"`);
    }
  });
  for (const [key, m] of Object.entries(media || {})) {
    if (!/^[a-z0-9-]+$/.test(key)) errors.push(`media "${key}": la clave solo admite a-z, 0-9 y guiones`);
    if (!nonEmpty(m.file) || !/\.webp$/.test(m.file)) errors.push(`media "${key}": "file" debe ser un .webp`);
    for (const field of ["alt", "caption", "source"]) if (!nonEmpty(m[field])) errors.push(`media "${key}": el campo "${field}" está vacío`);
    if (!Number.isInteger(m.width) || !Number.isInteger(m.height)) errors.push(`media "${key}": faltan width/height`);
  }
  return errors;
}

export function unusedMedia({ challenges, media }) {
  const used = new Set(challenges.flatMap((c) => c.media));
  return Object.keys(media).filter((key) => !used.has(key));
}
