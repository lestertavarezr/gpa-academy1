// Configuración de integración. Los valores VITE_* se fijan al compilar
// (por ejemplo en las variables de entorno de Netlify o en un archivo .env).

const params = new URLSearchParams(location.search);

export const CONFIG = {
  // Nota mínima (media de las misiones requeridas) para «aprobado» en la LMS.
  passingScore: Number(import.meta.env.VITE_PASSING_SCORE) || 70,
  // Módulo al que se limita el juego (1-5), p. ej. index.html?modulo=2.
  // Los paquetes SCORM por módulo lo usan para exigir solo sus 4 misiones.
  module: /^[1-5]$/.test(params.get("modulo") || "")
    ? Number(params.get("modulo"))
    : null,
  // Endpoint del cirujano con IA. Vacío = función desactivada.
  aiEndpoint: import.meta.env.VITE_AI_ENDPOINT ?? "/api/cirujano",
};
