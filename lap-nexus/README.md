# LAP//NEXUS — prototipo educativo

48 desafíos en ocho sectores: siete por módulo y un sector de **Guardia** con casos encadenados. El enfoque es cognitivo y de trabajo en equipo; no enseña a ejecutar procedimientos ni sustituye simulación manual o práctica supervisada.

Las pinzas fotografiadas están identificadas por fuentes abiertas como instrumental laparoscópico (ver `public/AUDITORIA-INSTRUMENTAL.md`). Los instrumentos sin foto libre adecuada llevan esquemas originales, identificados como tales.

## Reglas de juego

- **Integridad del quirófano.** Cada desafío empieza en 100 %. Cada error resta 15 % (10 % en los casos encadenados). Se supera con **70 %** o más; por debajo, el desafío queda como *no superado* y la pantalla final ofrece reintentar en lugar de avanzar.
- **Dos intentos y revelado.** El primer error muestra su consecuencia y una pista. El segundo revela la solución, que el jugador debe aplicar para continuar; a partir de ahí no se descuenta más.
- **Todo se baraja** en cada partida: opciones, tarjetas, nodos, roles y elementos. El orden mostrado nunca coincide con la solución.
- **Distractores reales.** Cada opción incorrecta es un error plausible de un instrumentista novato y lleva su consecuencia. Las inspecciones incluyen *trampas*: condiciones que parecen alertas y no lo son (por ejemplo, una pinza bipolar sin placa de retorno).
- **Informe final.** Cada partida termina con la lista de incidencias y su porqué.
- Distintivos: ✦ ✦ ✦ con 100, ✦ ✦ con 85 o más, ✦ con 70 o más.

| Sector | Mecánicas | Tema |
| --- | --- | --- |
| 01 Fundamentos | Circuito, señales, secuencia, inspección, escaneo | Cadena de imagen, óptica de 30°, ergonomía, lectura de la sala |
| 02 Instrumental | Carga, señales, inspección, secuencia, escaneo | Función e identificación del instrumental sobre fotos reales |
| 03 Accesos | Geometría, escaneo, señales, secuencia, inspección | Triangulación, Trendelenburg, fulcro, horizonte |
| 04 Energía | Inspección, señales, secuencia | Aislamiento, retorno, acoplamiento, cánulas híbridas, calor residual |
| 05 Campo | Señales, secuencia | Imagen, luz, insuflación (fuga frente a obstrucción), humo, vaho o sangre |
| 06 Sutura | Secuencia, geometría, señales | Preparación, conteo, tensión, aguja no localizada |
| 07 Especialidades | Set-up, secuencia, señales, inspección | Bariátrica, colorrectal, biliar, ginecológica |
| 08 Guardia | Casos encadenados | Un procedimiento completo por etapas, con una sola integridad |

Mecánicas: **Circuito** (ordenar una ruta con nodos de otras rutas), **Carga** (elegir piezas por función), **Geometría** (asignar roles en un esquema), **Inspección** (marcar alertas entre trampas), **Señales** (responder a avisos del campo), **Secuencia** (ordenar pasos con una tarjeta que sobra), **Set-up** (asignar elementos a funciones con uno que sobra), **Escaneo** (localizar partes sobre una fotografía real) y **Guardia** (etapas encadenadas de distintos tipos).

`npm test` valida la coherencia de los datos: cada opción con su porqué, señuelos en todas las secuencias y que la respuesta correcta no sea sistemáticamente la más larga.

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
