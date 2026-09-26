# LAP//NEXUS — prototipo educativo

Versión visual auditada con 44 desafíos: los 14 originales y 30 nuevos retos seleccionados mediante un estudio de mercado y necesidades de aprendizaje. La expansión profundiza orientación espacial, coordinación bimanual, instrumental, acceso, energía, señales del campo, sutura y preparación avanzada. El enfoque es cognitivo y de trabajo en equipo; no enseña a ejecutar procedimientos ni sustituye simulación manual o práctica supervisada.

Las pinzas fotografiadas están identificadas por fuentes abiertas como instrumental laparoscópico. La Babcock usa un recorte exclusivo de una Babcock laparoscópica de 5 mm; el portaagujas, el grasper y el disector se nombran según la identificación exacta de sus fuentes. Se retiró la denominación Maryland porque la fotografía disponible no demostraba ese subtipo. Los instrumentos sin foto libre adecuada llevan esquemas originales, identificados como tales. Los recursos funcionan sin conexión; ver `public/ESTUDIO-MERCADO-30-DESAFIOS.md`, `public/AUDITORIA-INSTRUMENTAL.md` y `public/CREDITOS-IMAGENES.md`.

Juego local para el programa de Instrumentación Laparoscópica de GPA Academy. Tiene siete sectores —uno por módulo— y 14 desafíos. No reutiliza el recorrido de Guardia de Quirófano: cada sector cambia la mecánica del tablero.

| Sector | Mecánica | Tema |
| --- | --- | --- |
| 1 | Conectar rutas | Cámara, procesador, monitor, luz y óptica |
| 2 | Cargar instrumental | Función de las piezas solicitadas |
| 3 | Asignar puntos | Triangulación esquemática |
| 4 | Marcar alertas | Seguridad de sistemas de energía |
| 5 | Resolver señales | Visión, luz e insuflación |
| 6 | Ordenar secuencias | Preparación y conciliación de sutura |
| 7 | Armar un set | Instrumental por especialidad |

El jugador puede repetir los desafíos para mejorar su precisión. Los mejores puntajes se guardan en el navegador mediante `localStorage`. No hay temporizador ni recompensas de tiempo limitado.

## Ejecutar el código

Requiere Node.js y npm. En esta carpeta:

```sh
npm install
npm run dev
```

Abre la dirección que muestra el servidor (por defecto `http://127.0.0.1:4180/`). Para compilar: `npm run build`. El resultado está en `dist/` y debe servirse por HTTP(S), no abrirse con `file://`.

## Fuentes de contenido

Cada sector enlaza la presentación del módulo desde el juego. Se consultaron las presentaciones de los módulos 1, 2, 3, 6 y 7 y los archivos PPTX de los módulos 4 y 5 desde Google Drive el 23 de septiembre de 2026. Las pruebas usan escenarios de preparación, detección y comunicación; no enseñan a realizar una intervención en un paciente.

Como contraste general de seguridad formativa se revisaron [Fundamentals of Laparoscopic Surgery (SAGES)](https://www.sages.org/wiki/fundamentals-laparoscopic-surgery/) y [Fundamental Use of Surgical Energy (SAGES)](https://www.sages.org/fundamental-use-surgical-energy-fuse/). Esto no constituye validación clínica de cada reto.

## Estado

Es una demo local, sin autenticación ni integración con la LMS. Antes de usarlo como evaluación formal, un docente clínico debe revisar y aprobar el contenido y debe definirse cómo se guardarán puntajes por estudiante. No se emplean datos de pacientes.
