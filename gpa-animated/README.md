# GPA Academy — Animaciones cinematográficas (Remotion)

Video vertical 1080×1920 · 25 fps · 20.72 s. El video original (voz, rostro, duración) es la capa base; el audio **no se modifica**.

## Estructura
```
animation-timeline.json   ← línea de tiempo editable (fuente única de verdad)
transcript/               ← transcripción con tiempos (.json palabra a palabra, .srt, .txt)
public/original.mp4       ← video base (CFR 25 fps)
public/person.webm        ← presentador recortado con alfa (permite gráficos DETRÁS de él)
src/components/           ← AnimatedKeywords, MedicalHUD, SurgicalInstruments, AnatomyVisualization,
                            CourseInfoCard, SimulationPreview, CallToAction (+ PresenterCard, BrandReveal, Captions)
scripts/stills.sh         ← capturas de validación
out/                      ← render final y capturas
```
Capas (de abajo a arriba): video → tinte navy → capas `behind` → presentador (alfa) → capas `front`.

## Comandos
```bash
npm install
npm run studio                       # previsualización en Remotion Studio
./scripts/stills.sh 3 6.6 12.6       # capturas a esos segundos → out/stills/
npm run render                       # → out/gpa-academy-animated.mp4
```
Sin GPU el halo 3D usa WebGL por software (`--gl=swangle`, ya configurado). Si tu entorno no puede descargar Chrome, exporta `REMOTION_BROWSER=/ruta/al/chrome`.

## Cómo modificar las animaciones
Edita `animation-timeline.json` y recarga el Studio:
- `start` / `end`: segundos. `transition.in/out`: duración de entrada/salida; `style`: `rise | scale | slide-left | slide-right | fade | none`.
- `position`: `{x,y,w,h}` en px sobre 1080×1920. `layer`: `behind` (detrás del presentador) o `front`.
- `props`: contenido. Los tiempos `at` dentro de props son segundos **absolutos** del video (sincronizados con `transcript.json`).
- `enabled: false` desactiva una animación sin borrarla. `course-card`, `simulation-preview` y `call-to-action` están desactivadas porque este clip **no** menciona programas, simulación ni inscripción; actívalas (ajustando tiempos y texto) en otros videos.
- Subtítulos: `captions.props.groups` define rangos de palabras (`words: [desde, hasta]`) del `transcript.json`.
- Nuevo componente: créalo en `src/components/` y regístralo en `REGISTRY` de `src/Composition.tsx`.
- Logo oficial: `BrandReveal` dibuja un wordmark tipográfico; reemplaza el hexágono por tu logo.
- Zonas seguras de Reels y colores: `src/lib/brand.ts`.

## Transcripción
Whisper *small* (faster-whisper, int8), español. Ver `transcript/`. La narración termina en «…que conozcan el instrumental» (el clip está cortado ahí): no se añadió ningún texto que no se diga.
