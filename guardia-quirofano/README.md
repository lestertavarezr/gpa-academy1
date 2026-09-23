# Guardia de Quirófano · GPA Academy

Simulación educativa de asistencia quirúrgica: 20 misiones en 5 módulos
(asepsia, heridas y suturas, equipamiento, instrumental y repaso integrador).
Hecha con [Phaser 4](https://phaser.io) y Vite.

> Demo educativa. Todavía no está integrada con la LMS ni validada como
> evaluación clínica formal. Los textos de los distractores (`src/distractors.js`)
> necesitan la revisión del equipo docente.

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
