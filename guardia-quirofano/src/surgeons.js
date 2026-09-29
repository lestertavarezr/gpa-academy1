// Equipo quirúrgico en la mesa: paciente con campo estéril, cirujano principal
// (al otro lado de la mesa, de frente) y ayudante (de espaldas, del lado de la
// cámara). Se dibujan con las mismas proporciones que el personaje del alumno,
// pero con bata estéril, gorro de quirófano y guantes estériles, para que se
// distinga a simple vista quién está dentro del campo y quién no.
// Coordenadas en el lienzo de 1200×675.

import frontUrl from "./assets/equipo/front.svg";
import frontLeftUrl from "./assets/equipo/front-left.svg";
import backUrl from "./assets/equipo/back.svg";
import armUrl from "./assets/equipo/arm.svg";
import legUrl from "./assets/equipo/leg.svg";
import { svgUrl } from "./stage.js";

// Esquinas del tablero de la mesa quirúrgica (cabecera → pies).
const A = [478, 272], // cabecera, lado lejano
  B = [748, 362], // pies, lado lejano
  D = [453, 306]; // cabecera, lado cercano
/** Punto del tablero: t a lo largo (0 cabecera, 1 pies), w a lo ancho (0 lejos, 1 cerca). */
export function top(t, w, lift = 0) {
  return [
    A[0] + t * (B[0] - A[0]) + w * (D[0] - A[0]),
    A[1] + t * (B[1] - A[1]) + w * (D[1] - A[1]) - lift,
  ];
}

// Posiciones de los pies en el suelo.
export const TEAM = {
  cirujano: { x: 604, y: 352 },
  ayudante: { x: 668, y: 452 },
};

// --- Dibujos -----------------------------------------------------------------------
// Archivos SVG en assets/equipo, con las mismas proporciones que el personaje
// del alumno: bata estéril de frente (mirando al frente o hacia el monitor) y de
// espaldas, brazo con manga de bata y guante estéril color crema (el del alumno
// es de nitrilo) y piernas con calzas.

export const TEAM_TEXTURES = {
  "team-front": frontUrl,
  "team-front-left": frontLeftUrl,
  "team-back": backUrl,
  "team-arm": armUrl,
  "team-leg": legUrl,
};

export function teamUrl(key) {
  return svgUrl(TEAM_TEXTURES[key]);
}

// --- Paciente ----------------------------------------------------------------------

function poly(g, pts, color, alpha = 1, line) {
  g.fillStyle(color, alpha);
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fillPath();
  if (line) {
    g.lineStyle(line[0], line[1], line[2] ?? 1);
    g.strokePath();
  }
}

/**
 * Paciente cubierto con campo estéril, arco de anestesia y ventana quirúrgica.
 * La incisión va aparte: solo se ve cuando la cirugía empieza, tras la pausa.
 */
export function drawPatient(scene) {
  const g = scene.add.graphics(),
    // Relieve del cuerpo según la posición: tórax y abdomen más altos, piernas bajas.
    height = (t) =>
      t < 0.22
        ? 5
        : t < 0.62
          ? 11 - Math.abs(t - 0.42) * 12
          : 8 - (t - 0.62) * 9,
    edge = (w0, w1, lift) => {
      const pts = [];
      for (let i = 0; i <= 16; i++) {
        const t = 0.18 + (0.74 * i) / 16;
        pts.push(top(t, w0, lift(t)));
      }
      for (let i = 16; i >= 0; i--) {
        const t = 0.18 + (0.74 * i) / 16;
        pts.push(top(t, w1, lift(t)));
      }
      return pts;
    };
  // Cabeza sobre la almohada (lado de anestesia), con gorro.
  const [hx, hy] = top(0.08, 0.5, 8);
  g.fillStyle(0xc88f6c, 1).fillEllipse(hx, hy, 22, 15);
  g.fillStyle(0x7bb8d8, 1).fillEllipse(hx - 4, hy - 3, 16, 12);
  // Sábana sobre el cuerpo: lado de la cámara en sombra, lomo iluminado.
  poly(
    g,
    edge(0.16, 0.86, (t) => 3),
    0x3f7fb5,
    1,
  );
  poly(g, edge(0.2, 0.62, height), 0x5b9bd0, 1);
  poly(
    g,
    edge(0.55, 0.84, (t) => height(t) * 0.55 + 2),
    0x4a88bf,
    1,
  );
  poly(
    g,
    edge(0.3, 0.46, (t) => height(t) + 1),
    0x9ccbee,
    0.6,
  );
  // Ventana quirúrgica (piel preparada) con la incisión y el borde adhesivo.
  const win = [
    top(0.43, 0.32, 11),
    top(0.55, 0.32, 11),
    top(0.55, 0.64, 9),
    top(0.43, 0.64, 9),
  ];
  poly(g, win, 0xd29a76, 1, [1.6, 0xeef6fa, 0.95]);
  const incision = scene.add.graphics(),
    [ix0, iy0] = top(0.455, 0.47, 11),
    [ix1, iy1] = top(0.525, 0.47, 11);
  incision.lineStyle(2.4, 0x8f2a31, 1).lineBetween(ix0, iy0, ix1, iy1);
  incision.lineStyle(1, 0xe46a6f, 0.85).lineBetween(ix0, iy0 - 1, ix1, iy1 - 1);
  // Arco de anestesia: sábana vertical que separa la cabeza del campo.
  const [a0x, a0y] = top(0.17, 0, 0),
    [a1x, a1y] = top(0.17, 1, 0),
    h = 22;
  poly(
    g,
    [
      [a0x, a0y],
      [a1x, a1y],
      [a1x, a1y - h],
      [a0x, a0y - h],
    ],
    0x356f9f,
    0.9,
  );
  g.lineStyle(2, 0xc5d6df, 1).lineBetween(a0x, a0y - h, a1x, a1y - h);
  return { body: g, incision: incision.setVisible(!1) };
}

// --- Personajes --------------------------------------------------------------------

/** Crea un integrante del equipo. «back» indica si se le ve de espaldas. */
export function makeMember(scene, { x, y }, back) {
  const s = Math.max(0.82, Math.min(1.16, 0.86 + ((y - 300) / 300) * 0.26)),
    k = 1.1 * s,
    part = (key, px, py, ox, oy) =>
      scene.add.image(px, py, key).setOrigin(ox, oy).setScale(0.5),
    legs = [
      part("team-leg", -8, -36, 0.5, 0),
      part("team-leg", 8, -36, 0.5, 0),
    ],
    torso = part(back ? "team-back" : "team-front", 0, -30, 0.5, 1),
    leftArm = part("team-arm", -25, -77, 0.5, 0.06),
    rightArm = part("team-arm", 25, -77, 0.5, 0.06).setFlipX(!0),
    shadow = scene.add.ellipse(0, 3, 64, 16, 0x031b27, 0.4),
    // De frente, los brazos van delante del cuerpo (sobre el paciente); de
    // espaldas, detrás (las manos quedan ocultas trabajando en el campo).
    bodyParts = back
      ? [shadow, ...legs, leftArm, rightArm, torso]
      : [shadow, ...legs, torso],
    body = scene.add.container(x, y, bodyParts).setScale(k),
    arms = back
      ? null
      : scene.add.container(x, y, [leftArm, rightArm]).setScale(k);
  return { body, arms, torso, leftArm, rightArm, back, x, y, s };
}

// --- Posturas ----------------------------------------------------------------------

/**
 * Postura del equipo: «ready» espera en posición estéril (manos juntas a la
 * altura del pecho), «event» mira el monitor y «work» opera. Con `ask` el
 * ayudante pide instrumental hacia la Mesa de Mayo cada pocos segundos.
 * La escena debe tener `team`, `patient`, `teamTweens` y `reduced`.
 */
export function poseTeam(scene, pose, { ask = !0 } = {}) {
  if (!scene.team || pose === scene.teamPoseNow) return;
  scene.teamPoseNow = pose;
  const { cirujano: c, ayudante: h } = scene.team;
  (scene.teamTweens.forEach((tw) => tw.stop()),
    (scene.teamTweens = []),
    scene.teamAsk?.remove(),
    (scene.teamAsk = null));
  const set = {
      work: [-9, 13, -20, 20],
      event: [-58, 58, -34, 34],
      ready: [-58, 58, -34, 34],
    }[pose],
    move = (target, angle, extra = {}) =>
      scene.teamTweens.push(
        scene.tweens.add({
          targets: target,
          angle,
          duration: scene.reduced ? 0 : 450,
          ease: "Sine.easeInOut",
          ...extra,
        }),
      );
  (c.torso.setTexture(pose === "event" ? "team-front-left" : "team-front"),
    move(c.leftArm, set[0]),
    move(c.rightArm, set[1]),
    move(h.leftArm, set[2]),
    move(h.rightArm, set[3]),
    c.rightArm.setY(-77),
    scene.patient.incision.setVisible(pose === "work"));
  if (scene.reduced) return;
  if (pose !== "work") {
    // En espera: respiran y el ayudante acomoda las manos.
    const idle = (target, props, duration, delay = 0) =>
      scene.teamTweens.push(
        scene.tweens.add({
          targets: target,
          ...props,
          duration,
          delay,
          yoyo: !0,
          repeat: -1,
          ease: "Sine.easeInOut",
        }),
      );
    return (
      idle(c.torso, { scaleY: 0.508 }, 1500),
      idle(h.torso, { scaleY: 0.507 }, 1600, 300),
      pose === "ready" && idle(h.leftArm, { angle: set[2] + 5 }, 2100, 600)
    );
  }
  // Trabajo continuo: el cirujano sutura, el ayudante sostiene y ajusta, y
  // de vez en cuando pide instrumental hacia la Mesa de Mayo.
  scene.time.delayedCall(460, () => {
    if (scene.teamPoseNow !== "work") return;
    const loop = (target, props, duration, delay = 0) =>
      scene.teamTweens.push(
        scene.tweens.add({
          targets: target,
          ...props,
          duration,
          delay,
          yoyo: !0,
          repeat: -1,
          ease: "Sine.easeInOut",
        }),
      );
    (loop(c.rightArm, { angle: 24, y: -73 }, 620),
      loop(c.leftArm, { angle: -4 }, 1700, 200),
      loop(c.torso, { scaleY: 0.508 }, 1500),
      loop(h.leftArm, { angle: -15 }, 1300),
      loop(h.torso, { scaleY: 0.507 }, 1600, 300));
    const askNow = () => {
      if (scene.teamPoseNow !== "work") return;
      scene.teamTweens.push(
        scene.tweens.add({
          targets: h.rightArm,
          angle: -72,
          duration: 380,
          hold: 1100,
          yoyo: !0,
          ease: "Sine.easeInOut",
        }),
      );
      scene.teamAsk = scene.time.delayedCall(9000, askNow);
    };
    ask && (scene.teamAsk = scene.time.delayedCall(4000, askNow));
  });
}
