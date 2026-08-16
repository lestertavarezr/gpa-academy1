export type PriceModel =
  | { type: "DOP_FIXED"; amountDOP: number; installments: number }
  | { type: "USD_BASE"; amountUSD: number };

export interface ProgramContent {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  duration: string;
  startDate?: string;
  modality: string;
  aval?: string;
  price: PriceModel;
  heroImage: string;
  cardAccent: "cyan" | "gold";
  painPoints: string[];
  benefits: { title: string; description: string }[];
  includes: string[];
  bonuses: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  seatsLeft?: number;
  googleFormEnvKey:
    | "NEXT_PUBLIC_GOOGLE_FORM_ID_ASISTENCIA_QUIRURGICA"
    | "NEXT_PUBLIC_GOOGLE_FORM_ID_SUTURA"
    | "NEXT_PUBLIC_GOOGLE_FORM_ID_NEUROIMAGENES"
    | "NEXT_PUBLIC_GOOGLE_FORM_ID_LAPAROSCOPICA";
  pagaditoEnvKey:
    | "NEXT_PUBLIC_PAGADITO_URL_ASISTENCIA_QUIRURGICA"
    | "NEXT_PUBLIC_PAGADITO_URL_SUTURA"
    | "NEXT_PUBLIC_PAGADITO_URL_NEUROIMAGENES"
    | "NEXT_PUBLIC_PAGADITO_URL_LAPAROSCOPICA";
}

export const programs: ProgramContent[] = [
  {
    slug: "asistencia-quirurgica",
    name: "Diplomado en Asistencia Quirúrgica",
    shortName: "Asistencia Quirúrgica",
    tagline:
      "Conviértete en un asistente quirúrgico competente y certificado, con el respaldo académico del Colegio Médico Dominicano.",
    duration: "12 semanas · módulo teórico online",
    startDate: "22 de agosto de 2026",
    modality:
      "Online (teórica): video clases, presentaciones descargables, podcasts temáticos y evaluaciones dentro de GPA Academy OS. El componente práctico presencial se detalla por separado dentro del programa.",
    aval: "Colegio Médico Dominicano (CMD)",
    price: { type: "DOP_FIXED", amountDOP: 17900, installments: 2 },
    heroImage: "/images/programa-asistencia-quirurgica.jpg",
    cardAccent: "gold",
    painPoints: [
      "Sientes que tu formación de pregrado no te preparó para el quirófano real.",
      "No tienes un aval institucional que respalde tu experiencia como asistente quirúrgico.",
      "Te cuesta anticipar los pasos del cirujano y perder tiempo valioso en sala.",
      "No conoces el manejo correcto de instrumental, asepsia y protocolos ante emergencias intraoperatorias.",
    ],
    benefits: [
      {
        title: "Certificación avalada por el CMD",
        description:
          "Un diplomado con reconocimiento del Colegio Médico Dominicano que fortalece tu perfil profesional.",
      },
      {
        title: "Dominio real de quirófano",
        description:
          "Aprende instrumentación, asepsia, posicionamiento del paciente y asistencia activa paso a paso.",
      },
      {
        title: "Docentes cirujanos en ejercicio",
        description:
          "Clases dictadas por especialistas con experiencia clínica activa en Latinoamérica.",
      },
      {
        title: "Acceso de por vida al contenido",
        description:
          "Repasa las video clases, podcasts y presentaciones cuando lo necesites dentro de GPA Academy OS.",
      },
    ],
    includes: [
      "Video clases 100% online dentro de GPA Academy OS",
      "Presentaciones descargables en PDF",
      "Podcasts temáticos por módulo",
      "Evaluaciones y examen final dentro de la plataforma",
      "Certificado avalado por el Colegio Médico Dominicano (CMD)",
      "Componente práctico explicado en la sección propia del programa",
    ],
    bonuses: [
      {
        title: "Kit digital de instrumental quirúrgico",
        description:
          "Guía visual descargable con el instrumental más usado en sala, para los primeros inscritos antes del 22 de agosto.",
      },
      {
        title: "Sesión en vivo de preguntas y respuestas",
        description:
          "Acceso a una masterclass en vivo con docentes del diplomado, exclusiva para inscripción anticipada.",
      },
    ],
    faq: [
      {
        question: "¿El diplomado es 100% online?",
        answer:
          "El módulo teórico es 100% online dentro de GPA Academy OS. El componente práctico presencial se explica con detalle en la sección del programa y se coordina aparte.",
      },
      {
        question: "¿Qué aval tiene el diplomado?",
        answer:
          "Este diplomado está avalado por el Colegio Médico Dominicano (CMD).",
      },
      {
        question: "¿Puedo pagar en cuotas?",
        answer:
          "Sí, el precio de RD$17,900 puede fraccionarse en 2 cuotas a través de Pagadito.",
      },
    ],
    seatsLeft: 24,
    googleFormEnvKey: "NEXT_PUBLIC_GOOGLE_FORM_ID_ASISTENCIA_QUIRURGICA",
    pagaditoEnvKey: "NEXT_PUBLIC_PAGADITO_URL_ASISTENCIA_QUIRURGICA",
  },
  {
    slug: "sutura",
    name: "Taller de Sutura Online",
    shortName: "Taller de Sutura",
    tagline:
      "Domina las técnicas de sutura más usadas en la práctica clínica diaria, desde cualquier lugar.",
    duration: "Acceso inmediato · autoestudio",
    modality:
      "100% online: video clases, presentaciones descargables y evaluación final dentro de GPA Academy OS.",
    price: { type: "USD_BASE", amountUSD: 35 },
    heroImage: "/images/programa-sutura.jpg",
    cardAccent: "cyan",
    painPoints: [
      "Te sientes inseguro al suturar heridas fuera del entorno académico.",
      "No conoces las diferencias entre técnicas de sutura según el tipo de tejido.",
      "Te preocupa cometer errores que dejen cicatrices evitables en tus pacientes.",
    ],
    benefits: [
      {
        title: "Técnicas paso a paso",
        description:
          "Videos detallados de los principales puntos de sutura usados en emergencias y consulta.",
      },
      {
        title: "Aprende a tu ritmo",
        description:
          "Contenido disponible 24/7 para repasar cuantas veces necesites antes de tu evaluación.",
      },
      {
        title: "Evaluación con retroalimentación",
        description:
          "Evaluación final que confirma tu comprensión de cada técnica enseñada.",
      },
    ],
    includes: [
      "Video clases 100% online",
      "Presentaciones descargables en PDF",
      "Evaluación final dentro de GPA Academy OS",
      "Certificado digital de finalización",
    ],
    bonuses: [
      {
        title: "Guía descargable de nudos quirúrgicos",
        description:
          "Material visual de referencia rápida, exclusivo para inscripción anticipada.",
      },
    ],
    faq: [
      {
        question: "¿Necesito experiencia previa?",
        answer:
          "No, el taller está diseñado para reforzar desde fundamentos hasta técnicas intermedias de sutura.",
      },
      {
        question: "¿Cuánto tiempo tengo para completarlo?",
        answer:
          "El acceso es de por vida, puedes avanzar a tu propio ritmo dentro de GPA Academy OS.",
      },
    ],
    seatsLeft: 40,
    googleFormEnvKey: "NEXT_PUBLIC_GOOGLE_FORM_ID_SUTURA",
    pagaditoEnvKey: "NEXT_PUBLIC_PAGADITO_URL_SUTURA",
  },
  {
    slug: "neuroimagenes",
    name: "Programa de Neuroimágenes",
    shortName: "Neuroimágenes",
    tagline:
      "Interpreta con precisión y confianza tomografías y resonancias del sistema nervioso central.",
    duration: "Acceso inmediato · autoestudio",
    modality:
      "100% online: video clases, presentaciones descargables y evaluación final dentro de GPA Academy OS.",
    price: { type: "USD_BASE", amountUSD: 35 },
    heroImage: "/images/programa-neuroimagenes.jpg",
    cardAccent: "cyan",
    painPoints: [
      "Te cuesta identificar hallazgos patológicos en TAC y RM de cráneo.",
      "No tienes un método claro para leer estudios de neuroimagen de forma sistemática.",
      "Sientes inseguridad al presentar casos neurológicos en interconsulta.",
    ],
    benefits: [
      {
        title: "Método sistemático de lectura",
        description:
          "Aprende un enfoque estructurado para no pasar por alto hallazgos clave.",
      },
      {
        title: "Casos clínicos reales",
        description:
          "Analiza estudios reales con explicación detallada de cada hallazgo.",
      },
      {
        title: "Aplicable desde el primer día",
        description:
          "Conocimiento directamente transferible a tu práctica clínica o guardia.",
      },
    ],
    includes: [
      "Video clases 100% online",
      "Presentaciones descargables en PDF",
      "Evaluación final dentro de GPA Academy OS",
      "Certificado digital de finalización",
    ],
    bonuses: [
      {
        title: "Atlas digital de hallazgos frecuentes",
        description:
          "Recurso visual de consulta rápida, exclusivo para inscripción anticipada.",
      },
    ],
    faq: [
      {
        question: "¿Está orientado a un nivel específico?",
        answer:
          "Está diseñado tanto para estudiantes avanzados como para profesionales que buscan reforzar la lectura de neuroimágenes.",
      },
      {
        question: "¿Incluye casos prácticos?",
        answer:
          "Sí, el programa incluye análisis de casos clínicos reales con explicación docente.",
      },
    ],
    seatsLeft: 40,
    googleFormEnvKey: "NEXT_PUBLIC_GOOGLE_FORM_ID_NEUROIMAGENES",
    pagaditoEnvKey: "NEXT_PUBLIC_PAGADITO_URL_NEUROIMAGENES",
  },
  {
    slug: "instrumentacion-laparoscopica",
    name: "Programa de Instrumentación Laparoscópica",
    shortName: "Instrumentación Laparoscópica",
    tagline:
      "Especialízate en el manejo del instrumental laparoscópico y aporta valor real en cirugía mínimamente invasiva.",
    duration: "Acceso inmediato · autoestudio",
    modality:
      "100% online: video clases, presentaciones descargables y evaluación final dentro de GPA Academy OS.",
    price: { type: "USD_BASE", amountUSD: 35 },
    heroImage: "/images/programa-laparoscopia.jpg",
    cardAccent: "cyan",
    painPoints: [
      "No conoces con precisión el instrumental laparoscópico ni su función específica.",
      "Te sientes inseguro asistiendo en cirugías mínimamente invasivas.",
      "No comprendes del todo el montaje y flujo de una torre laparoscópica.",
    ],
    benefits: [
      {
        title: "Instrumental explicado a fondo",
        description:
          "Conoce cada pieza, su función y el momento exacto de uso durante la cirugía.",
      },
      {
        title: "Flujo de sala laparoscópica",
        description:
          "Entiende el montaje de torre, insuflador y disposición del equipo quirúrgico.",
      },
      {
        title: "Mayor valor en el quirófano",
        description:
          "Aporta con más seguridad y agilidad como asistente en procedimientos laparoscópicos.",
      },
    ],
    includes: [
      "Video clases 100% online",
      "Presentaciones descargables en PDF",
      "Evaluación final dentro de GPA Academy OS",
      "Certificado digital de finalización",
    ],
    bonuses: [
      {
        title: "Checklist de montaje de torre laparoscópica",
        description:
          "Guía descargable lista para imprimir, exclusiva para inscripción anticipada.",
      },
    ],
    faq: [
      {
        question: "¿Requiere experiencia previa en cirugía?",
        answer:
          "No es obligatorio, aunque se recomienda tener nociones básicas de quirófano para aprovechar mejor el contenido.",
      },
      {
        question: "¿El certificado tiene validez internacional?",
        answer:
          "Es un certificado digital de finalización emitido por GPA Academy, reconocido por nuestra comunidad en más de 12 países.",
      },
    ],
    seatsLeft: 40,
    googleFormEnvKey: "NEXT_PUBLIC_GOOGLE_FORM_ID_LAPAROSCOPICA",
    pagaditoEnvKey: "NEXT_PUBLIC_PAGADITO_URL_LAPAROSCOPICA",
  },
];

export function getProgramBySlug(slug: string) {
  return programs.find((p) => p.slug === slug);
}
