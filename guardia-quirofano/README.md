# Guardia de Quirófano · GPA Academy

Simulación educativa de asistencia quirúrgica: 20 misiones en 5 módulos
(asepsia, heridas y suturas, equipamiento, instrumental y repaso integrador).
Hecha con [Phaser 4](https://phaser.io) y Vite.

> Demo educativa. Todavía no está integrada con la LMS ni validada como
> evaluación clínica formal. Los textos de los distractores (`src/distractors.js`)
> y los nuevos de la fase 2 (`src/events.js`, `src/instruments.js`) necesitan
> la revisión del equipo docente.

## Desarrollo

```bash
cd guardia-quirofano
npm install
npm run dev              # servidor de desarrollo con recarga
npm run build            # build de producción en dist/
npm run preview          # sirve dist/ en http://127.0.0.1:4174
npm run package:windows  # dist/ + lanzador de Windows en release/*.zip
```

## Publicar en la web

`dist/` es un sitio estático con rutas relativas: funciona en cualquier hosting
o subcarpeta (Netlify, Vercel, GitHub Pages, servidor de la LMS).

- **Netlify**: el `netlify.toml` de la raíz del repositorio ya lo configura.
  Basta con conectar el repositorio.
- **Otro hosting**: ejecuta `npm run build` y sube el contenido de `dist/`.

Una vez publicado, es una PWA: se puede instalar desde Chrome o Edge
(«Instalar aplicación») y funciona sin conexión después de la primera visita.

## Estructura

| Archivo | Contenido |
|---|---|
| `src/main.js` | Datos de misiones, lógica de juego, escena Phaser y UI. Recuperado del bundle de la demo (los nombres cortos vienen de la minificación). |
| `src/distractors.js` | Tercera opción creíble para cada decisión, con su explicación. |
| `src/events.js` | Eventos inesperados (alarma de SpO₂, gasa al suelo, guante perforado…). |
| `src/instruments.js` | Instrumental de la Mesa de Mayo: función, peticiones y dibujo vectorial. |
| `src/mayo.js` | Minijuego Mesa de Mayo. |
| `src/progress.js` | Racha diaria, caso del día y medallas. |
| `src/audio.js` | Sonido procedural: ambiente de quirófano, monitor y efectos. |
| `src/assets/actor/*.svg` | Partes del personaje (cuerpo, brazo, pierna) que se animan. |
| `public/sw.js`, `public/manifest.webmanifest` | PWA: instalación y juego sin conexión. |
| `windows/` | Lanzador local para Windows (`JUGAR.cmd` + `servidor.ps1`). |

## Fase 1: cambios de la versión 1.1

- **Opciones barajadas** en todas las decisiones y retos. Antes, la respuesta
  correcta siempre era la primera.
- **Distractores creíbles**: cada decisión tiene un error realista (una
  verificación incompleta, una sola fuente, una acción aplazada) con
  retroalimentación que explica por qué no basta.
- **Puntuación con matices**: las pistas cuestan 3 puntos (una vez por paso),
  las rachas de aciertos dan hasta 5 puntos de bonus, y hay estrellas (1-3)
  y un rango al final de cada misión.
- **Personaje nuevo**: uniforme, gorro estampado, mascarilla y guantes, con
  paso animado, balanceo, respiración y orientación según la dirección.
- **Paciente en monitor**: ECG en vivo, FC y SpO₂ que se alteran con las
  incidencias abiertas y se calman al resolverlas. Es ambientación, no un
  modelo fisiológico.
- **Ambiente de sala**: luz de las lámparas, partículas, zumbido de sala,
  ciclo del ventilador y pitido del monitor sincronizado con la FC.
- **Web/PWA**: imagen en WebP (de 2,4 MB a 244 KB), manifiesto, iconos y
  service worker.

## Fase 2: cambios de la versión 1.2

- **Mesa de Mayo** (minijuego contrarreloj): el cirujano pide 15 piezas entre
  16 instrumentos, primero por nombre y después por su función, con voz si el
  sonido está activo. Hay 3 vidas, rachas, puntos por rapidez y récord, y al
  final se repasa cada error con el dibujo y la función de la pieza.
- **Modo Guardia**: tiempo límite por decisión (20 s, 12 s en eventos, 45 s en
  retos) y **estabilidad del paciente**: cada error resta 25 %, cada incidencia
  recuperada devuelve 10 % y a 0 % se suspende el caso. El monitor refleja la
  estabilidad. El modo Aprendizaje se mantiene sin cronómetro.
- **Eventos inesperados**: en cada misión aparece uno al azar entre el reto y
  la comunicación, con alarma visual y sonora y una explicación si la reacción
  no es segura.
- **Medallas (18)**, **racha de días** y **caso del día** (la misma misión
  para todos en la misma fecha), en el panel de inicio y en la vitrina de
  medallas.

## Fase 3 (en preparación): LMS, panel docente y cirujano con IA

Nada de esto se ha instalado todavía en la LMS de GPA Academy.

- **SCORM 1.2 / 2004** (`src/lms.js`): dentro de una LMS se envían la nota
  (media de las misiones requeridas), el estado, cada decisión como
  interacción y el progreso del alumno (`cmi.suspend_data`), que se restaura
  en cualquier equipo. `npm run package:scorm` genera en `release/scorm/` un
  paquete del curso completo y uno por módulo (`?modulo=N`). Nota mínima:
  `VITE_PASSING_SCORE` (70 por defecto).
- **Informe para el docente**: el alumno descarga un JSON desde la portada y el
  docente lo carga en `docente.html` (tabla de alumnos, nota por misión,
  decisiones más falladas con la respuesta incorrecta más elegida e
  instrumental más confundido, exportación CSV). Todo se procesa en el
  navegador. Los informes pueden editarse: la nota oficial es la de la LMS.
- **Cirujano con IA** (`netlify/functions/cirujano.mjs`, `src/ai.js`): tras
  elegir la comunicación, el alumno puede escribirla con sus palabras y recibe
  la reacción del cirujano y cuatro criterios. Es formativo y no puntúa. Usa la
  API de Claude desde el servidor; se activa al definir `ANTHROPIC_API_KEY` en
  Netlify (`CLAUDE_MODEL` y `ALLOWED_ORIGINS` son opcionales). Para usarlo
  desde un paquete SCORM, compila con `VITE_AI_ENDPOINT=https://<sitio>/api/cirujano`
  y añade el origen de la LMS a `ALLOWED_ORIGINS`.
- **Teclado**: las teclas 1-9 eligen la opción correspondiente.

## Demo para la landing page

Versión gratuita y sin registro para captar alumnos: se juega la **misión 1**
completa (en Aprendizaje o Guardia, con su evento inesperado) y la **Mesa de
Mayo**. Las otras 19 misiones se ven con candado e invitan a inscribirse.
No incluye el cirujano con IA, SCORM, el informe docente ni el panel docente.

```bash
npm run build:demo   # genera dist-demo/
npm run dev:demo     # para probarla en local
```

- **Enlace de inscripción:** `VITE_ENROLL_URL` en `.env.demo`. Sin él, la
  invitación muestra «Pregunta por el curso…» en lugar del botón.
- **Insertarla en la landing:** sube `dist-demo/` a tu web y usa el bloque de
  `../landing/insertar-demo.html` (iframe adaptable).
- **Medición:** la demo envía a la landing los eventos `mission_start`,
  `mission_complete`, `mayo_complete`, `cta_open` y `cta_click`
  (`postMessage` con `source: "guardia-demo"`); el bloque incluye un ejemplo
  para Google Analytics 4.
- Los textos de la invitación están en `index.html` (`#cta-dialog`).
