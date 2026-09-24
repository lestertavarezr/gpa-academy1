# ATLAS · Demo para la landing page

Versión de prueba de ATLAS · Laboratorio de heridas: **3 casos jugables** (01 Una herida que progresa, 05 Corte agudo limpio y 14 Fuga bajo la barrera). Los otros 18 aparecen con candado y llevan a la inscripción.

Por seguridad del curso, este `index.html` **no contiene** los expedientes, las preguntas ni las respuestas de los 18 casos bloqueados.

## Cómo subirla

1. Sube `index.html` a tu hosting o CMS, por ejemplo en `https://tu-sitio.com/demo-atlas/index.html`.
2. Insértala en la landing con un iframe. Cambia el valor de `cta` por el enlace de inscripción:

```html
<iframe
  src="https://tu-sitio.com/demo-atlas/index.html?cta=https://tu-sitio.com/inscripcion"
  title="Demo ATLAS · Laboratorio de heridas"
  style="width:100%;height:820px;border:0;border-radius:16px"
  loading="lazy"></iframe>
```

Los botones «Inscríbete al curso completo» se abren en una pestaña nueva. Si no pones `?cta=…` (o si el valor no empieza por `http://` o `https://`), esos botones no se muestran.

También puedes enlazarla directamente, sin iframe: `https://tu-sitio.com/demo-atlas/index.html?cta=https://tu-sitio.com/inscripcion`.

## Notas

- Archivo único (~455 KB), sin dependencias externas ni conexión a otros servidores.
- El progreso se guarda en el navegador del visitante, separado del juego completo.
- Casos ficticios con fines educativos; no diagnostica ni prescribe.
- Si la institución exige firma del revisor clínico antes de publicar, obtenerla antes de subir la demo.
