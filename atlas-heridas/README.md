# ATLAS · Laboratorio de heridas

Juego formativo local para el programa de Manejo de Heridas y Ostomías de GPA Academy. Contiene **15 casos / 45 decisiones** en seis rutas: cicatrización, evaluación, heridas agudas, heridas crónicas, terapia de presión negativa y ostomías. Integra selección interactiva de apósitos con fotografías reales, escenarios de pie diabético con y sin infección, úlcera venosa, isquemia, lesión por presión, complicación postquirúrgica y seguridad de NPWT.

## Ejecutar

Desde este directorio:

```bash
npm install
npm run dev     # http://127.0.0.1:4182/
npm test        # valida la coherencia de los 45 pasos (respuestas, fuentes, apósitos)
npm run build   # genera dist/
```

`npm run build` produce un **único `dist/index.html`** con JS, CSS, fuentes e imágenes incrustados (vite-plugin-singlefile), más `LEEME.txt` y `CREDITOS-IMAGENES.md`. Para distribuir, comprime `dist/`: el alumno abre `index.html` con doble clic, sin servidor, sin PowerShell y sin Internet.

## Diseño educativo

- El alumno lee expediente y visor esquemático, toma tres decisiones por caso y recibe retroalimentación con enlace a la guía.
- El orden de las opciones se baraja en cada decisión.
- Las fotos de apósitos pueden seleccionarse por clic o arrastrarse al visor. La simulación no pretende mostrar la técnica de aplicación física.
- Primer error: solo una pista (campo opcional `hint` del paso; si falta, se usa una pista genérica), sin revelar la respuesta. Segundo error: se resalta la opción correcta y se muestra la explicación. Puntuación: 100 al primer intento, 70 al segundo, 0 si se agotan los intentos; el caso puede repetirse.
- El progreso se guarda solo en `localStorage` del navegador. No registra datos clínicos personales ni envía resultados a la LMS.
- Los casos se basan en los módulos 1–5 del programa de Manejo de Heridas de la carpeta Drive proporcionada por el usuario. La ruta de ostomías añade escenarios periestomales.

## Seguridad clínica

Es una simulación de **casos ficticios**, no una herramienta para diagnosticar, indicar tratamientos o prescribir a pacientes reales. Las decisiones requieren evaluación individual, profesionales autorizados, alergias, función renal, microbiología cuando procede y protocolos locales. Los nombres de antibióticos aparecen únicamente como ejemplos de la tabla IWGDF 2023 para infección leve no complicada del pie diabético; no se dan dosis. Se prioriza derivación urgente cuando hay señales de isquemia, hemorragia o complicaciones quirúrgicas.

Guías incorporadas: IWGDF/IDSA 2023 (infección y pie diabético), IWGDF 2023 (descarga, perfusión y cicatrización), NICE NG19/NG125/NG152/CG179, CDC (tétanos), FDA (seguridad NPWT) y WOCN (piel periestomal). Los enlaces exactos aparecen dentro del juego.

## Créditos

Fotografías y licencias: [CREDITOS-IMAGENES.md](public/CREDITOS-IMAGENES.md). Las ilustraciones esquemáticas de heridas se generan mediante SVG en el código y no representan fotografías diagnósticas.
