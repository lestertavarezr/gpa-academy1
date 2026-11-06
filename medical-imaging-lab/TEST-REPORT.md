# Registro de pruebas — ejecución local

Fecha local: 2026-11-05. Rama `feature/gpa-medical-imaging-lab`, base `317f9f6`. Sin despliegue productivo.

| Verificación ejecutada | Resultado observado |
|---|---|
| `medical-imaging-lab/npm run check` | Pasa: ESLint, TypeScript estricto, 2 pruebas Vitest y build Vite de estudiante y administración |
| `medical-imaging-lab/npm audit --audit-level=moderate` | 0 vulnerabilidades reportadas |
| `medical-imaging-lab/npm run db:migrate:local` | Pasa: 9 sentencias de migración D1 |
| Generación e importación de DICOM | 16 instancias sintéticas importadas a Orthanc; QIDO devuelve 1 estudio, metadatos 16 instancias |
| Gateway DICOMweb | Anónimo 401; listado global 403; otro UID 404; metadatos, `BulkDataURI` y frames autorizados 200 |
| `medical-imaging-lab/npm run test:e2e` | 6/6 pasan con Chromium instalado por Playwright. Incluye firma LMS, UID privado, OHIF con píxeles y navegación `1/16` → `2/16`, respuesta, progreso, móvil/WCAG y administración |
| `neuroscan/npm run check` | Pasa: 98 desafíos validados, 135/135 tests y build web/standalone |
| NEURO//SCAN Playwright con canal Chrome local | 11/11 E2E pasan, incluidos offline, sincronización, admin y móvil |
| `docker compose config --quiet` | Pasa: configuración válida |
| Docker Compose completo | El daemon local bloqueó el arranque de OHIF/Nginx con error de capa `layer not mounted`; Orthanc sí arrancó e importó el estudio. Se ejecutó el mismo bundle oficial `ohif/app:v3.12.18` extraído de la imagen mediante `scripts/local_gateway.mjs` para el E2E. La receta Compose queda sin verificar en este host. |

Evidencia visual: [captura del prototipo](docs/prototype.png). El caso es deliberadamente geométrico y no representa anatomía diagnóstica.
