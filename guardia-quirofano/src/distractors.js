// Distractores creíbles por misión (mismo orden que las 20 misiones).
// Cada uno representa un error que un alumno real cometería: una verificación
// incompleta, una sola fuente de información o una acción aplazada.
// `why` explica por qué no es suficiente y se muestra como retroalimentación.
// PENDIENTE: validación del equipo docente antes de uso evaluativo.

const d = (text, why) => ({ text, why });

export const DISTRACTORS = [
  // 01 · La primera apertura
  {
    identity: d(
      "Preguntar su nombre al paciente y, si coincide con la pulsera, dar la identidad por confirmada.",
      "El nombre no basta: faltan un segundo identificador y el cotejo del procedimiento con el expediente y el equipo.",
    ),
    equipment: d(
      "Ajustar la conexión y dejarlo listo; la prueba se hará cuando el cirujano lo pida.",
      "Ajustar no es comprobar: sin prueba funcional ni aviso al equipo, la falla puede aparecer en plena intervención.",
    ),
    communication: d(
      "«Revisé identidad y material; lo del aspirador lo comento después de la pausa».",
      "Omitir un pendiente en la pausa impide que el equipo decida con toda la información.",
    ),
  },
  // 02 · Campo bajo vigilancia
  {
    identity: d(
      "Preguntar a la circulante si cree que tocó el campo y seguir según su impresión.",
      "Una impresión no aclara el evento: ante la duda, el material se considera contaminado y se sustituye.",
    ),
    equipment: d(
      "Pedir a la instrumentista que cuente sola y registre el total para ganar tiempo.",
      "El conteo se hace entre dos personas y en voz alta; uno individual no es una referencia compartida.",
    ),
    communication: d(
      "«Creo que no hubo contacto; si alguien lo vio, que avise».",
      "Trasladar la duda a otros deja el evento sin aclarar.",
    ),
  },
  // 03 · Preparación de la piel
  {
    identity: d(
      "Comprobar que la piel se vea teñida por el antiséptico y darla por preparada.",
      "El color no confirma técnica, área ni tiempo de secado: hay que confirmarlo con el responsable.",
    ),
    equipment: d(
      "Permitir el ajuste siempre que solo toque la cara externa del campo.",
      "Una persona sin bata ni guantes estériles no manipula el campo; el ajuste lo hace el personal estéril.",
    ),
    communication: d(
      "«La piel ya está pintada; el campo se movió un poco, pero sigue en su sitio».",
      "Minimizar el desplazamiento oculta un campo que debe sustituirse.",
    ),
  },
  // 04 · Conteo antes del cierre
  {
    identity: d(
      "Buscar las gasas faltantes en el cubo mientras el cirujano sigue cerrando.",
      "Buscar sin detener el cierre ni recontar en pareja puede dejar un textil retenido.",
    ),
    equipment: d(
      "Anotar la discrepancia en el registro y comunicarla al terminar.",
      "El cirujano debe conocerla antes de cerrar la cavidad, no después.",
    ),
    communication: d(
      "«Falta una gasa, pero seguro está en el cubo; podemos seguir cerrando».",
      "Suponer su ubicación no concilia el conteo; el cierre se detiene hasta resolverlo.",
    ),
  },
  // 05 · La herida contaminada
  {
    identity: d(
      "Cambiar tú mismo la clasificación a «sucia» en el parte.",
      "La clasificación la revisa y documenta el equipo responsable; además, sin pus franco no corresponde «sucia/infectada».",
    ),
    equipment: d(
      "Ver que el manómetro marque vacío y continuar.",
      "El manómetro no prueba la succión en la punta: hay que comprobarla con el equipo.",
    ),
    communication: d(
      "«Hubo un derrame y ya lo aspiramos; la clasificación la vemos al final».",
      "El cambio de clasificación afecta al plan ahora, no al final del caso.",
    ),
  },
  // 06 · Bordes que se separan
  {
    identity: d(
      "Aproximar los bordes con tiras adhesivas y registrarlo.",
      "Tratar la dehiscencia por cuenta propia excede tu rol: se documenta y se comunica al responsable.",
    ),
    equipment: d(
      "Reactivar las alarmas y confiar en que avisarán si algo cambia.",
      "Reactivarlas ayuda, pero el responsable debe verificar parámetros y límites configurados.",
    ),
    communication: d(
      "«La herida está un poco abierta; lo dejo anotado para la próxima ronda».",
      "Aplazarlo a la ronda retrasa la valoración que la dehiscencia requiere.",
    ),
  },
  // 07 · Sutura para el plano
  {
    identity: d(
      "Abrir la misma sutura que se usó para fascia en el caso anterior.",
      "Cada caso tiene su indicación; la costumbre no sustituye la confirmación del cirujano.",
    ),
    equipment: d(
      "Elegir una aguja cortante porque la fascia es un tejido resistente.",
      "Puede parecer lógico, pero el tipo de aguja lo confirma el cirujano según tejido y técnica; no se deduce solo.",
    ),
    communication: d(
      "«Tengo lista la sutura de siempre para fascia; ¿la abro?».",
      "«La de siempre» no nombra material, calibre ni aguja: la confirmación debe ser explícita.",
    ),
  },
  // 08 · Drenaje al cierre
  {
    identity: d(
      "Preparar el drenaje del registro escrito porque es el documento oficial.",
      "Si lo verbal y lo escrito no coinciden, se aclara con el cirujano; no se elige una de las fuentes.",
    ),
    equipment: d(
      "Comprobar que el empaque esté íntegro y colocarlo.",
      "La integridad del empaque no demuestra que el reservorio funcione.",
    ),
    communication: d(
      "«Preparé el del registro; si prefiere otro, lo cambiamos».",
      "Ofrecer cambiarlo después no resuelve la discrepancia antes del cierre.",
    ),
  },
  // 09 · Electrocirugía segura
  {
    identity: d(
      "Verificar que el generador no muestre alarma de placa y continuar.",
      "La ausencia de alarma no confirma la colocación ni el estado de la piel bajo la placa.",
    ),
    equipment: d(
      "Reconectar el cable y activar el lápiz un instante sobre el campo para probarlo.",
      "La prueba se coordina con el responsable y de forma segura; activarlo sin coordinar es un riesgo.",
    ),
    communication: d(
      "«La unidad pasó la autoprueba; podemos activar».",
      "La autoprueba del generador no incluye la placa ni los cables del paciente.",
    ),
  },
  // 10 · Torre laparoscópica
  {
    identity: d(
      "Pedir que traigan la torre y montar el resto sobre la marcha.",
      "Sin confirmar todos los componentes, puede faltar algo esencial al empezar.",
    ),
    equipment: d(
      "Cambiar a otro monitor y seguir si allí se ve bien.",
      "La intermitencia puede venir de la cámara o del cable; cambiar de monitor no identifica la falla.",
    ),
    communication: d(
      "«La imagen falla a ratos, pero se puede operar».",
      "Normalizar una falla no es verificarla: se comunica y se resuelve antes de empezar.",
    ),
  },
  // 11 · Aspiración e irrigación
  {
    identity: d(
      "Usar la solución colocada si su etiqueta indica que es estéril.",
      "Estéril no significa indicada: la solución debe coincidir con la orden.",
    ),
    equipment: d(
      "Cambiar la cánula de aspiración y volver a probar.",
      "La cánula es solo una parte: hay que revisar conexiones, recipiente y presión.",
    ),
    communication: d(
      "«Cambié la cánula, así que la aspiración debería estar bien».",
      "«Debería» no es una prueba; comunica el resultado verificado.",
    ),
  },
  // 12 · Posición e imagen
  {
    identity: d(
      "Preparar el lado que indica el parte operatorio.",
      "Ante una discrepancia de lateralidad, ninguna fuente se da por buena hasta que el equipo la aclare.",
    ),
    equipment: d(
      "Ponerte tu delantal plomado y dejar que cada persona se ocupe del suyo.",
      "La protección se coordina para todo el equipo, junto con la cobertura estéril del arco.",
    ),
    communication: d(
      "«El parte dice derecho; supongo que la imagen también».",
      "Suponer la lateralidad es justo el error que la verificación busca evitar.",
    ),
  },
  // 13 · Bandeja de cirugía general
  {
    identity: d(
      "Completar con piezas de otra bandeja sin registrarlo.",
      "Mezclar piezas sin registro altera el conteo y la trazabilidad.",
    ),
    equipment: d(
      "Corregir la hoja para que coincida con lo que contaste.",
      "Ajustar la hoja oculta la discrepancia; se recuenta en pareja y se documenta.",
    ),
    communication: d(
      "«Bandeja lista; faltaba una pinza, pero puse otra parecida».",
      "Una pieza «parecida» no garantiza la función ni cuadra con el conteo registrado.",
    ),
  },
  // 14 · Exposición en ortopedia
  {
    identity: d(
      "Preparar un Hohmann porque es el separador típico en ortopedia.",
      "Puede acertar, pero la exposición concreta la define el cirujano: hay que preguntarlo.",
    ),
    equipment: d(
      "Tener listo el nuevo separador y cambiarlo en cuanto veas que hace falta.",
      "Anticiparse está bien, pero el cambio se anuncia y se coordina; cambiarlo sin avisar deja sin visión.",
    ),
    communication: d(
      "«Aquí tiene el separador que usamos siempre».",
      "No confirma la región ni la exposición solicitada.",
    ),
  },
  // 15 · Microinstrumental neuroquirúrgico
  {
    identity: d(
      "Preparar el set general y pedir el micro cuando empiece la disección.",
      "Esperar al momento crítico interrumpe la cirugía; el set se aclara antes.",
    ),
    equipment: d(
      "Encender el microscopio y comprobar que la luz funcione.",
      "La luz no confirma imagen, enfoque ni óptica: hace falta una prueba de visualización.",
    ),
    communication: d(
      "«El micro enciende y el set está en camino».",
      "Encender no es comprobar, y «en camino» no confirma el set.",
    ),
  },
  // 16 · Set de otorrinolaringología
  {
    identity: d(
      "Abrir la bandeja de amigdalectomía y completar con lo que falte.",
      "Si el set no corresponde al procedimiento, se solicita el correcto; no se improvisa.",
    ),
    equipment: d(
      "Entregar el modelo de pinza que se usó en el último caso nasal.",
      "Otro caso no confirma lo que se pide hoy: repite nombre y uso antes de entregarla.",
    ),
    communication: d(
      "«Abrí lo que había; si falta algo, lo pedimos».",
      "Abrir un set que no corresponde compromete material y tiempo.",
    ),
  },
  // 17 · Clasificación final
  {
    identity: d(
      "Anotar «perforación» en observaciones y mantener la clase inicial.",
      "El hallazgo cambia la clase; una nota aparte deja el registro inconsistente.",
    ),
    equipment: d(
      "Preparar solo el material de cierre primario, como estaba planificado.",
      "Tras una perforación el plan puede cambiar; el cirujano debe confirmarlo antes.",
    ),
    communication: d(
      "«Hubo perforación; lo dejo en observaciones del parte».",
      "No basta registrarlo: el equipo debe revisar la clase y el cierre ahora.",
    ),
  },
  // 18 · Evaluación TIME
  {
    identity: d(
      "Documentar el exudado y el tamaño de la herida con una foto.",
      "Tamaño y exudado no cubren tejido, inflamación/infección ni bordes: TIME necesita los cuatro.",
    ),
    equipment: d(
      "Cambiar a un apósito más absorbente y avisar en la próxima ronda.",
      "Cambiar la cobertura sin orden y avisar tarde deja el cambio sin valoración.",
    ),
    communication: d(
      "«Hay más exudado; ya puse un apósito más absorbente».",
      "Informa una acción no indicada y omite bordes, tejido e inflamación.",
    ),
  },
  // 19 · Sutura en revisión
  {
    identity: d(
      "Elegir la absorbible de mayor calibre porque la fascia soporta tensión.",
      "El calibre no define la duración del soporte: confirma material, duración y calibre.",
    ),
    equipment: d(
      "Confirmar el nombre comercial en voz alta y abrir.",
      "Los nombres parecidos engañan: lee material, calibre y aguja en la etiqueta antes de abrir.",
    ),
    communication: d(
      "«Tengo una absorbible gruesa; sirve para fascia».",
      "«Absorbible gruesa» no es una indicación: faltan material y duración.",
    ),
  },
  // 20 · Entrega integral
  {
    identity: d(
      "Completar el informe escrito y dejarlo en la historia sin comentarlo.",
      "El papel sin comunicación verbal ni confirmación no asegura que se comprendan los pendientes.",
    ),
    equipment: d(
      "Rotular el reservorio y dejar la comprobación a la siguiente guardia.",
      "Rotularlo ayuda, pero su funcionamiento debe entregarse comprobado.",
    ),
    communication: d(
      "«Todo bien; drenaje y apósito están en el parte».",
      "Remitir al parte no transmite hallazgos ni pendientes.",
    ),
  },
];
