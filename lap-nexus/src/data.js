// Convenciones de datos:
// - response: choices[0] es la correcta; el juego las baraja. Cada opción es [texto, porqué/consecuencia].
// - pick/fault: options [id, texto, porqué]; answer lista los ids correctos.
// - order/route: cartas o nodos que no están en answer son señuelos; su porqué se muestra al revelar.
// - scan: markers [id, x%, y%, nombre real]; cada target pide tocar un marcador.
// - op: caso encadenado; stages son desafíos de cualquier otro modo.
export const modules = [
  {id:1,code:'01',title:'Fundamentos',sub:'La torre y su lenguaje',icon:'◎',color:'#a4ffdc',source:'https://docs.google.com/presentation/d/1zHc62ffayKJzVbFIfIyKgAnR6pGqkKuFY7L1-R7hRGo/edit'},
  {id:2,code:'02',title:'Instrumental',sub:'Reconocer antes de entregar',icon:'✦',color:'#ffd084',source:'https://docs.google.com/presentation/d/1Pxd3uMv7Uzyhw7e1sR_DWvunLcYxWiF_JUEnBTs-KvA/edit'},
  {id:3,code:'03',title:'Accesos',sub:'Geometría del campo',icon:'△',color:'#97c8ff',source:'https://docs.google.com/presentation/d/1_J-Vt_R81BILqhnX2w4hoFIw7x7fwBQbiDxvrcuG-wg/edit'},
  {id:4,code:'04',title:'Energía',sub:'Detectar antes de activar',icon:'ϟ',color:'#ff9e9e',source:'https://docs.google.com/presentation/d/1LX06MDcGdR03IK8UvWpLDYIiXbx4OJqE/edit'},
  {id:5,code:'05',title:'Campo',sub:'Señales en tiempo real',icon:'◈',color:'#a7adff',source:'https://docs.google.com/presentation/d/1uYUulC9oNThWxNjfp8_bEGcaQ9pRbbTe/edit'},
  {id:6,code:'06',title:'Sutura',sub:'Anticipar y conciliar',icon:'∞',color:'#ffaee0',source:'https://docs.google.com/presentation/d/16KYiT6SUtwrKuEKYJ5vu1cNYjJkmXCksFdXfrTrr-xw/edit'},
  {id:7,code:'07',title:'Especialidades',sub:'Preparar el set avanzado',icon:'✳',color:'#f7ea9b',source:'https://docs.google.com/presentation/d/1Oc2k1PaO1IBzwb3Z_oTyyddGpLSPx9tPOC0FA7t4iCQ/edit'},
  {id:8,code:'08',title:'Guardia',sub:'Casos encadenados',icon:'⬡',color:'#ffb27a',source:''},
];

export const PASS = 70;
export const COST = 15;

const photos = {
  theatre:{file:'theatre',credit:'Dr.jayesh amin · CC BY-SA 3.0',source:'https://commons.wikimedia.org/wiki/File:Laparoscopic_operating_theatre.jpg'},
  dissector:{file:'dissector',credit:'David.Mirth · CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:Laparo_disektor.jpg'},
  hernia:{file:'hernia-set',credit:'Anpol42 · CC BY-SA 3.0',source:'https://commons.wikimedia.org/wiki/File:Instruments_for_laparoscopic_Hernia_Operation.jpg'},
  position:{file:'position',credit:'G. Rees Doyle y J. A. McCutcheon · CC BY 4.0',source:'https://commons.wikimedia.org/wiki/File:Trendelenburg_position.jpg'},
};
const dissectorMarkers = [['knob',33,22,'Rueda de rotación del eje'],['post',21,9,'Poste metálico de conexión del cable de energía'],['ring',7,50,'Anillo del mango'],['shaft',68,53,'Eje con cubierta aislante'],['jaws',92,40,'Mordazas (extremo de trabajo)']];

export const missions = [
  // ─── 01 · FUNDAMENTOS ───
  {id:'1a',module:1,mode:'route',title:'La imagen tiene una ruta',brief:'Conecta la cadena que lleva la señal de la cámara al monitor. Hay componentes de otras rutas mezclados.',hint:'Sigue la señal eléctrica de vídeo, no el recorrido de la luz ni del gas.',lesson:'La cámara capta la imagen, el procesador la trata y el monitor la muestra. La fuente de luz y la fibra pertenecen a otra ruta.',
    nodes:[['cam','Cabezal de cámara'],['light','Fuente de luz'],['proc','Procesador de imagen'],['gas','Insuflador CO₂'],['mon','Monitor HD'],['fiber','Cable de fibra óptica']],answer:['cam','proc','mon']},
  {id:'1b',module:1,mode:'route',title:'La luz antes de mirar',brief:'Traza la ruta de iluminación hasta el interior del abdomen.',hint:'La luz tiene su propio cable; no pasa por la cámara.',lesson:'La fuente de luz se conecta mediante el cable de fibra óptica al poste de luz de la óptica laparoscópica.',
    nodes:[['fiber','Cable de fibra óptica'],['optic','Óptica'],['head','Cabezal de cámara'],['source','Fuente de luz'],['proc','Procesador de imagen']],answer:['source','fiber','optic']},
  {id:'1c',module:1,mode:'route',title:'Circuito completo de vídeo',brief:'Ordena la ruta desde la escena iluminada hasta la imagen que interpreta el equipo.',hint:'Empieza donde la imagen entra al sistema, dentro del paciente.',lesson:'La óptica recoge la escena, el cabezal la convierte en señal, el procesador la trata y el monitor la presenta.',
    nodes:[['optic','Óptica laparoscópica'],['head','Cabezal de cámara'],['processor','Procesador de vídeo'],['monitor','Monitor'],['light','Fuente de luz'],['fiber','Cable de fibra óptica']],answer:['optic','head','processor','monitor']},
  {id:'1d',module:1,mode:'response',title:'La óptica mira en ángulo',brief:'Tres situaciones frecuentes con una óptica de 30°. Óptica y cabezal hacen cosas distintas.',hint:'Girar la óptica cambia hacia dónde mira; girar el cabezal cambia el horizonte.',lesson:'Con una óptica angulada, el poste de luz orienta la dirección de visión y el cabezal mantiene el horizonte. Cualquier rotación se anuncia al equipo.',events:[
    {signal:'Al rotar la óptica, el objetivo sale del encuadre',choices:[
      ['Anunciar la rotación y recuperar la referencia visual','Con 30°, rotar cambia la dirección de visión; anunciarlo evita que el equipo pierda la referencia.'],
      ['Retirar la óptica y reintroducirla por el mismo trocar','Reintroducir pierde tiempo y visión: el problema es la orientación, no el acceso.'],
      ['Pedir una óptica de 0° para eliminar el ángulo','Cambiar de óptica no es la respuesta inmediata; la de 30° funciona si se controla su rotación.']]},
    {signal:'El horizonte aparece inclinado en pantalla',choices:[
      ['Girar el cabezal de cámara hasta nivelar el horizonte','El horizonte depende del cabezal; se nivela girándolo mientras la óptica conserva su dirección.'],
      ['Girar la óptica por el poste de luz hasta nivelarlo','Rotar la óptica cambia hacia dónde mira el ángulo de 30°: perderías el objetivo.'],
      ['Pedir que roten el monitor para compensar la inclinación','Mover el monitor no corrige la imagen y rompe la referencia de todo el equipo.']]},
    {signal:'La punta de un instrumento desaparece de la pantalla',choices:[
      ['Detenerse hasta volver a ver la punta','Una punta que se mueve fuera de visión puede lesionar tejido sin que nadie lo vea.'],
      ['Seguir avanzando despacio hasta que vuelva a aparecer','Avanzar sin ver la punta, aunque sea despacio, es el gesto que causa lesiones inadvertidas.'],
      ['Aumentar el zoom digital para localizar la punta','El zoom reduce el campo visible: la punta queda todavía más lejos de la imagen.']]},
  ]},
  {id:'1e',module:1,mode:'order',title:'Antiempañamiento con trazabilidad',brief:'La óptica se empaña. Ordena la respuesta del equipo. Una tarjeta no pertenece a la secuencia.',hint:'Nadie actúa sobre la óptica sin avisar primero.',lesson:'La recuperación de visibilidad se hace con comunicación, control del instrumento y verificación antes de reanudar.',
    cards:[['announce','Comunicar la pérdida de visibilidad'],['withdraw','Retirar o proteger la óptica según indique el equipo'],['clean','Limpiar y aplicar la medida antiempañamiento prevista'],['verify','Reintroducir y confirmar imagen nítida'],['boost','Subir la intensidad de luz para atravesar el vaho','La luz no elimina el vaho; más intensidad genera reflejos y calienta la punta.']],answer:['announce','withdraw','clean','verify']},
  {id:'1f',module:1,mode:'fault',title:'Ergonomía antes de comenzar',brief:'Marca las tres condiciones del montaje que favorecen fatiga o movimientos inseguros. Cuidado: no todo lo inusual es un error.',hint:'Busca lo que obliga al cuerpo o a los cables a trabajar en tensión.',lesson:'La ergonomía laparoscópica depende de una línea de visión cómoda, una altura de trabajo adecuada y cables sin tensión ni cruces.',count:3,options:[
    ['monitor','Monitor a un lado, fuera del eje del operador','Girar el cuello durante horas provoca fatiga y movimientos menos precisos.'],
    ['height','Mesa a una altura que obliga a elevar los hombros','Con los hombros elevados llega antes la fatiga y se pierde control fino.'],
    ['cables','Cables tensos cruzando la zona de movimiento','Un cable tenso puede engancharse, desconectar un equipo o arrastrar instrumental.'],
    ['second','Segundo monitor orientado hacia el asistente','Correcto: cada persona necesita su propia línea de visión.'],
    ['pedal','Pedal de activación junto al pie del operador','Es su ubicación prevista; el riesgo sería un pedal de otro equipo o fuera de alcance.'],
    ['tower','Torre al lado opuesto del paciente respecto al operador','Suele ser lo correcto: así el monitor queda frente al operador.']],answer:['monitor','height','cables']},
  {id:'1g',module:1,mode:'scan',title:'Lee la sala',brief:'Fotografía real de un quirófano laparoscópico. Localiza cada elemento que te piden.',hint:'La imagen laparoscópica no depende de la iluminación de la sala.',lesson:'Reconocer la sala antes de trabajar acelera cada respuesta: el monitor muestra, la torre procesa, y la lámpara del techo no participa en la imagen interna.',photo:photos.theatre,
    markers:[['monitor',23,37,'Monitor de vídeo'],['tower',32,55,'Torre de equipos de laparoscopia'],['lamp',36,36,'Lámpara quirúrgica de techo'],['table',46,61,'Mesa de operaciones'],['other',86,58,'Equipo de otra área de la sala']],
    targets:[
      {prompt:'Toca el monitor donde el equipo verá la imagen laparoscópica',answer:'monitor',why:'El monitor elevado en brazo es la referencia visual compartida del equipo.'},
      {prompt:'Toca la torre que agrupa los equipos de laparoscopia',answer:'tower',why:'La torre agrupa los equipos de la cadena de imagen y del campo.'},
      {prompt:'Toca el elemento que NO aporta luz dentro del abdomen',answer:'lamp',why:'La lámpara ilumina la sala; dentro del abdomen, la luz solo llega por la óptica.'}]},

  // ─── 02 · INSTRUMENTAL ───
  {id:'2a',module:2,mode:'pick',title:'Tres funciones, tres herramientas',brief:'Carga exactamente una pieza de visión, una de acceso y una de disección fina.',hint:'Una pinza de disección tiene mordazas finas, sin dientes de agarre.',lesson:'Óptica, trocar y disector laparoscópico cubren funciones distintas; la elección responde a la solicitud del equipo.',count:3,options:[
    ['optic','Óptica laparoscópica','Visión: sin ella no se trabaja.'],
    ['mary','Disector laparoscópico','Disección fina: mordazas delgadas para separar tejido.'],
    ['trocar','Trocar','Acceso: por él entran óptica e instrumentos.'],
    ['babcock','Pinza Babcock laparoscópica','Prensión atraumática, no disección fina.'],
    ['needle','Portaagujas laparoscópico','Hecho para sujetar la aguja; su mordaza no está pensada para disecar.'],
    ['grasper','Grasper laparoscópico dentado','Sus dientes sujetan con firmeza; disecar con él desgarra.']],answer:['optic','mary','trocar']},
  {id:'2b',module:2,mode:'pick',title:'Preparación para tracción y sutura',brief:'La solicitud: tracción atraumática, sutura intracorpórea y visión. Elige tres piezas.',hint:'"Atraumática" descarta cualquier mordaza con dientes.',lesson:'La Babcock laparoscópica aporta tracción atraumática; el portaagujas maneja la aguja y la óptica da visión.',count:3,options:[
    ['babcock','Pinza Babcock laparoscópica','Tracción atraumática: mordazas redondeadas y fenestradas.'],
    ['holder','Portaagujas laparoscópico','Sutura: sujeta la aguja con firmeza y bloqueo.'],
    ['optic','Óptica 30°','Visión.'],
    ['hook','Gancho monopolar','Instrumento de energía; no sirve para tracción ni para sutura.'],
    ['grasper','Grasper laparoscópico dentado','Tracción firme con dientes: no es atraumática.'],
    ['mary','Disector laparoscópico','Sus mordazas finas no sujetan la aguja como el portaagujas.']],answer:['babcock','holder','optic']},
  {id:'2c',module:2,mode:'pick',title:'Tracción delicada bajo visión',brief:'El equipo pide una pinza atraumática y visión. Selecciona exactamente dos elementos.',hint:'Atraumático significa que no daña al sujetar: mordazas redondeadas, sin dientes.',lesson:'La Babcock laparoscópica se destina a prensión atraumática; el grasper dentado es de tracción firme y no es equivalente.',count:2,options:[
    ['babcock','Pinza Babcock laparoscópica','Prensión atraumática.'],
    ['optic','Óptica laparoscópica','Visión.'],
    ['grasper','Grasper laparoscópico dentado','Dientes de agarre: tracción firme, no atraumática.'],
    ['mary','Disector laparoscópico','Sus puntas finas concentran la presión: es para disecar, no para traccionar.'],
    ['trocar','Trocar','Es acceso, no prensión.']],answer:['babcock','optic']},
  {id:'2d',module:2,mode:'response',title:'Diámetro y puerto compatible',brief:'Instrumento, puerto y adaptador deben coincidir. Resuelve tres discrepancias.',hint:'Antes de abrir, forzar o adaptar: confirmar.',lesson:'Diámetro, longitud, sello y plataforma se confirman con el modelo real y el protocolo local antes de abrir o conectar.',events:[
    {signal:'El instrumento solicitado no pasa por el puerto disponible',choices:[
      ['Parar y confirmar el diámetro solicitado','Si no pasa, suele ser de mayor calibre; se confirma antes de buscar alternativa.'],
      ['Girar el instrumento mientras se empuja con suavidad','Forzarlo puede dañar el sello o el instrumento y desplazar el trocar.'],
      ['Pedir un trocar de mayor calibre y cambiarlo ya','Cambiar un puerto lo decide el responsable; primero se confirma qué se necesita.']]},
    {signal:'La etiqueta del envase no coincide con la solicitud',choices:[
      ['Mantenerlo cerrado y aclarar la referencia','Un envase cerrado conserva su esterilidad hasta confirmar que es el material correcto.'],
      ['Abrirlo y comparar el contenido con lo solicitado','Abrirlo para comprobar compromete un producto estéril que quizá no se use.'],
      ['Entregarlo si el calibre y la longitud coinciden','Calibre y longitud no bastan: sello, función y plataforma también deben coincidir.']]},
    {signal:'Te ofrecen un adaptador de otra marca para el puerto',choices:[
      ['Verificar compatibilidad antes de montarlo','La compatibilidad se confirma antes: un sello defectuoso se descubre tarde.'],
      ['Montarlo y comprobar si fuga con el gas abierto','Probarlo con el paciente insuflado convierte una duda en una fuga real.'],
      ['Aceptarlo si el diámetro nominal es el mismo','El mismo diámetro nominal no garantiza el mismo sello ni el mismo ajuste.']]},
  ]},
  {id:'2e',module:2,mode:'fault',title:'Inspección de una pinza',brief:'Marca los tres hallazgos que obligan a retirar la pinza. Hay detalles que parecen defectos y no lo son.',hint:'Busca lo que afecta a la función o al aislamiento, no a la estética.',lesson:'Mordazas, mecanismo, eje y aislamiento forman un conjunto; un defecto funcional impide considerar el instrumento listo.',count:3,options:[
    ['jaw','Mordazas que no cierran alineadas','No sujetan con seguridad y pueden dañar tejido o soltar lo que agarran.'],
    ['ratchet','Cremallera que no bloquea o no libera','La pinza puede soltarse o quedar trabada sobre el tejido.'],
    ['shaft','Aislamiento del eje con una zona pelada','Por ahí puede escapar corriente y quemar fuera de la vista.'],
    ['wear','Marcas de uso en el mango reutilizable','El desgaste estético del mango no afecta la función.'],
    ['nolock','Pinza sin cremallera, de apertura libre','Muchas pinzas se fabrican sin bloqueo; no es un defecto si es el modelo pedido.'],
    ['knob','Rueda de rotación con giro firme y uniforme','Una resistencia uniforme es normal; el defecto sería que gire suelta o se trabe.']],answer:['jaw','ratchet','shaft']},
  {id:'2f',module:2,mode:'order',title:'Entrega con circuito cerrado',brief:'Ordena una entrega de instrumental con confirmación verbal. Una tarjeta sobra.',hint:'Lo que se entrega es lo pedido y confirmado, no lo supuesto.',lesson:'La comunicación en circuito cerrado reduce ambigüedades: solicitud, repetición, confirmación y entrega orientada.',
    cards:[['request','Escuchar la solicitud completa'],['repeat','Repetir el nombre y la característica crítica'],['confirm','Recibir confirmación del equipo'],['handoff','Entregar el instrumento orientado y visible'],['anticipate','Entregar lo previsible antes de oír la solicitud','Anticiparse sirve para preparar, no para entregar: se entrega lo pedido y confirmado.']],answer:['request','repeat','confirm','handoff']},
  {id:'2g',module:2,mode:'scan',title:'Anatomía de una pinza',brief:'Fotografía real de un disector laparoscópico (mango a la izquierda, extremo a la derecha). Localiza cada parte.',hint:'Sigue el instrumento desde la mano del operador hasta el tejido.',lesson:'Conocer cada parte de la pinza permite inspeccionarla y describir un fallo con precisión.',photo:photos.dissector,markers:dissectorMarkers,
    targets:[
      {prompt:'Toca la pieza que gira el eje sin mover el mango',answer:'knob',why:'La rueda de rotación orienta las mordazas sin torcer la muñeca.'},
      {prompt:'Toca la parte que entra en contacto con el tejido',answer:'jaws',why:'Las mordazas son el extremo de trabajo: se revisan alineación y cierre.'},
      {prompt:'Toca la zona donde se buscan grietas del aislamiento',answer:'shaft',why:'El eje lleva una cubierta aislante; una grieta ahí puede quemar lejos de la punta.'}]},
  {id:'2h',module:2,mode:'scan',title:'Mesa mixta',brief:'Mesa real preparada para una hernioplastia laparoscópica. Encuentra lo que te piden.',hint:'Lo laparoscópico es largo y fino: tiene que atravesar un puerto.',lesson:'Una mesa real mezcla acceso, instrumental de eje largo, instrumental convencional y conexiones. Clasificarlo por función acelera cada entrega.',photo:photos.hernia,
    markers:[['trocar',18,48,'Trocares con válvula'],['shafts',49,27,'Instrumentos de eje largo'],['clamps',8,73,'Pinzas convencionales de anillas'],['forceps',30,72,'Pinzas de disección convencionales'],['cables',80,27,'Cables de conexión']],
    targets:[
      {prompt:'Toca el material de acceso por el que entrarán óptica e instrumentos',answer:'trocar',why:'Los trocares, con su válvula, son el acceso y mantienen el neumoperitoneo.'},
      {prompt:'Toca los instrumentos diseñados para trabajar a través de un puerto',answer:'shafts',why:'El eje largo y fino permite trabajar dentro del abdomen a través del trocar.'},
      {prompt:'Toca lo que hay que conectar y verificar con la torre',answer:'cables',why:'Los cables y tubos se revisan y se conectan al equipo compatible.'}]},

  // ─── 03 · ACCESOS ───
  {id:'3a',module:3,mode:'tri',title:'Triángulo de trabajo',brief:'Esquema didáctico: coloca la cámara y separa los dos puertos de trabajo.',hint:'La cámara necesita mirar entre los dos instrumentos, no desde un lado.',lesson:'La triangulación evita que los instrumentos queden paralelos y preserva una línea de visión útil. La ubicación real la decide el equipo según el procedimiento.',roles:[['camera','Cámara'],['left','Trabajo izquierdo'],['right','Trabajo derecho']],positions:[['top','Vértice superior'],['bottomLeft','Base izquierda'],['bottomRight','Base derecha']],answer:{top:'camera',bottomLeft:'left',bottomRight:'right'}},
  {id:'3b',module:3,mode:'scan',title:'Inclinación de Trendelenburg',brief:'Fotografía con maniquí de una cama en Trendelenburg. Lee la posición.',hint:'En Trendelenburg la cabeza queda más baja que los pies.',lesson:'Trendelenburg baja la cabeza y eleva los pies. La posición la establece el equipo; el personal protege al paciente y anticipa deslizamientos.',photo:photos.position,
    markers:[['head',5,38,'Extremo de la cabeza'],['feet',93,22,'Extremo de los pies'],['panel',10,71,'Panel de control de la cama'],['wheel',77,92,'Rueda de la cama']],
    targets:[
      {prompt:'Toca el extremo que queda más bajo en esta posición',answer:'head',why:'En Trendelenburg la cabeza queda por debajo de los pies.'},
      {prompt:'Toca dónde se controla la inclinación en esta cama',answer:'panel',why:'En esta cama el panel lateral controla la posición; la mesa de quirófano tiene su propio mando.'}]},
  {id:'3c',module:3,mode:'response',title:'El efecto fulcro',brief:'El puerto es un punto de apoyo. Interpreta cómo cambia el movimiento.',hint:'Lo que haces fuera del trocar se invierte y se escala dentro.',lesson:'El puerto funciona como fulcro: el movimiento externo se invierte en la punta y su amplitud depende de cuánto eje queda dentro.',events:[
    {signal:'El operador mueve el mango hacia su izquierda',choices:[
      ['La punta se desplaza hacia la derecha','El trocar actúa como fulcro: el movimiento externo se invierte en la punta.'],
      ['La punta se desplaza hacia la izquierda','Esa es la intuición de la cirugía abierta; con fulcro, el movimiento se invierte.'],
      ['La punta avanza en profundidad','Mover lateralmente el mango no hace avanzar la punta; la profundidad se controla empujando el eje.']]},
    {signal:'La punta se acerca a una estructura que no es el objetivo',choices:[
      ['Detener y corregir en pasos cortos','Parar primero y corregir en pequeño evita que el fulcro amplifique el error.'],
      ['Corregir con un movimiento amplio y rápido del mango','Con el fulcro, un gesto amplio fuera se amplifica dentro.'],
      ['Pedir que muevan la cámara para seguir la punta','Mover la cámara no detiene la punta: el riesgo sigue mientras el instrumento se mueve.']]},
    {signal:'Un gesto mínimo del mango produce un gran desplazamiento en pantalla',choices:[
      ['Reducir la amplitud del gesto y confirmar profundidad','La escala depende del eje que queda dentro y de la cercanía de la óptica: se compensa con gestos más pequeños.'],
      ['Acercar la óptica para ver el movimiento con detalle','Acercar la óptica magnifica todavía más el movimiento en pantalla.'],
      ['Compensar moviendo el mango en sentido contrario','Un contragolpe rápido duplica el error: el problema es la amplitud, no la dirección.']]},
  ]},
  {id:'3d',module:3,mode:'response',title:'Horizonte estable',brief:'Cambios de orientación producidos por cámara y puertos.',hint:'Cuando cambia la vista, hay que volver a acordar qué es "arriba".',lesson:'La orientación estable requiere referencias compartidas; una cámara lateral o rotada altera arriba, abajo, izquierda y derecha.',events:[
    {signal:'La cámara pasa a un puerto lateral',choices:[
      ['Acordar la nueva orientación antes de seguir','Al cambiar de puerto cambia el punto de vista: hay que acordar de nuevo las referencias.'],
      ['Continuar: la imagen es la misma si no se gira el cabezal','Desde otro puerto, izquierda y derecha ya no corresponden a lo mismo.'],
      ['Dejar que cada miembro se reoriente por su cuenta','Sin una referencia común, cada persona interpreta la imagen de forma distinta.']]},
    {signal:'La imagen rota lentamente durante una maniobra',choices:[
      ['Avisar y restablecer el horizonte','Corregir el horizonte primero devuelve a todos una referencia fiable.'],
      ['Compensar la rotación moviendo los instrumentos','Corregir a mano con el horizonte girado cruza izquierda y derecha y provoca errores.'],
      ['Esperar a terminar la maniobra para corregirlo','Terminar con el horizonte rotado es trabajar con referencias falsas en el momento crítico.']]},
    {signal:'Operador y asistente llaman "arriba" a zonas distintas',choices:[
      ['Nombrar una referencia anatómica común y confirmarla','Una referencia nombrada y confirmada es la misma para todos.'],
      ['Usar como referencia la orientación del paciente en la mesa','La mesa y la pantalla no coinciden cuando la cámara está rotada o lateral.'],
      ['Continuar y corregir cuando aparezca un error','Esperar al error es aceptar que ocurra; la referencia se acuerda antes.']]},
  ]},
  {id:'3f',module:3,mode:'order',title:'Pausa antes del acceso',brief:'Ordena la verificación de equipo previa al acceso laparoscópico. Una tarjeta sobra.',hint:'Nada avanza sin la autorización del responsable.',lesson:'La técnica y el sitio de acceso los decide el equipo responsable; el personal confirma material, riesgos comunicados y preparación antes de proceder.',
    cards:[['brief','Confirmar plan y factores de riesgo comunicados'],['equipment','Verificar acceso solicitado, calibre e integridad'],['team','Hacer la pausa y confirmar que el equipo está listo'],['proceed','Continuar solo con autorización del responsable'],['openall','Abrir todos los trocares disponibles por si se necesitan','Abrir material innecesario desperdicia y no sustituye confirmar el calibre solicitado.']],answer:['brief','equipment','team','proceed']},
  {id:'3g',module:3,mode:'fault',title:'Espacio restringido',brief:'Marca las tres señales de geometría deficiente que deben comunicarse. Algunas situaciones parecen raras pero son correctas.',hint:'Busca lo que quita control o visión, no lo que simplemente es distinto.',lesson:'Paralelismo, palancas extremas y puntas fuera de visión reducen control y aumentan colisiones; la corrección corresponde al equipo, bajo visión.',count:3,options:[
    ['parallel','Instrumentos casi paralelos, sin ángulo entre sí','Chocan entre ellos ("duelo de espadas") y pierden capacidad de trabajo.'],
    ['lever','Mangos llevados al tope contra el borde del puerto','En el límite de la palanca se pierde control y se fuerza la pared.'],
    ['tips','Punta activa fuera del campo visual','Una punta que no se ve puede lesionar sin que nadie lo note.'],
    ['center','Cámara entre los dos puertos de trabajo','Es la disposición buscada: visión central y trabajo a ambos lados.'],
    ['parked','Instrumento en espera, retirado hasta la punta del trocar','Retirado dentro del trocar queda seguro y fuera de la zona de trabajo.'],
    ['back','Óptica retirada unos centímetros para ampliar el campo','Alejar la óptica es una forma válida de ver ambas puntas a la vez.']],answer:['parallel','lever','tips']},

  // ─── 04 · ENERGÍA ───
  {id:'4a',module:4,mode:'fault',title:'Inspección de energía',brief:'Marca las tres señales que obligan a detener y verificar antes de usar energía. Hay trampas.',hint:'No todas las energías necesitan lo mismo: piensa cómo circula la corriente en cada una.',lesson:'Aislamiento, retorno y activación bajo visión son controles de seguridad. La bipolar no usa placa de retorno porque la corriente circula entre sus mordazas.',count:3,options:[
    ['insul','Grieta en el aislamiento del electrodo','La corriente puede escapar por la grieta y quemar fuera de la vista.'],
    ['return','Placa de retorno monopolar colocada sin comprobar su contacto','Un contacto pobre concentra la corriente y puede quemar la piel bajo la placa.'],
    ['blind','Activación propuesta con la punta fuera de visión','Activar sin ver la punta es activar a ciegas.'],
    ['bipolar','Pinza bipolar conectada sin placa de retorno','Correcto: la bipolar conduce la corriente entre sus mordazas y no necesita placa.'],
    ['standby','Generador en espera hasta que se solicite','Es lo correcto: se activa solo cuando el equipo lo pide.'],
    ['holster','Electrodo guardado en su funda aislante entre usos','Es la forma segura de dejarlo cuando no se usa.']],answer:['insul','return','blind']},
  {id:'4b',module:4,mode:'fault',title:'Sistema combinado: alerta',brief:'Encuentra las tres condiciones que exigen aclaración antes de conectar el dispositivo.',hint:'Compatibilidad, integridad física y comunicación del modo.',lesson:'La compatibilidad del generador, la integridad física y la comunicación del modo se confirman antes del uso.',count:3,options:[
    ['mismatch','Generador de otra marca, sin compatibilidad confirmada','Un dispositivo en una plataforma no compatible puede entregar una energía distinta a la prevista.'],
    ['damage','Cable con la cubierta aplastada cerca del conector','Un cable dañado puede fallar o fugar corriente.'],
    ['unknown','Modo de energía que nadie ha anunciado','Si el modo no se anuncia, el equipo no sabe qué efecto esperar.'],
    ['justopen','Dispositivo de un solo uso abierto justo antes de conectarlo','Abrirlo cuando se va a usar es lo previsto, si la solicitud está confirmada.'],
    ['selftest','Generador que hace una autoprueba al encenderse','La autoprueba es normal en muchos generadores; no indica un fallo.'],
    ['keyed','Conector que solo entra en una orientación','Es un diseño deliberado para evitar errores de montaje.']],answer:['mismatch','damage','unknown']},
  {id:'4c',module:4,mode:'response',title:'Calor residual',brief:'Desactivar no significa que la punta esté fría.',hint:'Tras activar, la punta sigue siendo peligrosa durante un tiempo.',lesson:'Algunos dispositivos conservan calor tras activarse; se mantienen visibles, separados de tejidos y en su soporte hasta que el equipo confirme la seguridad.',events:[
    {signal:'El dispositivo acaba de desactivarse',choices:[
      ['Mantener la punta visible y separada de los tejidos','La punta puede seguir caliente: visible y separada no quema nada.'],
      ['Apoyarlo sobre el campo junto al sitio de trabajo','La punta puede conservar calor y quemar lo que toque, aunque esté apagada.'],
      ['Entregarlo en mano a la instrumentista enseguida','La punta sigue caliente: debe ir a su soporte, no a una mano.']]},
    {signal:'Te piden cambiar de instrumento justo después de activarlo',choices:[
      ['Avisar del calor residual y dejarlo en su soporte','El aviso y el soporte evitan quemaduras en paños, instrumental o personas.'],
      ['Dejarlo sobre la mesa de instrumental, entre las pinzas','Una punta caliente sobre paños e instrumental puede quemarlos o transferir calor.'],
      ['Entregarlo sin comentar: el cambio es urgente','La urgencia no enfría la punta; si no se avisa, quien lo recibe no lo sabe.']]},
    {signal:'La punta toca otra pinza metálica tras activarse',choices:[
      ['Avisar y vigilar el tejido que sujeta la otra pinza','El calor puede pasar a la otra pinza y de ahí al tejido que sujeta.'],
      ['No es relevante: el dispositivo ya está apagado','El calor residual puede transferirse aunque el dispositivo esté apagado.'],
      ['Separarlas y reactivar para comprobar que funciona','Reactivar sin necesidad añade energía y calor justo donde hay una duda.']]},
  ]},
  {id:'4d',module:4,mode:'fault',title:'Acoplamiento directo',brief:'Marca las tres situaciones que pueden transferir energía a un elemento no previsto.',hint:'El riesgo es el contacto durante la activación, no la mera presencia de metal.',lesson:'El acoplamiento directo ocurre cuando un electrodo activo toca otro instrumento conductor; visión, separación y comunicación son las barreras.',count:3,options:[
    ['touch','Electrodo activo tocando otra pinza metálica','La corriente pasa a la pinza y quema donde esta toque tejido.'],
    ['hidden','Activación con el punto de contacto fuera de visión','Si no se ve el contacto, no se ve la lesión.'],
    ['crowded','Instrumentos conductores amontonados alrededor de la punta','Cuanto más cerca, más probable es un contacto durante la activación.'],
    ['two','Dos instrumentos metálicos en el campo a la vez','Es lo normal; el riesgo es que se toquen durante la activación.'],
    ['pulses','Activación en pulsos cortos y controlados','Es una práctica prudente, no un riesgo.'],
    ['bipolarv','Bipolar activada con las mordazas a la vista','Es la condición segura de uso.']],answer:['touch','hidden','crowded']},
  {id:'4e',module:4,mode:'fault',title:'Corriente fuera de vista',brief:'Selecciona los tres riesgos que pueden causar una lesión lejos de la punta observada. Pista: uno de los materiales parece peligroso y no lo es.',hint:'Piensa en las cánulas: el problema es mezclar metal y plástico.',lesson:'Fallo de aislamiento, acoplamiento capacitivo (sobre todo con cánulas híbridas) y activación fuera de visión son mecanismos de lesión descritos por FUSE.',count:3,options:[
    ['crack','Defecto de aislamiento en el eje','La corriente escapa por el defecto y quema fuera del campo visible.'],
    ['hybrid','Cánula híbrida de metal y plástico para el gancho monopolar','El anclaje de plástico impide que la corriente capacitiva se disipe por la pared: puede quemar lejos de la punta.'],
    ['blind','Activación con parte del instrumento fuera de visión','Lo que no se ve puede estar tocando tejido.'],
    ['metal','Cánula totalmente metálica para el gancho monopolar','Una cánula totalmente metálica disipa la corriente capacitiva por la pared; el riesgo es la híbrida.'],
    ['bipolar','Energía bipolar en lugar de monopolar','La bipolar reduce el acoplamiento y la corriente dispersa.'],
    ['visible','Punta completamente visible durante la activación','Es la condición segura.']],answer:['crack','hybrid','blind']},
  {id:'4f',module:4,mode:'order',title:'Plataforma correcta',brief:'Ordena la preparación de un dispositivo de energía antes de su prueba. Una tarjeta es peligrosa.',hint:'La prueba es lo último, y siempre según el fabricante.',lesson:'La preparación segura comienza con identificación y compatibilidad, sigue con inspección y configuración comunicada y termina con una prueba controlada.',
    cards:[['identify','Identificar dispositivo, cable y generador solicitados'],['compatibility','Confirmar compatibilidad e integridad'],['settings','Comunicar y confirmar el modo previsto'],['test','Hacer la prueba indicada por el fabricante y el protocolo'],['drape','Hacer una activación de prueba sobre el paño estéril','Activar sobre paños puede quemarlos o iniciar un incendio: la prueba sigue al fabricante.']],answer:['identify','compatibility','settings','test']},
  {id:'4g',module:4,mode:'response',title:'Humo y cable de luz',brief:'Dos riesgos que persisten fuera del punto de activación.',hint:'El extremo de un cable de luz encendido quema como una fuente de calor.',lesson:'El humo reduce la visibilidad y el extremo del cable de luz puede actuar como fuente térmica; ambos requieren comunicación y manejo según protocolo.',events:[
    {signal:'El humo oculta la punta activa',choices:[
      ['No activar hasta recuperar visibilidad','Sin ver la punta, cualquier activación es a ciegas.'],
      ['Seguir activando en pulsos cortos para terminar','Aunque sean pulsos, activar sin ver la punta es activar a ciegas.'],
      ['Limpiar la óptica, que es la causa probable','Si el humo está en el campo, limpiar la lente no lo elimina.']]},
    {signal:'El cable de luz queda desconectado de la óptica pero encendido',choices:[
      ['Poner la fuente en espera y avisar','Sin luz saliendo, el extremo deja de ser una fuente de calor.'],
      ['Dejarlo sobre el paño con el extremo hacia abajo','El extremo encendido puede quemar paños y piel: es un riesgo de incendio.'],
      ['Cubrir el extremo con una compresa','Taparlo no apaga la luz: la compresa puede calentarse y quemarse.']]},
    {signal:'La visibilidad mejora y empeora de forma intermitente',choices:[
      ['Revisar evacuación de humo, lente y fuente','Una causa intermitente se busca sistema por sistema.'],
      ['Subir la potencia para acortar cada activación','Más potencia no reduce el humo y aumenta el daño térmico.'],
      ['Silenciar la alarma del insuflador para concentrarse','Silenciar sin revisar esconde el problema que causa la mala visión.']]},
  ]},

  // ─── 05 · CAMPO ───
  {id:'5a',module:5,mode:'response',title:'Sala de señales',brief:'Cada aviso tiene un sistema responsable. Identifícalo antes de actuar.',hint:'Borroso, oscuro y sin presión son tres sistemas distintos.',lesson:'Imagen, luz y presión son sistemas distintos; cada señal necesita una comprobación dirigida con el equipo.',events:[
    {signal:'La imagen está borrosa, con buena luz',choices:[
      ['Revisar la lente y el enfoque del cabezal','Borroso con buena luz apunta a lente sucia o enfoque, no a la iluminación.'],
      ['Repetir el balance de blancos','El balance de blancos corrige el color, no la nitidez.'],
      ['Aumentar la intensidad de la fuente de luz','Más luz no enfoca; con vaho o suciedad produce más reflejos.']]},
    {signal:'El campo se ve oscuro pero nítido',choices:[
      ['Revisar la fuente de luz y el cable de fibra','Imagen nítida pero oscura: la cámara funciona, falta luz.'],
      ['Revisar el cable entre procesador y monitor','Si esa conexión fallara no habría imagen; aquí hay imagen, pero falta luz.'],
      ['Subir el brillo en los ajustes del monitor','El brillo del monitor maquilla el problema; al campo sigue llegando poca luz.']]},
    {signal:'La presión cae de golpe y el insuflador alarma',choices:[
      ['Buscar fugas en trocares y conexiones','Una caída brusca suele ser una fuga: llave abierta, trocar desplazado o conexión.'],
      ['Aumentar la presión programada del insuflador','Subir la presión no cierra la fuga y expone al paciente a más presión.'],
      ['Silenciar la alarma y vigilar el valor','Silenciar sin buscar la causa deja que el campo se siga perdiendo.']]},
  ]},
  {id:'5b',module:5,mode:'response',title:'Control de visibilidad',brief:'Tres alertas nuevas; identifica el sistema que corresponde antes de continuar.',hint:'Color, señal y gas se revisan por rutas diferentes.',lesson:'Balance de blancos, señal de cámara y neumoperitoneo se revisan por rutas diferentes.',events:[
    {signal:'La imagen tiene un tono amarillento',choices:[
      ['Repetir el balance de blancos','Un tono incorrecto en toda la imagen se corrige con el balance de blancos.'],
      ['Cambiar el cable de fibra óptica','Un cable dañado reduce la luz, pero el tono se corrige con el balance de blancos.'],
      ['Limpiar la lente de la óptica','La suciedad empaña; no cambia el color de toda la imagen.']]},
    {signal:'El monitor está encendido pero sin imagen',choices:[
      ['Revisar el cable de vídeo al monitor','"Sin señal" apunta a la conexión de vídeo entre procesador y monitor.'],
      ['Revisar la fuente de luz y el cable de fibra','Sin luz verías una imagen oscura, no una pantalla sin señal.'],
      ['Cambiar la óptica por una de repuesto','Con una óptica dañada verías una imagen defectuosa, no una pantalla sin señal.']]},
    {signal:'Alarma del insuflador sin cambios en la imagen',choices:[
      ['Revisar presión, flujo y conexiones de gas','La alarma del gas se revisa en el sistema de gas.'],
      ['Silenciarla: la imagen confirma que todo va bien','La imagen no mide la presión: una alarma de gas se revisa en el gas.'],
      ['Esperar a que se repita antes de revisar','Esperar una segunda alarma retrasa la corrección de una fuga u obstrucción.']]},
  ]},
  {id:'5c',module:5,mode:'response',title:'La presión habla',brief:'Lee el insuflador: presión y flujo juntos cuentan qué pasa.',hint:'Fuga: presión baja, flujo alto. Obstrucción: presión alta, flujo nulo.',lesson:'Presión baja con flujo alto sugiere fuga; presión alta sin flujo sugiere obstrucción. Una alarma no se silencia sin identificar la causa y comunicarla.',events:[
    {signal:'La presión cae y el flujo sube al máximo',choices:[
      ['Buscar una fuga: llaves, trocares o conexiones','El gas sale del insuflador pero se escapa: es una fuga.'],
      ['Revisar si el tubo de gas está acodado','Un tubo acodado sube la presión y frena el flujo: es el patrón contrario.'],
      ['Cambiar la botella de CO₂ por una llena','Con la botella vacía el flujo no subiría: el gas sí sale, pero se escapa.']]},
    {signal:'La presión sube y el flujo se detiene',choices:[
      ['Buscar un tubo acodado o una llave cerrada','El gas no puede avanzar: el patrón es de obstrucción.'],
      ['Buscar una llave abierta en algún trocar','Una llave abierta produce fuga: la presión bajaría y el flujo subiría.'],
      ['Aumentar el flujo máximo del insuflador','Más flujo contra una obstrucción no llega al paciente y retrasa la solución.']]},
    {signal:'No llega gas después de cambiar la botella',choices:[
      ['Comprobar válvula y conexión de la botella','Tras un cambio, lo primero es la válvula y la conexión de la botella.'],
      ['Subir la presión programada del insuflador','Si el gas no entra al insuflador, cambiar la presión no resuelve nada.'],
      ['Revisar la llave del trocar de la óptica','La llave del trocar no explica que falte gas desde el cambio de botella.']]},
  ]},
  {id:'5d',module:5,mode:'response',title:'Humo, vaho o sangre',brief:'Diferencia la causa de la pérdida de imagen antes de actuar.',hint:'Fíjate en cuándo aparece y en su color.',lesson:'La apariencia de la imagen orienta la comprobación, pero el equipo confirma la causa; ante un posible sangrado, la visión se protege.',events:[
    {signal:'Halo lechoso uniforme al introducir la óptica',choices:[
      ['Vaho en la lente: calentar o limpiar la óptica','Al entrar, la diferencia de temperatura empaña la lente.'],
      ['Humo de energía: pedir evacuación del campo','Sin activación previa no hay humo; un halo al entrar es típico del vaho.'],
      ['Sangrado: avisar al cirujano de inmediato','La sangre enrojece y oscurece; un halo lechoso uniforme sugiere vaho.']]},
    {signal:'Nube que aparece durante una activación de energía',choices:[
      ['Humo: pausar la activación y evacuar','La nube coincide con la activación: es humo.'],
      ['Vaho: retirar la óptica y limpiar la lente','La nube coincide con la activación: es humo, y limpiar la lente no lo evacúa.'],
      ['Fallo de la fuente de luz: revisar el cable','La luz no genera nubes; su relación con la activación señala humo.']]},
    {signal:'Cambio rojo súbito que oculta las referencias',choices:[
      ['Avisar de inmediato y mantener la visión estable','Si es sangrado, el equipo necesita una imagen estable para responder.'],
      ['Retirar la óptica para limpiarla y volver a entrar','Si es sangrado, retirar la óptica deja al equipo sin visión cuando más la necesita.'],
      ['Repetir el balance de blancos sobre una gasa','Un rojo súbito no es un problema de color hasta descartar sangrado.']]},
  ]},
  {id:'5e',module:5,mode:'order',title:'Comunicación en circuito cerrado',brief:'Ordena una comunicación ante una alerta de equipo. Una tarjeta rompe el circuito.',hint:'El circuito se cierra cuando quien emitió el mensaje recibe el resultado.',lesson:'Un mensaje cerrado incluye aviso claro, repetición del receptor, confirmación y reporte del resultado.',
    cards:[['call','Emitir un aviso específico y nombrar el sistema'],['repeat','El receptor repite la instrucción'],['confirm','Quien la emitió confirma o corrige'],['report','El receptor informa del resultado'],['act','El receptor actúa en cuanto entiende la idea general','Actuar sin repetir ni confirmar es la causa típica de malentendidos.']],answer:['call','repeat','confirm','report']},
  {id:'5f',module:5,mode:'order',title:'Cambio súbito del campo',brief:'Ordena las prioridades del equipo ante una pérdida inesperada de visibilidad. Una tarjeta distrae.',hint:'Primero avisar, después proteger la visión.',lesson:'El personal avisa, conserva la visión disponible, prepara lo solicitado y confirma lo usado; las decisiones clínicas corresponden al responsable.',
    cards:[['announce','Comunicar el cambio de inmediato'],['vision','Mantener o recuperar una vista útil sin movimientos a ciegas'],['prepare','Preparar el material solicitado por el responsable'],['reconcile','Confirmar lo usado y el estado del campo antes de avanzar'],['tidy','Reorganizar la mesa de instrumental mientras se aclara','Ocuparse de otra tarea retrasa la respuesta a lo que pida el responsable.']],answer:['announce','vision','prepare','reconcile']},

  // ─── 06 · SUTURA ───
  {id:'6a',module:6,mode:'order',title:'Antes de entregar la aguja',brief:'Ordena la preparación del instrumentista para el tiempo de sutura. Una tarjeta sobra.',hint:'Confirmar lo pedido va antes que cualquier otra cosa.',lesson:'La preparación combina confirmación del material, inspección del conjunto y conteo compartido antes de entregar.',
    cards:[['confirm','Confirmar material y calibre solicitados'],['inspect','Inspeccionar aguja y portaagujas'],['count','Anotar la aguja en el conteo con circulante'],['handoff','Entregar al equipo el conjunto verificado'],['preload','Cargar la aguja antes de confirmar el calibre','Cargar antes de confirmar puede obligar a abrir otra sutura y complica el conteo.']],answer:['confirm','inspect','count','handoff']},
  {id:'6b',module:6,mode:'order',title:'Cierre del tiempo de sutura',brief:'Reconstruye el control del material al terminar. Una tarjeta rompe la trazabilidad.',hint:'Nada se desecha antes de contarlo.',lesson:'La trazabilidad de agujas e instrumentos se confirma con el equipo antes de cerrar la entrega.',
    cards:[['announce','Recibir el aviso de fin del tiempo de sutura'],['retrieve','Recuperar la aguja y el instrumental usados'],['recount','Conciliar el conteo con circulante'],['report','Comunicar cualquier discrepancia antes de avanzar'],['discard','Desechar la aguja usada en cuanto se retira','Desecharla antes de contarla rompe la conciliación: el conteo no cuadraría.']],answer:['announce','retrieve','recount','report']},
  {id:'6c',module:6,mode:'order',title:'Orientación de la aguja',brief:'Ordena la preparación antes de entregar una aguja cargada. Una tarjeta es un atajo inseguro.',hint:'La carga la define quien va a suturar, no la costumbre.',lesson:'La carga exacta depende de la solicitud del operador: confirmar material, inspeccionar, orientar según la indicación y verificar antes de transferir.',
    cards:[['material','Confirmar sutura, aguja y solicitud'],['inspect','Inspeccionar aguja y portaagujas'],['orient','Cargar y orientar según la indicación recibida'],['verify','Mostrar y confirmar antes de entregar'],['habit','Cargarla en el ángulo que suele usarse','La orientación se ajusta a la indicación del operador, no a la costumbre.']],answer:['material','inspect','orient','verify']},
  {id:'6d',module:6,mode:'tri',title:'Dos manos, dos funciones',brief:'Asigna visión, exposición y conducción de aguja en un esquema de coordinación bimanual.',hint:'La mano con más destreza fina conduce la aguja.',lesson:'La mano no dominante suele mantener la exposición mientras la dominante conduce la aguja y la cámara conserva la visión; es un modelo didáctico, no una prescripción técnica.',roles:[['expose','Exposición estable'],['needle','Conducción de aguja'],['camera','Visión']],positions:[['top','Visión estable'],['bottomLeft','Mano no dominante'],['bottomRight','Mano dominante']],answer:{top:'camera',bottomLeft:'expose',bottomRight:'needle'}},
  {id:'6e',module:6,mode:'response',title:'Tensión sin exceso',brief:'Reconoce señales de tensión inadecuada en una tarea simulada de sutura.',hint:'Ni un cierre que deforma ni uno que se afloja es un buen cierre.',lesson:'La tensión se valora con el equipo: demasiada compromete el tejido y muy poca deja el cierre inestable.',events:[
    {signal:'El tejido se deforma mucho al ajustar el nudo',choices:[
      ['Avisar de un posible exceso de tensión','Una deformación marcada sugiere tensión excesiva, que puede cortar el tejido o comprometer su riego.'],
      ['Continuar: la deformación indica un cierre firme','La deformación marcada no es firmeza: puede cortar o comprometer el tejido.'],
      ['Pedir un hilo más grueso para que resista','El calibre no corrige un exceso de tensión; el tejido sigue sufriendo.']]},
    {signal:'El lazo pierde aproximación al soltarlo',choices:[
      ['Avisar de tensión insuficiente','Un lazo que se abre no mantiene el cierre.'],
      ['Continuar: el siguiente punto lo compensará','Un punto flojo no se compensa con otro: el cierre queda inestable.'],
      ['Cortar el hilo y dejarlo como está','Cortar sin verificar deja fijo un nudo que no cumple su función.']]},
    {signal:'La línea de sutura sale del campo visual',choices:[
      ['Detener y recuperar la visión','Suturar sin ver arriesga lesión y pérdida de la aguja.'],
      ['Seguir el hilo con la aguja hasta que reaparezca','Mover una aguja fuera de visión arriesga lesión y pérdida de la aguja.'],
      ['Pedir más zoom para ver el detalle','Más zoom reduce el campo: la sutura queda aún más fuera de la imagen.']]},
  ]},
  {id:'6f',module:6,mode:'order',title:'Aguja no localizada',brief:'Ordena la respuesta ante una aguja que no se ve. Una tarjeta es la tentación habitual.',hint:'Se busca en cuanto se detecta la falta, no al final.',lesson:'Una discrepancia exige detenerse, comunicar y conciliar de forma sistemática según el protocolo institucional.',
    cards:[['stop','Detener la progresión y mantener el campo controlado'],['announce','Comunicar que la aguja no está localizada'],['reconcile','Conciliar conteo, portaagujas y zonas de transferencia'],['protocol','Seguir la búsqueda y el escalamiento del protocolo'],['later','Continuar y buscarla al final del procedimiento','Esperar al final permite que la aguja se desplace y dificulta encontrarla.']],answer:['stop','announce','reconcile','protocol']},

  // ─── 07 · ESPECIALIDADES ───
  {id:'7a',module:7,mode:'loadout',title:'Set avanzado: bariátrica',brief:'El equipo pide exposición hepática, grapado y extracción protegida. Asigna un elemento a cada función; uno sobra.',hint:'El hígado se expone con un retractor específico, no con una pinza.',lesson:'Retractor hepático, grapadora y bolsa de extracción forman parte del set bariátrico descrito en el módulo; confirma siempre la solicitud local.',slots:[['expose','Exposición hepática'],['divide','Grapado'],['extract','Extracción']],items:[['nathanson','Retractor Nathanson','Diseñado para separar y sostener el hígado.'],['stapler','Grapadora lineal','Corta y grapa a la vez.'],['bag','Bolsa de extracción','Extrae la pieza sin contaminar el trayecto.'],['grasper','Grasper laparoscópico dentado','Sujeta con dientes: no está pensado para sostener el hígado.']],answer:{expose:'nathanson',divide:'stapler',extract:'bag'}},
  {id:'7b',module:7,mode:'loadout',title:'Set avanzado: colorrectal',brief:'Se pide visión, anastomosis circular y extracción contenida. Relaciona cada función; uno sobra.',hint:'Lee bien el tipo de anastomosis.',lesson:'La preparación por especialidad exige confirmar el procedimiento y la compatibilidad de cada dispositivo.',slots:[['vision','Visión'],['join','Anastomosis circular'],['extract','Extracción']],items:[['optic','Óptica laparoscópica','Visión.'],['circular','Grapadora circular EEA','Crea una anastomosis circular.'],['bag','Bolsa de extracción','Extracción contenida.'],['stapler','Grapadora lineal','Grapa en línea recta: no es la anastomosis circular solicitada.']],answer:{vision:'optic',join:'circular',extract:'bag'}},
  {id:'7c',module:7,mode:'order',title:'Pausa de seguridad biliar',brief:'Ordena el punto de control del equipo antes de dividir estructuras. Una tarjeta es un atajo peligroso.',hint:'La guía pide ver, no suponer.',lesson:'La guía multisocietaria recomienda la visión crítica de seguridad para la identificación anatómica. El instrumentista apoya la pausa; la decisión clínica es del cirujano.',
    cards:[['expose','Confirmar exposición y visibilidad suficientes'],['identify','Escuchar la identificación anatómica explícita'],['team','Confirmar que el equipo comparte el punto de control'],['authorize','Continuar solo con la indicación del responsable'],['assume','Aceptar la identificación por la forma habitual de la vía','La visión crítica de seguridad existe porque la anatomía puede ser distinta de la habitual.']],answer:['expose','identify','team','authorize']},
  {id:'7d',module:7,mode:'response',title:'Anastomosis colorrectal: preparación',brief:'Tres comprobaciones del instrumental, sin ejecutar la técnica.',hint:'Cualquier discrepancia se comunica en el momento, no al final.',lesson:'La grapadora circular exige confirmar referencia, componentes, compatibilidad y trazabilidad según el fabricante y el protocolo local.',events:[
    {signal:'El tamaño solicitado no coincide con el envase',choices:[
      ['Mantenerlo cerrado y aclarar la referencia','Un tamaño distinto cambia la anastomosis; se aclara antes de abrir.'],
      ['Abrirlo: un tamaño cercano suele servir','Un tamaño distinto cambia la anastomosis; no se sustituye sin indicación.'],
      ['Pedir otro a circulante sin avisar al equipo','El equipo debe conocer la discrepancia antes de que llegue el material.']]},
    {signal:'Falta un componente del sistema solicitado',choices:[
      ['Detener y comunicar la discrepancia','Avisar a tiempo da margen para conseguir el componente correcto.'],
      ['Usar el componente equivalente de otro kit','Mezclar componentes de kits distintos puede fallar en el disparo.'],
      ['Montar lo disponible y avisar al final','Avisar al final deja al equipo sin margen para conseguir el componente.']]},
    {signal:'La verificación final aún no se ha comunicado',choices:[
      ['Completar la verificación y el registro del lote','La verificación y el registro se hacen durante la preparación.'],
      ['Entregar el dispositivo: el cirujano lo revisará','La verificación es compartida; entregarlo sin ella traslada el riesgo.'],
      ['Registrar el lote al final del procedimiento','Al final, el envase con el lote puede haberse perdido.']]},
  ]},
  {id:'7e',module:7,mode:'fault',title:'Grapado bariátrico: alerta',brief:'Marca las tres condiciones que impiden considerar lista la grapadora. Algunas situaciones son normales en grapado.',hint:'Cartucho, plataforma y esterilidad.',lesson:'Cartucho, plataforma, integridad y referencia se confirman antes de entregar. El juego no enseña a elegir cargas ni la técnica de grapado.',count:3,options:[
    ['cartridge','Carga del cartucho sin confirmar con el cirujano','La carga define la altura de grapa: sin confirmarla, puede no ser la adecuada.'],
    ['platform','Cartucho de una línea distinta a la del mango','Un cartucho de otra línea puede no encajar ni disparar bien.'],
    ['seal','Envase del cartucho con el sello de esterilidad roto','Sin garantía de esterilidad no se usa.'],
    ['reload','Recarga abierta al pedirse el siguiente disparo','Abrir la recarga cuando se solicita es lo previsto.'],
    ['reuse','Mismo mango para varias recargas en el mismo paciente','Muchos mangos admiten varias recargas en un procedimiento, según el fabricante.'],
    ['colors','Cartuchos de distintos colores en la mesa','Los colores indican alturas de grapa; tener varios es normal si se confirman antes de cargar.']],answer:['cartridge','platform','seal']},
  {id:'7f',module:7,mode:'loadout',title:'Set ginecológico laparoscópico',brief:'Asocia visión, manipulación y sutura en un set genérico. Uno sobra.',hint:'La manipulación se hace con una pinza de agarre.',lesson:'Los procedimientos ginecológicos varían; esta actividad solo relaciona funciones básicas y exige confirmar la solicitud del equipo.',slots:[['vision','Visión'],['handle','Manipulación'],['suture','Sutura']],items:[['optic','Óptica laparoscópica','Visión.'],['grasper','Grasper laparoscópico dentado','Agarre firme para manipular.'],['holder','Portaagujas laparoscópico','Sutura.'],['hook','Gancho monopolar','Es un instrumento de energía, no de agarre.']],answer:{vision:'optic',handle:'grasper',suture:'holder'}},

  // ─── 08 · GUARDIA (casos encadenados) ───
  {id:'8a',module:8,mode:'op',title:'Colecistectomía: del montaje al conteo',cost:10,brief:'Primer caso de la mañana: colecistectomía laparoscópica programada. Tú instrumentas. Cuatro etapas, un solo margen de error.',lesson:'Un procedimiento es una cadena: una torre bien montada, una entrega confirmada, una alarma bien leída y un conteo cerrado se sostienen entre sí.',stages:[
    {mode:'route',title:'Montaje: la imagen',brief:'La torre llega desconectada. Traza la ruta de vídeo.',hint:'Desde donde entra la imagen hasta donde la ve el equipo.',
      nodes:[['optic','Óptica laparoscópica'],['head','Cabezal de cámara'],['processor','Procesador de vídeo'],['monitor','Monitor'],['light','Fuente de luz'],['gas','Insuflador CO₂']],answer:['optic','head','processor','monitor']},
    {mode:'pick',title:'Primer tiempo',brief:'El cirujano pide visión, el acceso para la óptica y el instrumento de energía para disecar.',hint:'Energía para disecar: un instrumento monopolar.',count:3,options:[
      ['optic','Óptica laparoscópica','Visión.'],['trocar','Trocar','Acceso para la óptica.'],['hook','Gancho monopolar','Energía para disecar.'],
      ['babcock','Pinza Babcock laparoscópica','Tracción atraumática; no es un instrumento de energía.'],['holder','Portaagujas laparoscópico','Es de sutura, no de disección.'],['grasper','Grasper laparoscópico dentado','Es de tracción, no de energía.']],answer:['optic','trocar','hook']},
    {mode:'response',title:'En pleno campo',brief:'El procedimiento avanza. Dos avisos seguidos.',hint:'Presión alta sin flujo es obstrucción; y la pausa acordada es del equipo.',events:[
      {signal:'Tras recolocar al paciente, el insuflador marca presión alta y flujo cero',choices:[
        ['Revisar si el tubo quedó acodado o pinzado','Presión alta sin flujo: el gas no avanza. Tras mover al paciente, el tubo suele quedar acodado.'],
        ['Buscar una llave abierta en los trocares','Una llave abierta daría presión baja y flujo alto: el patrón contrario.'],
        ['Subir el flujo máximo para vencer la resistencia','Más flujo contra una obstrucción no llega al paciente.']]},
      {signal:'Te piden los clips y nadie ha nombrado la visión crítica de seguridad acordada',choices:[
        ['Tenerlos listos y recordar la pausa acordada','La pausa es del equipo: si se acordó, cualquiera puede recordarla.'],
        ['Entregarlos: la identificación es cosa del cirujano','La pausa es del equipo: si se acordó, cualquiera puede y debe recordarla.'],
        ['No entregarlos hasta que tú veas la anatomía','La identificación anatómica no es tu decisión; tu papel es recordar la pausa, no bloquear.']]},
    ]},
    {mode:'order',title:'Cierre',brief:'La pieza está fuera. Ordena el cierre del material. Una tarjeta sobra.',hint:'Nada se desmonta antes de contar.',
      cards:[['bag','Confirmar que la pieza salió en su bolsa'],['count','Conciliar agujas, gasas e instrumental con circulante'],['report','Comunicar el resultado del conteo al cirujano'],['close','Continuar con el cierre tras un conteo correcto'],['early','Empezar a desmontar la mesa antes del conteo','Desmontar antes de contar mezcla el material y hace imposible conciliar.']],answer:['bag','count','report','close']},
  ]},
  {id:'8b',module:8,mode:'op',title:'Guardia de noche: todo a la vez',cost:10,brief:'Urgencia de madrugada. El equipo está cansado y los sistemas empiezan a dar avisos. Tres etapas, un solo margen.',lesson:'Con cansancio, las barreras que salvan son las mismas: inspeccionar, nombrar lo que se ve y conciliar antes de avanzar.',stages:[
    {mode:'fault',title:'Inspección rápida',brief:'Revisas el gancho monopolar y su acceso con prisa. Marca los dos riesgos reales.',hint:'Una cánula mixta de metal y plástico es un riesgo; una totalmente metálica no.',count:2,options:[
      ['hybrid','Cánula híbrida de metal y plástico para el gancho','Impide que la corriente capacitiva se disipe por la pared: puede quemar lejos de la punta.'],
      ['crack','Pequeña grieta en el aislamiento cerca del mango','Por ahí puede escapar corriente, fuera de la vista.'],
      ['metal','Cánula totalmente metálica en otro puerto','Disipa la corriente capacitiva por la pared: no es la alerta.'],
      ['bipolar','Pinza bipolar sin placa de retorno','La bipolar no necesita placa de retorno.'],
      ['holster','Gancho guardado en su funda aislante','Es la forma segura de dejarlo entre usos.']],answer:['hybrid','crack']},
    {mode:'response',title:'Campo inestable',brief:'Dos cambios de imagen en pocos minutos.',hint:'Cuándo aparece y de qué color es.',events:[
      {signal:'Una nube cubre el campo durante la activación',choices:[
        ['Pausar y pedir evacuación de humo','Coincide con la activación: es humo. Sin visión no se activa.'],
        ['Retirar la óptica para limpiarla','Es humo en el campo; limpiar la lente no lo evacúa.'],
        ['Seguir activando: se despejará sola','Activar sin ver la punta es activar a ciegas.']]},
      {signal:'La imagen se tiñe de rojo de golpe',choices:[
        ['Avisar de inmediato y mantener la óptica estable','Si es sangrado, el equipo necesita una imagen estable para responder.'],
        ['Retirar la óptica para limpiarla y volver a entrar','Retirar la óptica deja al equipo sin visión justo cuando más la necesita.'],
        ['Repetir el balance de blancos sobre una gasa','Un rojo súbito no es un problema de color hasta descartar sangrado.']]},
    ]},
    {mode:'order',title:'La aguja que falta',brief:'Al cerrar, el conteo no cuadra: falta una aguja. Ordena la respuesta. Una tarjeta es la tentación de las 4 a. m.',hint:'Cansancio o no, se busca ahora.',
      cards:[['stop','Detener la progresión y mantener el campo controlado'],['announce','Comunicar que la aguja no está localizada'],['reconcile','Conciliar conteo, portaagujas y zonas de transferencia'],['protocol','Seguir la búsqueda y el escalamiento del protocolo'],['assume','Registrarla como descartada: seguro que cayó al suelo','Suponer dónde está no es localizarla; el protocolo existe para no suponer.']],answer:['stop','announce','reconcile','protocol']},
  ]},
];
