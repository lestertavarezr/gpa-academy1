// Panel docente: agrega los informes JSON que exportan los alumnos.
// Todo ocurre en el navegador; no se envía nada a ningún servidor.

import "./style.css";
import "./docente.css";
import { INSTRUMENTS } from "./instruments.js";

const $ = (s) => document.querySelector(s);
const TOTAL_MISSIONS = 20;
let students = [];
let isDemo = !1;

function el(tag, className, text) {
  const n = document.createElement(tag);
  className && (n.className = className);
  text != null && (n.textContent = text);
  return n;
}
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const instrumentName = (id) =>
  INSTRUMENTS.find((i) => i.id === id)?.name ||
  (id === "tiempo" ? "(se agotó el tiempo)" : id);

// --- Carga ---------------------------------------------------------------------

function valid(r) {
  return (
    r &&
    r.app === "guardia-quirofano" &&
    r.student?.name &&
    Array.isArray(r.missions) &&
    Array.isArray(r.decisions)
  );
}

async function loadFiles(files) {
  let added = 0,
    rejected = 0;
  for (const file of files) {
    try {
      const report = JSON.parse(await file.text());
      if (!valid(report)) throw new Error();
      add(report);
      added++;
    } catch {
      rejected++;
    }
  }
  isDemo && ((isDemo = !1), (students = students.filter((s) => !s.demo)));
  $("#status").textContent =
    `${added} informe(s) cargado(s)` +
    (rejected ? ` · ${rejected} archivo(s) no reconocido(s)` : "");
  render();
}

// Un informe por alumno: si llegan dos, se queda el más reciente.
function add(report) {
  const key = (report.student.lmsId || report.student.name)
    .trim()
    .toLowerCase();
  const i = students.findIndex((s) => s.key === key);
  const entry = { key, report, demo: !!report.demo };
  i < 0
    ? students.push(entry)
    : report.exportedAt > students[i].report.exportedAt &&
      (students[i] = entry);
}

// --- Cálculos --------------------------------------------------------------------

function summary(r) {
  const played = r.missions.filter((m) => m.best > 0);
  const dec = r.decisions;
  const last = Math.max(
    0,
    ...dec.map((d) => d.t || 0),
    ...(r.mayo?.picks || []).map((p) => p.t || 0),
  );
  return {
    name: r.student.name,
    done: played.length,
    avg: played.length
      ? Math.round(played.reduce((a, m) => a + m.best, 0) / played.length)
      : 0,
    course: Math.round(
      r.missions.reduce((a, m) => a + m.best, 0) / TOTAL_MISSIONS,
    ),
    stars: r.missions.reduce((a, m) => a + (m.stars || 0), 0),
    guardia: r.missions.filter((m) => m.guardia).length,
    safe: pct(dec.filter((d) => d.ok).length, dec.length),
    decisions: dec.length,
    medals: (r.medals || []).length,
    mayoBest: r.mayo?.best || 0,
    last: last ? new Date(last) : new Date(r.exportedAt),
  };
}

function failRanking() {
  const groups = new Map();
  for (const { report } of students)
    for (const d of report.decisions) {
      const key = `${d.m}|${d.k}`;
      const g = groups.get(key) || {
        m: d.m,
        mt: d.mt,
        q: d.q,
        n: 0,
        fails: 0,
        wrong: new Map(),
        who: new Set(),
      };
      g.n++;
      if (!d.ok) {
        g.fails++;
        g.who.add(report.student.name);
        g.wrong.set(d.a, (g.wrong.get(d.a) || 0) + 1);
      }
      groups.set(key, g);
    }
  return [...groups.values()]
    .filter((g) => g.fails)
    .sort((a, b) => b.fails - a.fails || b.fails / b.n - a.fails / a.n)
    .slice(0, 10);
}

function mayoRanking() {
  const groups = new Map();
  for (const { report } of students)
    for (const p of report.mayo?.picks || []) {
      const g = groups.get(p.asked) || {
        asked: p.asked,
        n: 0,
        fails: 0,
        confused: new Map(),
      };
      g.n++;
      if (!p.ok) {
        g.fails++;
        g.confused.set(p.picked, (g.confused.get(p.picked) || 0) + 1);
      }
      groups.set(p.asked, g);
    }
  return [...groups.values()]
    .filter((g) => g.fails)
    .sort((a, b) => b.fails - a.fails)
    .slice(0, 8);
}

const top = (map) => [...map.entries()].sort((a, b) => b[1] - a[1])[0];

// --- Render ----------------------------------------------------------------------

function tile(label, value, note) {
  const t = el("div", "t-tile");
  t.append(el("small", "", label), el("strong", "", value));
  note && t.append(el("span", "", note));
  return t;
}

function heatClass(v) {
  return v <= 0
    ? "h0"
    : v < 40
      ? "h1"
      : v < 60
        ? "h2"
        : v < 80
          ? "h3"
          : v < 95
            ? "h4"
            : "h5";
}

function rankRow({ title, detail, value, max, label, tip }) {
  const li = el("li");
  li.title = tip;
  const head = el("div", "t-rank-head");
  head.append(el("strong", "", title), el("span", "t-rank-value", label));
  const bar = el("div", "t-bar");
  const fill = el("span");
  fill.style.width = `${Math.max(4, (value / max) * 100)}%`;
  bar.append(fill);
  li.append(head, bar, el("p", "", detail));
  return li;
}

function render() {
  const has = students.length > 0;
  $("#dashboard").hidden = !has;
  $("#csv").hidden = !has;
  $("#clear").hidden = !has;
  $("#demo-banner").hidden = !isDemo;
  if (!has) return;

  const rows = students
    .map((s) => summary(s.report))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  // Indicadores
  const tiles = $("#tiles");
  tiles.replaceChildren(
    tile("Alumnos", String(rows.length)),
    tile(
      "Misiones completadas",
      `${(rows.reduce((a, r) => a + r.done, 0) / rows.length).toFixed(1)} / ${TOTAL_MISSIONS}`,
      "media por alumno",
    ),
    tile(
      "Nota media",
      String(Math.round(rows.reduce((a, r) => a + r.avg, 0) / rows.length)),
      "en las misiones jugadas",
    ),
    tile(
      "Decisiones seguras",
      `${pct(
        students.reduce(
          (a, s) => a + s.report.decisions.filter((d) => d.ok).length,
          0,
        ),
        students.reduce((a, s) => a + s.report.decisions.length, 0),
      )} %`,
      "a la primera, toda la clase",
    ),
  );

  // Tabla de alumnos
  const table = $("#students");
  table.replaceChildren();
  const cols = [
    ["Alumno", (r) => r.name],
    ["Completadas", (r) => `${r.done}/${TOTAL_MISSIONS}`],
    ["Nota media", (r) => (r.done ? r.avg : "—")],
    ["Nota del curso", (r) => r.course],
    ["Decisiones seguras", (r) => (r.decisions ? `${r.safe} %` : "—")],
    ["Estrellas", (r) => r.stars],
    ["Guardia", (r) => r.guardia],
    ["Medallas", (r) => r.medals],
    ["Mesa de Mayo", (r) => r.mayoBest || "—"],
    ["Última actividad", (r) => r.last.toLocaleDateString("es")],
  ];
  const thead = el("thead"),
    htr = el("tr");
  cols.forEach(([h]) => htr.append(el("th", "", h)));
  thead.append(htr);
  const tbody = el("tbody");
  rows.forEach((r) => {
    const tr = el("tr");
    cols.forEach(([, f], i) =>
      tr.append(el(i ? "td" : "th", "", String(f(r)))),
    );
    tbody.append(tr);
  });
  table.append(thead, tbody);

  // Matriz misión × alumno
  const heat = $("#heat");
  heat.replaceChildren();
  const hh = el("thead"),
    hr = el("tr");
  hr.append(el("th", "", "Alumno"));
  for (let i = 0; i < TOTAL_MISSIONS; i++) {
    const th = el("th", "", String(i + 1).padStart(2, "0"));
    th.title = students[0].report.missions[i]?.title || "";
    hr.append(th);
  }
  hh.append(hr);
  const hb = el("tbody");
  students
    .slice()
    .sort((a, b) =>
      a.report.student.name.localeCompare(b.report.student.name, "es"),
    )
    .forEach(({ report }) => {
      const tr = el("tr");
      tr.append(el("th", "", report.student.name));
      report.missions.slice(0, TOTAL_MISSIONS).forEach((m) => {
        const td = el("td", heatClass(m.best), m.best ? String(m.best) : "—");
        td.title = `${report.student.name} · ${m.title}: ${m.best ? `${m.best}/100 · ${"★".repeat(m.stars)}${m.guardia ? " · 🛡️ Guardia" : ""}` : "sin jugar"}`;
        tr.append(td);
      });
      hb.append(tr);
    });
  heat.append(hh, hb);

  // Decisiones más falladas
  const fails = failRanking(),
    fmax = Math.max(1, ...fails.map((f) => f.fails));
  $("#fails").replaceChildren(
    ...(fails.length
      ? fails.map((f) => {
          const [answer] = top(f.wrong) || [""];
          return rankRow({
            title: `M${String(f.m + 1).padStart(2, "0")} · ${f.mt}`,
            detail: `${f.q} — respuesta incorrecta más elegida: «${answer}»`,
            value: f.fails,
            max: fmax,
            label: `${f.fails} error(es) · ${pct(f.fails, f.n)} %`,
            tip: `Alumnos con error: ${[...f.who].join(", ")}`,
          });
        })
      : [el("li", "t-empty", "Sin errores registrados.")]),
  );

  // Mesa de Mayo
  const mayo = mayoRanking(),
    mmax = Math.max(1, ...mayo.map((m) => m.fails));
  $("#mayo").replaceChildren(
    ...(mayo.length
      ? mayo.map((m) => {
          const [picked] = top(m.confused) || [""];
          return rankRow({
            title: instrumentName(m.asked),
            detail: `Se confundió sobre todo con: ${instrumentName(picked)}`,
            value: m.fails,
            max: mmax,
            label: `${m.fails} de ${m.n} · ${pct(m.fails, m.n)} %`,
            tip: `${m.fails} errores en ${m.n} peticiones`,
          });
        })
      : [el("li", "t-empty", "Sin partidas de Mesa de Mayo en los informes.")]),
  );
}

function csv() {
  const rows = students.map((s) => summary(s.report));
  const head = [
    "Alumno",
    "Completadas",
    "Nota media",
    "Nota del curso",
    "Decisiones seguras %",
    "Estrellas",
    "Misiones en Guardia",
    "Medallas",
    "Récord Mesa de Mayo",
    "Última actividad",
  ];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    head.map(esc).join(";"),
    ...rows.map((r) =>
      [
        r.name,
        r.done,
        r.avg,
        r.course,
        r.safe,
        r.stars,
        r.guardia,
        r.medals,
        r.mayoBest,
        r.last.toISOString().slice(0, 10),
      ]
        .map(esc)
        .join(";"),
    ),
  ];
  // BOM para que Excel reconozca los acentos.
  const blob = new Blob(["﻿" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = el("a");
  a.href = URL.createObjectURL(blob);
  a.download = `guardia-quirofano-clase-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(a);
  a.click();
  a.remove();
}

// --- Datos de ejemplo ------------------------------------------------------------
// Alumnos ficticios con perfiles distintos, solo para ver el panel funcionando.

const SAMPLE = [
  [
    0,
    "identity",
    "La primera apertura",
    "Empieza por el expediente",
    "Preguntar su nombre al paciente y, si coincide con la pulsera, dar la identidad por confirmada.",
  ],
  [
    3,
    "identity",
    "Conteo antes del cierre",
    "Reconcilia el conteo",
    "Buscar las gasas faltantes en el cubo mientras el cirujano sigue cerrando.",
  ],
  [
    4,
    "challenge",
    "La herida contaminada",
    "Clasifica lo que cambió",
    "Derrame gastrointestinal importante sin pus franco → Sucia/infectada",
  ],
  [
    8,
    "identity",
    "Electrocirugía segura",
    "Revisa el plan",
    "Verificar que el generador no muestre alarma de placa y continuar.",
  ],
  [
    9,
    "equipment",
    "Torre laparoscópica",
    "Prueba la imagen",
    "Cambiar a otro monitor y seguir si allí se ve bien.",
  ],
  [
    11,
    "identity",
    "Posición e imagen",
    "Confirma el lado",
    "Preparar el lado que indica el parte operatorio.",
  ],
  [
    13,
    "communication",
    "Exposición en ortopedia",
    "«¿Qué exposición queda confirmada?»",
    "«Aquí tiene el separador que usamos siempre».",
  ],
  [
    18,
    "equipment",
    "Sutura en revisión",
    "Lee el empaque",
    "Confirmar el nombre comercial en voz alta y abrir.",
  ],
];
const TITLES = [
  "La primera apertura",
  "Campo bajo vigilancia",
  "Preparación de la piel",
  "Conteo antes del cierre",
  "La herida contaminada",
  "Bordes que se separan",
  "Sutura para el plano",
  "Drenaje al cierre",
  "Electrocirugía segura",
  "Torre laparoscópica",
  "Aspiración e irrigación",
  "Posición e imagen",
  "Bandeja de cirugía general",
  "Exposición en ortopedia",
  "Microinstrumental neuroquirúrgico",
  "Set de otorrinolaringología",
  "Clasificación final",
  "Evaluación TIME",
  "Sutura en revisión",
  "Entrega integral",
];
const CONFUSED = [
  ["kelly", "mosquito"],
  ["metzenbaum", "mayo-recta"],
  ["allis", "kocher"],
  ["babcock", "allis"],
  ["diseccion-lisa", "diseccion-dientes"],
  ["balfour", "farabeuf"],
];

function demoReports() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const people = [
    ["Ana Pérez", 0.9, 20],
    ["Luis Gómez", 0.75, 16],
    ["María Rodríguez", 0.82, 18],
    ["José Martínez", 0.55, 9],
    ["Carmen Díaz", 0.68, 12],
    ["Pedro Sánchez", 0.45, 6],
    ["Laura Fernández", 0.88, 20],
    ["Miguel Torres", 0.62, 11],
  ];
  const now = Date.now();
  return people.map(([name, skill, played], p) => {
    const missions = TITLES.map((title, i) => {
      const best =
        i < played
          ? Math.min(
              100,
              Math.round(40 + skill * 60 - rnd() * 25 + (rnd() > 0.7 ? 15 : 0)),
            )
          : 0;
      return {
        index: i,
        module: Math.floor(i / 4) + 1,
        title,
        best,
        stars: best >= 95 ? 3 : best >= 75 ? 2 : best ? 1 : 0,
        guardia: best >= 80 && rnd() > 0.6,
      };
    });
    const decisions = [];
    SAMPLE.forEach(([m, k, mt, q, wrong]) => {
      if (m >= played) return;
      const ok = rnd() < skill;
      decisions.push({
        m,
        mod: Math.floor(m / 4) + 1,
        mt,
        k,
        q,
        a: ok ? "(respuesta segura)" : wrong,
        ok,
        g: 0,
        t: now - rnd() * 6e8,
      });
    });
    for (let i = 0; i < played * 5; i++)
      decisions.push({
        m: i % played,
        mod: 1,
        mt: TITLES[i % played],
        k: `otras-${i % 4}`,
        q: "Otras decisiones",
        a: "",
        ok: rnd() < skill + 0.1,
        g: 0,
        t: now - rnd() * 6e8,
      });
    const picks = [];
    for (let i = 0; i < 15 + p * 3; i++) {
      const [asked, conf] = CONFUSED[Math.floor(rnd() * CONFUSED.length)];
      const ok = rnd() < skill + 0.05;
      picks.push({
        asked,
        picked: ok ? asked : rnd() > 0.25 ? conf : "tiempo",
        ok,
        t: now - rnd() * 6e8,
      });
    }
    return {
      app: "guardia-quirofano",
      version: 1,
      demo: !0,
      exportedAt: new Date(now).toISOString(),
      student: { name, lmsId: null },
      missions,
      decisions,
      mayo: { best: Math.round(1200 + skill * 1800), picks },
      medals: Array.from({ length: Math.round(skill * 12) }, (_, i) => `m${i}`),
      streak: Math.round(skill * 6),
    };
  });
}

// --- Eventos ------------------------------------------------------------------------

const drop = $("#drop");
$("#files").addEventListener("change", (e) => loadFiles(e.target.files));
drop.addEventListener(
  "keydown",
  (e) =>
    (e.key === "Enter" || e.key === " ") &&
    (e.preventDefault(), $("#files").click()),
);
["dragenter", "dragover"].forEach((t) =>
  drop.addEventListener(
    t,
    (e) => (e.preventDefault(), drop.classList.add("over")),
  ),
);
["dragleave", "drop"].forEach((t) =>
  drop.addEventListener(t, () => drop.classList.remove("over")),
);
drop.addEventListener(
  "drop",
  (e) => (e.preventDefault(), loadFiles(e.dataTransfer.files)),
);
$("#demo").addEventListener("click", () => {
  students = [];
  isDemo = !0;
  demoReports().forEach(add);
  $("#status").textContent = "Mostrando 8 alumnos ficticios.";
  render();
});
$("#csv").addEventListener("click", csv);
$("#clear").addEventListener("click", () => {
  students = [];
  isDemo = !1;
  $("#files").value = "";
  $("#status").textContent = "";
  render();
});
