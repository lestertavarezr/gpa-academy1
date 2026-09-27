# NEURO//SCAN v2

Entrenamiento educativo en lectura sistemática de neuroimágenes (GPA Academy): 98 casos en 8 módulos, repaso espaciado, modos práctica/evaluación, sincronización entre dispositivos y recordatorios push.

> Simulador educativo. No es una herramienta diagnóstica ni sustituye la valoración de un profesional.

## Qué cambió respecto a la v1 (archivo HTML único)

| v1 | v2 |
|---|---|
| Preguntas, imágenes y lógica en un solo `<script>` minificado (~950 KB) | Contenido en `content/` (JSON + WebP), motor en módulos ES, build reproducible |
| Sin pruebas | 123 pruebas unitarias/integración + 11 de extremo a extremo en Chromium |
| Progreso solo en `localStorage` | Sincronización anónima en Cloudflare (Workers + D1) con fusión entre dispositivos |
| Sin analítica | Estadísticas agregadas y anónimas por pregunta, distractor y confianza (`/admin.html`) |
| Recordatorio solo con la pestaña abierta | Web Push real (VAPID + RFC 8291) enviado por un cron en la zona horaria del estudiante |
| Carga todo de golpe | Web: ~132 KB iniciales, imágenes bajo demanda, offline con Service Worker |
| CSP con `unsafe-inline` y `unsafe-eval` | Web: CSP estricta desde `_headers`; archivo único: CSP por hash |
| Sin versión de esquema | Estado versionado (v2) con migración desde v1; los respaldos v1 siguen funcionando |

Errores de la v1 corregidos: 17 casos mostraban la misma imagen repetida, 6 imágenes se descargaban sin usarse, en móvil no había forma de cambiar de módulo, el banner podía decir "caso 0 de 5", el foco del teclado se perdía al elegir una opción, `lang="en"` en una app en español y un contraste insuficiente (WCAG AA).

## Estructura

```
content/            Banco de preguntas (lo edita el equipo académico)
  modules.json      Nombres de los 8 módulos
  challenges.json   98 casos: enunciado, 4 opciones, índice correcto, explicación, fuente, imágenes
  media.json        Metadatos de imágenes (alt, pie, fuente, tamaño)
  media/*.webp      Imágenes
src/
  core/             Motor puro y probado: repaso espaciado, sesiones, XP, estado/migración/fusión
  services/         Almacenamiento, API, sincronización, analítica, push
  ui/               Plantillas (todo texto escapado), controlador, canvas
  sw.js             Service Worker: caché offline y notificaciones push
  admin/            Panel de estadísticas
worker/             Backend Cloudflare Worker + migraciones D1
scripts/            build, validación, CSV, claves VAPID
tests/              Vitest (unidad/integración) y Playwright (e2e)
```

## Comandos

Requiere Node 22.13 o superior.

```bash
npm ci
npm run validate      # valida el banco de preguntas
npm test              # pruebas unitarias e integración
npm run build         # dist/web (sitio) + dist/standalone/neuroscan-app.html (archivo único)
npm run dev           # build + Worker local en http://localhost:8787
npm run test:e2e      # e2e en Chromium contra el Worker local (npx playwright install chromium la primera vez)
```

El archivo `dist/standalone/neuroscan-app.html` funciona con doble clic, sin servidor; guarda el progreso solo en ese navegador. Para que también sincronice: `NEUROSCAN_STANDALONE_API=https://tu-dominio npm run build` y añade el origen correspondiente a `ALLOWED_ORIGINS`.

## Editar el banco de preguntas

Opción A, hoja de cálculo (sin tocar código):

1. `npm run content:export-csv` genera `content/challenges.csv`.
2. Edítalo en Excel o Google Sheets. `correcta` es la letra (A–D); `imagenes` son claves de `media.json` separadas por `|`.
3. `npm run content:import-csv` valida y reescribe `challenges.json`. Si hay errores, no cambia nada y los lista.

Opción B: editar `content/challenges.json` directamente.

En ambos casos, el cambio entra por un pull request: CI valida el contenido y ejecuta todas las pruebas antes de publicarlo. El contenido es clínico, así que se prefirió revisión con historial en lugar de un editor web sin control de cambios.

Reglas que aplica el validador: ids consecutivos desde 1, exactamente 4 opciones distintas, índice correcto 0–3, módulo y dificultad válidos, campos no vacíos, imágenes existentes y sin repetir. Las opciones se barajan de forma determinista en pantalla; escribe la correcta donde quieras y apúntala con `answer`.

Para añadir una imagen: copia el `.webp` en `content/media/` y añade su entrada en `media.json` (`file`, `width`, `height`, `alt`, `caption`, `source`).

## Despliegue en Cloudflare

Una sola vez:

```bash
npx wrangler login
npx wrangler d1 create neuroscan            # copia el database_id en wrangler.toml
npm run vapid:generate                      # pega la clave pública en VAPID_PUBLIC_KEY (wrangler.toml)
npx wrangler secret put VAPID_PRIVATE_KEY   # la clave privada que imprimió el paso anterior
npx wrangler secret put ADMIN_TOKEN         # token largo y aleatorio para /admin.html
```

Edita también `VAPID_SUBJECT` con un correo real de contacto.

Cada despliegue:

```bash
npm run db:migrate:remote
npm run deploy          # valida, prueba, construye y publica
```

O desde GitHub Actions: ejecuta el workflow "NEURO//SCAN" manualmente con `deploy` marcado. Necesita los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en el entorno `production`.

Si el LMS de GPA Academy debe mostrar la app en un iframe, añade su dominio a `frame-ancestors` en `scripts/build.mjs` (`WEB_CSP`).

## Cómo funciona

**Sincronización.** Al abrir la app web se crea una cuenta anónima (sin nombre ni correo). El servidor guarda solo el hash SHA-256 del token del dispositivo. Cada escritura lleva la revisión de la que parte; si otro dispositivo escribió antes, el servidor responde 409 con su copia y el cliente fusiona:

- por caso, gana el historial con más repasos;
- casos vistos y días de actividad se unen;
- la sesión en curso viene del dispositivo usado más recientemente;
- el XP toma el máximo (sumar contaría dos veces);
- "Reiniciar" incrementa una época que gana sobre el historial anterior, para que el reinicio llegue a todos los dispositivos.

Para vincular otro dispositivo: "Vincular otro dispositivo" muestra un código de 8 caracteres, válido 10 minutos y de un solo uso.

**Recordatorios push.** El navegador se suscribe con la clave VAPID; el Worker guarda la suscripción, la hora y la zona horaria. Un cron cada 15 minutos envía el aviso cuando ya pasó la hora local, no se avisó hoy y el estudiante no ha estudiado hoy. El mensaje indica cuántos repasos vencidos tiene. Las suscripciones caducadas (404/410) o con 5 fallos seguidos se eliminan. En iPhone/iPad el push solo funciona con la app instalada en la pantalla de inicio (iOS 16.4+); sin push, la app usa el aviso con la pestaña abierta.

**Estadísticas.** Cada respuesta envía: id del caso, opción elegida (índice original), acierto, modo y confianza. No se guarda quién respondió: el servidor solo acumula contadores. `/admin.html` muestra acierto, errores con confianza alta (conceptos mal calibrados) y el distractor más elegido, que son las señales de preguntas ambiguas o de conceptos erróneos frecuentes.

## Privacidad y seguridad

- Sin datos personales: cuentas anónimas, sin IP ni correo en la base de datos. "Borrar mis datos del servidor" elimina cuenta, progreso y suscripciones. Desactivar la nube detiene la sincronización y las estadísticas.
- Las reflexiones escritas por el estudiante forman parte del progreso sincronizado. La app pide no introducir datos de pacientes.
- Todo estado externo (localStorage, respaldos, servidor, host de ChatGPT) pasa por `sanitizeState`, que descarta ids inválidos y claves como `__proto__`.
- Todo texto dinámico se escapa antes de insertarse en el HTML; hay una prueba de XSS.
- Las suscripciones push solo aceptan endpoints de servicios push reales (Google, Mozilla, Apple, Microsoft), para que el Worker no pueda usarse como relé hacia otros hosts.
- Límite de tamaño en todos los cuerpos, cuota diaria de eventos por cuenta y rate limiting en los endpoints sin autenticación.
- El token de administración se compara en tiempo constante.

## Límites conocidos

- El cron envía como máximo `MAX_PUSH_PER_RUN` avisos por ejecución (25, dentro del límite del plan gratuito); el resto sale en la siguiente ejecución. Súbelo en el plan de pago si hay muchos estudiantes a la misma hora.
- Las pruebas e2e no pueden recibir un push real (no hay servicio push en CI); el cifrado se verifica con el vector de la RFC 8291 y con una implementación independiente (`http_ece`).
- Integración como widget de ChatGPT: si existe `window.openai`, la app usa el estado del host y desactiva nube y push.
