// Lets the academic team edit the question bank in a spreadsheet:
//   npm run content:export-csv   → content/challenges.csv (UTF-8, opens in Excel / Google Sheets)
//   npm run content:import-csv   → validates the CSV and rewrites content/challenges.json
// In the CSV, "correcta" is the letter (A–D) of the right option and "imagenes" lists media keys separated by "|".
import fs from "node:fs";
import { validateContent } from "../src/core/content.js";

const url = (file) => new URL(`../content/${file}`, import.meta.url);
const COLUMNS = ["id", "modulo", "dificultad", "titulo", "caso", "pregunta", "competencia", "opcion_a", "opcion_b", "opcion_c", "opcion_d", "correcta", "explicacion", "fuente", "imagenes"];
const LETTERS = ["A", "B", "C", "D"];

export function toCSV(rows) {
  const cell = (value) => {
    const text = String(value ?? "");
    return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}

export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((value) => value.trim() !== ""));
}

export function challengesToRows(challenges, modules) {
  return [
    COLUMNS,
    ...challenges.map((c) => [c.id, modules[c.module], c.difficulty, c.title, c.caseText, c.question, c.competency, ...c.options, LETTERS[c.answer], c.explanation, c.source, c.media.join("|")]),
  ];
}

export function rowsToChallenges(rows, modules) {
  const [header, ...body] = rows;
  if (header.join(",") !== COLUMNS.join(",")) throw new Error(`Encabezados esperados: ${COLUMNS.join(", ")}`);
  return body.map((r, index) => {
    const get = (name) => (r[COLUMNS.indexOf(name)] ?? "").trim();
    const module = modules.indexOf(get("modulo"));
    return {
      id: Number(get("id")) || index + 1,
      module: module >= 0 ? module : -1,
      difficulty: get("dificultad"),
      title: get("titulo"),
      caseText: get("caso"),
      question: get("pregunta"),
      competency: get("competencia"),
      options: ["opcion_a", "opcion_b", "opcion_c", "opcion_d"].map(get),
      answer: LETTERS.indexOf(get("correcta").toUpperCase()),
      explanation: get("explicacion"),
      source: get("fuente"),
      media: get("imagenes") ? get("imagenes").split("|").map((k) => k.trim()).filter(Boolean) : [],
    };
  });
}

const command = process.argv[2];
if (command) {
  const modules = JSON.parse(fs.readFileSync(url("modules.json")));
  if (command === "export") {
    const challenges = JSON.parse(fs.readFileSync(url("challenges.json")));
    fs.writeFileSync(url("challenges.csv"), "﻿" + toCSV(challengesToRows(challenges, modules)));
    console.log("✓ content/challenges.csv exportado. Edítalo y ejecuta npm run content:import-csv");
  } else if (command === "import") {
    const challenges = rowsToChallenges(parseCSV(fs.readFileSync(url("challenges.csv"), "utf8")), modules);
    const errors = validateContent({ modules, challenges, media: JSON.parse(fs.readFileSync(url("media.json"))) });
    if (errors.length) {
      console.error(`✗ No se importó nada. ${errors.length} problemas:\n- ${errors.join("\n- ")}`);
      process.exit(1);
    }
    fs.writeFileSync(url("challenges.json"), JSON.stringify(challenges, null, 2) + "\n");
    console.log(`✓ ${challenges.length} desafíos importados en content/challenges.json. Revisa el diff antes de publicar.`);
  } else {
    console.error("Uso: node scripts/content-csv.mjs export|import");
    process.exit(1);
  }
}
