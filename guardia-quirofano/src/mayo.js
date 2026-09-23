// Mesa de Mayo: minijuego contrarreloj. El cirujano pide una pieza (primero
// por nombre, después por su función) y hay que entregarla antes de que se
// agote el tiempo. Tres errores terminan la partida.

import { INSTRUMENTS, instrumentSvg } from "./instruments.js";
import { Sound } from "./audio.js";
import { Progress } from "./progress.js";

const TOTAL = 15;
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, className, text) {
  const node = document.createElement(tag);
  className && (node.className = className);
  text != null && (node.textContent = text);
  return node;
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Etapas: calentamiento por nombre → nombre con la mesa barajada → función.
function stageFor(round) {
  if (round < 4) return { kind: "name", pool: 1, limit: 8000, reshuffle: !1 };
  if (round < 10) return { kind: "name", pool: 2, limit: 6500, reshuffle: !0 };
  return {
    kind: "need",
    pool: 2,
    limit: Math.max(5500, 8000 - (round - 10) * 500),
    reshuffle: !0,
  };
}

function speak(text) {
  if (!Sound.enabled || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text.replace(/[¡!]/g, ""));
    u.lang = "es-ES";
    u.rate = 1.1;
    const voice = speechSynthesis
      .getVoices()
      .find((v) => v.lang?.startsWith("es"));
    voice && (u.voice = voice);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch {}
}

export function createMayo({ root, onExit }) {
  let S = null;
  let raf = 0;
  let pending = 0;

  function clearTimers() {
    cancelAnimationFrame(raf);
    clearTimeout(pending);
  }

  function frame() {
    root.replaceChildren();
    const head = el("div", "mayo-head");
    const title = el("div", "mayo-title");
    title.append(
      el("p", "chapter-label", "MINIJUEGO · CONTRARRELOJ"),
      el("h1", "", "Mesa de Mayo"),
    );
    const stats = el("div", "mayo-stats");
    stats.innerHTML = `<span class="mayo-lives" aria-label="Vidas"></span>
      <span class="mayo-vital">FC <b id="mayo-hr">72</b></span>
      <span>Pieza <b id="mayo-round">0</b>/${TOTAL}</span>
      <span class="mayo-combo" id="mayo-combo"></span>
      <span class="mayo-score"><b id="mayo-score">0</b> pts</span>`;
    const exit = el("button", "button button-quiet mayo-exit", "← Salir");
    exit.type = "button";
    exit.addEventListener("click", () => {
      clearTimers();
      Sound.stopAmbient();
      onExit();
    });
    head.append(title, stats, exit);

    const surgeon = el("div", "mayo-surgeon");
    surgeon.innerHTML = `<div class="mayo-avatar" aria-hidden="true">CX</div>
      <div class="mayo-bubble"><small id="mayo-kind">EL CIRUJANO PIDE</small><strong id="mayo-call" aria-live="assertive">Prepárate…</strong>
      <div class="mayo-timer"><span id="mayo-timer-fill"></span></div></div>`;
    const feedback = el("p", "mayo-feedback");
    feedback.id = "mayo-feedback";
    feedback.setAttribute("role", "status");
    const tray = el("div", "mayo-tray");
    tray.id = "mayo-tray";
    root.append(head, surgeon, feedback, tray);
  }

  function renderStats() {
    $(".mayo-lives", root).textContent =
      "❤".repeat(S.lives) + "♡".repeat(3 - S.lives);
    const hr = 72 + (3 - S.lives) * 14 + Math.min(S.combo, 8);
    Sound.setHeartRate(hr);
    $("#mayo-hr", root).textContent = hr;
    $("#mayo-round", root).textContent = Math.min(S.round + 1, TOTAL);
    $("#mayo-score", root).textContent = S.score;
    $("#mayo-combo", root).textContent = S.combo >= 2 ? `🔥 x${S.combo}` : "";
  }

  function renderTray() {
    const tray = $("#mayo-tray", root);
    tray.replaceChildren();
    S.order.forEach((item) => {
      const b = el("button", "mayo-card");
      b.type = "button";
      b.dataset.id = item.id;
      b.innerHTML = instrumentSvg(item.id);
      b.append(el("span", "", item.name));
      b.addEventListener("click", () => pick(item.id, b));
      tray.append(b);
    });
  }

  function next() {
    if (S.round >= TOTAL || S.lives <= 0) return finish();
    const stage = stageFor(S.round);
    const pool = INSTRUMENTS.filter(
      (i) => i.tier <= stage.pool && i.id !== S.current?.id,
    );
    S.current = pool[Math.floor(Math.random() * pool.length)];
    S.stage = stage;
    S.busy = !1;
    if (stage.reshuffle) ((S.order = shuffle(INSTRUMENTS)), renderTray());
    const text = stage.kind === "name" ? S.current.call : `«${S.current.need}»`;
    $("#mayo-kind", root).textContent =
      stage.kind === "name"
        ? "EL CIRUJANO PIDE"
        : "EL CIRUJANO NECESITA · ELIGE POR FUNCIÓN";
    $("#mayo-call", root).textContent = text;
    $("#mayo-feedback", root).textContent = "";
    $("#mayo-feedback", root).className = "mayo-feedback";
    speak(stage.kind === "name" ? S.current.call : S.current.need);
    renderStats();
    S.start = performance.now();
    S.deadline = S.start + stage.limit;
    tick();
  }

  function tick() {
    const now = performance.now(),
      left = Math.max(0, S.deadline - now),
      frac = left / S.stage.limit;
    const fill = $("#mayo-timer-fill", root);
    fill.style.width = `${frac * 100}%`;
    fill.classList.toggle("urgent", frac < 0.3);
    if (left <= 0) return miss(null);
    raf = requestAnimationFrame(tick);
  }

  function pick(id, card) {
    if (!S || S.busy || S.done) return;
    if (id !== S.current.id) return miss(card);
    cancelAnimationFrame(raf);
    S.busy = !0;
    const took = performance.now() - S.start,
      left = Math.max(0, S.deadline - performance.now()) / S.stage.limit;
    S.combo++;
    S.bestCombo = Math.max(S.bestCombo, S.combo);
    const gained = Math.round(
      (100 + 100 * left) * (1 + 0.1 * Math.min(S.combo - 1, 10)),
    );
    S.score += gained;
    S.correct++;
    S.times.push(took);
    card.classList.add("delivered");
    const fb = $("#mayo-feedback", root);
    fb.className = "mayo-feedback good";
    fb.textContent = `+${gained} · ${(took / 1000).toFixed(1)} s${S.combo >= 3 ? ` · racha x${S.combo}` : ""}`;
    Sound.play(S.combo >= 3 && S.combo % 3 === 0 ? "streak" : "good");
    S.round++;
    renderStats();
    pending = setTimeout(next, 520);
  }

  function miss(card) {
    cancelAnimationFrame(raf);
    S.busy = !0;
    S.lives--;
    S.combo = 0;
    S.errors.push({
      asked: S.current,
      picked: card?.dataset.id || null,
      kind: S.stage.kind,
    });
    card?.classList.add("wrong");
    $(`.mayo-card[data-id="${S.current.id}"]`, root)?.classList.add("reveal");
    const fb = $("#mayo-feedback", root);
    fb.className = "mayo-feedback bad";
    fb.textContent = `${card ? "No es esa." : "¡Tiempo!"} Era ${S.current.name}: ${S.current.use}`;
    Sound.play(S.lives <= 1 ? "alarm" : "bad");
    S.round++;
    renderStats();
    pending = setTimeout(next, 1900);
  }

  function finish() {
    clearTimers();
    S.done = !0;
    Sound.setHeartRate(72);
    const avg = S.times.length
      ? S.times.reduce((a, b) => a + b, 0) / S.times.length
      : 0;
    const record = Progress.saveMayo(S.score);
    Progress.recordPlay();
    Progress.unlock("mayo");
    S.correct === TOTAL && !S.errors.length && Progress.unlock("mayo-perfecta");
    S.correct >= 10 && avg < 2500 && Progress.unlock("mano-rapida");
    Sound.play("complete");

    const tray = $("#mayo-tray", root);
    tray.replaceChildren();
    $("#mayo-call", root).textContent =
      S.lives > 0 ? "¡Buen trabajo en la mesa!" : "El cirujano pide relevo.";
    $("#mayo-kind", root).textContent = "FIN DE LA PARTIDA";
    $("#mayo-timer-fill", root).style.width = "0";
    $("#mayo-feedback", root).textContent = "";

    const box = el("div", "mayo-summary");
    box.innerHTML = `<div class="debrief-score">${S.score}<small> pts${record ? " · ¡nuevo récord!" : ""}</small></div>
      <div class="mayo-summary-stats">
        <span><b>${S.correct}/${TOTAL}</b> entregas correctas</span>
        <span><b>${S.times.length ? (avg / 1000).toFixed(1) : "–"} s</b> tiempo medio</span>
        <span><b>x${S.bestCombo}</b> mejor racha</span>
        <span><b>${Progress.mayoBest()}</b> récord personal</span>
      </div>`;
    if (S.errors.length) {
      const review = el("div", "mayo-review");
      review.append(el("h3", "", "Repasa lo que falló"));
      S.errors.forEach((e) => {
        const row = el("div", "mayo-review-row");
        row.innerHTML = instrumentSvg(e.asked.id);
        const text = el("p");
        const strong = el("strong", "", e.asked.name);
        text.append(strong, el("span", "", ` — ${e.asked.use}`));
        e.picked &&
          text.append(
            el(
              "small",
              "",
              `Entregaste: ${INSTRUMENTS.find((i) => i.id === e.picked).name}`,
            ),
          );
        row.append(text);
        review.append(row);
      });
      box.append(review);
    }
    const actions = el("div", "debrief-buttons");
    const again = el("button", "button button-primary", "Jugar otra vez →");
    again.type = "button";
    again.addEventListener("click", start);
    const back = el("button", "button button-quiet", "Volver al menú");
    back.type = "button";
    back.addEventListener("click", () => {
      Sound.stopAmbient();
      onExit();
    });
    actions.append(again, back);
    box.append(actions);
    tray.append(box);
  }

  function start() {
    clearTimers();
    S = {
      round: 0,
      lives: 3,
      score: 0,
      combo: 0,
      bestCombo: 0,
      correct: 0,
      times: [],
      errors: [],
      current: null,
      busy: !0,
      order: shuffle(INSTRUMENTS),
    };
    frame();
    renderTray();
    renderStats();
    Sound.startAmbient();
    let n = 3;
    const call = $("#mayo-call", root);
    const count = () => {
      if (n === 0) return next();
      call.textContent = `Revisa la mesa… ${n}`;
      Sound.play("select");
      n--;
      pending = setTimeout(count, 800);
    };
    count();
  }

  return {
    start,
    stop() {
      clearTimers();
      S && (S.done = !0);
    },
  };
}
