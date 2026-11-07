# GPA Academy — Animaciones cinematográficas (Remotion)

Videos verticales 1080×1920 · 25 fps (~20.7 s). El video original (voz, rostro, duración) es la capa base; el audio **no se modifica**.

## Estructura
```
videos/NN/animation-timeline.json   ← línea de tiempo editable de cada video (fuente única de verdad)
videos/NN/transcript/               ← transcripción con tiempos (.json palabra a palabra, .srt, .txt)
public/NN/original.mp4              ← video base (CFR 25 fps, sin audio)
public/NN/audio.m4a                 ← audio ORIGINAL (copia sin recodificar)
public/NN/person.webm               ← presentador recortado con alfa (permite gráficos DETRÁS de él)
src/components/                     ← AnimatedKeywords, MedicalHUD, SurgicalInstruments, AnatomyVisualization,
                                      CourseInfoCard (+CertificateCard), SimulationPreview, CallToAction,
                                      PresenterCard, BrandReveal, Captions
scripts/                            ← stills.sh (capturas) · render.sh (render + audio original)
out/                                ← renders finales y capturas
```
Videos incluidos: **01** (presentación del Dr. Tavares), **02** (formación, certificación y programas online), **03** (modalidades de aprendizaje, simulador y práctica antes del quirófano) **04** (certificación, perfil profesional y destinos) y **05** (cierre: «Elige tu programa… ¡Te esperamos!»).
Capas (de abajo a arriba): video → tinte navy → capas `behind` → presentador (alfa) → capas `front`.

## Comandos
```bash
npm install
npm run studio                         # Remotion Studio: composiciones Video01, Video02
./scripts/stills.sh 02 3 6.6 12.6      # capturas del video 02 a esos segundos → out/stills/02/
./scripts/render.sh 02                 # → out/gpa-academy-animated-02.mp4 (audio original sin tocar)
```
Sin GPU el halo 3D usa WebGL por software (`--gl=swangle`, ya configurado). Si tu entorno no puede descargar Chrome, exporta `REMOTION_BROWSER=/ruta/al/chrome`.

## Añadir un video nuevo
1. `ffmpeg` → `public/NN/original.mp4` (25 fps, `-an`) y `public/NN/audio.m4a` (`-vn -c:a copy`).
2. Transcribir (Whisper, español, tiempos por palabra) → `videos/NN/transcript/transcript.json`.
3. Generar `public/NN/person.webm` (presentador con alfa; ver máscara con MediaPipe Selfie Segmentation).
4. Crear `videos/NN/animation-timeline.json` (copia uno existente) y registrarlo en `src/lib/timeline.ts`.

## Cómo modificar las animaciones
Edita `animation-timeline.json` y recarga el Studio:
- `start` / `end`: segundos. `transition.in/out`: duración de entrada/salida; `style`: `rise | scale | slide-left | slide-right | fade | none`.
- `position`: `{x,y,w,h}` en px sobre 1080×1920. `layer`: `behind` (detrás del presentador) o `front`.
- `props`: contenido. Los tiempos `at` dentro de props son segundos **absolutos** del video (sincronizados con `transcript.json`).
- `enabled: false` desactiva una animación sin borrarla. `simulation-preview` y `call-to-action` están desactivadas porque los clips **no** mencionan simulación ni invitan a inscribirse (en el video 01 también `course-card`); actívalas (ajustando tiempos y texto) en otros videos.
- Subtítulos: `captions.props.groups` define rangos de palabras (`words: [desde, hasta]`) del `transcript.json`.
- Nuevo componente: créalo en `src/components/` y regístralo en `REGISTRY` de `src/Composition.tsx`.
- Logo oficial: `BrandReveal` dibuja un wordmark tipográfico; reemplaza el hexágono por tu logo.
- Zonas seguras de Reels y colores: `src/lib/brand.ts`.

## Transcripción
Whisper *small* (faster-whisper, int8), español, en `videos/NN/transcript/`. El video 01 termina en «…que conozcan el instrumental» y el 02 empieza en «…instrumental,» y termina en «Aprenderás con…» (los clips están cortados ahí): no se añadió ningún texto que no se diga. El certificado es genérico, sin avales ni acreditaciones.
