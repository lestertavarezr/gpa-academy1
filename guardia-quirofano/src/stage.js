// Etapa A · 2.5D: profundidad, luz e iconos de la sala isométrica.
//
// La sala es una sola ilustración. Para que el personaje pueda pasar por
// detrás de los muebles se recortan de la propia imagen las siluetas de los
// objetos del primer plano («oclusores»). Cada recorte se dibuja exactamente
// sobre su sitio, así que es invisible hasta que el personaje queda detrás:
// entonces lo tapa. Quién va delante se decide comparando los pies del
// personaje con la línea de apoyo del mueble en el suelo («huella»).
// Coordenadas en el lienzo de 1200×675.

export const OCCLUDERS = [
  {
    id: "mesa-quirurgica",
    shape: [
      [446, 300],
      [472, 270],
      [525, 278],
      [610, 305],
      [700, 338],
      [745, 362],
      [746, 392],
      [700, 402],
      [646, 428],
      [646, 448],
      [600, 473],
      [560, 470],
      [488, 428],
      [484, 398],
      [470, 345],
      [446, 332],
    ],
    // Borde delantero de la huella en el suelo (de izquierda a derecha).
    footprint: [
      [440, 345],
      [485, 398],
      [560, 470],
      [600, 472],
      [646, 448],
      [700, 405],
      [750, 398],
    ],
  },
  {
    id: "anestesia",
    shape: [
      [268, 160],
      [320, 118],
      [382, 118],
      [410, 165],
      [428, 215],
      [430, 330],
      [421, 353],
      [360, 360],
      [325, 364],
      [290, 362],
      [270, 332],
    ],
    footprint: [
      [268, 362],
      [430, 350],
    ],
  },
  {
    id: "mesa-material",
    shape: [
      [42, 452],
      [95, 418],
      [152, 418],
      [302, 498],
      [304, 632],
      [292, 644],
      [196, 670],
      [178, 666],
      [58, 566],
      [44, 522],
    ],
    footprint: [
      [44, 545],
      [190, 666],
      [302, 632],
    ],
  },
  {
    id: "mesa-mayo",
    shape: [
      [712, 470],
      [840, 405],
      [880, 392],
      [937, 402],
      [937, 442],
      [924, 532],
      [800, 602],
      [794, 617],
      [778, 617],
      [724, 588],
      [714, 560],
    ],
    footprint: [
      [716, 588],
      [790, 614],
      [924, 528],
    ],
  },
];

/** Altura del borde delantero de la huella en la x dada. */
export function footprintY(footprint, x) {
  if (x <= footprint[0][0]) return footprint[0][1];
  for (let i = 1; i < footprint.length; i++) {
    const [x0, y0] = footprint[i - 1],
      [x1, y1] = footprint[i];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return footprint[footprint.length - 1][1];
}

/** Recorta cada oclusor de la ilustración a una textura con transparencia. */
export function buildOccluders(scene, roomKey) {
  const src = scene.textures.get(roomKey).getSourceImage(),
    sx = src.width / 1200,
    sy = src.height / 675;
  return OCCLUDERS.map((o) => {
    const xs = o.shape.map((p) => p[0]),
      ys = o.shape.map((p) => p[1]),
      x0 = Math.floor(Math.min(...xs)) - 2,
      y0 = Math.floor(Math.min(...ys)) - 2,
      w = Math.ceil(Math.max(...xs)) - x0 + 4,
      h = Math.ceil(Math.max(...ys)) - y0 + 4,
      key = `occ-${o.id}`,
      tex = scene.textures.createCanvas(key, w, h),
      ctx = tex.getContext();
    ctx.beginPath();
    o.shape.forEach(([x, y], i) =>
      i ? ctx.lineTo(x - x0, y - y0) : ctx.moveTo(x - x0, y - y0),
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(src, x0 * sx, y0 * sy, w * sx, h * sy, 0, 0, w, h);
    tex.refresh();
    return { ...o, image: scene.add.image(x0, y0, key).setOrigin(0, 0) };
  });
}

// --- Texturas generadas ----------------------------------------------------------

function canvasTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  draw(tex.getContext(), w, h);
  tex.refresh();
}

export function makeStageTextures(scene) {
  // Viñeta cinematográfica.
  canvasTexture(scene, "vignette", 600, 338, (g, w, h) => {
    const rg = g.createRadialGradient(
      w / 2,
      h * 0.46,
      h * 0.36,
      w / 2,
      h / 2,
      w * 0.62,
    );
    rg.addColorStop(0, "rgba(3,14,22,0)");
    rg.addColorStop(1, "rgba(3,14,22,0.55)");
    g.fillStyle = rg;
    g.fillRect(0, 0, w, h);
  });
  // Charco de luz (se estira en elipse para el suelo).
  canvasTexture(scene, "light-pool", 256, 256, (g) => {
    const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    rg.addColorStop(0, "rgba(255,252,236,0.9)");
    rg.addColorStop(0.45, "rgba(214,244,255,0.35)");
    rg.addColorStop(1, "rgba(200,240,255,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 256, 256);
  });
  // Anillo del destino en el suelo.
  canvasTexture(scene, "floor-ring", 160, 160, (g) => {
    g.strokeStyle = "rgba(141,241,222,0.95)";
    g.lineWidth = 7;
    g.beginPath();
    g.arc(80, 80, 66, 0, Math.PI * 2);
    g.stroke();
    const rg = g.createRadialGradient(80, 80, 0, 80, 80, 70);
    rg.addColorStop(0, "rgba(141,241,222,0.35)");
    rg.addColorStop(1, "rgba(141,241,222,0)");
    g.fillStyle = rg;
    g.fill();
  });
  // Chispa para celebraciones.
  canvasTexture(scene, "spark", 16, 16, (g) => {
    const rg = g.createRadialGradient(8, 8, 0, 8, 8, 8);
    rg.addColorStop(0, "rgba(255,255,255,1)");
    rg.addColorStop(0.4, "rgba(255,230,160,0.9)");
    rg.addColorStop(1, "rgba(255,200,90,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 16, 16);
  });
  // Distintivo de estación: disco de vidrio con borde iluminado y sombra.
  canvasTexture(scene, "station-pin", 96, 104, (g) => {
    g.fillStyle = "rgba(0,10,16,0.45)";
    g.beginPath();
    g.ellipse(48, 96, 26, 6, 0, 0, Math.PI * 2);
    g.fill();
    const body = g.createLinearGradient(0, 8, 0, 84);
    body.addColorStop(0, "#1f6f78");
    body.addColorStop(1, "#0a3440");
    g.fillStyle = body;
    g.beginPath();
    g.arc(48, 46, 36, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = "rgba(170,255,238,0.9)";
    g.stroke();
    const gloss = g.createLinearGradient(0, 12, 0, 50);
    gloss.addColorStop(0, "rgba(255,255,255,0.38)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gloss;
    g.beginPath();
    g.ellipse(48, 30, 26, 14, 0, 0, Math.PI * 2);
    g.fill();
  });
}

// --- Iconos de estación (sustituyen a las letras ID, ST, MN…) ------------------------
// Archivos SVG en assets/iconos (expediente, paquete estéril, monitor, frasco de
// aspiración, gasas con verificación y equipo). Se cargan como archivos, no como
// URL blob: la página publicada no permite imágenes blob.

import fichaIcon from "./assets/iconos/ficha.svg";
import materialIcon from "./assets/iconos/material.svg";
import monitorIcon from "./assets/iconos/monitor.svg";
import aspiracionIcon from "./assets/iconos/aspiracion.svg";
import conteoIcon from "./assets/iconos/conteo.svg";
import equipoIcon from "./assets/iconos/equipo.svg";

export const STATION_ICONS = {
  ficha: fichaIcon,
  material: materialIcon,
  monitor: monitorIcon,
  aspiracion: aspiracionIcon,
  conteo: conteoIcon,
  equipo: equipoIcon,
};

/**
 * En el archivo único de la demo los SVG llegan incrustados como
 * «data:image/svg+xml,…» sin base64, que el cargador de Phaser no sabe leer:
 * se convierten en una URL blob equivalente. En el resto de builds son archivos.
 */
export function svgUrl(url) {
  if (!url.startsWith("data:image/svg+xml,")) return url;
  const svg = decodeURIComponent(url.slice(url.indexOf(",") + 1));
  return URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
}

export function iconUrl(id) {
  return svgUrl(STATION_ICONS[id]);
}
