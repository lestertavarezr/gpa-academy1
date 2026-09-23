// Progreso del jugador fuera de cada misión: racha diaria, caso del día y
// medallas. Todo se guarda en localStorage de este navegador.

const KEY = "gpa-guardia-quirofano-progress-v1";

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && typeof data === "object") return data;
  } catch {}
  return {};
}
function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

function dayKey(date = new Date()) {
  const y = date.getFullYear(),
    m = String(date.getMonth() + 1).padStart(2, "0"),
    d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function previousDay(key) {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
}

export const MEDALS = [
  {
    id: "primera",
    icon: "🩺",
    title: "Primer turno",
    desc: "Completa tu primera misión.",
  },
  {
    id: "perfecta",
    icon: "⭐",
    title: "Pulso firme",
    desc: "Consigue 3 estrellas en una misión.",
  },
  {
    id: "racha5",
    icon: "🔥",
    title: "En la zona",
    desc: "Encadena 5 aciertos seguidos en una misión.",
  },
  {
    id: "modulo1",
    icon: "🧼",
    title: "Maestría: asepsia",
    desc: "Completa las 4 misiones del módulo 1.",
  },
  {
    id: "modulo2",
    icon: "🩹",
    title: "Maestría: heridas",
    desc: "Completa las 4 misiones del módulo 2.",
  },
  {
    id: "modulo3",
    icon: "⚡",
    title: "Maestría: equipos",
    desc: "Completa las 4 misiones del módulo 3.",
  },
  {
    id: "modulo4",
    icon: "✂️",
    title: "Maestría: instrumental",
    desc: "Completa las 4 misiones del módulo 4.",
  },
  {
    id: "modulo5",
    icon: "📋",
    title: "Maestría: repaso",
    desc: "Completa las 4 misiones del módulo 5.",
  },
  {
    id: "campana",
    icon: "🏆",
    title: "Campaña completa",
    desc: "Completa las 20 misiones.",
  },
  {
    id: "guardia",
    icon: "🛡️",
    title: "Guardia superada",
    desc: "Completa una misión en Modo Guardia.",
  },
  {
    id: "guardia3",
    icon: "💎",
    title: "Nervios de acero",
    desc: "Consigue 3 estrellas en Modo Guardia.",
  },
  {
    id: "eventos",
    icon: "🚨",
    title: "Reflejos clínicos",
    desc: "Resuelve bien 5 eventos inesperados.",
  },
  {
    id: "mayo",
    icon: "🧰",
    title: "Primera mesa",
    desc: "Termina una partida de Mesa de Mayo.",
  },
  {
    id: "mayo-perfecta",
    icon: "🎯",
    title: "Mesa perfecta",
    desc: "Entrega las 15 piezas sin un error.",
  },
  {
    id: "mano-rapida",
    icon: "⚡",
    title: "Mano rápida",
    desc: "Tiempo medio menor de 2,5 s con 10 aciertos o más.",
  },
  {
    id: "diario",
    icon: "📅",
    title: "Caso del día",
    desc: "Completa el caso del día.",
  },
  {
    id: "dias3",
    icon: "📆",
    title: "Constancia",
    desc: "Juega 3 días seguidos.",
  },
  {
    id: "dias7",
    icon: "🗓️",
    title: "Hábito quirúrgico",
    desc: "Juega 7 días seguidos.",
  },
];

const listeners = new Set();

export const Progress = {
  /** Suscribe a medallas nuevas: fn(medal). */
  onMedal(fn) {
    listeners.add(fn);
  },
  unlock(id) {
    const data = load();
    data.medals ??= {};
    if (data.medals[id]) return !1;
    data.medals[id] = dayKey();
    save(data);
    const medal = MEDALS.find((m) => m.id === id);
    medal && listeners.forEach((fn) => fn(medal));
    return !0;
  },
  medals() {
    return load().medals || {};
  },
  /** Racha de días consecutivos con al menos una partida terminada. */
  streak() {
    const data = load(),
      today = dayKey();
    if (!data.lastDay) return 0;
    return data.lastDay === today || data.lastDay === previousDay(today)
      ? data.streak || 0
      : 0;
  },
  playedToday() {
    return load().lastDay === dayKey();
  },
  recordPlay() {
    const data = load(),
      today = dayKey();
    if (data.lastDay !== today) {
      data.streak =
        data.lastDay === previousDay(today) ? (data.streak || 0) + 1 : 1;
      data.lastDay = today;
      save(data);
    }
    const s = data.streak || 0;
    s >= 3 && this.unlock("dias3");
    s >= 7 && this.unlock("dias7");
    return s;
  },
  /** Misión del día: la misma para todos en la misma fecha. */
  dailyMission(total) {
    const key = dayKey();
    let h = 0;
    for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h % total;
  },
  dailyDone() {
    return load().dailyDone === dayKey();
  },
  markDaily() {
    const data = load();
    data.dailyDone = dayKey();
    save(data);
    this.unlock("diario");
  },
  countEvent() {
    const data = load();
    data.events = (data.events || 0) + 1;
    save(data);
    data.events >= 5 && this.unlock("eventos");
  },
  guardiaDone() {
    return load().guardia || [];
  },
  markGuardia(index) {
    const data = load();
    data.guardia ??= [];
    data.guardia.includes(index) || data.guardia.push(index);
    save(data);
  },
  mayoBest() {
    return load().mayoBest || 0;
  },
  saveMayo(score) {
    const data = load(),
      record = score > (data.mayoBest || 0);
    record && ((data.mayoBest = score), save(data));
    return record;
  },
};
