import authored from "../../content/challenges.json";
import modules from "../../content/modules.json";
import { API_BASE } from "../config.js";
import { escapeHTML as e } from "../ui/escape.js";

const $ = (selector) => document.querySelector(selector);
const byId = new Map(authored.map((c) => [c.id, c]));
let rows = [];
let sortKey = "accuracy";
let ascending = true;

const pct = (n, d) => (d ? Math.round((n / d) * 100) : null);

function toRow(stat) {
  const ch = byId.get(stat.challengeId);
  if (!ch) return null;
  const high = stat.byConfidence?.Alta || { attempts: 0, correct: 0 };
  const wrongPicks = stat.options.map((picks, index) => ({ picks, index })).filter((o) => o.index !== ch.answer);
  const top = wrongPicks.sort((a, b) => b.picks - a.picks)[0];
  const wrongTotal = stat.attempts - stat.correct;
  return {
    id: ch.id,
    module: ch.module,
    title: ch.title,
    attempts: stat.attempts,
    accuracy: pct(stat.correct, stat.attempts),
    overconfident: pct(high.attempts - high.correct, high.attempts),
    distractor: top && top.picks ? { text: ch.options[top.index], share: pct(top.picks, wrongTotal) } : null,
  };
}

function render() {
  const min = Number($("#min").value) || 0;
  const visible = rows
    .filter((r) => r.attempts >= min)
    .sort((a, b) => {
      const av = a[sortKey] ?? -1;
      const bv = b[sortKey] ?? -1;
      return (av > bv ? 1 : av < bv ? -1 : a.id - b.id) * (ascending ? 1 : -1);
    });
  $("#table tbody").innerHTML = visible
    .map((r) => {
      const accClass = r.accuracy !== null && r.accuracy < 50 ? "low" : "";
      const overClass = r.overconfident !== null && r.overconfident >= 30 ? "warn" : "";
      const distractor = r.distractor ? `${e(r.distractor.text)} <small>(${r.distractor.share}% de los errores)</small>` : "—";
      return `<tr><td class="num">${r.id}</td><td>${e(modules[r.module])}</td><td>${e(r.title)}</td><td class="num">${r.attempts}</td><td class="num ${accClass}">${r.accuracy ?? "—"}%</td><td class="num ${overClass}">${r.overconfident ?? "—"}${r.overconfident === null ? "" : "%"}</td><td>${distractor}</td></tr>`;
    })
    .join("");
  $("#table").hidden = false;
}

function renderSummary(totals) {
  const box = $("#summary");
  box.innerHTML = [
    ["Cuentas anónimas", totals.users],
    ["Activas 7 días", totals.activeUsers7d],
    ["Avisos push activos", totals.pushSubscriptions],
    ["Respuestas registradas", rows.reduce((sum, r) => sum + r.attempts, 0)],
  ]
    .map(([label, value]) => `<div><b>${Number(value) || 0}</b>${e(label)}</div>`)
    .join("");
  box.hidden = false;
}

$("#auth").addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = $("#token").value.trim();
  $("#status").textContent = "Cargando…";
  try {
    const response = await fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` }, credentials: "omit" });
    if (response.status === 401) throw new Error("Token incorrecto.");
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    rows = data.challenges.map(toRow).filter(Boolean);
    renderSummary(data.totals);
    render();
    $("#status").textContent = `Actualizado ${new Date(data.generatedAt).toLocaleString()}`;
  } catch (error) {
    $("#status").textContent = error.message || "No se pudo cargar.";
  }
});
$("#min").addEventListener("change", () => rows.length && render());
$("#table thead").addEventListener("click", (event) => {
  const key = event.target.closest("[data-sort]")?.dataset.sort;
  if (!key) return;
  ascending = key === sortKey ? !ascending : true;
  sortKey = key;
  render();
});
