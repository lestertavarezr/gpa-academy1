// Contenido del modo Asistente observador: incidencias, sucesos normales y
// misiones. Va aparte del juego para que el panel docente lo use sin cargar
// Phaser.
// PENDIENTE: validación del equipo docente.

// --- Incidencias ---------------------------------------------------------------------

// `label`: lo que el alumno elige en «¿Qué observaste?»; `why`: por qué importa;
// `comm[0]` es la comunicación correcta (se barajan al mostrarlas).
export const INCIDENTS = {
  guante: {
    label: "El cirujano se tocó la mascarilla con el guante",
    why: "La mascarilla no es estéril: el guante queda contaminado y debe cambiarse antes de volver al campo.",
    comm: [
      "Decirlo en voz alta en ese momento: «Doctor, su guante tocó la mascarilla».",
      "Esperar a que termine la cirugía y comentarlo con la circulante.",
      "Acercarse a la mesa y señalar el guante con la mano.",
    ],
  },
  gasa: {
    label: "Una gasa cayó al suelo",
    why: "La gasa del suelo sigue contando: la circulante la recoge con pinza, la muestra al equipo y la registra para que el conteo final cuadre.",
    comm: [
      "Avisar a la circulante para que la recoja con pinza, la muestre y la registre en el conteo.",
      "Recogerla con la mano y tirarla a la basura para mantener el orden.",
      "No decir nada: una gasa en el suelo ya no forma parte del conteo.",
    ],
  },
  cruce: {
    label: "La circulante pasó entre la mesa quirúrgica y la Mesa de Mayo",
    why: "Quien no está estéril no debe pasar entre dos zonas estériles: si hay duda de contacto, lo dudoso se considera contaminado.",
    comm: [
      "Avisar en voz alta para que el equipo compruebe si tocó algo estéril.",
      "Ignorarlo: mientras no toque al paciente, no pasa nada.",
      "Tomarla del brazo para apartarla del campo.",
    ],
  },
  manos: {
    label: "El ayudante bajó las manos por debajo de la cintura",
    why: "Con bata estéril, solo se considera estéril el frente desde el pecho hasta la cintura: las manos que bajan de ahí se consideran contaminadas.",
    comm: [
      "Avisar al ayudante: sus manos bajaron de la cintura y debe cambiarse los guantes.",
      "Nada: sigue dentro del campo, no hay problema.",
      "Esperar a ver si vuelve a hacerlo antes de decir algo.",
    ],
  },
  spo2: {
    label: "La saturación bajó en el monitor",
    why: "Una desaturación puede ser el primer signo de una complicación: el dato concreto, dicho enseguida, gana tiempo.",
    comm: [
      "Avisar enseguida al anestesiólogo con el dato: «Saturación en 88 %».",
      "Silenciar la alarma para no distraer al cirujano.",
      "Esperar a que vuelva a subir sola.",
    ],
  },
};
// Sucesos normales: no son incidencias. Si el alumno reporta durante uno, se
// le explica por qué es normal.
export const NORMAL = {
  pide: "El ayudante toma instrumental de la Mesa de Mayo: es parte normal del trabajo.",
  paso: "La circulante camina junto a la pared, lejos del campo estéril: es un recorrido seguro.",
};

export const OBS_MISSIONS = [
  {
    title: "Primera observación",
    intro:
      "Cirugía programada sin complicaciones. Observa con calma: las incidencias duran bastante en pantalla.",
    duration: 64,
    window: 9,
    events: [
      [6, "pide"],
      [12, "gasa"],
      [27, "guante"],
      [38, "pide"],
      [44, "cruce"],
    ],
  },
  {
    title: "Laparotomía",
    intro:
      "Hay más movimiento en la sala. No todo lo que se mueve es un error: aprende a distinguirlo.",
    duration: 80,
    window: 7,
    events: [
      [5, "paso"],
      [11, "manos"],
      [22, "pide"],
      [28, "gasa"],
      [42, "guante"],
      [52, "paso"],
      [60, "cruce"],
    ],
  },
  {
    title: "Evento crítico",
    intro:
      "Mira también el monitor del paciente. Las incidencias duran menos en pantalla.",
    duration: 76,
    window: 6,
    events: [
      [6, "pide"],
      [12, "spo2"],
      [26, "guante"],
      [36, "paso"],
      [44, "manos"],
      [58, "gasa"],
    ],
  },
  {
    title: "Doble incidencia",
    intro:
      "A veces pasan dos cosas a la vez. Reporta cada una por separado, sin perder de vista el resto.",
    duration: 80,
    window: 6,
    events: [
      [5, "paso"],
      [10, "gasa"],
      [11, "guante"],
      [26, "pide"],
      [32, "spo2"],
      [46, "cruce"],
      [47, "manos"],
      [64, "pide"],
    ],
  },
];
