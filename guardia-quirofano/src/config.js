// Configuración de integración. Los valores VITE_* se fijan al compilar
// (por ejemplo en las variables de entorno de Netlify o en un archivo .env).

const params = new URLSearchParams(location.search);

export const CONFIG = {
  // Nota mínima (media de las misiones requeridas) para «aprobado» en la LMS.
  passingScore: Number(import.meta.env.VITE_PASSING_SCORE) || 70,
  // Módulo al que se limita el juego (1-5): solo se muestran y exigen sus 4 misiones.
  // El paquete SCORM de cada módulo lo graba en window.GPA_MODULE (algunas LMS
  // ignoran los parámetros de lanzamiento); la URL sirve para probarlo.
  module: /^[1-5]$/.test(
    String(window.GPA_MODULE ?? params.get("modulo") ?? ""),
  )
    ? Number(window.GPA_MODULE ?? params.get("modulo"))
    : null,
  // Endpoint del cirujano con IA. Vacío = función desactivada.
  aiEndpoint: import.meta.env.VITE_AI_ENDPOINT ?? "/api/cirujano",
  // Versión demo para la landing page (npm run build:demo): solo la misión 1
  // y la Mesa de Mayo, con invitación a inscribirse en el curso.
  demo: import.meta.env.VITE_DEMO === "1",
  // Página de inscripción a la que lleva el botón de la demo.
  enrollUrl: import.meta.env.VITE_ENROLL_URL || "",
};
// Misiones jugables en la demo.
export const DEMO_MISSIONS = [0];
