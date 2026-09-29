// Equipo quirúrgico en la mesa: paciente con campo estéril, cirujano principal
// (al otro lado de la mesa, de frente) y ayudante (de espaldas, del lado de la
// cámara). Se dibujan con las mismas proporciones que el personaje del alumno,
// pero con bata estéril, gorro de quirófano y guantes estériles, para que se
// distinga a simple vista quién está dentro del campo y quién no.
// Coordenadas en el lienzo de 1200×675.

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

const GOWN = `<linearGradient id="gw" x1="0" x2="1"><stop offset="0" stop-color="#5f9fd6"/><stop offset=".5" stop-color="#86bde9"/><stop offset="1" stop-color="#4b86bf"/></linearGradient>`;
const SKIN = `<radialGradient id="sk" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#e2ab85"/><stop offset="1" stop-color="#b98160"/></radialGradient>`;
const CAP = `<linearGradient id="cp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fb0a6"/><stop offset="1" stop-color="#23827b"/></linearGradient>`;

const svg = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;

// Bata estéril vista de frente; la cabeza mira al frente o hacia el monitor.
function front(gaze) {
  const ex = gaze === "izquierda" ? -1.3 : 0;
  return svg(
    60,
    104,
    GOWN + SKIN + CAP,
    `<path d="M7 60 Q9 53 22 51 L38 51 Q51 53 53 60 L52 104 L8 104 Z" fill="url(#gw)" stroke="#2f5f8f" stroke-width="1.2"/>
    <path d="M22 51 Q30 57 38 51" fill="none" stroke="#2f5f8f" stroke-width="1.4"/>
    <path d="M18 70 L20 104 M42 70 L40 104 M30 60 L30 104" stroke="#3f77ad" stroke-width=".9" opacity=".55"/>
    <path d="M8 84 L52 84" stroke="#2f5f8f" stroke-width="1.6" opacity=".45"/>
    <rect x="25" y="42" width="10" height="11" rx="3" fill="#b27a58"/>
    <ellipse cx="12.5" cy="31" rx="3" ry="4.2" fill="#b98160"/><ellipse cx="47.5" cy="31" rx="3" ry="4.2" fill="#b98160"/>
    <circle cx="30" cy="29" r="17" fill="url(#sk)"/>
    <path d="M20 26 Q23.5 24 27 25.5 M33 25.5 Q36.5 24 40 26" stroke="#3b2418" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <ellipse cx="23.6" cy="30" rx="2.1" ry="2.4" fill="#fff"/><ellipse cx="36.4" cy="30" rx="2.1" ry="2.4" fill="#fff"/>
    <circle cx="${24 + ex}" cy="30.4" r="1.45" fill="#2a1a12"/><circle cx="${36.8 + ex}" cy="30.4" r="1.45" fill="#2a1a12"/>
    <rect x="18.5" y="26.5" width="10" height="7.5" rx="2.5" fill="#dff4ff" fill-opacity=".25" stroke="#9fb9c9" stroke-width=".8"/>
    <rect x="31.5" y="26.5" width="10" height="7.5" rx="2.5" fill="#dff4ff" fill-opacity=".25" stroke="#9fb9c9" stroke-width=".8"/>
    <path d="M28.5 29 L31.5 29" stroke="#9fb9c9" stroke-width=".8"/>
    <path d="M15 34 Q30 31 45 34 L44 44 Q30 50 16 44 Z" fill="#e8f5fb" stroke="#9cc3d6" stroke-width=".7"/>
    <path d="M17 37.5 Q30 35.5 43 37.5 M17.5 40.5 Q30 39 42.5 40.5" stroke="#9cc3d6" stroke-width=".6" fill="none"/>
    <path d="M10.5 24 Q9 6 30 4 Q51 6 49.5 24 Q40 20 30 20.5 Q20 20 10.5 24 Z" fill="url(#cp)" stroke="#1d6a64" stroke-width="1"/>
    <path d="M12 21 Q30 14 48 21" stroke="#1d6a64" stroke-width=".7" fill="none" opacity=".6"/>`,
  );
}

// Bata vista de espaldas: cintas de la bata cruzada y gorro por detrás.
const back = svg(
  60,
  104,
  GOWN + SKIN + CAP,
  `<path d="M7 60 Q9 53 22 51 L38 51 Q51 53 53 60 L52 104 L8 104 Z" fill="url(#gw)" stroke="#2f5f8f" stroke-width="1.2"/>
  <path d="M30 54 L30 104" stroke="#2f5f8f" stroke-width="1.1" opacity=".6"/>
  <path d="M34 54 Q44 70 42 104" stroke="#3f77ad" stroke-width="1" fill="none" opacity=".6"/>
  <path d="M8 82 L52 82" stroke="#2f5f8f" stroke-width="2.2" opacity=".55"/>
  <path d="M30 82 L25 90 M30 82 L35 91" stroke="#2f5f8f" stroke-width="1.4" opacity=".7"/>
  <rect x="25" y="42" width="10" height="11" rx="3" fill="#b27a58"/>
  <ellipse cx="12.5" cy="31" rx="3" ry="4.2" fill="#b98160"/><ellipse cx="47.5" cy="31" rx="3" ry="4.2" fill="#b98160"/>
  <circle cx="30" cy="29" r="17" fill="url(#sk)"/>
  <path d="M12 36 Q30 41 48 36" stroke="#e8f5fb" stroke-width="1.2" fill="none"/>
  <path d="M28 38 L25 45 M32 38 L35 45" stroke="#e8f5fb" stroke-width="1"/>
  <path d="M11 30 Q9 6 30 4 Q51 6 49 30 Q40 35 30 35 Q20 35 11 30 Z" fill="url(#cp)" stroke="#1d6a64" stroke-width="1"/>
  <path d="M16 14 Q30 22 44 14 M13 24 Q30 31 47 24" stroke="#1d6a64" stroke-width=".7" fill="none" opacity=".55"/>`,
);

// Brazo con manga de bata y guante estéril (color crema: el del alumno es de nitrilo).
const arm = svg(
  14,
  46,
  `<linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#77b1e2"/><stop offset="1" stop-color="#4b86bf"/></linearGradient>
  <linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#f6ecd9"/><stop offset="1" stop-color="#d9c7a6"/></linearGradient>`,
  `<path d="M1 5 Q1 1 7 1 Q13 1 13 5 L12 33 L2 33 Z" fill="url(#s)" stroke="#2f5f8f" stroke-width=".8"/>
  <rect x="2" y="29" width="10" height="3.5" rx="1.2" fill="#e9dcc2" stroke="#b9a37f" stroke-width=".5"/>
  <path d="M2.4 32 L11.6 32 L11.9 40 Q11.9 45 7 45 Q2.1 45 2.1 40 Z" fill="url(#g)" stroke="#b9a37f" stroke-width=".6"/>`,
);

// Piernas: pantalón de pijama bajo la bata y calzas.
const leg = svg(
  18,
  40,
  `<linearGradient id="p" x1="0" x2="1"><stop offset="0" stop-color="#4b86bf"/><stop offset="1" stop-color="#2f5f8f"/></linearGradient>`,
  `<path d="M2 0 L16 0 L15 31 L3 31 Z" fill="url(#p)" stroke="#2f5f8f" stroke-width=".8"/>
  <path d="M2 30 Q2 27.5 5 27.5 L13 27.5 Q16 27.5 16.5 31 L17.5 36 Q17.5 39.5 14 39.5 L4 39.5 Q0.8 39.5 1 36 Z" fill="#cfe7f3" stroke="#8fb6cc" stroke-width=".7"/>`,
);

export const TEAM_SVGS = {
  "team-front": front("frente"),
  "team-front-left": front("izquierda"),
  "team-back": back,
  "team-arm": arm,
  "team-leg": leg,
};

export function teamUrl(key) {
  return URL.createObjectURL(
    new Blob([TEAM_SVGS[key]], { type: "image/svg+xml" }),
  );
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
