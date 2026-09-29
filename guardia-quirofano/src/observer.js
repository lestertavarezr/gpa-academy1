// Asistente observador: el alumno no participa en el procedimiento. Observa
// la cirugía desde la zona de observación, sin entrar al campo estéril, y
// reporta las incidencias que comprometen la seguridad del paciente eligiendo
// qué vio y cómo comunicarlo. Al final, una bitácora compara lo que reportó
// con lo que realmente pasó.
// PENDIENTE: validación del equipo docente (incidencias, distancias y a quién
// debe dirigirse el observador según el protocolo de GPA Academy).

import Phaser from "phaser";
import roomUrl from "./assets/quirofano-isometrico.webp";
import bodyUrl from "./assets/actor/body.svg";
import armUrl from "./assets/actor/arm.svg";
import legUrl from "./assets/actor/leg.svg";
// La circulante: el mismo personaje con pijama granate y gorro liso.
import circBodyUrl from "./assets/actor/circulante-body.svg";
import circArmUrl from "./assets/actor/circulante-arm.svg";
import circLegUrl from "./assets/actor/circulante-leg.svg";
import { buildOccluders, footprintY, svgUrl } from "./stage.js";
import {
  TEAM,
  TEAM_TEXTURES,
  teamUrl,
  drawPatient,
  makeMember,
  poseTeam,
  top,
} from "./surgeons.js";
import { Sound } from "./audio.js";
import { Progress } from "./progress.js";
import { Report } from "./report.js";
import { LMS } from "./lms.js";
import { INCIDENTS, NORMAL, OBS_MISSIONS } from "./observer-data.js";

export { INCIDENTS, OBS_MISSIONS };

const POINTS_FALSE = 8,
  POINTS_ZONE = 10,
  // La circulante tarda unos segundos en llegar al hueco entre las mesas: la
  // incidencia empieza cuando cruza, no cuando echa a andar.
  DELAY = { cruce: 3 };

// --- Escena ----------------------------------------------------------------------

// Zonas en el suelo (elipses en el lienzo de 1200×675).
const STERILE = { x: 615, y: 405, rx: 185, ry: 92 },
  WATCH = { x: 360, y: 548, rx: 64, ry: 24 },
  inside = (z, x, y) => ((x - z.x) / z.rx) ** 2 + ((y - z.y) / z.ry) ** 2 <= 1;

class ObserverScene extends Phaser.Scene {
  constructor() {
    super("Observer");
  }
  preload() {
    this.load.image("room", roomUrl);
    Object.keys(TEAM_TEXTURES).forEach((key) =>
      this.load.svg(key, teamUrl(key), { scale: 2 }),
    );
    for (const [key, url] of Object.entries({
      "me-body": bodyUrl,
      "me-arm": armUrl,
      "me-leg": legUrl,
      "circ-body": circBodyUrl,
      "circ-arm": circArmUrl,
      "circ-leg": circLegUrl,
    }))
      this.load.svg(key, svgUrl(url), { scale: 2 });
  }
  create() {
    const hooks = this.game.registry.get("hooks");
    this.hooks = hooks;
    this.reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    this.add.image(600, 337.5, "room").setDisplaySize(1200, 675);
    this.add.rectangle(600, 337.5, 1200, 675, 400426, 0.1);
    this.occluders = buildOccluders(this, "room");
    this.occluders.forEach((o) => o.image.setDepth(18));
    this.mayoOcc = this.occluders.find((o) => o.id === "mesa-mayo");

    // Zonas: campo estéril (no pasar) y zona de observación del alumno.
    this.sterileZone = this.add
      .ellipse(
        STERILE.x,
        STERILE.y,
        STERILE.rx * 2,
        STERILE.ry * 2,
        0xff4d5e,
        0.05,
      )
      .setStrokeStyle(2, 0xff6b78, 0.45)
      .setDepth(6);
    this.add
      .text(
        STERILE.x - 110,
        STERILE.y + STERILE.ry + 8,
        "ZONA ESTÉRIL · NO PASAR",
        {
          fontFamily: "Arial",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#ffb3ba",
          backgroundColor: "#3a0d16cc",
          padding: { x: 5, y: 2 },
        },
      )
      .setOrigin(0.5)
      .setDepth(19);
    this.add
      .ellipse(WATCH.x, WATCH.y, WATCH.rx * 2, WATCH.ry * 2, 0x57f29a, 0.12)
      .setStrokeStyle(2, 0x57f29a, 0.8)
      .setDepth(6);
    this.add
      .text(WATCH.x + 20, WATCH.y + WATCH.ry + 14, "ZONA DE OBSERVACIÓN", {
        fontFamily: "Arial",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#b8ffd4",
        backgroundColor: "#06201acc",
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(19);

    // Equipo operando (sin el ayudante pidiendo por su cuenta: aquí lo marca
    // el guion de la misión).
    this.patient = drawPatient(this);
    this.team = {
      cirujano: makeMember(this, TEAM.cirujano, !1),
      ayudante: makeMember(this, TEAM.ayudante, !0),
    };
    this.teamTweens = [];
    const c = this.team.cirujano,
      h = this.team.ayudante;
    c.body.setDepth(17.9);
    this.patient.body.setDepth(18.2);
    this.patient.incision.setDepth(18.21);
    c.arms.setDepth(18.3);
    h.body.setDepth(18.5);
    poseTeam(this, "work", { ask: !1 });

    this.me = this.person("me", WATCH.x, WATCH.y);
    this.me.container.setDepth(20);
    this.meTag = this.add
      .text(WATCH.x, WATCH.y - 118, "TÚ", {
        fontFamily: "Arial",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#06202a",
        backgroundColor: "#8df1de",
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(26);
    this.circ = this.person("circ", 1180, 300);
    this.circ.container.setVisible(!1);
    this.makeMonitor();
    // Gasa con su hilo radiopaco azul, para que se distinga en el suelo.
    this.gauze = this.add
      .container(0, 0, [
        this.add.rectangle(0, 0, 20, 14, 0xffffff).setStrokeStyle(1, 0x9fb3bd),
        this.add.rectangle(0, 0, 20, 3, 0x2f7fd0),
      ])
      .setVisible(!1);

    this.input.on("pointerdown", (p) => this.walk(p.worldX, p.worldY));
    this.elapsed = 0;
    this.fired = 0;
    this.events.once("shutdown", () => this.tweens.killAll());
  }
  person(kind, x, y) {
    const s = 0.86 + ((y - 300) / 300) * 0.26,
      part = (key, px, py, ox, oy) =>
        this.add
          .image(px, py, `${kind}-${key}`)
          .setOrigin(ox, oy)
          .setScale(0.5),
      legs = [part("leg", -8, -36, 0.5, 0), part("leg", 8, -36, 0.5, 0)],
      torso = part("body", 0, -30, 0.5, 1),
      arms = [
        part("arm", -25, -77, 0.5, 0.06),
        part("arm", 25, -77, 0.5, 0.06).setFlipX(!0),
      ],
      shadow = this.add.ellipse(0, 3, 64, 16, 0x031b27, 0.4),
      figure = this.add.container(0, 0, [...legs, torso, ...arms]),
      container = this.add.container(x, y, [shadow, figure]).setScale(1.1 * s);
    this.reduced ||
      this.tweens.add({
        targets: torso,
        scaleY: 0.508,
        duration: 1500,
        yoyo: !0,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    return { container, legs, arms, torso };
  }
  makeMonitor() {
    const panel = this.add
      .rectangle(0, 0, 176, 64, 0x03141d, 0.92)
      .setStrokeStyle(2, 0x2c6f7a);
    this.spo2Text = this.add
      .text(-78, -8, "SpO₂ 99 %", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#57f29a",
      })
      .setOrigin(0, 0.5);
    const title = this.add
      .text(-78, -24, "MONITOR DEL PACIENTE", {
        fontFamily: "Arial",
        fontSize: "9px",
        fontStyle: "bold",
        color: "#8fb9c2",
      })
      .setOrigin(0, 0.5);
    this.hrText = this.add
      .text(-78, 16, "FC 76", {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#57f29a",
      })
      .setOrigin(0, 0.5);
    this.monitor = this.add
      .container(1090, 60, [panel, title, this.spo2Text, this.hrText])
      .setDepth(25);
    this.spo2 = 99;
  }
  // El alumno solo se mueve dentro de la zona de observación.
  walk(x, y) {
    if (!this.running) return;
    if (inside(STERILE, x, y)) {
      this.hooks.onZone();
      this.sterileZone.setFillStyle(0xff4d5e, 0.3);
      this.reduced || this.cameras.main.shake(180, 0.004);
      this.time.delayedCall(700, () =>
        this.sterileZone.setFillStyle(0xff4d5e, 0.05),
      );
      return;
    }
    if (!inside(WATCH, x, y)) return this.hooks.onOutside();
    this.tweens.add({
      targets: [this.me.container],
      x,
      y,
      duration: 400,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: this.meTag,
      x,
      y: y - 118,
      duration: 400,
    });
  }
  start(mission) {
    this.mission = mission;
    this.elapsed = 0;
    this.fired = 0;
    this.running = !0;
  }
  update(_, delta) {
    if (!this.running) return;
    this.elapsed += delta / 1000;
    const ev = this.mission.events;
    while (this.fired < ev.length && ev[this.fired][0] <= this.elapsed) {
      const [t, kind] = ev[this.fired++];
      this.play(kind);
      this.hooks.onEvent(kind, t);
    }
    this.hooks.onTick(this.elapsed);
    this.circDepth();
  }
  // Profundidad de la circulante respecto al equipo y a la Mesa de Mayo.
  circDepth() {
    const w = this.circ.container;
    if (!w.visible) return this.mayoOcc.image.setDepth(18);
    const h = this.team.ayudante,
      behindMayo =
        w.x + 35 > this.mayoOcc.image.x &&
        w.y < footprintY(this.mayoOcc.footprint, w.x);
    w.setDepth(w.y < 300 ? 17.5 : w.y < h.y ? 18.45 : 20.5);
    this.mayoOcc.image.setDepth(behindMayo ? 21 : 18);
  }
  // --- Sucesos visibles ---
  play(kind) {
    const { cirujano: c, ayudante: h } = this.team,
      d = this.reduced ? 0 : 1;
    if (kind === "pide")
      this.gesture(h.rightArm, { angle: -72 }, 380 * d, 1100, { angle: 20 });
    if (kind === "guante")
      // La mano sube hasta la mascarilla y vuelve al campo.
      this.gesture(c.rightArm, { angle: 133, y: -77 }, 500 * d, 2200, {
        angle: 13,
      });
    if (kind === "manos") {
      // Los brazos bajan a los costados: las manos quedan bajo la cintura.
      this.gesture(h.leftArm, { angle: 22, y: -64 }, 450 * d, 3600, {
        angle: -20,
        y: -77,
      });
      this.gesture(h.rightArm, { angle: -22, y: -64 }, 450 * d, 3600, {
        angle: 20,
        y: -77,
      });
    }
    if (kind === "gasa") {
      // Resbala del borde de la mesa y cae al suelo, delante de la mesa.
      const [x, y] = top(0.55, 1, 8);
      this.gauze
        .setPosition(x, y)
        .setAngle(0)
        .setAlpha(1)
        .setDepth(20.6)
        .setVisible(!0);
      this.tweens.add({
        targets: this.gauze,
        x: x - 44,
        y: 476,
        angle: 160,
        duration: 900 * d + 1,
        ease: "Bounce.easeOut",
      });
    }
    if (kind === "spo2") this.desaturate();
    if (kind === "cruce")
      this.stroll([
        [1180, 330],
        [900, 360],
        [760, 430],
        [640, 520],
        [470, 620],
        [300, 700],
      ]);
    if (kind === "paso")
      this.stroll([
        [150, 238],
        [560, 232],
        [880, 250],
        [1000, 270],
        [1180, 300],
      ]);
  }
  gesture(target, to, duration, hold, back) {
    this.tweens.killTweensOf(target);
    this.tweens.add({
      targets: target,
      ...to,
      duration: duration + 1,
      ease: "Sine.easeInOut",
      onComplete: () =>
        this.tweens.add({
          targets: target,
          ...back,
          delay: hold,
          duration: duration + 1,
          ease: "Sine.easeInOut",
          onComplete: () => this.resumeWork(target),
        }),
    });
  }
  // Tras un gesto, cada brazo vuelve a su movimiento de trabajo.
  resumeWork(target) {
    if (this.reduced) return;
    const { cirujano: c, ayudante: h } = this.team,
      loops = new Map([
        [c.rightArm, [{ angle: 24, y: -73 }, 620]],
        [c.leftArm, [{ angle: -4 }, 1700]],
        [h.leftArm, [{ angle: -15 }, 1300]],
      ]),
      loop = loops.get(target);
    loop &&
      this.tweens.add({
        targets: target,
        ...loop[0],
        duration: loop[1],
        yoyo: !0,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
  }
  stroll(path) {
    const w = this.circ.container;
    this.tweens.killTweensOf(w);
    w.setPosition(...path[0]).setVisible(!0);
    const steps = path.slice(1).map(([x, y], i) => {
      const [px, py] = path[i];
      return {
        x,
        y,
        scale: 1.1 * (0.86 + ((y - 300) / 300) * 0.26),
        duration: Math.hypot(x - px, y - py) * 9,
      };
    });
    this.tweens.chain({
      targets: w,
      tweens: steps,
      onComplete: () => w.setVisible(!1),
    });
    this.reduced ||
      this.circ.legs.forEach((leg, i) =>
        this.tweens.add({
          targets: leg,
          angle: i ? -14 : 14,
          duration: 260,
          yoyo: !0,
          repeat: Math.ceil(steps.reduce((a, s) => a + s.duration, 0) / 520),
        }),
      );
  }
  desaturate() {
    Sound.play("alarm");
    const from = { v: 99 };
    this.tweens.add({
      targets: from,
      v: 88,
      duration: 1600,
      onUpdate: () => {
        this.spo2 = Math.round(from.v);
        this.spo2Text.setText(`SpO₂ ${this.spo2} %`);
        this.spo2 < 94 &&
          (this.spo2Text.setColor("#ffc857"), this.hrText.setText("FC 104"));
      },
    });
    this.reduced ||
      this.tweens.add({
        targets: this.monitor,
        alpha: 0.55,
        duration: 380,
        yoyo: !0,
        repeat: 9,
        delay: 1200,
      });
  }
  recover(kind) {
    if (kind === "spo2") {
      this.spo2Text.setText("SpO₂ 97 %").setColor("#57f29a");
      this.hrText.setText("FC 80");
      this.monitor.setAlpha(1);
    }
    if (kind === "gasa")
      this.tweens.add({ targets: this.gauze, alpha: 0, duration: 500 });
  }
}

// --- Interfaz ---------------------------------------------------------------------

const $ = (sel, root) => root.querySelector(sel);
function el(tag, className, text) {
  const node = document.createElement(tag);
  className && (node.className = className);
  text != null && (node.textContent = text);
  return node;
}
function button(className, text, onClick) {
  const b = el("button", className, text);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const clock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export const starsFor = (score) =>
  score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;

/** Puntuación: cada incidencia vale lo mismo (60 % detectarla, 40 % comunicarla). */
export function scoreRun({ incidents, falseAlarms, zone }) {
  const each = 100 / Math.max(1, incidents.length);
  const base = incidents.reduce(
    (a, i) =>
      a +
      (i.detected
        ? each * (0.6 * (i.fast ? 1 : 0.7) + (i.commOk ? 0.4 : 0))
        : 0),
    0,
  );
  return Math.max(
    0,
    Math.round(base - falseAlarms * POINTS_FALSE - zone * POINTS_ZONE),
  );
}

export function createObserver({ root, onExit, onFinish, isLocked, onLocked }) {
  let game = null,
    scene = null,
    S = null,
    keyHandler = null;

  function destroyGame() {
    game?.destroy(!0);
    game = scene = null;
  }
  function exit() {
    stopKeys();
    destroyGame();
    Sound.stopAmbient();
    onExit();
  }
  function stopKeys() {
    keyHandler && document.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  }

  function head(sub) {
    const h = el("div", "mayo-head");
    const title = el("div", "mayo-title");
    title.append(
      el("p", "chapter-label", sub),
      el("h1", "", "Asistente observador"),
    );
    h.append(title, button("button button-quiet mayo-exit", "← Salir", exit));
    return h;
  }

  // Pantalla inicial: el papel del observador y las 4 misiones.
  function menu() {
    stopKeys();
    destroyGame();
    root.replaceChildren();
    const intro = el("div", "obs-intro");
    intro.innerHTML = `<p><b>Tu papel:</b> hoy no entras al procedimiento. Observas desde la <b class="obs-green">zona de observación</b> y no puedes pasar a la <b class="obs-red">zona estéril</b>.</p>
      <p>Cuando veas algo que comprometa la seguridad del paciente, pulsa <b>REPORTAR</b> (o la tecla <kbd>R</kbd>): elige qué viste y cómo comunicarlo. Cuanto antes, mejor. Ojo: no todo lo que se mueve es un error.</p>`;
    const list = el("div", "obs-missions");
    const done = Progress.observer();
    OBS_MISSIONS.forEach((m, i) => {
      const locked = isLocked(i),
        best = done[i],
        b = button(`obs-mission${locked ? " locked" : ""}`, "", () =>
          locked ? onLocked() : play(i),
        );
      b.innerHTML = `<span class="daily-tag">MISIÓN ${i + 1}${locked ? " · 🔒" : ""}</span><strong></strong><small></small><em>${best ? `${"★".repeat(best.stars)}${"☆".repeat(3 - best.stars)} · récord ${best.score}` : "Sin jugar"}</em>`;
      $("strong", b).textContent = m.title;
      $("small", b).textContent = m.intro;
      list.append(b);
    });
    root.append(head("MODO OBSERVACIÓN · 4 MISIONES"), intro, list);
  }

  function play(index) {
    const mission = OBS_MISSIONS[index];
    root.replaceChildren();
    S = {
      index,
      mission,
      elapsed: 0,
      active: [],
      incidents: mission.events
        .filter(([, k]) => INCIDENTS[k])
        .map(([t, kind]) => ({
          t: t + (DELAY[kind] || 0),
          kind,
          end: t + (DELAY[kind] || 0) + mission.window,
          detected: !1,
        })),
      normals: mission.events
        .filter(([, k]) => NORMAL[k])
        .map(([t, kind]) => ({ t, kind, end: t + 5 })),
      falseAlarms: 0,
      zone: 0,
      log: [],
      paused: !1,
      done: !1,
      options: shuffle(Object.keys(INCIDENTS)),
    };
    const bar = el("div", "obs-bar");
    bar.innerHTML = `<span class="obs-live"><i></i> CIRUGÍA EN CURSO</span><div class="obs-progress"><span id="obs-progress"></span></div><span id="obs-clock">00:00 / ${clock(mission.duration)}</span><span>Reportes <b id="obs-reports">0</b></span>`;
    const stageWrap = el("div", "obs-stage-wrap");
    const stage = el("div", "obs-stage");
    stage.id = "obs-stage";
    stage.setAttribute("role", "img");
    stage.setAttribute(
      "aria-label",
      "Quirófano: dos cirujanos operan mientras observas desde la zona de observación",
    );
    const report = button("obs-report", "", openReport);
    report.innerHTML = "REPORTAR <small>tecla R</small>";
    report.id = "obs-report";
    const dialog = el("div", "obs-dialog");
    dialog.id = "obs-dialog";
    dialog.hidden = !0;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Reportar una incidencia");
    const toast = el("p", "obs-toast");
    toast.id = "obs-toast";
    toast.setAttribute("role", "status");
    stageWrap.append(stage, report, dialog, toast);
    const side = el("aside", "obs-side");
    side.innerHTML = `<h3>Bitácora de observación</h3><p class="obs-hint"></p><ol id="obs-log" class="obs-log"></ol>`;
    $(".obs-hint", side).textContent = mission.intro;
    const grid = el("div", "obs-grid");
    grid.append(stageWrap, side);
    root.append(
      head(`MISIÓN ${index + 1} · ${mission.title.toUpperCase()}`),
      bar,
      grid,
    );

    keyHandler = (e) => {
      if (e.key === "Escape" && S.paused) return closeDialog();
      if ((e.key === "r" || e.key === "R") && !S.paused && !S.done) {
        e.preventDefault();
        openReport();
      }
    };
    document.addEventListener("keydown", keyHandler);

    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: stage,
      width: 1200,
      height: 675,
      backgroundColor: "#071b27",
      render: { antialias: !0 },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [],
    });
    game.registry.set("hooks", {
      onTick,
      onEvent: () => {},
      onZone: () => {
        S.zone++;
        toastMsg(
          "Estás invadiendo la zona estéril. Un observador se mantiene a distancia del campo (−10).",
          "bad",
        );
        Sound.play("bad");
      },
      onOutside: () =>
        toastMsg("Quédate dentro de la zona de observación verde.", ""),
    });
    game.scene.add("Observer", ObserverScene, !0);
    game.events.once("ready", () => {});
    const wait = () => {
      scene = game?.scene.getScene("Observer");
      if (!scene?.sys.isActive() || !scene.team) return setTimeout(wait, 60);
      Sound.startAmbient();
      countdown(3);
    };
    wait();
  }

  function countdown(n) {
    if (!scene) return;
    if (!n) {
      toastMsg("Observa. Reporta en cuanto veas algo.", "");
      return scene.start(S.mission);
    }
    toastMsg(`La cirugía empieza en ${n}…`, "");
    Sound.play("select");
    setTimeout(() => countdown(n - 1), 800);
  }

  function toastMsg(text, tone) {
    const t = $("#obs-toast", root);
    if (!t) return;
    t.textContent = text;
    t.className = `obs-toast show ${tone}`;
    clearTimeout(t.timer);
    t.timer = setTimeout(() => (t.className = "obs-toast"), 2800);
  }

  function onTick(elapsed) {
    S.elapsed = elapsed;
    const m = S.mission;
    $("#obs-clock", root).textContent =
      `${clock(elapsed)} / ${clock(m.duration)}`;
    $("#obs-progress", root).style.width =
      `${Math.min(100, (elapsed / m.duration) * 100)}%`;
    for (const i of S.incidents)
      !i.detected &&
        !i.closed &&
        elapsed > i.end &&
        ((i.closed = !0), scene?.recover(i.kind));
    elapsed >= m.duration && finish();
  }

  function openReport() {
    if (!scene?.running || S.paused || S.done) return;
    S.paused = !0;
    scene.scene.pause();
    const at = S.elapsed,
      d = $("#obs-dialog", root);
    d.replaceChildren(
      el("p", "chapter-label", `REPORTE · ${clock(at)}`),
      el("h2", "", "¿Qué observaste?"),
    );
    const opts = el("div", "obs-options");
    S.options.forEach((k) =>
      opts.append(
        button("option", INCIDENTS[k].label, () => chooseKind(k, at)),
      ),
    );
    opts.append(
      button("button button-quiet", "Cancelar, no era nada", closeDialog),
    );
    d.append(opts);
    d.hidden = !1;
    $(".option", d)?.focus();
  }

  function closeDialog() {
    const d = $("#obs-dialog", root);
    d && (d.hidden = !0);
    S.paused = !1;
    scene?.scene.resume();
    $("#obs-report", root)?.focus();
  }

  function chooseKind(kind, at) {
    const hit = S.incidents.find(
      (i) => i.kind === kind && !i.detected && at >= i.t && at <= i.end,
    );
    const d = $("#obs-dialog", root);
    if (!hit) {
      S.falseAlarms++;
      const normal = S.normals.find((n) => at >= n.t && at <= n.end),
        seen = S.incidents.find(
          (i) => i.kind === kind && i.detected && at <= i.end,
        );
      addLog(at, `Falsa alarma: «${INCIDENTS[kind].label}»`, "bad");
      Report.logObserver({
        mission: S.index,
        kind: `falsa-${kind}`,
        detected: !1,
        commOk: !1,
        answer: INCIDENTS[kind].label,
      });
      Sound.play("bad");
      return feedback(
        "Falsa alarma (−8)",
        seen
          ? "Esa incidencia ya la habías reportado."
          : normal
            ? NORMAL[normal.kind]
            : "En este momento no había ninguna incidencia de ese tipo. Reportar sin motivo interrumpe al equipo.",
        "bad",
      );
    }
    d.replaceChildren(
      el("p", "chapter-label", "BIEN VISTO · ¿CÓMO LO COMUNICAS?"),
      el("h2", "", INCIDENTS[kind].label),
    );
    const opts = el("div", "obs-options");
    shuffle(
      INCIDENTS[kind].comm.map((text, n) => ({ text, ok: n === 0 })),
    ).forEach((o) =>
      opts.append(button("option", o.text, () => chooseComm(hit, at, o))),
    );
    d.append(opts);
    $(".option", d)?.focus();
  }

  function chooseComm(hit, at, o) {
    hit.detected = !0;
    hit.reaction = at - hit.t;
    hit.fast = hit.reaction <= (hit.end - hit.t) / 2;
    hit.commOk = o.ok;
    hit.answer = o.text;
    scene?.recover(hit.kind);
    addLog(
      at,
      `${INCIDENTS[hit.kind].label} · ${o.ok ? "bien comunicado" : "comunicación a mejorar"}`,
      o.ok ? "good" : "warn",
    );
    Report.logObserver({
      mission: S.index,
      kind: hit.kind,
      detected: !0,
      commOk: o.ok,
      answer: o.text,
      ms: Math.round(hit.reaction * 1000),
    });
    Sound.play(o.ok ? "good" : "bad");
    feedback(
      o.ok
        ? `¡Bien! Detectada en ${hit.reaction.toFixed(1)} s y bien comunicada.`
        : `Detectada en ${hit.reaction.toFixed(1)} s, pero la comunicación no es la adecuada.`,
      o.ok
        ? INCIDENTS[hit.kind].why
        : `Lo correcto: ${INCIDENTS[hit.kind].comm[0]} ${INCIDENTS[hit.kind].why}`,
      o.ok ? "good" : "warn",
    );
  }

  function feedback(title, text, tone) {
    const d = $("#obs-dialog", root);
    d.replaceChildren(
      el(
        "p",
        `chapter-label obs-${tone}`,
        tone === "good" ? "CORRECTO" : "A REVISAR",
      ),
      el("h2", "", title),
      el("p", "obs-why", text),
      button("button button-primary", "Seguir observando →", closeDialog),
    );
    $(".button-primary", d).focus();
  }

  function addLog(at, text, tone) {
    S.log.push({ at, text, tone });
    const li = el("li", `obs-${tone}`);
    li.append(el("b", "", clock(at)), document.createTextNode(` ${text}`));
    $("#obs-log", root)?.append(li);
    $("#obs-reports", root).textContent = S.log.length;
  }

  function finish() {
    if (S.done) return;
    S.done = !0;
    scene && (scene.running = !1);
    stopKeys();
    Sound.stopAmbient();
    const score = scoreRun(S),
      stars = starsFor(score),
      record = Progress.saveObserver(S.index, score, stars),
      all = S.incidents.every((i) => i.detected);
    for (const i of S.incidents)
      i.detected ||
        Report.logObserver({
          mission: S.index,
          kind: i.kind,
          detected: !1,
          commOk: !1,
          answer: "no detectada",
        });
    Progress.recordPlay();
    Progress.unlock("observador");
    all && !S.falseAlarms && !S.zone && Progress.unlock("ojo-clinico");
    LMS.saveProgress();
    Sound.play("complete");
    destroyGame();

    root.replaceChildren(
      head(
        `MISIÓN ${S.index + 1} · ${S.mission.title.toUpperCase()} · RESULTADO`,
      ),
    );
    const box = el("div", "mayo-summary obs-summary");
    const found = S.incidents.filter((i) => i.detected).length;
    box.innerHTML = `<div class="debrief-score">${score}<small> / 100${record ? " · ¡nuevo récord!" : ""}</small></div>
      <p class="obs-stars" aria-label="${stars} de 3 estrellas">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
      <div class="mayo-summary-stats">
        <span><b>${found}/${S.incidents.length}</b> incidencias detectadas</span>
        <span><b>${S.incidents.filter((i) => i.commOk).length}</b> bien comunicadas</span>
        <span><b>${S.falseAlarms}</b> falsas alarmas</span>
        <span><b>${S.zone}</b> invasiones de la zona estéril</span>
      </div>`;
    const table = el("div", "obs-review");
    table.append(el("h3", "", "Lo que pasó en la sala"));
    S.incidents.forEach((i) => {
      const row = el(
        "div",
        `obs-review-row ${i.detected ? (i.commOk ? "good" : "warn") : "bad"}`,
      );
      const status = i.detected
        ? `Detectada a los ${i.reaction.toFixed(1)} s${i.fast ? "" : " (tarde)"} · ${i.commOk ? "comunicación correcta" : "comunicación a mejorar"}`
        : "Se te escapó";
      row.append(
        el("b", "", `${clock(i.t)} · ${INCIDENTS[i.kind].label}`),
        el("span", "", status),
        el(
          "small",
          "",
          i.commOk
            ? INCIDENTS[i.kind].why
            : `Lo correcto: ${INCIDENTS[i.kind].comm[0]}`,
        ),
      );
      table.append(row);
    });
    box.append(table);
    onFinish?.(box, { mission: S.index, score, stars });
    const actions = el("div", "debrief-buttons");
    actions.append(
      button("button button-primary", "Repetir misión →", () => play(S.index)),
    );
    const next = S.index + 1;
    next < OBS_MISSIONS.length &&
      !isLocked(next) &&
      actions.append(
        button("button button-quiet", "Siguiente misión", () => play(next)),
      );
    actions.append(button("button button-quiet", "Todas las misiones", menu));
    box.append(actions);
    root.append(box);
    $(".button-primary", box)?.focus();
  }

  return {
    start: menu,
    stop() {
      stopKeys();
      destroyGame();
      S && (S.done = !0);
    },
    // Para las pruebas automáticas.
    debug: () => ({ S, scene }),
  };
}
