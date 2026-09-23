// Instrumental de la Mesa de Mayo: nombre, función, peticiones del cirujano
// y un dibujo vectorial esquemático generado por código.
// `call`: petición por nombre; `need`: petición por función (sin nombrarlo).
// `tier` 1 = instrumental básico que aparece desde el principio.
// PENDIENTE: validación del equipo docente.

export const INSTRUMENTS = [
  {
    id: "bisturi",
    name: "Mango de bisturí n.º 3",
    use: "Porta hojas n.º 10-15 para incidir y cortar tejido.",
    call: "¡Bisturí!",
    need: "Voy a incidir la piel: necesito corte.",
    tier: 1,
    draw: "scalpel",
  },
  {
    id: "metzenbaum",
    name: "Tijera Metzenbaum",
    use: "Tijera larga y fina para disecar tejido delicado.",
    call: "¡Metzenbaum!",
    need: "Tijera para disecar tejido delicado.",
    tier: 1,
    draw: "metz",
  },
  {
    id: "mayo-recta",
    name: "Tijera Mayo recta",
    use: "Tijera robusta de hojas rectas; se usa para cortar suturas.",
    call: "¡Mayo recta!",
    need: "Tijera para cortar la sutura.",
    tier: 1,
    draw: "scissors",
  },
  {
    id: "mayo-curva",
    name: "Tijera Mayo curva",
    use: "Tijera robusta de hojas curvas para tejido denso, como la fascia.",
    call: "¡Mayo curva!",
    need: "Tijera fuerte para cortar tejido denso.",
    tier: 2,
    draw: "scissors-curved",
  },
  {
    id: "kelly",
    name: "Pinza Kelly",
    use: "Pinza hemostática de tamaño mediano para pinzar vasos.",
    call: "¡Kelly!",
    need: "Pinza hemostática mediana para este vaso.",
    tier: 1,
    draw: "clamp-curved",
  },
  {
    id: "mosquito",
    name: "Pinza mosquito (Halsted)",
    use: "Pinza hemostática pequeña y fina para vasos muy pequeños.",
    call: "¡Mosquito!",
    need: "Hemostática fina para un vaso muy pequeño.",
    tier: 2,
    draw: "clamp-small",
  },
  {
    id: "kocher",
    name: "Pinza Kocher",
    use: "Pinza fuerte con dientes en la punta para tejido fibroso.",
    call: "¡Kocher!",
    need: "Pinza fuerte con dientes para tejido fibroso.",
    tier: 2,
    draw: "kocher",
  },
  {
    id: "allis",
    name: "Pinza Allis",
    use: "Pinza de prensión con dientecillos finos para traccionar tejido.",
    call: "¡Allis!",
    need: "Pinza de dientecillos finos para traccionar tejido.",
    tier: 2,
    draw: "allis",
  },
  {
    id: "babcock",
    name: "Pinza Babcock",
    use: "Pinza de prensión atraumática para estructuras tubulares, como el intestino.",
    call: "¡Babcock!",
    need: "Pinza atraumática para sujetar el intestino.",
    tier: 2,
    draw: "babcock",
  },
  {
    id: "diseccion-dientes",
    name: "Pinza de disección con dientes",
    use: "Sujeta tejidos firmes, como la piel, sin que se deslicen.",
    call: "¡Disección con dientes!",
    need: "Pinza de disección para sujetar la piel.",
    tier: 1,
    draw: "forceps-teeth",
  },
  {
    id: "diseccion-lisa",
    name: "Pinza de disección sin dientes",
    use: "Sujeta tejidos delicados con menor trauma.",
    call: "¡Disección sin dientes!",
    need: "Pinza de disección atraumática para tejido delicado.",
    tier: 1,
    draw: "forceps",
  },
  {
    id: "portaagujas",
    name: "Portaagujas Mayo-Hegar",
    use: "Sostiene la aguja de sutura con firmeza.",
    call: "¡Portaagujas!",
    need: "Vamos a suturar: algo para sostener la aguja.",
    tier: 1,
    draw: "needle-holder",
  },
  {
    id: "farabeuf",
    name: "Separador Farabeuf",
    use: "Separador manual para planos superficiales.",
    call: "¡Farabeuf!",
    need: "Separador manual para los bordes superficiales.",
    tier: 1,
    draw: "farabeuf",
  },
  {
    id: "balfour",
    name: "Separador Balfour",
    use: "Separador autoestático para la pared abdominal.",
    call: "¡Balfour!",
    need: "Separador autoestático para el abdomen.",
    tier: 2,
    draw: "balfour",
  },
  {
    id: "yankauer",
    name: "Aspirador Yankauer",
    use: "Cánula rígida para aspirar líquidos del campo.",
    call: "¡Yankauer!",
    need: "Necesito aspirar el campo.",
    tier: 1,
    draw: "yankauer",
  },
  {
    id: "backhaus",
    name: "Pinza de campo Backhaus",
    use: "Fija los campos quirúrgicos entre sí.",
    call: "¡Backhaus!",
    need: "Algo para fijar los campos.",
    tier: 2,
    draw: "backhaus",
  },
];

// --- Dibujos -----------------------------------------------------------------
// Lienzo 160×64, instrumento horizontal con los mangos a la izquierda.

const STEEL = 'stroke="#46606c" fill="url(#steel)"';
const line = (w = 2.4) =>
  `stroke="#46606c" stroke-width="${w}" fill="none" stroke-linecap="round"`;
const LINE = line();
const defs = `<defs><linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fa"/><stop offset=".5" stop-color="#c3d0d7"/><stop offset="1" stop-color="#8fa3ad"/></linearGradient></defs>`;

// Mangos de anillas + tallos cruzados hasta la articulación en x=78.
function rings(len = 78) {
  return `<ellipse cx="16" cy="18" rx="10" ry="8" ${LINE}/><ellipse cx="16" cy="46" rx="10" ry="8" ${LINE}/>
  <path d="M25 21 L${len} 30 M25 43 L${len} 34" ${LINE}/>
  <path d="M40 22 L44 24 M40 42 L44 40" ${LINE}/>
  <circle cx="${len}" cy="32" r="3.2" ${STEEL}/>`;
}

const SHAPES = {
  scalpel: `<rect x="14" y="27" width="104" height="10" rx="4" ${STEEL} stroke-width="1.4"/>
    <path d="M30 32 H100" stroke="#46606c" stroke-width="1" stroke-dasharray="3 3"/>
    <path d="M118 29 L146 31 Q150 32 146 33 L118 35 Z" fill="#dfe8ec" stroke="#46606c" stroke-width="1.2"/>`,
  metz: `${rings(96)}<path d="M96 30 Q124 29 148 31.2 M96 34 Q124 35 148 32.8" ${LINE}/>`,
  scissors: `${rings(80)}<path d="M80 29 L144 27 L146 30 L80 32 Z M80 35 L144 37 L146 34 L80 32 Z" ${STEEL} stroke-width="1.2"/>`,
  "scissors-curved": `${rings(80)}<path d="M80 29 Q120 25 146 20 L147 24 Q120 30 80 32 Z M80 35 Q120 33 146 24 L145 28 Q120 37 80 32 Z" ${STEEL} stroke-width="1.2"/>`,
  "clamp-curved": `${rings(80)}<path d="M80 31 Q118 30 142 22 M80 33 Q118 34 142 24" ${LINE}/>
    <path d="M100 30 l2 3 M108 29 l2 3 M116 28 l2 3 M124 27 l2 3" stroke="#46606c" stroke-width="1"/>`,
  "clamp-small": `<g transform="translate(18 8) scale(.78)">${rings(80)}<path d="M80 31 Q112 30 136 24 M80 33 Q112 34 136 26" ${LINE}/></g>`,
  kocher: `${rings(80)}<path d="M80 31 L142 30 M80 33 L142 34" ${LINE}/>
    <path d="M142 29 L147 32 L142 35" ${LINE}/>`,
  allis: `${rings(80)}<path d="M80 31 L128 29 Q140 22 146 26 M80 33 L128 35 Q140 42 146 38" ${LINE}/>
    <path d="M146 26 L146 38" stroke="#46606c" stroke-width="3" stroke-dasharray="1.6 1.4"/>`,
  babcock: `${rings(80)}<path d="M80 31 L124 30 Q132 20 144 22 Q150 32 144 42 Q132 44 124 34 L80 33" ${LINE}/>
    <ellipse cx="138" cy="32" rx="5" ry="7" fill="#071a25" opacity=".18"/>`,
  "needle-holder": `${rings(92)}<path d="M92 29 L140 30 L141 34 L92 35 Z" ${STEEL} stroke-width="1.2"/>
    <path d="M108 30 l4 4 M114 30 l4 4 M120 30 l4 4 M126 30 l4 4 M112 30 l-4 4 M118 30 l-4 4 M124 30 l-4 4 M130 30 l-4 4" stroke="#46606c" stroke-width=".8"/>`,
  forceps: `<path d="M14 32 L146 26 M14 32 L146 38" ${line(5)}/><path d="M14 32 L146 26 M14 32 L146 38" stroke="#dce6ea" stroke-width="2" fill="none"/>
    <path d="M44 27 h24 M44 37 h24" stroke="#46606c" stroke-width="1" stroke-dasharray="2 2"/>`,
  "forceps-teeth": `<path d="M14 32 L144 26 M14 32 L144 38" ${line(5)}/><path d="M14 32 L144 26 M14 32 L144 38" stroke="#dce6ea" stroke-width="2" fill="none"/>
    <path d="M144 25 L149 28 L144 29 M144 39 L149 36 L144 35" ${line(1.8)}/>
    <path d="M44 27 h24 M44 37 h24" stroke="#46606c" stroke-width="1" stroke-dasharray="2 2"/>`,
  farabeuf: `<path d="M22 14 L22 24 L138 24 L138 14 M22 50 L22 40 L138 40 L138 50" stroke="#46606c" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <path d="M22 14 h-8 M138 14 h8 M22 50 h-8 M138 50 h8" ${LINE}/>`,
  balfour: `<rect x="24" y="16" width="110" height="10" rx="3" ${STEEL} stroke-width="1.2"/>
    <path d="M34 26 L34 48 Q34 54 42 54 L54 54 M124 26 L124 48 Q124 54 116 54 L104 54" ${line(3.4)}/>
    <path d="M74 26 L74 40 Q79 50 84 40 L84 26" ${LINE}/>`,
  yankauer: `<path d="M14 36 Q16 30 30 30 L104 30 Q126 30 138 42" ${line(7)}/>
    <path d="M14 36 Q16 30 30 30 L104 30 Q126 30 138 42" stroke="#eef4f6" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="140" cy="44" r="5" ${STEEL} stroke-width="1.2"/>
    <path d="M30 27 v6 M38 27 v6 M46 27 v6" stroke="#46606c" stroke-width="1"/>`,
  backhaus: `${rings(80)}<path d="M80 30 Q118 10 138 30 M80 34 Q118 54 138 34" ${LINE}/>
    <path d="M138 30 L142 33 L138 34" ${LINE}/>`,
};

export function instrumentSvg(id) {
  const item = INSTRUMENTS.find((i) => i.id === id);
  return `<svg viewBox="0 0 160 64" role="img" aria-label="${item.name}" xmlns="http://www.w3.org/2000/svg">${defs}${SHAPES[item.draw]}</svg>`;
}
