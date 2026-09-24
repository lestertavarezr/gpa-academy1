// lms.js va primero: restaura el progreso del alumno antes de que se lea.
import { LMS } from "./lms.js";
import Phaser from "phaser";
import "./style.css";
import roomUrl from "./assets/quirofano-isometrico.webp";
import actorBodyUrl from "./assets/actor/body.svg";
import actorArmUrl from "./assets/actor/arm.svg";
import actorLegUrl from "./assets/actor/leg.svg";
import { Sound } from "./audio.js";
import { DISTRACTORS } from "./distractors.js";
import { EVENTS } from "./events.js";
import { Progress, MEDALS } from "./progress.js";
import { createMayo } from "./mayo.js";
import { CONFIG, DEMO_MISSIONS } from "./config.js";
import { Report } from "./report.js";
import { aiAvailable, mountCoach } from "./ai.js";
const Ut = Phaser,
  Dt = [
    { id: "ficha", label: "Expediente", short: "ID", x: 225, y: 170 },
    { id: "material", label: "Material", short: "ST", x: 170, y: 480 },
    { id: "monitor", label: "Monitor", short: "MN", x: 395, y: 210 },
    { id: "aspiracion", label: "Aspiración", short: "AS", x: 365, y: 350 },
    { id: "conteo", label: "Conteo", short: "CT", x: 830, y: 470 },
    { id: "equipo", label: "Equipo", short: "EQ", x: 895, y: 135 },
  ],
  Xt = [
    {
      title: "Asepsia y antisepsia",
      source:
        "https://docs.google.com/presentation/d/1R3OiFMMAcn1b48pNN0hSF5Zl3BG5otEm/edit",
    },
    {
      title: "Heridas y suturas",
      source:
        "https://docs.google.com/presentation/d/1QYgmxPW_l_WVZKvqTqpE-XfBEi-BY6be/edit",
    },
    {
      title: "Equipamiento y tecnología",
      source:
        "https://docs.google.com/presentation/d/1dnm1bLhjN8_K8cOgAck5maAHd9NMvLWG/edit",
    },
    {
      title: "Instrumental por especialidad",
      source:
        "https://docs.google.com/presentation/d/1rLXtS1Z1Z8GmAWYpfNcxEgvXZaFanfs9/edit",
    },
    {
      title: "Repaso integrador",
      source:
        "https://docs.google.com/presentation/d/1CG2CWXggNEVN8YfUsW3QReK6B_jtcxt8/edit",
    },
  ],
  Mt = [
    {
      module: 1,
      source: Xt[0].source,
      learning:
        "Verificar identidad, funcionamiento y esterilidad antes de preparar el campo.",
      title: "La primera apertura",
      label: "MISIÓN 01 · APERTURA",
      guided: !0,
      intro:
        "Son las 07:20. El equipo se prepara para su primera intervención. Antes de avanzar, verifica tres puntos que pueden cambiar el desarrollo de la pausa de seguridad.",
      identity: {
        station: "ficha",
        title: "Empieza por el expediente",
        finding:
          "Hay una pulsera colocada, pero nadie ha cotejado los identificadores y el procedimiento con el expediente.",
        options: [
          {
            text: "Cotejar identificadores y procedimiento con el expediente y el equipo.",
            safe: !0,
          },
          {
            text: "Usar la pizarra como única confirmación para ahorrar tiempo.",
            safe: !1,
          },
        ],
        good: "Confirmaste los datos antes de avanzar. El equipo parte de la misma información.",
        bad: "La pizarra no sustituye una verificación activa. Esta incertidumbre aparecerá en la pausa.",
      },
      equipment: {
        station: "aspiracion",
        title: "Comprueba el equipo",
        finding:
          "La conexión del aspirador está suelta y aún no se ha comprobado su funcionamiento.",
        options: [
          {
            text: "Asegurar la conexión, probar el equipo y comunicar que está disponible.",
            safe: !0,
          },
          {
            text: "Esperar hasta que el equipo necesite aspiración.",
            safe: !1,
          },
        ],
        good: "Detectaste la falla antes de que interrumpiera el trabajo.",
        bad: "El funcionamiento sigue sin confirmar. La pausa tendrá que detenerse para resolverlo.",
      },
      supplies: [
        {
          id: "ready",
          title: "Paquete A",
          detail: "Envoltorio íntegro; indicador y registro verificables.",
          target: "field",
        },
        {
          id: "suspect",
          title: "Paquete B",
          detail: "Envoltorio con humedad visible.",
          target: "hold",
        },
      ],
      dialogue:
        "«Estamos por comenzar. ¿Hay alguna situación que el equipo deba conocer antes de la pausa?»",
      communication: [
        {
          text: "«Identidad, material y aspiración: estos son los resultados de la verificación y lo que falta resolver».",
          safe: !0,
        },
        {
          text: "«Creo que está todo bien; si surge algo, avisamos».",
          safe: !1,
        },
        { text: "No intervenir para no retrasar al equipo.", safe: !1 },
      ],
      pauseIntro:
        "El equipo se reúne para la pausa antes de la incisión. Lo que decidiste antes determina qué debe revisarse ahora.",
    },
  ];
function yt(p, T, t, u, c, l, a, s, e, i) {
  const r = Mt.length + 1,
    n = (o) => ({
      station: o[0],
      title: o[1],
      finding: o[2],
      options: [
        { text: o[3], safe: !0 },
        { text: o[4], safe: !1 },
      ],
      good: o[5],
      bad: o[6],
    });
  Mt.push({
    module: p,
    source: Xt[p - 1].source,
    title: T,
    label: `MÓDULO ${p} · MISIÓN ${String(r).padStart(2, "0")}`,
    guided: !1,
    intro: t,
    identity: n(u),
    equipment: n(c),
    supplies: [
      { id: "ready", title: l[0], detail: l[1], target: "field" },
      { id: "suspect", title: a[0], detail: a[1], target: "hold" },
    ],
    dialogue: s,
    communication: [
      { text: e[0], safe: !0 },
      { text: e[1], safe: !1 },
      { text: "Guardar silencio y avanzar sin aclararlo.", safe: !1 },
    ],
    pauseIntro:
      "El equipo se reúne para la pausa. Tus decisiones previas determinan qué se debe aclarar antes de continuar.",
    learning: i,
  });
}
yt(
  1,
  "Campo bajo vigilancia",
  "La sala ya está montada. Una persona circulante se acerca a la mesa estéril y el equipo tiene prisa.",
  [
    "ficha",
    "Estado del campo",
    "No consta si un material no estéril tocó el borde del campo.",
    "Aclarar el contacto y sustituir lo comprometido.",
    "Asumir que sigue estéril porque se ve limpio.",
    "El evento quedó aclarado.",
    "La apariencia no demuestra esterilidad.",
  ],
  [
    "conteo",
    "Conteo inicial",
    "Instrumentista y circulante aún no confirmaron el conteo inicial.",
    "Realizar y registrar juntos el conteo antes de avanzar.",
    "Dejar el conteo para el cierre.",
    "Hay una referencia compartida.",
    "Falta una referencia fiable.",
  ],
  ["Campo íntegro", "Empaque seco y trazable."],
  ["Campo rasgado", "El empaque presenta una rotura."],
  "«¿Hubo contacto con el campo?»",
  [
    "«Aclaremos el contacto y repongamos lo comprometido».",
    "«No se nota contaminación; sigamos».",
  ],
  "La pérdida de esterilidad se trata como contaminación, aunque el material parezca limpio.",
);
yt(
  1,
  "Preparación de la piel",
  "Antes del drapeado, se revisa la preparación cutánea y el material que entrará al campo.",
  [
    "ficha",
    "Confirma la preparación",
    "La preparación cutánea figura pendiente de confirmación.",
    "Confirmar con el responsable que se completó según protocolo.",
    "Suponer que ya se realizó.",
    "La preparación quedó verificada.",
    "Una etapa crítica sigue sin confirmar.",
  ],
  [
    "equipo",
    "Límite estéril",
    "Una persona sin bata ni guantes estériles intenta ajustar un campo.",
    "Detener el contacto y pedir al personal estéril que haga el ajuste.",
    "Permitirlo para no retrasar.",
    "Se mantuvo el límite estéril.",
    "El contacto compromete el campo.",
  ],
  ["Campo seco", "Empaque intacto y verificable."],
  ["Campo desplazado", "Un borde tocó una superficie no estéril."],
  "«¿Está todo listo para el drapeado?»",
  [
    "«Confirmemos la preparación y sustituyamos el campo comprometido».",
    "«Sí, ya se ve preparado».",
  ],
  "El montaje del campo depende de la preparación y de barreras estériles intactas.",
);
yt(
  1,
  "Conteo antes del cierre",
  "El cirujano anuncia el cierre de cavidad. Queda un registro de textiles sin conciliar.",
  [
    "conteo",
    "Reconcilia el conteo",
    "Las gasas registradas no coinciden con el recuento.",
    "Detener el avance y repetir el conteo con instrumentista y circulante.",
    "Esperar al final para revisarlo.",
    "La discrepancia se abordó a tiempo.",
    "La diferencia sigue abierta.",
  ],
  [
    "equipo",
    "Aviso al cirujano",
    "El cirujano aún no conoce la discrepancia.",
    "Comunicarla antes de cerrar la cavidad.",
    "Asumir que otra persona ya avisó.",
    "Todo el equipo conoce el estado.",
    "Falta una comunicación crítica.",
  ],
  ["Textiles registrados", "Gasas radiopacas contabilizadas."],
  ["Textiles sueltos", "Gasas adicionales sin registrar."],
  "«¿Podemos confirmar el conteo?»",
  [
    "«Hay una discrepancia; detengamos el cierre y conciliemos».",
    "«Se resolverá después».",
  ],
  "El conteo de textiles e instrumental se concilia y comunica antes del cierre.",
);
yt(
  2,
  "La herida contaminada",
  "Aparece un derrame gastrointestinal importante, sin pus franco, durante un procedimiento.",
  [
    "ficha",
    "Clasifica el hallazgo",
    "El parte aún dice «herida limpia».",
    "Solicitar al equipo revisar y documentar la clasificación tras el derrame.",
    "Mantener «limpia» porque así se planificó.",
    "El registro refleja el hallazgo.",
    "La clasificación inicial ya no describe el caso.",
  ],
  [
    "aspiracion",
    "Visibilidad del campo",
    "La aspiración no se ha comprobado tras el derrame.",
    "Comprobarla con el equipo antes de continuar.",
    "Asumir que funciona porque está conectada.",
    "La aspiración está disponible.",
    "La conexión no equivale a prueba funcional.",
  ],
  ["Cobertura verificada", "Apósito estéril íntegro según el plan."],
  ["Cobertura abierta", "Envase abierto; esterilidad no verificable."],
  "«¿Qué cambió con el derrame?»",
  [
    "«Revisemos clasificación y material con el equipo».",
    "«El plan inicial sigue igual».",
  ],
  "Un derrame importante puede cambiar la clasificación de la herida y el plan del equipo.",
);
yt(
  2,
  "Bordes que se separan",
  "En una herida reciente se observa separación parcial de bordes. Tu papel es detectarla y comunicarla.",
  [
    "ficha",
    "Registra la observación",
    "La separación no aparece en la evolución.",
    "Documentar el hallazgo y avisar al profesional responsable.",
    "Cubrir la herida y esperar a la próxima ronda.",
    "El hallazgo entra en la evaluación clínica.",
    "La dehiscencia queda sin comunicar.",
  ],
  [
    "monitor",
    "Vigilancia de signos",
    "El monitor tiene las alarmas silenciadas.",
    "Pedir al responsable que verifique parámetros y alarmas.",
    "Confiar en una lectura aislada.",
    "La vigilancia quedó confirmada.",
    "Una lectura aislada puede omitir cambios.",
  ],
  ["Apósito estéril", "Empaque íntegro para la cobertura indicada."],
  ["Apósito vencido", "La fecha de uso permitida ya pasó."],
  "«¿Hay algún cambio que debamos valorar?»",
  [
    "«Observé separación de bordes; solicito valoración».",
    "«Se ve casi normal».",
  ],
  "La dehiscencia requiere valoración del equipo; la simulación no prescribe tratamientos autónomos.",
);
yt(
  2,
  "Sutura para el plano",
  "El equipo solicita una sutura para cierre de fascia y debe confirmarse la indicación.",
  [
    "ficha",
    "Lee la indicación",
    "El pedido no consigna material ni calibre.",
    "Aclarar material y calibre con el cirujano antes de abrir.",
    "Elegir el hilo que parece más grueso.",
    "La selección se basa en una indicación.",
    "El grosor aparente no la sustituye.",
  ],
  [
    "equipo",
    "Confirma la aguja",
    "Hay agujas de punta distinta sin confirmar cuál se requiere.",
    "Confirmar el tipo según tejido y técnica con el cirujano.",
    "Entregar la primera disponible.",
    "El equipo aclaró la aguja.",
    "La elección puede no corresponder al tejido.",
  ],
  ["Sutura indicada", "Material y calibre confirmados; empaque íntegro."],
  ["Sutura distinta", "No coincide con la indicación."],
  "«¿Qué sutura y aguja quedó confirmada?»",
  [
    "«Repito material, calibre y aguja antes de abrirlos».",
    "«Cualquiera servirá».",
  ],
  "La selección de sutura y aguja se confirma por tejido y técnica.",
);
yt(
  2,
  "Drenaje al cierre",
  "Se ha indicado un drenaje cerrado. Antes del cierre se comprueba material y funcionamiento.",
  [
    "ficha",
    "Verifica la indicación",
    "El drenaje solicitado verbalmente no coincide con el registro.",
    "Aclarar el tipo con el cirujano y actualizar el registro.",
    "Preparar el primero del armario.",
    "La indicación quedó unificada.",
    "La discrepancia sigue abierta.",
  ],
  [
    "aspiracion",
    "Comprueba el sistema",
    "El reservorio no ha sido revisado.",
    "Comprobar integridad y funcionamiento según protocolo.",
    "Colocarlo y revisar después.",
    "El sistema se comprobó antes de usarlo.",
    "Su funcionamiento sigue incierto.",
  ],
  ["Drenaje confirmado", "Modelo indicado y empaque íntegro."],
  ["Drenaje dudoso", "Empaque perforado."],
  "«¿Qué drenaje quedó indicado?»",
  ["«Confirmamos modelo y funcionamiento».", "«Lo revisaremos luego»."],
  "Los drenajes requieren indicación clara, empaque verificado y prueba del sistema.",
);
yt(
  3,
  "Electrocirugía segura",
  "La unidad electroquirúrgica está preparada, pero faltan comprobaciones de seguridad.",
  [
    "ficha",
    "Revisa el plan",
    "Se prevé uso monopolar y la placa de retorno no figura como confirmada.",
    "Pedir confirmación de colocación y condición de la placa.",
    "Suponer que está bajo los campos.",
    "El circuito previsto quedó confirmado.",
    "La ausencia de confirmación sigue abierta.",
  ],
  [
    "equipo",
    "Inspecciona conexiones",
    "Un cable está parcialmente desconectado.",
    "Corregir la conexión con el responsable y probar la unidad.",
    "Ajustarlo solo si falla durante la cirugía.",
    "La falla se atendió antes del uso.",
    "La conexión dudosa permanece.",
  ],
  ["Lápiz verificado", "Cable y empaque íntegros; compatible."],
  ["Lápiz dañado", "Aislamiento del cable deteriorado."],
  "«¿Qué falta antes de activar?»",
  [
    "«Confirmamos placa, cables y prueba funcional».",
    "«La unidad enciende; está lista».",
  ],
  "En uso monopolar se comprueban placa de retorno, cables y configuración.",
);
yt(
  3,
  "Torre laparoscópica",
  "El procedimiento requiere imagen, luz e insuflación. La torre enciende, pero falta probarla.",
  [
    "ficha",
    "Valida el procedimiento",
    "El parte indica laparoscopia y la sala figura preparada para cirugía abierta.",
    "Aclarar la discrepancia y confirmar componentes necesarios.",
    "Esperar a que pidan lo que falte.",
    "La sala se alineó con el procedimiento.",
    "Puede faltar tecnología esencial.",
  ],
  [
    "monitor",
    "Prueba la imagen",
    "La señal de cámara es intermitente.",
    "Revisar conexiones y hacer prueba de imagen con el equipo.",
    "Ignorarla porque a ratos se ve bien.",
    "La imagen quedó comprobada.",
    "La intermitencia sigue presente.",
  ],
  ["Óptica verificada", "Compatible, procesada y con empaque íntegro."],
  ["Cable de luz dudoso", "Conector dañado."],
  "«¿La torre está realmente lista?»",
  [
    "«Confirmamos imagen, luz, insuflación y material».",
    "«Todo enciende, así que sí».",
  ],
  "La torre integra varios sistemas y cada uno requiere verificación.",
);
yt(
  3,
  "Aspiración e irrigación",
  "La intervención necesita un campo visible; el circuito de aspiración e irrigación aún no se prueba.",
  [
    "ficha",
    "Plan de fluidos",
    "La solución indicada no coincide con el recipiente colocado.",
    "Aclarar la solución y confirmar el recipiente correcto.",
    "Utilizar el disponible sin consultar.",
    "El insumo coincide con la indicación.",
    "La discrepancia sigue abierta.",
  ],
  [
    "aspiracion",
    "Comprueba succión",
    "La succión es débil en la prueba.",
    "Revisar conexiones, recipiente y presión con el responsable.",
    "Aumentar presión sin revisar el sistema.",
    "La causa se investigó.",
    "La falla puede persistir.",
  ],
  ["Tubo verificado", "Circuito estéril e íntegro."],
  ["Tubo abierto", "Conexión abierta; esterilidad no verificable."],
  "«¿Qué falta para mantener el campo visible?»",
  [
    "«Confirmamos solución y funcionamiento».",
    "«Subamos la presión y sigamos».",
  ],
  "Circuito, solución y esterilidad se comprueban antes de usar la bomba.",
);
yt(
  3,
  "Posición e imagen",
  "Una cirugía ortopédica requiere posicionamiento e imagen con arco en C.",
  [
    "ficha",
    "Confirma el lado",
    "El pedido de imagen no consigna lado y difiere del parte.",
    "Aclarar el lado con el equipo antes de preparar.",
    "Preparar ambos lados y decidir luego.",
    "El lado quedó confirmado.",
    "La discrepancia sigue activa.",
  ],
  [
    "equipo",
    "Protección para imagen",
    "No se comprobó protección radiológica ni cobertura del arco.",
    "Coordinar protección y cobertura estéril con responsables.",
    "Confiar en que el operador lo resolverá al entrar.",
    "La entrada se planificó con seguridad.",
    "La coordinación queda pendiente.",
  ],
  ["Cobertura íntegra", "Funda estéril compatible con el arco."],
  ["Funda rasgada", "Rotura visible."],
  "«¿Qué falta para traer el arco?»",
  ["«Confirmamos lado, protección y cobertura».", "«Que entre y luego vemos»."],
  "Lado, posición y protección radiológica se coordinan antes de la imagen.",
);
yt(
  4,
  "Bandeja de cirugía general",
  "Se prepara una bandeja general. Faltan piezas y una pinza no coincide con la lista.",
  [
    "ficha",
    "Verifica el set",
    "La lista requiere corte, hemostasia, disección y retracción; el registro está incompleto.",
    "Cotejar bandeja y lista aprobada; resolver faltantes.",
    "Confiar en que aparecerán durante la cirugía.",
    "El set se cotejó.",
    "El faltante puede interrumpir la intervención.",
  ],
  [
    "conteo",
    "Conteo instrumental",
    "El número de pinzas no coincide con la hoja.",
    "Recontar con circulante y documentar.",
    "Ajustar mentalmente el número.",
    "El conteo quedó conciliado.",
    "La discrepancia permanece.",
  ],
  ["Set completo", "Piezas y conteo verificados."],
  ["Set incompleto", "Falta una pinza Kelly."],
  "«¿La bandeja está completa?»",
  [
    "«Verificamos funciones, piezas y conteo».",
    "«Buscaremos faltantes después».",
  ],
  "La mesa se organiza por función y se coteja con el set previsto.",
);
yt(
  4,
  "Exposición en ortopedia",
  "El equipo solicita un separador para trabajar cerca de hueso.",
  [
    "ficha",
    "Aclara la necesidad",
    "El pedido solo dice «separador».",
    "Preguntar qué región y exposición necesita el cirujano.",
    "Elegir el más grande.",
    "La solicitud quedó precisa.",
    "El tamaño no determina su uso.",
  ],
  [
    "equipo",
    "Anticipa el cambio",
    "Se anuncia cambio de plano sin ajustar el separador.",
    "Confirmar nueva exposición y coordinar el relevo.",
    "Retirar el separador sin avisar.",
    "El cambio se coordinó.",
    "La retirada puede dejar sin visión.",
  ],
  ["Hohmann verificado", "Instrumento requerido, estéril e íntegro."],
  ["Retractor dudoso", "Extremo activo dañado."],
  "«¿Qué exposición queda confirmada?»",
  ["«Confirmo función y aviso antes del cambio».", "«Tomé el más grande»."],
  "Cada separador tiene una función y la exposición se coordina con el cirujano.",
);
yt(
  4,
  "Microinstrumental neuroquirúrgico",
  "El campo requiere manipulación fina y un instrumento tiene la punta deteriorada.",
  [
    "ficha",
    "Verifica la técnica",
    "Se requiere microdisección, pero el set registrado es general.",
    "Aclarar el set de microinstrumental antes de preparar.",
    "Usar instrumentos generales hasta que pidan otros.",
    "El set coincide con la técnica.",
    "Falta equipo de precisión.",
  ],
  [
    "monitor",
    "Confirma la visualización",
    "No se probó la imagen del microscopio.",
    "Coordinar prueba de visualización.",
    "Asumir que funcionará porque enciende.",
    "La visualización se comprobó.",
    "El encendido no confirma la imagen.",
  ],
  ["Frazier íntegro", "Cánula fina procesada e inspeccionada."],
  ["Microinstrumento dañado", "Punta deformada."],
  "«¿El equipo fino está apto?»",
  [
    "«Confirmamos set, óptica e instrumentos».",
    "«El microscopio enciende; sigamos».",
  ],
  "Microinstrumental y visualización requieren inspección específica.",
);
yt(
  4,
  "Set de otorrinolaringología",
  "Se requiere instrumental para cirugía nasal endoscópica; la bandeja disponible es de amigdalectomía.",
  [
    "ficha",
    "Comprueba el procedimiento",
    "El set no corresponde al parte operatorio.",
    "Aclarar procedimiento y solicitar set apropiado.",
    "Abrir la bandeja disponible.",
    "El set se alineó con el abordaje.",
    "La bandeja no corresponde.",
  ],
  [
    "equipo",
    "Confirma pinza fina",
    "Se pide una pinza nasal y hay dos modelos similares.",
    "Repetir nombre y uso antes de entregarla.",
    "Entregar cualquiera de las dos.",
    "La entrega fue precisa.",
    "Similitud visual no garantiza función.",
  ],
  ["Pinza adecuada", "Modelo solicitado, estéril e íntegro."],
  ["Pinza errónea", "Modelo distinto al requerido."],
  "«¿El set corresponde al abordaje?»",
  ["«Confirmamos procedimiento, set y pinza».", "«Las pinzas se parecen»."],
  "En cada especialidad importan el set correcto y la confirmación verbal.",
);
yt(
  5,
  "Clasificación final",
  "El parte inicial dice «herida limpia». Ahora hay perforación y contenido intestinal.",
  [
    "ficha",
    "Actualiza la clasificación",
    "La perforación no consta en la clasificación final.",
    "Comunicarla para que el equipo revise y documente la clase.",
    "Conservar «limpia» por el parte inicial.",
    "Se considera el hallazgo real.",
    "El parte inicial ya no corresponde.",
  ],
  [
    "equipo",
    "Plan de cierre",
    "El cierre no se revisó tras el hallazgo.",
    "Pedir al cirujano confirmar el plan de cierre.",
    "Asumir cierre primario rutinario.",
    "La decisión queda en el equipo.",
    "No debe asumirse el cierre.",
  ],
  ["Cobertura verificada", "Apósito estéril según indicación."],
  ["Cobertura usada", "Empaque abierto; trazabilidad dudosa."],
  "«¿Clasificación y cierre siguen iguales?»",
  ["«Revisemos clase y cierre con el cirujano».", "«El parte inicial basta»."],
  "La perforación cambia la evaluación; el equipo define el cierre.",
);
yt(
  5,
  "Evaluación TIME",
  "Una herida presenta exudado abundante y bordes que no avanzan.",
  [
    "ficha",
    "Registra T-I-M-E",
    "Se describe exudado, pero no tejido ni bordes.",
    "Documentar tejido, inflamación, humedad y bordes para valoración.",
    "Registrar solo el exudado.",
    "La evaluación incluye los cuatro componentes.",
    "La observación queda parcial.",
  ],
  [
    "equipo",
    "Comparte el cambio",
    "El responsable no conoce el aumento de exudado.",
    "Comunicarlo y solicitar revisión del plan.",
    "Cambiar el apósito sin informar.",
    "El equipo dispone de datos actuales.",
    "El cambio queda sin valoración.",
  ],
  ["Apósito indicado", "Tipo y absorción confirmados."],
  ["Apósito inadecuado", "Baja absorción sin orden confirmada."],
  "«¿Qué cambió en humedad y bordes?»",
  ["«Documento TIME y comunico el cambio».", "«Solo cambié la cobertura»."],
  "TIME ordena observar tejido, infección/inflamación, humedad y bordes.",
);
yt(
  5,
  "Sutura en revisión",
  "Antes del cierre, se confirma una sutura de larga duración para fascia de alta tensión.",
  [
    "ficha",
    "Confirma la prescripción",
    "Hay suturas absorbibles de distinta duración.",
    "Confirmar material, duración y calibre requeridos.",
    "Tomar cualquier absorbible.",
    "La elección responde a la indicación.",
    "«Absorbible» no define resistencia.",
  ],
  [
    "equipo",
    "Lee el empaque",
    "Un producto tiene nombre parecido al solicitado.",
    "Leer material, calibre y aguja antes de abrir.",
    "Guiarse por el color del empaque.",
    "Se confirmó el producto exacto.",
    "El color no sustituye la etiqueta.",
  ],
  ["PDS confirmado", "Material y calibre indicados; empaque íntegro."],
  ["Sutura distinta", "Material diferente al confirmado."],
  "«¿Qué material exacto necesitamos?»",
  [
    "«Repito material, calibre y aguja».",
    "«Todas las absorbibles son equivalentes».",
  ],
  "Comparar suturas por absorción, estructura y resistencia, según indicación clínica.",
);
yt(
  5,
  "Entrega integral",
  "Una herida con drenaje y apósito requiere entrega al siguiente equipo.",
  [
    "ficha",
    "Conciliación final",
    "El informe omite clase de herida, drenaje y estado del apósito.",
    "Completar la entrega y confirmar los datos con el equipo.",
    "Entregar solo el nombre del procedimiento.",
    "La continuidad dispone de datos relevantes.",
    "La entrega queda incompleta.",
  ],
  [
    "aspiracion",
    "Estado del drenaje",
    "El reservorio cerrado no está identificado ni comprobado.",
    "Confirmar tipo, identificación y funcionamiento.",
    "Dejarlo para la próxima guardia.",
    "El drenaje se entrega con estado conocido.",
    "La próxima guardia recibe una incertidumbre.",
  ],
  ["Apósito confirmado", "Cobertura indicada, íntegra y documentada."],
  ["Apósito dudoso", "Etiqueta ilegible."],
  "«¿Qué debe saber la siguiente guardia?»",
  [
    "«Comunico herida, drenaje, cobertura y pendientes».",
    "«Terminó sin novedades».",
  ],
  "Una entrega segura resume hallazgos, material y acciones pendientes.",
);
Mt.forEach((p, T) => {
  p.label = `MÓDULO ${p.module} · MISIÓN ${String(T + 1).padStart(2, "0")}`;
});
// Tercera opción creíble en cada decisión; la comunicación sustituye el
// distractor genérico («guardar silencio») por uno específico del caso.
Mt.forEach((p, T) => {
  const extra = DISTRACTORS[T];
  for (const key of ["identity", "equipment"])
    p[key].options.push({
      text: extra[key].text,
      safe: !1,
      why: extra[key].why,
    });
  p.communication = [
    p.communication[0],
    { text: extra.communication.text, safe: !1, why: extra.communication.why },
    p.communication[1],
  ];
});
// Orden aleatorio estable por partida: se guarda en el estado para que las
// opciones no salten al volver a pintar el panel.
function shuffled(key, items) {
  Q.shuffle ??= {};
  let order = Q.shuffle[key];
  if (!Array.isArray(order) || order.length !== items.length) {
    order = items.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    Q.shuffle[key] = order;
  }
  return order.map((i) => items[i]);
}
const bi = {
    4: {
      type: "match",
      title: "Clasifica lo que cambió",
      prompt:
        "Relaciona cada hallazgo con su clase de herida. El equipo tratante confirma la clasificación final.",
      choices: [
        "Limpia",
        "Limpia-contaminada",
        "Contaminada",
        "Sucia/infectada",
      ],
      rows: [
        [
          "Entrada controlada a un tracto sin derrame importante",
          "Limpia-contaminada",
        ],
        ["Derrame gastrointestinal importante sin pus franco", "Contaminada"],
        ["Perforación con infección establecida", "Sucia/infectada"],
      ],
    },
    5: {
      type: "match",
      title: "Reconoce la complicación",
      prompt:
        "Relaciona cada observación con el término que se debe comunicar al profesional responsable.",
      choices: ["Dehiscencia", "Hematoma", "Seroma", "Infección"],
      rows: [
        ["Separación de los bordes de la herida", "Dehiscencia"],
        ["Acumulación de sangre bajo la piel", "Hematoma"],
        ["Acumulación de líquido seroso", "Seroma"],
      ],
    },
    6: {
      type: "match",
      title: "Lee la sutura y la aguja",
      prompt:
        "Asocia cada característica con la categoría correcta antes de abrir material.",
      choices: [
        "Monofilamento",
        "Multifilamento",
        "Aguja cilíndrica",
        "Aguja cortante inversa",
      ],
      rows: [
        ["Un solo filamento y menor capilaridad", "Monofilamento"],
        ["Varios filamentos trenzados", "Multifilamento"],
        ["Punta redonda para tejidos delicados", "Aguja cilíndrica"],
      ],
    },
    7: {
      type: "match",
      title: "Distingue drenajes y cobertura",
      prompt: "Clasifica los elementos mencionados en la solicitud del equipo.",
      choices: [
        "Pasivo abierto",
        "Activo cerrado",
        "Apósito",
        "Instrumento de corte",
      ],
      rows: [
        ["Penrose", "Pasivo abierto"],
        ["Jackson-Pratt", "Activo cerrado"],
        ["Cobertura de espuma", "Apósito"],
      ],
    },
    8: {
      type: "diagnose",
      title: "Panel de electrocirugía",
      prompt:
        "Marca cada componente como verificado o pendiente según la evidencia visible.",
      rows: [
        ["Placa de retorno", "No consta colocación confirmada", "pending"],
        ["Cable del lápiz", "Conexión parcialmente suelta", "pending"],
        ["Generador", "Autoprueba completada y documentada", "ready"],
      ],
    },
    9: {
      type: "diagnose",
      title: "Panel de torre laparoscópica",
      prompt:
        "No basta con que la torre encienda. Interpreta el estado de cada componente.",
      rows: [
        ["Cámara y monitor", "Señal de imagen intermitente", "pending"],
        ["Fuente de luz", "Prueba funcional completada", "ready"],
        ["Insuflador", "Alarmas aún sin comprobar", "pending"],
      ],
    },
    10: {
      type: "diagnose",
      title: "Panel de aspiración e irrigación",
      prompt:
        "Lee los resultados de prueba del circuito y marca lo que exige revisión.",
      rows: [
        ["Aspiración", "Succión débil durante la prueba", "pending"],
        [
          "Solución de irrigación",
          "Etiqueta coincide con la indicación",
          "ready",
        ],
        ["Tubería estéril", "Conexión abierta y sin trazabilidad", "pending"],
      ],
    },
    11: {
      type: "diagnose",
      title: "Panel de imagen y posición",
      prompt:
        "Antes de introducir el arco en C, identifica qué está listo y qué falta.",
      rows: [
        ["Lado operatorio", "Pedido de imagen y parte no coinciden", "pending"],
        [
          "Protección radiológica",
          "Personal sin confirmación de protección",
          "pending",
        ],
        ["Mesa y frenos", "Estabilidad comprobada", "ready"],
      ],
    },
    12: {
      type: "tray",
      title: "Arma la bandeja general",
      prompt:
        "Selecciona exactamente tres instrumentos de la solicitud: corte, hemostasia y sutura.",
      choices: [
        ["Mango de bisturí n.º 3", !0],
        ["Pinza Kelly", !0],
        ["Portaagujas Mayo-Hegar", !0],
        ["Cánula Fukushima", !1],
        ["Pinza Takahashi", !1],
        ["Separador Hohmann", !1],
      ],
    },
    13: {
      type: "tray",
      title: "Arma el set ortopédico",
      prompt:
        "Selecciona los tres elementos pedidos para exposición, corte y aspiración.",
      choices: [
        ["Separador Hohmann", !0],
        ["Tijera Mayo curva", !0],
        ["Aspirador Yankauer", !0],
        ["Pinza Takahashi", !1],
        ["Portaagujas Castroviejo", !1],
        ["Pinza Randall", !1],
      ],
    },
    14: {
      type: "tray",
      title: "Arma el set microquirúrgico",
      prompt:
        "Selecciona tres instrumentos de trabajo fino para este caso neuroquirúrgico.",
      choices: [
        ["Cánula Frazier", !0],
        ["Portaagujas Castroviejo", !0],
        ["Tijera de Yasargil", !0],
        ["Aspirador Poole", !1],
        ["Separador Hohmann", !1],
        ["Separador Balfour", !1],
      ],
    },
    15: {
      type: "tray",
      title: "Arma el set nasal",
      prompt:
        "Selecciona tres instrumentos de la bandeja de cirugía nasal endoscópica.",
      choices: [
        ["Pinza de bayoneta", !0],
        ["Pinza Blakesley", !0],
        ["Pinza Takahashi", !0],
        ["Separador Hohmann", !1],
        ["Separador Balfour", !1],
        ["Pinza Randall", !1],
      ],
    },
    16: {
      type: "handoff",
      title: "Reconstruye la entrega",
      prompt:
        "Toca las tarjetas en el orden: hallazgo → verificación/acuerdo → pendiente.",
      cards: [
        [
          "pending",
          "Preparar la cobertura según el plan que confirme el cirujano",
        ],
        ["finding", "Se encontró perforación con contenido intestinal"],
        ["action", "El equipo revisó la clase de herida y el cierre"],
      ],
    },
    17: {
      type: "handoff",
      title: "Reconstruye la entrega TIME",
      prompt:
        "Ordena el resumen: hallazgo → valoración/comunicación → pendiente.",
      cards: [
        ["action", "Se documentaron tejido, inflamación, humedad y bordes"],
        ["pending", "El responsable revisará el plan de cobertura"],
        ["finding", "Aumentó el exudado y los bordes no avanzan"],
      ],
    },
    18: {
      type: "handoff",
      title: "Reconstruye la entrega de sutura",
      prompt: "Ordena el mensaje: necesidad → confirmación → siguiente paso.",
      cards: [
        ["action", "Se confirmó material, calibre y aguja con el cirujano"],
        ["finding", "Se solicita sutura de larga duración para fascia"],
        ["pending", "Abrir solo el empaque que coincida con la indicación"],
      ],
    },
    19: {
      type: "handoff",
      title: "Entrega al siguiente turno",
      prompt: "Ordena el mensaje: estado actual → comprobación → pendiente.",
      cards: [
        ["pending", "El siguiente equipo vigilará y documentará lo indicado"],
        ["finding", "La herida tiene drenaje cerrado y apósito"],
        [
          "action",
          "Se confirmó tipo, identificación y funcionamiento del drenaje",
        ],
      ],
    },
  },
  Ai = [
    {
      steps: ["Inspeccionar", "Auditar campo", "Comunicar", "Pausa", "Informe"],
      accent: "asepsia",
      lead: "Busca rupturas de la barrera estéril y confirma el conteo.",
    },
    {
      steps: ["Valorar", "Clasificar", "Consultar", "Confirmar", "Informe"],
      accent: "heridas",
      lead: "Interpreta hallazgos de heridas, suturas y drenajes.",
    },
    {
      steps: ["Inspeccionar", "Diagnosticar", "Coordinar", "Probar", "Informe"],
      accent: "equipos",
      lead: "Comprueba cada componente de los equipos antes de su uso.",
    },
    {
      steps: ["Reconocer", "Armar bandeja", "Entregar", "Conteo", "Informe"],
      accent: "instrumental",
      lead: "Elige el instrumental que corresponde a la especialidad.",
    },
    {
      steps: ["Revisar", "Sintetizar", "Entregar", "Cerrar", "Informe"],
      accent: "repaso",
      lead: "Integra hallazgos, acuerdos y pendientes en una entrega clara.",
    },
  ],
  lt = (p) => document.querySelector(p),
  kt = "gpa-guardia-quirofano-save-v4",
  Mi = "gpa-guardia-quirofano-best-v4";
let Mode = ye("gpa-guardia-quirofano-mode") === "guardia" ? "guardia" : "learn",
  zt = 0,
  Ot = 1,
  Q = null,
  Et = null,
  Qt = !0,
  At = null,
  qt = 0;
const Ri = {
  ficha: { x: 265, y: 345, icon: "ID", label: "LEYENDO EXPEDIENTE" },
  material: { x: 240, y: 540, icon: "ST", label: "REVISANDO MATERIAL" },
  monitor: { x: 475, y: 365, icon: "MN", label: "COMPROBANDO MONITOR" },
  aspiracion: { x: 380, y: 440, icon: "AS", label: "PROBANDO ASPIRACIÓN" },
  conteo: { x: 790, y: 505, icon: "CT", label: "CONTANDO ELEMENTOS" },
  equipo: { x: 845, y: 345, icon: "EQ", label: "HABLANDO CON EQUIPO" },
};
function ye(p) {
  try {
    return JSON.parse(localStorage.getItem(p));
  } catch {
    return null;
  }
}
function Pi(p, T) {
  try {
    localStorage.setItem(p, JSON.stringify(T));
  } catch {}
}
function Wi(p) {
  try {
    localStorage.removeItem(p);
  } catch {}
}
function xe(p) {
  return (
    p &&
    Number.isInteger(p.missionIndex) &&
    p.missionIndex >= 0 &&
    p.missionIndex < Mt.length &&
    ["observe", "material", "event", "talk", "pause"].includes(p.phase) &&
    p.decisions &&
    p.assignments &&
    p.challengeSelections &&
    Array.isArray(p.challengeOrder) &&
    Array.isArray(p.challengePick) &&
    Array.isArray(p.recovered)
  );
}
function St() {
  Q && (Q.phase === "debrief" ? Wi(kt) : Pi(kt, Q));
}
function Yi(p) {
  return {
    missionIndex: p,
    phase: "observe",
    substep: "identity",
    inspected: !1,
    decisions: { identity: null, equipment: null, communication: null },
    assignments: {},
    selectedSupply: null,
    challengeSelections: {},
    challengeOrder: [],
    challengePick: [],
    challengeCorrect: null,
    recovered: [],
    score: 0,
    mistakes: 0,
    hints: 0,
    feedback: null,
    awaiting: !1,
    pauseVerified: !1,
    shuffle: {},
    streak: 0,
    bestStreak: 0,
    mode: Mode,
    eventId: EVENTS[Math.floor(Math.random() * EVENTS.length)].id,
    eventOk: null,
    failed: !1,
    timeouts: 0,
  };
}
function ft() {
  return Mt[Q.missionIndex];
}
function Ht() {
  return bi[Q.missionIndex];
}
function Ct() {
  return Ai[ft().module - 1];
}
const Hi = [
  {
    prompt: "Confirma campo, material y conteo con el equipo antes de seguir.",
    good: "Confirmar en voz alta integridad del campo, material y conteo con los responsables.",
    bad: "Continuar porque la mesa parece ordenada.",
  },
  {
    prompt:
      "Confirma que el hallazgo se documentó y que el equipo acordó el siguiente paso.",
    good: "Repetir el hallazgo, la valoración solicitada y el plan confirmado por el responsable.",
    bad: "Elegir el manejo por cuenta propia sin comunicar el cambio.",
  },
  {
    prompt:
      "Verifica los componentes de la tecnología y comunica las fallas antes de usarla.",
    good: "Repasar prueba funcional, componentes pendientes y responsable de resolverlos.",
    bad: "Dar por listo el equipo solo porque está encendido.",
  },
  {
    prompt: "Antes de entregar el set, confirma piezas, integridad y conteo.",
    good: "Conciliar la bandeja con la lista y confirmar la entrega al equipo.",
    bad: "Entregar la bandeja sin revisar piezas ni conteo.",
  },
  {
    prompt:
      "Cierra el caso con una entrega que deje claros los hallazgos y pendientes.",
    good: "Compartir hallazgo, verificación realizada y pendiente con el siguiente equipo.",
    bad: "Decir solamente que el procedimiento terminó.",
  },
];
function ht(p, T) {
  lt(p).textContent = T;
}
function Vt(p = "good") {
  Sound.play(p);
}
// Racha de aciertos consecutivos: da un pequeño bonus visible, no altera el
// máximo de 100 puntos (ver Final).
function Streak(ok) {
  if (!ok) {
    Q.streak = 0;
    return;
  }
  Q.streak = (Q.streak || 0) + 1;
  Q.bestStreak = Math.max(Q.bestStreak || 0, Q.streak);
  Q.streak >= 5 && Progress.unlock("racha5");
  Q.streak >= 3 && (Vt("streak"), Toast(`🔥 Racha x${Q.streak}`));
}
// Puntuación final: pistas restan (una vez por paso), la mejor racha suma
// un pequeño bonus; siempre entre 0 y 100.
function Final() {
  const hints = Math.min(15, (Q.hints || 0) * 3),
    bonus = Math.min(5, Math.max(0, (Q.bestStreak || 0) - 2));
  return {
    base: Q.score,
    hints,
    bonus,
    // El bonus compensa errores, nunca las pistas: el techo baja con cada una.
    total: Math.max(0, Math.min(100 - hints, Q.score - hints + bonus)),
    stars: !Q.mistakes && !Q.hints ? 3 : Q.mistakes <= 1 ? 2 : 1,
  };
}
function Rank(total) {
  return total >= 95
    ? "Instrumentista de élite"
    : total >= 80
      ? "Instrumentista segura"
      : total >= 60
        ? "En formación avanzada"
        : "Residente en práctica";
}
const StarsKey = "gpa-guardia-quirofano-stars-v1";
function Toast(text) {
  const el = document.createElement("div");
  ((el.className = "combo-toast"),
    (el.textContent = text),
    el.setAttribute("aria-hidden", "true"),
    lt(".scene-frame").append(el),
    setTimeout(() => el.remove(), 1600));
}
function Jt() {
  return Q
    ? Q.phase === "observe"
      ? ft()[Q.substep].station
      : Q.phase === "material"
        ? "material"
        : Q.phase === "talk"
          ? "equipo"
          : null
    : null;
}
class Xi extends Ut.Scene {
  constructor() {
    (super("RoomScene"), (this.points = new Map()));
  }
  preload() {
    (this.load.image("room", roomUrl),
      this.load.svg("actor-body", actorBodyUrl, { scale: 2 }),
      this.load.svg("actor-arm", actorArmUrl, { scale: 2 }),
      this.load.svg("actor-leg", actorLegUrl, { scale: 2 }));
  }
  create() {
    (this.add.image(600, 337.5, "room").setDisplaySize(1200, 675),
      this.add.rectangle(600, 337.5, 1200, 675, 400426, 0.1),
      this.makeAmbience(),
      this.makeVitals(),
      Dt.forEach((u) => this.makePoint(u)),
      this.makeActor(),
      (this.stageCard = this.add
        .container(600, 338)
        .setDepth(30)
        .setVisible(!1)));
    const T = this.add
        .rectangle(0, 0, 560, 146, 535353, 0.96)
        .setStrokeStyle(2, 8576979, 0.9),
      t = (this.cardTitle = this.add
        .text(0, -28, "PAUSA DE SEGURIDAD", {
          fontFamily: "Arial",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#8df1de",
        })
        .setOrigin(0.5));
    ((this.cardText = this.add
      .text(0, 15, "EL EQUIPO SE DETIENE", {
        fontFamily: "Arial",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#f5fffc",
      })
      .setOrigin(0.5)),
      this.stageCard.add([T, t, this.cardText]),
      this.game.events.on("state-change", this.sync, this),
      this.events.once(Ut.Scenes.Events.SHUTDOWN, () =>
        this.game.events.off("state-change", this.sync, this),
      ),
      Q && this.sync(Q),
      this.cameras.main.fadeIn(420, 5, 25, 35));
  }
  makePoint(T) {
    const t = this.add
        .circle(0, 0, 51, 8321503, 0.19)
        .setStrokeStyle(1, 13697013, 0.45),
      u = this.add
        .circle(0, 0, 33, 667968, 0.94)
        .setStrokeStyle(2, 12976117, 0.9),
      c = this.add.circle(0, 0, 24, 948098, 0.98),
      l = this.add
        .text(0, 0, T.short, {
          fontFamily: "Arial",
          fontSize: "15px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5),
      a = this.add
        .rectangle(
          0,
          52,
          Math.max(114, T.label.length * 9 + 24),
          27,
          601403,
          0.95,
        )
        .setStrokeStyle(1, 10349792, 0.6),
      s = this.add
        .text(0, 52, T.label.toUpperCase(), {
          fontFamily: "Arial",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#f1fffc",
        })
        .setOrigin(0.5),
      e = this.add.container(T.x, T.y, [t, u, c, l, a, s]).setDepth(15),
      i = this.add
        .zone(T.x, T.y + 15, 140, 115)
        .setInteractive({ useHandCursor: !0 })
        .setDepth(16);
    (i.on("pointerover", () =>
      this.tweens.add({ targets: e, scale: 1.1, duration: 140 }),
    ),
      i.on("pointerout", () =>
        this.tweens.add({ targets: e, scale: 1, duration: 140 }),
      ),
      i.on("pointerdown", () => this.game.events.emit("station-select", T.id)),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        this.tweens.add({
          targets: t,
          scale: 1.18,
          alpha: 0.24,
          duration: 1500,
          yoyo: !0,
          repeat: -1,
          delay: Math.random() * 800,
        }),
      this.points.set(T.id, {
        group: e,
        halo: t,
        disc: u,
        core: c,
        hit: i,
        name: s,
      }));
  }
  makeAmbience() {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const glow = this.textures.createCanvas("lamp-glow", 256, 256),
      g = glow.getContext(),
      rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    (rg.addColorStop(0, "rgba(255,250,225,0.55)"),
      rg.addColorStop(0.35, "rgba(220,245,255,0.18)"),
      rg.addColorStop(1, "rgba(200,240,255,0)"),
      (g.fillStyle = rg),
      g.fillRect(0, 0, 256, 256),
      glow.refresh());
    const mote = this.textures.createCanvas("mote", 8, 8),
      m = mote.getContext(),
      mg = m.createRadialGradient(4, 4, 0, 4, 4, 4);
    (mg.addColorStop(0, "rgba(255,255,255,1)"),
      mg.addColorStop(1, "rgba(255,255,255,0)"),
      (m.fillStyle = mg),
      m.fillRect(0, 0, 8, 8),
      mote.refresh());
    // Lámparas quirúrgicas de la ilustración (coordenadas del lienzo 1200×675).
    [
      [475, 95, 1.25],
      [676, 124, 1.1],
    ].forEach(([x, y, sc], i) => {
      const halo = this.add
        .image(x, y, "lamp-glow")
        .setScale(sc)
        .setBlendMode(Ut.BlendModes.ADD)
        .setAlpha(0.75)
        .setDepth(5);
      reduced ||
        this.tweens.add({
          targets: halo,
          alpha: 0.55,
          scale: sc * 0.94,
          duration: 2600 + i * 500,
          yoyo: !0,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
    });
    reduced ||
      this.add
        .particles(575, 300, "mote", {
          x: { min: -170, max: 170 },
          y: { min: -170, max: 120 },
          lifespan: 5200,
          speedX: { min: -5, max: 5 },
          speedY: { min: -7, max: 3 },
          scale: { start: 0.5, end: 0.15 },
          alpha: { start: 0.45, end: 0 },
          frequency: 260,
          blendMode: "ADD",
        })
        .setDepth(6);
  }
  makeVitals() {
    const x = 1088,
      y = 132,
      panel = this.add
        .rectangle(0, 0, 196, 104, 0x061820, 0.92)
        .setStrokeStyle(2, 0x2b6f78, 0.9),
      title = this.add.text(-88, -46, "PACIENTE · MONITOR", {
        fontFamily: "Arial",
        fontSize: "10px",
        fontStyle: "bold",
        color: "#7fb9bd",
      });
    ((this.hrText = this.add
      .text(-88, 30, "FC 72", {
        fontFamily: "Arial",
        fontSize: "19px",
        fontStyle: "bold",
        color: "#57f29a",
      })
      .setOrigin(0, 0.5)),
      (this.spo2Text = this.add
        .text(88, 30, "SpO₂ 98%", {
          fontFamily: "Arial",
          fontSize: "15px",
          fontStyle: "bold",
          color: "#6fd8ff",
        })
        .setOrigin(1, 0.5)),
      (this.heartDot = this.add.circle(-6, 30, 5, 0xff5a6a).setAlpha(0.25)),
      (this.ecg = this.add.graphics()),
      (this.ecgSamples = new Array(88).fill(0)),
      (this.ecgPhase = 1),
      (this.nextBeat = 0),
      (this.vitalsAlert = !1),
      (this.vitals = this.add
        .container(x, y, [
          panel,
          title,
          this.ecg,
          this.hrText,
          this.spo2Text,
          this.heartDot,
        ])
        .setDepth(12)));
  }
  update(time, delta) {
    if (!this.ecg) return;
    const hr = Sound.heartRate;
    // Plantilla PQRST simplificada; se avanza un paso por muestra.
    const beat = [0, 1.5, 2, 0, -2, 15, -6, 0, 0, 1, 3, 4, 3, 1];
    for (
      this.ecgAcc = (this.ecgAcc || 0) + delta;
      this.ecgAcc >= 22;
      this.ecgAcc -= 22
    )
      (this.ecgSamples.shift(),
        this.ecgSamples.push(
          this.ecgPhase < beat.length
            ? beat[this.ecgPhase++]
            : Math.random() * 0.6 - 0.3,
        ));
    time >= this.nextBeat &&
      ((this.nextBeat = time + 60000 / hr),
      (this.ecgPhase = 0),
      Sound.beep(),
      this.heartDot.setAlpha(1),
      this.tweens.add({ targets: this.heartDot, alpha: 0.25, duration: 260 }));
    const g = this.ecg;
    (g.clear(),
      g.lineStyle(2, this.vitalsAlert ? 0xffc857 : 0x57f29a, 1),
      g.beginPath());
    this.ecgSamples.forEach((v, i) => {
      const px = -88 + i * 2,
        py = -4 - v * 1.1;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    });
    g.strokePath();
  }
  makeActor() {
    const shadow = this.add.ellipse(0, 3, 64, 16, 0x031b27, 0.45),
      part = (key, x, y, ox, oy) =>
        this.add.image(x, y, key).setOrigin(ox, oy).setScale(0.5);
    ((this.leftLeg = part("actor-leg", -8, -36, 0.5, 0)),
      (this.rightLeg = part("actor-leg", 8, -36, 0.5, 0)),
      (this.torso = part("actor-body", 0, -30, 0.5, 1)),
      (this.leftArm = part("actor-arm", -25, -77, 0.5, 0.06)),
      (this.rightArm = part("actor-arm", 25, -77, 0.5, 0.06).setFlipX(!0)),
      (this.figure = this.add
        .container(0, 0, [
          this.leftLeg,
          this.rightLeg,
          this.torso,
          this.leftArm,
          this.rightArm,
        ])
        .setScale(1.1)),
      (this.actor = this.add
        .container(600, 560, [shadow, this.figure])
        .setDepth(23)
        .setVisible(!1)),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        this.tweens.add({
          targets: this.torso,
          scaleY: 0.508,
          duration: 1500,
          yoyo: !0,
          repeat: -1,
          ease: "Sine.easeInOut",
        }),
      (this.propBack = this.add
        .rectangle(0, 0, 35, 42, 15529715)
        .setStrokeStyle(2, 1398631)));
    const r = this.add.rectangle(0, -10, 22, 3, 6129811),
      n = this.add.rectangle(0, -3, 22, 3, 6129811),
      o = this.add.rectangle(0, 4, 22, 3, 6129811);
    ((this.propCode = this.add
      .text(0, 13, "ID", {
        fontFamily: "Arial",
        fontSize: "9px",
        fontStyle: "bold",
        color: "#134e60",
      })
      .setOrigin(0.5)),
      (this.propScan = this.add.rectangle(0, -15, 26, 3, 5427887)),
      (this.prop = this.add
        .container(40, -58, [
          this.propBack,
          r,
          n,
          o,
          this.propCode,
          this.propScan,
        ])
        .setScale(0.85)
        .setVisible(!1)),
      this.actor.add(this.prop));
    const f = this.add
        .rectangle(0, 0, 186, 58, 601920, 0.98)
        .setStrokeStyle(2, 10417375),
      d = this.add.circle(-68, 0, 18, 2785154);
    ((this.actionIcon = this.add
      .text(-68, 0, "ID", {
        fontFamily: "Arial",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)),
      (this.actionTitle = this.add
        .text(-44, -9, "LEYENDO EXPEDIENTE", {
          fontFamily: "Arial",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#f2fffb",
          wordWrap: { width: 125 },
        })
        .setOrigin(0, 0.5)));
    const h = this.add.rectangle(-45, 18, 126, 4, 3234149).setOrigin(0, 0.5);
    ((this.scanBar = this.add
      .rectangle(-45, 18, 126, 4, 8582357)
      .setOrigin(0, 0.5)),
      (this.actionBubble = this.add
        .container(0, -190, [
          f,
          d,
          this.actionIcon,
          this.actionTitle,
          h,
          this.scanBar,
        ])
        .setVisible(!1)),
      this.actor.add(this.actionBubble));
  }
  stopActorMotion() {
    var T, t, u, c, l, a;
    for (const s of [
      this.moveTween,
      this.walkTweenA,
      this.walkTweenB,
      this.bobTween,
      this.actionTween,
      this.scanTween,
      this.propTween,
    ])
      s == null || s.stop();
    ((this.bobTween = null), this.figure && (this.figure.y = 0));
    ((T = this.actionTimer) == null || T.remove(!1),
      (t = this.countTimer) == null || t.remove(!1),
      (this.moveTween =
        this.walkTweenA =
        this.walkTweenB =
        this.actionTween =
        this.scanTween =
        this.propTween =
        this.actionTimer =
        this.countTimer =
          null),
      (u = this.leftLeg) == null || u.setAngle(0),
      (c = this.rightLeg) == null || c.setAngle(0),
      (l = this.leftArm) == null || l.setAngle(0),
      (a = this.rightArm) == null || a.setAngle(0),
      this.pendingVisit && (this.pendingVisit(!1), (this.pendingVisit = null)));
  }
  resetActor() {
    this.actor &&
      (this.stopActorMotion(),
      this.actor.setPosition(600, 560).setAlpha(1).setVisible(!1),
      this.actionBubble.setVisible(!1),
      this.prop.setVisible(!1));
  }
  visitStation(T) {
    const t = Ri[T];
    if (!t || !this.actor) return Promise.resolve(!1);
    this.stopActorMotion();
    const u = !this.actor.visible;
    (this.actor.setVisible(!0).setAlpha(u ? 0 : 1),
      this.actionBubble.setVisible(!1),
      this.prop.setVisible(!1));
    const c = Ut.Math.Distance.Between(this.actor.x, this.actor.y, t.x, t.y),
      l = Math.min(1150, Math.max(530, c * 1.7));
    Math.abs(t.x - this.actor.x) > 8 &&
      this.figure.setScale(t.x < this.actor.x ? -1.1 : 1.1, 1.1);
    return (
      (this.walkTweenA = this.tweens.add({
        targets: [this.leftLeg, this.rightArm],
        angle: 16,
        duration: 190,
        yoyo: !0,
        repeat: -1,
        ease: "Sine.easeInOut",
      })),
      (this.walkTweenB = this.tweens.add({
        targets: [this.rightLeg, this.leftArm],
        angle: -16,
        duration: 190,
        yoyo: !0,
        repeat: -1,
        ease: "Sine.easeInOut",
      })),
      (this.bobTween = this.tweens.add({
        targets: this.figure,
        y: -3,
        duration: 190,
        yoyo: !0,
        repeat: -1,
        ease: "Sine.easeInOut",
      })),
      new Promise((a) => {
        ((this.pendingVisit = a),
          (this.moveTween = this.tweens.add({
            targets: this.actor,
            x: t.x,
            y: t.y,
            alpha: 1,
            duration: l,
            ease: "Sine.easeInOut",
            onComplete: () => {
              var s, e;
              if (
                ((s = this.walkTweenA) == null || s.stop(),
                (e = this.walkTweenB) == null || e.stop(),
                this.bobTween && (this.bobTween.stop(), (this.bobTween = null)),
                (this.figure.y = 0),
                this.figure.setScale(1.1, 1.1),
                this.leftLeg.setAngle(0),
                this.rightLeg.setAngle(0),
                this.leftArm.setAngle(0),
                this.rightArm.setAngle(0),
                this.actionIcon.setText(t.icon),
                this.actionTitle.setText(t.label),
                this.actionBubble.setVisible(!0),
                this.propCode.setText(
                  T === "equipo" ? "···" : T === "conteo" ? "01" : t.icon,
                ),
                this.propBack.setFillStyle(
                  T === "monitor"
                    ? 1195081
                    : T === "material"
                      ? 12167041
                      : T === "equipo"
                        ? 11923169
                        : 15529715,
                ),
                this.propCode.setColor(T === "monitor" ? "#a4ffe8" : "#134e60"),
                this.prop.setVisible(!0),
                (this.propScan.y = -15),
                (this.propTween = this.tweens.add({
                  targets: this.propScan,
                  y: 6,
                  duration: T === "ficha" ? 580 : 780,
                  yoyo: !0,
                  repeat: -1,
                  ease: "Sine.easeInOut",
                })),
                T === "conteo")
              ) {
                let i = 1;
                this.countTimer = this.time.addEvent({
                  delay: 310,
                  loop: !0,
                  callback: () => {
                    ((i = (i % 5) + 1),
                      this.propCode.setText(String(i).padStart(2, "0")));
                  },
                });
              }
              (this.scanBar.setScale(0.04, 1),
                (this.scanTween = this.tweens.add({
                  targets: this.scanBar,
                  scaleX: 1,
                  duration: 850,
                  ease: "Sine.easeInOut",
                  repeat: -1,
                })),
                (this.actionTween = this.tweens.add({
                  targets: this.rightArm,
                  angle: T === "equipo" ? -38 : -24,
                  duration: 300,
                  yoyo: !0,
                  repeat: -1,
                })),
                (this.actionTimer = this.time.delayedCall(950, () => {
                  const i = this.pendingVisit;
                  ((this.pendingVisit = null), i == null || i(!0));
                })));
            },
          })));
      })
    );
  }
  sync(T) {
    var c, l, a, s;
    if (!this.points.size) return;
    const V = Vitals();
    this.hrText &&
      (this.hrText.setText(`FC ${V.hr}`),
      this.hrText.setColor(V.alert ? "#ffc857" : "#57f29a"),
      this.spo2Text.setText(`SpO₂ ${V.spo2}%`),
      V.alert && !this.vitalsAlert && Sound.play("alarm"),
      (this.vitalsAlert = V.alert));
    const t = Jt(),
      u = ["pause", "debrief", "event"].includes(T.phase);
    for (const e of Dt) {
      const i = this.points.get(e.id),
        r = t === e.id && !u;
      (i.group.setAlpha(u ? 0.43 : r ? 1 : 0.62),
        i.disc.setStrokeStyle(r ? 4 : 2, r ? 16777215 : 12976117),
        i.core.setFillStyle(r ? 2670518 : 948098),
        i.halo.setAlpha(r ? 0.42 : 0.12),
        (i.hit.input.enabled = !u));
    }
    (this.stageCard.setVisible(u),
      this.cardTitle.setText(
        T.phase === "event"
          ? "ALERTA EN SALA"
          : T.failed
            ? "MODO GUARDIA"
            : "PAUSA DE SEGURIDAD",
      ),
      this.cardTitle.setColor(
        T.phase === "event" || T.failed ? "#ffc857" : "#8df1de",
      ),
      this.cardText.setText(
        T.phase === "event"
          ? T.awaiting
            ? T.eventOk
              ? "IMPREVISTO RESUELTO"
              : "REACCIÓN A REVISAR"
            : "¡EVENTO INESPERADO!"
          : T.phase === "debrief"
            ? T.failed
              ? "CASO SUSPENDIDO"
              : "MISIÓN COMPLETADA"
            : T.recovered.length
              ? "INCIDENCIA RESUELTA"
              : "REVISAR ANTES DE AVANZAR",
      ),
      u &&
        (c = this.actionBubble) != null &&
        c.visible &&
        (this.actionBubble.setVisible(!1),
        this.prop.setVisible(!1),
        (l = this.actionTween) == null || l.stop(),
        (a = this.scanTween) == null || a.stop(),
        (s = this.propTween) == null || s.stop()));
  }
}
function Ki() {
  Et ||
    ((Et = new Ut.Game({
      type: Ut.AUTO,
      parent: "phaser-stage",
      width: 1200,
      height: 675,
      backgroundColor: "#071b27",
      render: { antialias: !0 },
      scale: { mode: Ut.Scale.FIT, autoCenter: Ut.Scale.CENTER_BOTH },
      scene: [Xi],
    })),
    Et.events.on("station-select", Li));
}
function Qi() {
  Et && Et.events.emit("state-change", Q);
}
function Te() {
  const p = ye(Mi);
  return Array.isArray(p) ? p : [];
}
function Se() {
  const p = Te(),
    T = lt("#module-selector");
  (T.replaceChildren(),
    Xt.forEach((u, c) => {
      if (CONFIG.module && c + 1 !== CONFIG.module) return;
      const l = Mt.filter(
          (s, e) => s.module === c + 1 && Number(p[e]) > 0,
        ).length,
        a = Tt(
          T,
          CONFIG.demo
            ? `M${c + 1} · ${u.title}`
            : `M${c + 1} · ${u.title}  ${l}/4`,
          () => {
            ((Ot = c + 1),
              CONFIG.demo || (zt = Mt.findIndex((s) => s.module === Ot)),
              Se());
          },
          "module-tab",
        );
      (a.classList.toggle("is-selected", Ot === c + 1),
        a.setAttribute("aria-pressed", String(Ot === c + 1)));
    }),
    ht("#module-heading", `MÓDULO ${Ot} · ${Xt[Ot - 1].title.toUpperCase()}`),
    ht("#welcome-lede", Ai[Ot - 1].lead));
  const t = lt("#mission-selector");
  (t.replaceChildren(),
    Mt.forEach((u, c) => {
      if (u.module !== Ot) return;
      const l = document.createElement("button"),
        locked = Locked(c);
      ((l.type = "button"),
        (l.className = `mission-choice${zt === c ? " is-selected" : ""}${locked ? " locked" : ""}`),
        l.setAttribute("aria-pressed", String(zt === c)));
      const a = document.createElement("span");
      ((a.className = "mission-num"),
        (a.textContent = String(c + 1).padStart(2, "0")));
      const s = document.createElement("span"),
        e = document.createElement("strong");
      e.textContent = u.title;
      const i = document.createElement("small");
      const st = ye(StarsKey),
        sc = Array.isArray(st) ? Number(st[c]) || 0 : 0;
      ((i.textContent = locked
        ? "🔒 Incluida en el curso completo"
        : p[c]
          ? `${"★".repeat(sc)}${"☆".repeat(3 - sc)}  Mejor: ${p[c]}/100${Progress.guardiaDone().includes(c) ? " · 🛡️" : ""}`
          : u.guided
            ? "Misión guiada · empieza aquí"
            : "Pendiente de jugar"),
        s.append(e, i));
      const r = document.createElement("span");
      (r.setAttribute("aria-hidden", "true"),
        (r.textContent = locked ? "🔒" : p[c] ? "✓" : "↗"),
        l.append(a, s, r),
        l.addEventListener("click", () =>
          locked ? Cta(`«${u.title}» está en el curso completo.`) : Zi(c),
        ),
        t.append(l));
    }),
    ht(
      "#campaign-progress",
      CONFIG.demo
        ? `Demo: ${DEMO_MISSIONS.length} misión jugable de ${Mt.length} · el resto, en el curso completo`
        : `${RequiredMissions().filter((c) => Number(p[c]) > 0).length} de ${RequiredMissions().length} misiones completadas`,
    ),
    Hub());
}
function Zi(p) {
  ((zt = p), (Ot = Mt[p].module), Se());
}
function Ce() {
  var T, t, u;
  (qt++,
    (u =
      (t =
        (T = Et == null ? void 0 : Et.scene) == null
          ? void 0
          : T.getScene("RoomScene")) == null
        ? void 0
        : t.stopActorMotion) == null || u.call(t),
    (lt("#welcome").hidden = !1),
    (lt("#game-view").hidden = !0),
    (lt("#mayo-view").hidden = !0),
    mayo.stop(),
    Sound.stopAmbient());
  const p = ye(kt);
  ((lt("#resume-mission").hidden = !xe(p)),
    xe(p) &&
      (lt("#resume-mission").textContent =
        `Continuar misión ${String(p.missionIndex + 1).padStart(2, "0")}`),
    Se(),
    window.scrollTo({ top: 0, behavior: "smooth" }));
}
function $t(p, T = !1) {
  var u, c;
  (qt++, (lt("#actor-status").hidden = !0));
  const t = ye(kt);
  ((Q = T && xe(t) ? { ...t, feedback: null } : Yi(p)),
    (zt = Q.missionIndex),
    (Ot = ft().module),
    (lt("#welcome").hidden = !0),
    (lt("#game-view").hidden = !1),
    Sound.startAmbient(),
    Ki(),
    (c =
      (u = Et.scene.getScene("RoomScene")) == null ? void 0 : u.resetActor) ==
      null || c.call(u),
    Et.scale.refresh(),
    St(),
    It(),
    window.scrollTo({ top: 0, behavior: "smooth" }));
}
async function Li(p) {
  var a;
  if (
    !Q ||
    ["pause", "debrief", "event"].includes(Q.phase) ||
    !Dt.some((s) => s.id === p)
  )
    return;
  const T = ++qt,
    t = Q.phase,
    u = Q.missionIndex,
    c = Dt.find((s) => s.id === p).label;
  ((lt("#actor-status").hidden = !1),
    ht("#actor-status", `Asistente en movimiento hacia ${c.toLowerCase()}…`),
    (Q.feedback = {
      kind: "tip",
      text: `El asistente se desplaza a ${c.toLowerCase()}…`,
    }),
    Zt());
  const l =
    (a = Et == null ? void 0 : Et.scene) == null
      ? void 0
      : a.getScene("RoomScene");
  (l != null && l.visitStation && (await l.visitStation(p)),
    !(
      T !== qt ||
      Q.phase !== t ||
      Q.missionIndex !== u ||
      lt("#game-view").hidden
    ) &&
      (ht("#actor-status", `Asistente: ${Ri[p].label.toLowerCase()}.`),
      p === Jt()
        ? t === "material"
          ? ((Q.feedback = {
              kind: "good",
              text: "Material localizado. Continúa con el reto en el panel inferior.",
            }),
            lt("#workbench").scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            }),
            Zt())
          : ((Q.inspected = !0), (Q.feedback = null), Vt("select"), St(), It())
        : ((Q.feedback = {
            kind: "tip",
            text: `Has visitado ${c.toLowerCase()}. Para avanzar en este paso, visita ${Dt.find((s) => s.id === Jt()).label.toLowerCase()}.`,
          }),
          Zt())));
}
function Ji(o) {
  const T = Q.substep,
    p = o.safe;
  Q.awaiting ||
    !Q.inspected ||
    (Log(T, ft()[T].title, o.text || "Tiempo agotado", p),
    (Q.decisions[T] = p),
    (Q.awaiting = !0),
    p ? (Q.score += 20) : Q.mistakes++,
    Streak(p),
    (Q.feedback = {
      kind: p ? "good" : "bad",
      text: p ? ft()[T].good : o.why ? `${o.why} ${ft()[T].bad}` : ft()[T].bad,
    }),
    Vt(p ? "good" : "bad"),
    St(),
    It());
}
function jt() {
  ((Q.awaiting = !1),
    (Q.feedback = null),
    (Q.inspected = !1),
    Q.phase === "observe"
      ? Q.substep === "identity"
        ? (Q.substep = "equipment")
        : (Q.phase = "material")
      : Q.phase === "material"
        ? (Q.phase = "event")
        : Q.phase === "event"
          ? (Q.phase = "talk")
          : Q.phase === "talk"
            ? (Q.phase = "pause")
            : Q.phase === "pause" && Q.pauseVerified && (Q.phase = "debrief"),
    Q.phase === "event" && Vt("alarm"),
    St(),
    It());
}
function $i() {
  return ft().supplies.every((p) => !!Q.assignments[p.id]);
}
function Fe(p, T) {
  if (Q.phase !== "material" || Q.awaiting || Q.assignments[p]) return;
  const t = ft().supplies.find((c) => c.id === p);
  if (!t || !["field", "hold"].includes(T)) return;
  ((Q.assignments[p] = T), (Q.selectedSupply = null));
  const u = t.target === T;
  Log(
    `material:${p}`,
    `${t.title}: ${t.detail}`,
    T === "field" ? "Campo verificado" : "Retener y sustituir",
    u,
  );
  (u ? (Q.score += p === "ready" ? 12 : 13) : Q.mistakes++,
    Streak(u),
    (Q.feedback = {
      kind: u ? "good" : "bad",
      text: u
        ? `${t.title}: destino adecuado.`
        : `${t.title}: este destino deja una incidencia para la pausa.`,
    }),
    $i() &&
      ((Q.awaiting = !0),
      (Q.feedback = {
        kind: ft().supplies.every((c) => Q.assignments[c.id] === c.target)
          ? "good"
          : "bad",
        text: "Material organizado. Las decisiones que aún necesitan revisión aparecerán durante la pausa.",
      })),
    Vt(u ? "good" : "bad"),
    St(),
    It());
}
function ji(o) {
  const p = o.safe;
  Q.awaiting ||
    !Q.inspected ||
    (Log("communication", ft().dialogue, o.text || "Tiempo agotado", p),
    (Q.decisions.communication = p),
    (Q.awaiting = !0),
    p ? (Q.score += 20) : Q.mistakes++,
    Streak(p),
    (Q.feedback = {
      kind: p ? "good" : "bad",
      text: p
        ? "Compartiste hallazgos concretos y las verificaciones pendientes."
        : `${o.why ? o.why + " " : ""}El equipo no recibió un estado preciso. La pausa tendrá que recuperar esa información.`,
    }),
    Vt(p ? "good" : "bad"),
    St(),
    It());
}
const ki = ["identity", "material", "equipment", "communication"];
function _t() {
  const p = [];
  return (
    Q.decisions.identity === !1 &&
      !Q.recovered.includes("identity") &&
      p.push("identity"),
    (ft().module === 1
      ? ft().supplies.some((t) => Q.assignments[t.id] !== t.target)
      : Q.challengeCorrect === !1) &&
      !Q.recovered.includes("material") &&
      p.push("material"),
    Q.decisions.equipment === !1 &&
      !Q.recovered.includes("equipment") &&
      p.push("equipment"),
    Q.decisions.communication === !1 &&
      !Q.recovered.includes("communication") &&
      p.push("communication"),
    ki.filter((t) => p.includes(t))
  );
}
function qi(p) {
  return {
    identity: {
      title: ft().identity.title,
      text: ft().identity.bad,
      fix: ft().identity.options[0].text,
      unsafe: ft().identity.options[1].text,
    },
    material:
      ft().module === 1
        ? {
            title: "Campo por verificar",
            text: "Un elemento quedó en el destino equivocado.",
            fix: "Retirar el material no apto y obtener uno verificado.",
            unsafe: "Mantenerlo en el campo sin resolver la discrepancia.",
          }
        : {
            title: `Revisar: ${Ht().title}`,
            text: "El reto del módulo dejó una discrepancia. Revísala con el equipo antes de avanzar.",
            fix: "Revisar el resultado, consultar la presentación del módulo y corregirlo con el equipo.",
            unsafe: "Dar la respuesta por válida sin verificarla.",
          },
    equipment: {
      title: ft().equipment.title,
      text: ft().equipment.bad,
      fix: ft().equipment.options[0].text,
      unsafe: ft().equipment.options[1].text,
    },
    communication: {
      title: "Información incompleta al equipo",
      text: "La pausa revela que no todos conocen las verificaciones pendientes.",
      fix: "Comunicar hallazgos concretos y confirmar que el equipo los comprendió.",
      unsafe: "Evitar la aclaración para no interrumpir.",
    },
  }[p];
}
function Oe(p, T) {
  Q.phase !== "pause" ||
    Q.awaiting ||
    _t()[0] !== p ||
    (Log(`pause:${p}`, qi(p).title, T ? qi(p).fix : qi(p).unsafe, T),
    Streak(T),
    T
      ? (Q.recovered.push(p),
        (Q.awaiting = !0),
        (Q.feedback = {
          kind: "good",
          text: "Incidencia aclarada con el equipo. Ya puedes continuar.",
        }))
      : (Q.mistakes++,
        (Q.feedback = {
          kind: "bad",
          text: "La incidencia sigue abierta. Elige una acción que permita verificarla antes de seguir.",
        })),
    Vt(T ? "good" : "bad"),
    St(),
    It());
}
function De(p) {
  if (!(Q.phase !== "pause" || _t().length || Q.awaiting)) {
    const H = Hi[ft().module - 1];
    Log("closure", H.prompt, p ? H.good : H.bad, p);
    if (p) {
      ((Q.score += 15),
        (Q.pauseVerified = !0),
        (Q.awaiting = !0),
        (Q.feedback = {
          kind: "good",
          text: `${Ct().steps[3]} completado: el equipo confirmó el resultado y lo pendiente.`,
        }));
      const T = Te(),
        f = Final(),
        r = ye(StarsKey),
        n = Array.isArray(r) ? r : [];
      ((T[Q.missionIndex] = Math.max(Number(T[Q.missionIndex]) || 0, f.total)),
        Pi(Mi, T),
        (n[Q.missionIndex] = Math.max(Number(n[Q.missionIndex]) || 0, f.stars)),
        Pi(StarsKey, n),
        Vt("complete"),
        MissionDone(f));
    } else
      (Q.mistakes++,
        (Q.feedback = {
          kind: "bad",
          text: "Esta fase requiere una confirmación compartida, no una suposición aislada.",
        }));
    (Vt(p ? "good" : "bad"), St(), It());
  }
}
function Tt(p, T, t, u = "option") {
  const c = document.createElement("button");
  return (
    (c.type = "button"),
    (c.className = u),
    (c.textContent = T),
    c.addEventListener("click", t),
    p.append(c),
    c
  );
}
function Zt() {
  const p = lt("#feedback");
  if (!Q.feedback) {
    p.hidden = !0;
    return;
  }
  ((p.hidden = !1),
    (p.className = `feedback ${Q.feedback.kind}`),
    (p.textContent = Q.feedback.text));
}
function te(p, T) {
  const t = lt("#evidence");
  ((t.hidden = !1), t.replaceChildren());
  const u = document.createElement("strong");
  u.textContent = p;
  const c = document.createElement("span");
  ((c.textContent = T), t.append(u, c));
}
function Ee(p) {
  const T = lt("#dialogue");
  ((T.hidden = !1), (T.textContent = p));
}
function _i() {
  const p = ft()[Q.substep];
  (ht(
    "#panel-kicker",
    ft().guided ? "TU GUÍA · INSPECCIÓN" : "MISIÓN · INSPECCIÓN",
  ),
    ht("#panel-counter", Q.substep === "identity" ? "01 / 05" : "02 / 05"),
    ht("#panel-avatar", Q.substep === "identity" ? "ID" : "EQ"),
    ht(
      "#panel-title",
      Q.inspected
        ? p.title
        : `Toca ${Dt.find((T) => T.id === p.station).label}`,
    ),
    ht(
      "#panel-description",
      Q.inspected
        ? p.finding
        : `Toca «${Dt.find((T) => T.id === p.station).label}» en la sala o en los botones debajo de la imagen.`,
    ),
    ht("#panel-phase", `FASE 1 · ${Ct().steps[0].toUpperCase()}`),
    Q.inspected
      ? (te(
          "TU DECISIÓN",
          "¿Qué debe hacerse antes de que el equipo continúe?",
        ),
        Q.awaiting ||
          shuffled(Q.substep, p.options).forEach((T) =>
            Tt(lt("#decision-options"), T.text, () => Ji(T)),
          ))
      : Q.substep === "identity" && Ee(ft().intro),
    Q.awaiting &&
      Tt(lt("#decision-options"), "Continuar →", jt, "next-button"));
}
function Fi() {
  const p = lt("#workbench");
  if (((p.hidden = Q.phase !== "material"), p.hidden)) return;
  const T = lt("#supply-cards");
  (T.replaceChildren(),
    ft().supplies.forEach((u) => {
      const c = Q.assignments[u.id],
        l = document.createElement("button");
      ((l.type = "button"),
        (l.className = `supply-card${Q.selectedSupply === u.id ? " selected" : ""}${c ? " placed" : ""}`),
        (l.draggable = !c && !Q.awaiting),
        (l.disabled = !!c || Q.awaiting),
        (l.dataset.supply = u.id));
      const a = document.createElement("strong");
      a.textContent = u.title;
      const s = document.createElement("span");
      s.textContent = u.detail;
      const e = document.createElement("small");
      ((e.textContent = c
        ? c === "field"
          ? "→ Campo"
          : "→ Retener"
        : "Toca para elegir"),
        l.append(a, s, e),
        l.addEventListener("click", () => {
          ((Q.selectedSupply = u.id), Fi());
        }),
        l.addEventListener("dragstart", (i) => {
          (i.dataTransfer.setData("text/plain", u.id),
            (i.dataTransfer.effectAllowed = "move"));
        }),
        T.append(l));
    }));
  const t = lt("#supply-targets");
  (t.replaceChildren(),
    [
      ["field", "Campo verificado", "Material aceptado para la preparación"],
      ["hold", "Retener y sustituir", "Material dudoso fuera del campo"],
    ].forEach(([u, c, l]) => {
      const a = document.createElement("button");
      ((a.type = "button"),
        (a.className = "supply-target"),
        (a.dataset.target = u));
      const s = document.createElement("strong");
      s.textContent = c;
      const e = document.createElement("span");
      e.textContent = l;
      const i = document.createElement("em");
      ((i.textContent = String(
        Object.values(Q.assignments).filter((r) => r === u).length,
      )),
        a.append(s, e, i),
        a.addEventListener("click", () => {
          Q.selectedSupply && Fe(Q.selectedSupply, u);
        }),
        a.addEventListener("dragover", (r) => {
          (r.preventDefault(), a.classList.add("drag-over"));
        }),
        a.addEventListener("dragleave", () => a.classList.remove("drag-over")),
        a.addEventListener("drop", (r) => {
          (r.preventDefault(),
            a.classList.remove("drag-over"),
            Fe(r.dataTransfer.getData("text/plain"), u));
        }),
        t.append(a));
    }));
}
function Kt(p, T, t, u) {
  const c = Tt(p, T, u, "challenge-choice");
  return (
    c.classList.toggle("selected", !!t),
    c.setAttribute("aria-pressed", String(!!t)),
    (c.disabled = Q.awaiting),
    c
  );
}
function ts() {
  if (Q.awaiting || Q.phase !== "material") return;
  const p = Ht();
  let T = !1;
  (p.type === "match" &&
    (T = p.rows.every((t, u) => Q.challengeSelections[u] === t[1])),
    p.type === "diagnose" &&
      (T = p.rows.every((t, u) => Q.challengeSelections[u] === t[2])),
    p.type === "tray" &&
      (T = p.choices.every(([t, u], c) => Q.challengePick.includes(c) === u)),
    p.type === "handoff" &&
      (T = Q.challengeOrder.join(",") === "finding,action,pending"),
    (Q.challengeCorrect = T),
    Log("challenge", p.title, ChallengeAnswer(p), T),
    (Q.awaiting = !0),
    T ? (Q.score += 25) : Q.mistakes++,
    Streak(T),
    (Q.feedback = {
      kind: T ? "good" : "bad",
      text: T
        ? "Reto completado. La decisión se incorpora al informe."
        : "Hay una discrepancia en este reto. Se revisará con el equipo antes de cerrar el caso.",
    }),
    Vt(T ? "good" : "bad"),
    St(),
    It());
}
function Gt() {
  const p = Ht(),
    T = lt("#challenge-board");
  (T.replaceChildren(), (T.hidden = !1));
  const t = document.createElement("p");
  if (
    ((t.className = "challenge-prompt"),
    (t.textContent = p.prompt),
    T.append(t),
    p.type === "match")
  ) {
    const l = document.createElement("div");
    ((l.className = "match-rows"),
      p.rows.forEach(([a], s) => {
        const e = document.createElement("div");
        e.className = "match-row";
        const i = document.createElement("strong");
        ((i.textContent = a), e.append(i));
        const r = document.createElement("div");
        ((r.className = "match-options"),
          shuffled("match", p.choices).forEach((n) =>
            Kt(r, n, Q.challengeSelections[s] === n, () => {
              ((Q.challengeSelections[s] = n), St(), Gt());
            }),
          ),
          e.append(r),
          l.append(e));
      }),
      T.append(l));
  }
  if (p.type === "diagnose") {
    const l = document.createElement("div");
    ((l.className = "diagnostic-panel"),
      p.rows.forEach(([a, s], e) => {
        const i = document.createElement("div");
        i.className = "diagnostic-row";
        const r = document.createElement("span");
        ((r.className = `diagnostic-light ${Q.challengeSelections[e] || "unknown"}`),
          r.setAttribute("aria-hidden", "true"));
        const n = document.createElement("div"),
          o = document.createElement("strong");
        o.textContent = a;
        const f = document.createElement("small");
        ((f.textContent = s), n.append(o, f), i.append(r, n));
        const d = document.createElement("div");
        ((d.className = "diagnostic-actions"),
          Kt(d, "✓ Verificado", Q.challengeSelections[e] === "ready", () => {
            ((Q.challengeSelections[e] = "ready"), St(), Gt());
          }),
          Kt(d, "! Pendiente", Q.challengeSelections[e] === "pending", () => {
            ((Q.challengeSelections[e] = "pending"), St(), Gt());
          }),
          i.append(d),
          l.append(i));
      }),
      T.append(l));
  }
  if (p.type === "tray") {
    const l = document.createElement("div");
    ((l.className = "instrument-grid"),
      shuffled(
        "tray",
        p.choices.map(([s], e) => [s, e]),
      ).forEach(([s, e], n) => {
        const i = Kt(l, s, Q.challengePick.includes(e), () => {
          (Q.challengePick.includes(e)
            ? (Q.challengePick = Q.challengePick.filter((n) => n !== e))
            : Q.challengePick.length < 3 && Q.challengePick.push(e),
            St(),
            Gt());
        });
        i.dataset.instrument = e;
        const r = document.createElement("small");
        ((r.textContent = `INSTRUMENTO ${String(n + 1).padStart(2, "0")}`),
          i.prepend(r));
      }),
      T.append(l));
    const a = document.createElement("p");
    ((a.className = "challenge-count"),
      (a.textContent = `${Q.challengePick.length} de 3 instrumentos seleccionados`),
      T.append(a));
  }
  if (p.type === "handoff") {
    const l = document.createElement("div");
    ((l.className = "handoff-slots"),
      ["1 · HALLAZGO", "2 · VERIFICACIÓN", "3 · PENDIENTE"].forEach((s, e) => {
        const i = document.createElement("div");
        i.className = "handoff-slot";
        const r = document.createElement("small");
        r.textContent = s;
        const n = p.cards.find((f) => f[0] === Q.challengeOrder[e]),
          o = document.createElement("strong");
        ((o.textContent = n ? n[1] : "Toca una tarjeta para colocarla aquí"),
          i.append(r, o),
          l.append(i));
      }),
      T.append(l));
    const a = document.createElement("div");
    ((a.className = "handoff-cards"),
      shuffled("handoff", p.cards).forEach(([s, e]) => {
        const i = Kt(a, e, Q.challengeOrder.includes(s), () => {
          !Q.challengeOrder.includes(s) &&
            Q.challengeOrder.length < 3 &&
            (Q.challengeOrder.push(s), St(), Gt());
        });
        i.disabled = Q.challengeOrder.includes(s);
      }),
      T.append(a),
      Tt(
        T,
        "↶ Reiniciar orden",
        () => {
          ((Q.challengeOrder = []), St(), Gt());
        },
        "challenge-reset",
      ));
  }
  const u =
      p.type === "match" || p.type === "diagnose"
        ? Object.keys(Q.challengeSelections).length
        : p.type === "tray"
          ? Q.challengePick.length
          : Q.challengeOrder.length,
    c = p.type === "tray" || p.type === "handoff" ? 3 : p.rows.length;
  if (Q.awaiting) {
    const l = document.createElement("p");
    ((l.className = `challenge-result ${Q.challengeCorrect ? "good" : "bad"}`),
      (l.textContent = Q.challengeCorrect
        ? "Reto superado en la primera pasada."
        : "Resultado pendiente de revisión en la pausa."),
      T.append(l));
  } else {
    const l = Tt(T, "Confirmar reto →", ts, "next-button challenge-submit");
    l.disabled = u < c;
  }
}
function es() {
  const p = ft().module === 1;
  (ht(
    "#panel-kicker",
    p ? "AUDITORÍA DE ESTERILIDAD" : `RETO DEL MÓDULO ${ft().module}`,
  ),
    ht("#panel-counter", "03 / 05"),
    ht(
      "#panel-avatar",
      p ? "ST" : ["", "ST", "H", "EQ", "IN", "R"][ft().module],
    ),
    ht("#panel-title", p ? "Audita el material" : Ht().title),
    ht(
      "#panel-description",
      p
        ? "Envía el material apto al campo y retén el que no cumple las condiciones. Arrastra o toca."
        : Ht().prompt,
    ),
    ht("#panel-phase", `FASE 2 · ${Ct().steps[1].toUpperCase()}`),
    te(
      "TU RETO",
      p
        ? "Solo entra al campo el material indicado y con condición verificable."
        : Ct().lead,
    ),
    Q.awaiting &&
      Tt(
        lt("#decision-options"),
        "Continuar con el equipo →",
        jt,
        "next-button",
      ),
    (lt("#workbench").hidden = !1),
    (lt("#supply-grid").hidden = !p),
    (lt("#challenge-board").hidden = p),
    ht("#challenge-kicker", `INTERACCIÓN · ${Ct().steps[1].toUpperCase()}`),
    ht("#workbench-title", p ? "Decide qué entra al campo" : Ht().title),
    ht(
      "#challenge-instruction",
      p
        ? "Arrastra o toca cada elemento y luego un destino"
        : "Resuelve el reto y confirma tu respuesta",
    ),
    p ? Fi() : Gt());
}
function is() {
  (ht(
    "#panel-kicker",
    ft().guided ? "TU GUÍA · COMUNICACIÓN" : "MISIÓN · COMUNICACIÓN",
  ),
    ht("#panel-counter", "04 / 05"),
    ht("#panel-avatar", "EQ"),
    ht("#panel-title", Q.inspected ? "Comunica al equipo" : "Toca Equipo"),
    ht(
      "#panel-description",
      Q.inspected
        ? "El equipo espera una comunicación clara de lo que se verificó y lo que queda pendiente."
        : "Acércate al equipo tocando el marcador «Equipo» o el botón debajo de la sala.",
    ),
    ht("#panel-phase", `FASE 3 · ${Ct().steps[2].toUpperCase()}`),
    Q.inspected &&
      (Ee(ft().dialogue),
      Q.awaiting ||
        shuffled("communication", ft().communication).forEach((p) =>
          Tt(lt("#decision-options"), p.text, () => ji(p)),
        )),
    Q.awaiting &&
      Tt(
        lt("#decision-options"),
        `Ir a ${Ct().steps[3].toLowerCase()} →`,
        jt,
        "next-button",
      ));
}
function ss() {
  (ht("#panel-kicker", Ct().steps[3].toUpperCase()),
    ht("#panel-counter", "05 / 05"),
    ht("#panel-avatar", "!"),
    ht("#panel-phase", `FASE 4 · ${Ct().steps[3].toUpperCase()}`));
  const p = _t()[0];
  if (p) {
    const T = qi(p);
    (ht("#panel-title", T.title),
      ht("#panel-description", T.text),
      Ee(
        ft().module === 1
          ? ft().pauseIntro
          : `El equipo detiene el avance para revisar el reto de ${Xt[ft().module - 1].title.toLowerCase()}.`,
      ),
      te(
        "CONSECUENCIA DE TUS DECISIONES",
        `Quedan ${_t().length} verificación(es) abiertas. Resuelve esta antes de continuar.`,
      ),
      Q.awaiting
        ? Tt(lt("#decision-options"), "Seguir la pausa →", jt, "next-button")
        : shuffled(`pause-${p}`, [
            [T.fix, !0],
            [T.unsafe, !1],
          ]).forEach(([t, u]) =>
            Tt(lt("#decision-options"), t, () => Oe(p, u)),
          ));
  } else {
    const T = Hi[ft().module - 1];
    (ht("#panel-title", Ct().steps[3]),
      ht("#panel-description", T.prompt),
      te(
        "CIERRE DEL MÓDULO",
        "Selecciona la acción que confirma el trabajo con el equipo.",
      ),
      Q.awaiting
        ? Tt(
            lt("#decision-options"),
            "Ver informe de misión →",
            jt,
            "next-button",
          )
        : shuffled("closure", [
            [T.good, !0],
            [T.bad, !1],
          ]).forEach(([t, u]) => Tt(lt("#decision-options"), t, () => De(u))));
  }
}
function ns() {
  if (Q.failed) return Failed();
  (ht("#panel-kicker", "INFORME FINAL"),
    ht("#panel-counter", "MISIÓN COMPLETA"),
    ht("#panel-avatar", "✓"),
    ht("#panel-title", `${Ct().steps[1]} completado`),
    ht(
      "#panel-description",
      "Terminaste la misión. El informe muestra qué resolviste en la primera pasada y qué recuperó el equipo durante la pausa.",
    ),
    ht("#panel-phase", "FASE 5 · APRENDER"));
  const p = lt("#decision-options"),
    T = document.createElement("div");
  const F = Final();
  ((T.className = "debrief-score"),
    (T.innerHTML = `${F.total}<small> / 100 puntos</small>`),
    p.append(T));
  const S = document.createElement("div");
  ((S.className = "debrief-stars"),
    S.setAttribute("aria-label", `${F.stars} de 3 estrellas`),
    (S.innerHTML = [1, 2, 3]
      .map((i) => `<span class="${i <= F.stars ? "on" : ""}">★</span>`)
      .join("")),
    p.append(S));
  const R = document.createElement("p");
  ((R.className = "debrief-rank"),
    (R.textContent = `${Rank(F.total)} · Mejor racha: ${Q.bestStreak || 0}`),
    p.append(R));
  const B = document.createElement("p");
  ((B.className = "debrief-breakdown"),
    (B.textContent = `Decisiones ${F.base} · Pistas −${F.hints} · Racha +${F.bonus}`),
    p.append(B),
    Q.mode === "guardia" &&
      B.append(
        Object.assign(document.createElement("span"), {
          className: "guardia-badge",
          textContent: " · 🛡️ Superada en Modo Guardia",
        }),
      ));
  const t = Te(),
    u =
      ft().module === 1
        ? ft().supplies.every((i) => Q.assignments[i.id] === i.target)
        : Q.challengeCorrect === !0,
    c = [
      [
        "Expediente",
        Q.decisions.identity,
        "Confirmación activa antes de avanzar.",
        "La discrepancia se aclaró en la pausa; hazlo al inicio.",
      ],
      [
        Ct().steps[1],
        u,
        "Reto del módulo resuelto en la primera pasada.",
        "El resultado se revisó con el equipo; repite el reto para practicar.",
      ],
      [
        "Equipo",
        Q.decisions.equipment,
        "Comprobaste el equipo antes de necesitarlo.",
        "La comprobación quedó pendiente; intégrala a la preparación.",
      ],
      [
        "Comunicación",
        Q.decisions.communication,
        "Compartiste hallazgos y pendientes.",
        "El equipo necesitó una aclaración; comunica datos concretos.",
      ],
    ],
    l = document.createElement("div");
  ((l.className = "report-rows"),
    c.forEach(([i, r, n, o]) => {
      const f = document.createElement("div"),
        d = document.createElement("span"),
        h = document.createElement("b");
      h.textContent = i;
      const v = document.createElement("small");
      ((v.textContent = r ? n : o), d.append(h, v));
      const m = document.createElement("strong");
      ((m.textContent = r ? "Primera pasada" : "Recuperado en la pausa"),
        (m.className = r ? "pass" : "recover"),
        f.append(d, m),
        l.append(f));
    }),
    EventRow(l),
    p.append(l));
  const a = document.createElement("p");
  ((a.className = "debrief-note"),
    (a.textContent = `Aprendizaje clave: ${ft().learning}`),
    p.append(a));
  const s = document.createElement("p");
  ((s.className = "debrief-note"),
    (s.textContent = Q.mistakes
      ? `Revisa ${Q.mistakes} decisión(es) para mejorar. Mejor puntuación: ${t[Q.missionIndex] || F.total}.`
      : `Excelente primera pasada. Mejor puntuación: ${t[Q.missionIndex] || F.total}.`),
    p.append(s));
  const e = document.createElement("div");
  ((e.className = "debrief-buttons"),
    Tt(e, "Repetir misión", () => $t(Q.missionIndex), "button button-quiet"),
    CONFIG.demo
      ? Tt(
          e,
          "Quiero el curso completo →",
          () => Cta("Completaste tu primera misión."),
          "button button-primary",
        )
      : Q.missionIndex < Mt.length - 1 &&
          (!CONFIG.module || Mt[Q.missionIndex + 1].module === CONFIG.module)
        ? Tt(
            e,
            "Siguiente misión →",
            () => $t(Q.missionIndex + 1),
            "button button-primary",
          )
        : Tt(e, "Ver campaña completa →", Ce, "button button-primary"),
    p.append(e));
}
function rs() {
  const p = lt("#station-shortcuts");
  if ((p.replaceChildren(), ["pause", "debrief", "event"].includes(Q.phase))) {
    p.hidden = !0;
    return;
  }
  p.hidden = !1;
  const T = Jt();
  Dt.forEach((t) => {
    const u = document.createElement("button");
    ((u.type = "button"),
      (u.textContent = t.label),
      (u.className = `shortcut${t.id === T ? " active" : ""}`),
      u.setAttribute("aria-label", `Ir a ${t.label}`),
      u.addEventListener("click", () => {
        (lt("#phaser-stage").scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        }),
          Li(t.id));
      }),
      p.append(u));
  });
}
function as() {
  const p = lt("#hint-button");
  ((p.hidden = Q.phase === "debrief"),
    !p.hidden &&
      (p.textContent = (Q.hintKeys || []).includes(
        Q.phase === "observe" ? Q.substep : Q.phase,
      )
        ? "Pista"
        : "Pista (−3)"));
}
function It() {
  if (!Q) return;
  // Modo Guardia: si la estabilidad llega a cero, el caso se suspende.
  Q.mode === "guardia" &&
    Q.phase !== "debrief" &&
    Stability() <= 0 &&
    ((Q.failed = !0), (Q.phase = "debrief"), Vt("alarm"), St());
  const T = {
    observe: 0,
    material: 1,
    event: 1,
    talk: 2,
    pause: 3,
    debrief: 4,
  }[Q.phase];
  ((lt("#game-view").dataset.module = String(ft().module)),
    ht("#mission-eyebrow", ft().label),
    ht("#mission-heading-title", ft().title),
    ht("#mission-intro", ft().intro),
    ht(
      "#scene-module",
      `MÓDULO ${ft().module} · ${Xt[ft().module - 1].title.toUpperCase()}`,
    ),
    (lt("#mission-source").href = ft().source),
    ht("#scene-number", String(Q.missionIndex + 1).padStart(2, "0")),
    ht("#score", String(Q.score)),
    ht(
      "#mission-status",
      Q.phase === "debrief"
        ? Q.failed
          ? "CASO SUSPENDIDO"
          : "MISIÓN COMPLETADA"
        : Q.phase === "event"
          ? "¡EVENTO INESPERADO!"
          : `PASO ${T + 1} DE 5`,
    ),
    (lt("#stat-progress-fill").style.width =
      `${((T + ((Q.phase === "observe" && Q.substep === "equipment") || Q.phase === "event" ? 0.5 : 0)) / 4) * 100}%`),
    document.querySelectorAll("[data-step]").forEach((t) => {
      const u = Number(t.dataset.step);
      (t.classList.toggle("current", u === T),
        t.classList.toggle("completed", u < T),
        (t.querySelector("b").textContent = Ct().steps[u]));
    }),
    ht(
      "#stage-instruction",
      Q.phase === "observe"
        ? Q.inspected
          ? "REVISIÓN COMPLETA · ELIGE UNA ACCIÓN"
          : `TOCA ${Dt.find((t) => t.id === Jt()).label.toUpperCase()} PARA INSPECCIONAR`
        : Q.phase === "material"
          ? `RETO: ${Ct().steps[1].toUpperCase()} EN EL PANEL INFERIOR`
          : Q.phase === "talk"
            ? Q.inspected
              ? "EQUIPO CONTACTADO · ELIGE QUÉ COMUNICAR"
              : "TOCA EQUIPO PARA COMUNICAR"
            : Q.phase === "pause"
              ? `FASE: ${Ct().steps[3].toUpperCase()}`
              : Q.phase === "event"
                ? "¡ALERTA EN SALA! · RESPONDE EN EL PANEL"
                : "REVISA TU INFORME Y ELIGE OTRA MISIÓN",
    ),
    (lt("#dialogue").hidden = !0),
    (lt("#evidence").hidden = !0),
    lt("#decision-options").replaceChildren(),
    (lt("#workbench").hidden = !0),
    Q.phase === "observe" && _i(),
    Q.phase === "material" && es(),
    Q.phase === "event" && evs(),
    Q.phase === "talk" && is(),
    Q.phase === "pause" && ss(),
    Q.phase === "debrief" && ns(),
    Zt(),
    rs(),
    as(),
    Sound.setHeartRate(Vitals().hr),
    lt(".scene-frame").classList.toggle(
      "alarm",
      Q.phase === "event" && !Q.awaiting,
    ),
    GuardHud(),
    Coach(),
    Qi());
}
// Constantes del paciente: cada incidencia abierta tensa la escena y la
// resolución la calma. Es ambientación, no un modelo fisiológico.
function Vitals() {
  if (!Q) return { hr: 72, spo2: 98, alert: !1 };
  // El reto de material solo cuenta una vez jugado (en el módulo 1, _t() lo
  // marca abierto mientras no haya asignaciones).
  const n =
    Q.phase === "debrief"
      ? 0
      : _t().filter(
          (k) => k !== "material" || ["talk", "pause"].includes(Q.phase),
        ).length;
  const loss = Q.mode === "guardia" ? 100 - Stability() : 0;
  return {
    hr: Math.round(72 + n * 9 + loss * 0.3),
    spo2: Math.max(88, 99 - n - Math.round(loss / 20)),
    alert: n >= 2 || loss >= 50,
  };
}
// ---------------------------------------------------------------------------
// Fase 2: eventos inesperados, Modo Guardia, medallas, racha diaria y
// Mesa de Mayo.

// Tiempo por decisión en Modo Guardia (ms).
const GUARD_LIMITS = {
  decision: 20000,
  event: 12000,
  material: 45000,
  pause: 20000,
};
let guard = { key: "", deadline: 0, limit: 0 };

function CurrentEvent() {
  return EVENTS.find((e) => e.id === Q.eventId) || EVENTS[0];
}
// Estabilidad del paciente en Modo Guardia: cada error resta 25 y cada
// incidencia recuperada en la pausa devuelve 10. A 0 se suspende el caso.
function Stability() {
  if (!Q) return 100;
  return Math.max(
    0,
    Math.min(100, 100 - Q.mistakes * 25 + (Q.recovered || []).length * 10),
  );
}
function evs() {
  const ev = CurrentEvent();
  (ht("#panel-kicker", "EVENTO INESPERADO"),
    ht("#panel-counter", "¡ALERTA!"),
    ht("#panel-avatar", "!"),
    ht("#panel-title", ev.title),
    ht("#panel-description", ev.alarm),
    ht("#panel-phase", "INTERRUPCIÓN · RESPONDE YA"),
    te("TU REACCIÓN", "¿Qué haces primero?"),
    Q.awaiting
      ? Tt(lt("#decision-options"), "Volver al caso →", jt, "next-button")
      : shuffled("event", ev.options).forEach((o) =>
          Tt(lt("#decision-options"), o.text, () => EvPick(o)),
        ));
}
function EvPick(o) {
  if (Q.phase !== "event" || Q.awaiting) return;
  Log(
    `event:${Q.eventId}`,
    CurrentEvent().title,
    o.text || "Tiempo agotado",
    o.safe,
  );
  ((Q.eventOk = o.safe),
    (Q.awaiting = !0),
    o.safe ? Progress.countEvent() : Q.mistakes++,
    Streak(o.safe),
    (Q.feedback = {
      kind: o.safe ? "good" : "bad",
      text: o.safe ? CurrentEvent().good : o.why,
    }),
    Vt(o.safe ? "good" : "bad"),
    St(),
    It());
}
function EventRow(list) {
  if (Q.eventOk == null) return;
  const row = document.createElement("div"),
    d = document.createElement("span"),
    b = document.createElement("b"),
    sm = document.createElement("small"),
    st = document.createElement("strong");
  ((b.textContent = `Imprevisto: ${CurrentEvent().title.replace(/[¡!]/g, "")}`),
    (sm.textContent = Q.eventOk
      ? "Reaccionaste según el protocolo."
      : "Repasa la reacción segura: detenerte, comunicar y resolver."),
    (st.textContent = Q.eventOk ? "Bien resuelto" : "A repasar"),
    (st.className = Q.eventOk ? "pass" : "recover"),
    d.append(b, sm),
    row.append(d, st),
    list.append(row));
}
function Failed() {
  (ht("#panel-kicker", "MODO GUARDIA"),
    ht("#panel-counter", "CASO SUSPENDIDO"),
    ht("#panel-avatar", "✕"),
    ht("#panel-title", "El paciente se desestabilizó"),
    ht(
      "#panel-description",
      "Demasiadas decisiones sin verificar a tiempo. En Modo Guardia cada error y cada segundo cuentan: el equipo suspendió el caso para estabilizar al paciente.",
    ),
    ht("#panel-phase", "FASE 5 · APRENDER"));
  const box = lt("#decision-options"),
    n = document.createElement("p");
  ((n.className = "debrief-note"),
    (n.textContent = `Errores: ${Q.mistakes} · Tiempos agotados: ${Q.timeouts || 0}. Aprendizaje clave: ${ft().learning}`),
    box.append(n));
  const e = document.createElement("div");
  ((e.className = "debrief-buttons"),
    Tt(
      e,
      "Reintentar en Guardia",
      () => $t(Q.missionIndex),
      "button button-primary",
    ),
    Tt(
      e,
      "Practicar en Aprendizaje",
      () => (SetMode("learn"), $t(Q.missionIndex)),
      "button button-quiet",
    ),
    box.append(e));
}
function GuardPending() {
  if (!Q || Q.mode !== "guardia" || Q.awaiting || lt("#game-view").hidden)
    return null;
  switch (Q.phase) {
    case "observe":
    case "talk":
      return Q.inspected ? GUARD_LIMITS.decision : null;
    case "material":
      return GUARD_LIMITS.material;
    case "event":
      return GUARD_LIMITS.event;
    case "pause":
      return GUARD_LIMITS.pause;
    default:
      return null;
  }
}
function GuardHud() {
  const hud = lt("#guardia-hud");
  if (((hud.hidden = !Q || Q.mode !== "guardia"), hud.hidden)) return;
  (ht("#stability", String(Stability())),
    hud.classList.toggle("critical", Stability() <= 50));
  const limit = GuardPending(),
    key = `${Q.missionIndex}|${Q.phase}|${Q.substep}|${Q.inspected}|${Q.awaiting}|${Q.mistakes}|${Q.recovered.length}`;
  key !== guard.key &&
    (guard = {
      key,
      limit: limit || 0,
      deadline: limit ? performance.now() + limit : 0,
    });
}
function GuardTimeout() {
  if (!GuardPending()) return;
  ((Q.timeouts = (Q.timeouts || 0) + 1), Vt("alarm"));
  const why = "¡Tiempo! El equipo tuvo que avanzar sin tu verificación.";
  switch (Q.phase) {
    case "observe":
      return Ji({ safe: !1, why });
    case "talk":
      return ji({ safe: !1, why });
    case "event":
      return EvPick({ safe: !1, why });
    case "material":
      if (ft().module === 1) {
        for (const s of ft().supplies)
          Q.assignments[s.id] ||
            Fe(s.id, s.target === "field" ? "hold" : "field");
        return;
      }
      return ts();
    case "pause": {
      const open = _t()[0];
      return open ? Oe(open, !1) : De(!1);
    }
  }
}
setInterval(() => {
  if (!Q || Q.mode !== "guardia" || lt("#game-view").hidden) return;
  const fill = lt("#guardia-timer-fill");
  if (!guard.deadline)
    return (
      (fill.style.width = "100%"),
      fill.classList.remove("urgent"),
      ht("#guardia-time", Q.phase === "debrief" ? "—" : "En espera")
    );
  const left = guard.deadline - performance.now();
  ((fill.style.width = `${Math.max(0, left / guard.limit) * 100}%`),
    fill.classList.toggle("urgent", left < 5000),
    ht("#guardia-time", `${Math.max(0, Math.ceil(left / 1000))} s`),
    left <= 0 && ((guard.deadline = 0), GuardTimeout()));
}, 200);

// Medallas y progreso al terminar una misión.
function MissionDone(f) {
  (Progress.recordPlay(),
    Progress.unlock("primera"),
    f.stars === 3 && Progress.unlock("perfecta"));
  const best = Te();
  for (let m = 1; m <= 5; m++)
    Mt.every((x, i) => x.module !== m || Number(best[i]) > 0) &&
      Progress.unlock(`modulo${m}`);
  (Mt.every((_, i) => Number(best[i]) > 0) && Progress.unlock("campana"),
    Q.mode === "guardia" &&
      (Progress.markGuardia(Q.missionIndex),
      Progress.unlock("guardia"),
      f.stars === 3 && Progress.unlock("guardia3")),
    Q.missionIndex === Progress.dailyMission(Mt.length) &&
      !Progress.dailyDone() &&
      Progress.markDaily(),
    SyncLMS(),
    Track("mission_complete", {
      mission: Q.missionIndex + 1,
      score: f.total,
      mode: Q.mode,
    }));
}
const medalQueue = [];
let medalBusy = !1;
function ShowMedal() {
  if (medalBusy || !medalQueue.length) return;
  medalBusy = !0;
  const m = medalQueue.shift(),
    box = lt("#medal-toast");
  box.replaceChildren();
  const icon = document.createElement("span"),
    text = document.createElement("span"),
    small = document.createElement("small"),
    strong = document.createElement("strong");
  ((icon.className = "medal-toast-icon"),
    (icon.textContent = m.icon),
    (small.textContent = "¡MEDALLA DESBLOQUEADA!"),
    (strong.textContent = m.title),
    text.append(small, strong),
    box.append(icon, text),
    (box.hidden = !1),
    box.classList.remove("show"),
    void box.offsetWidth,
    box.classList.add("show"),
    Vt("streak"),
    setTimeout(() => {
      ((box.hidden = !0), (medalBusy = !1), ShowMedal());
    }, 3200));
}
Progress.onMedal((m) => (medalQueue.push(m), ShowMedal()));
function RenderMedals() {
  const got = Progress.medals(),
    grid = lt("#medals-grid");
  (grid.replaceChildren(),
    MEDALS.forEach((m) => {
      const card = document.createElement("div"),
        icon = document.createElement("span"),
        title = document.createElement("strong"),
        desc = document.createElement("small");
      ((card.className = `medal${got[m.id] ? " got" : ""}`),
        (icon.className = "medal-icon"),
        (icon.textContent = got[m.id] ? m.icon : "🔒"),
        (title.textContent = m.title),
        (desc.textContent = m.desc),
        card.append(icon, title, desc),
        grid.append(card));
    }));
}

// Panel de inicio: racha, medallas, modo y caso del día.
function SetMode(m) {
  ((Mode = m), Pi("gpa-guardia-quirofano-mode", m), LMS.saveProgress(), Hub());
}
function Hub() {
  const streak = Progress.streak(),
    played = Progress.playedToday();
  (ht("#streak-count", String(streak)),
    ht("#streak-label", streak === 1 ? "día seguido" : "días seguidos"),
    lt("#streak-chip").classList.toggle("hot", played),
    (lt("#streak-chip").title = played
      ? "Ya jugaste hoy: racha asegurada"
      : "Termina una misión o una Mesa de Mayo hoy para mantener la racha"),
    ht("#medal-count", String(Object.keys(Progress.medals()).length)),
    ht("#medal-total", String(MEDALS.length)),
    document.querySelectorAll(".mode-switch [data-mode]").forEach((b) => {
      const on = b.dataset.mode === Mode;
      (b.classList.toggle("is-selected", on),
        b.setAttribute("aria-checked", String(on)));
    }));
  const d = Progress.dailyMission(Mt.length);
  (ht(
    "#daily-title",
    `Misión ${String(d + 1).padStart(2, "0")} · ${Mt[d].title}`,
  ),
    ht(
      "#daily-meta",
      Progress.dailyDone()
        ? "✓ Completado hoy · vuelve mañana por otro"
        : `Módulo ${Mt[d].module} · ${Xt[Mt[d].module - 1].title}`,
    ),
    lt("#daily-case").classList.toggle("done", Progress.dailyDone()),
    ht(
      ".welcome-note",
      CONFIG.demo
        ? Mode === "guardia"
          ? "Modo Guardia: tiempo límite por decisión y el paciente puede desestabilizarse."
          : "Versión demo: juega la misión 1 completa y la Mesa de Mayo. Sin registro."
        : Mode === "guardia"
          ? "Modo Guardia: tiempo límite por decisión y el paciente puede desestabilizarse. Progreso guardado en este navegador."
          : "Modo Aprendizaje: sin cronómetro, a tu ritmo. Las 20 misiones pueden jugarse en cualquier orden. Progreso guardado en este navegador.",
    ));
  const best = Progress.mayoBest();
  ht("#mayo-best-label", best ? `Tu récord: ${best} pts` : "");
}
document
  .querySelectorAll(".mode-switch [data-mode]")
  .forEach((b) => b.addEventListener("click", () => SetMode(b.dataset.mode)));
lt("#daily-case").addEventListener("click", () =>
  $t(Progress.dailyMission(Mt.length)),
);
lt("#medals-chip").addEventListener("click", () => {
  (RenderMedals(), lt("#medals-dialog").showModal());
});
lt("#medals-close").addEventListener("click", () =>
  lt("#medals-dialog").close(),
);
lt("#streak-chip").addEventListener("click", () => {
  (RenderMedals(), lt("#medals-dialog").showModal());
});
const mayo = createMayo({
  root: lt("#mayo-view"),
  onExit: () => ((lt("#mayo-view").hidden = !0), Ce()),
  onFinish: (box, result) => {
    if ((Track("mayo_complete", result), !CONFIG.demo)) return;
    const cta = document.createElement("button");
    ((cta.type = "button"),
      (cta.className = "demo-ribbon demo-ribbon-inline"),
      (cta.innerHTML =
        '<span class="daily-tag">CURSO COMPLETO</span><strong>20 misiones, Modo Guardia y seguimiento docente</strong><span class="daily-go" aria-hidden="true">→</span>'),
      cta.addEventListener("click", () =>
        Cta("¿Te gustó la Mesa de Mayo? Hay mucho más."),
      ),
      box.append(cta));
  },
});
lt("#open-mayo").addEventListener("click", () => {
  ((lt("#welcome").hidden = !0),
    (lt("#game-view").hidden = !0),
    (lt("#mayo-view").hidden = !1),
    window.scrollTo({ top: 0 }),
    mayo.start());
});

// ---------------------------------------------------------------------------
// Fase 3: LMS (SCORM), informe para el docente, cirujano con IA y teclado.

function Log(kind, question, answer, correct) {
  Report.log({
    mission: Q.missionIndex,
    module: ft().module,
    missionTitle: ft().title,
    kind,
    question,
    answer,
    correct,
    mode: Q.mode,
  });
}
function ChallengeAnswer(p) {
  switch (p.type) {
    case "match":
      return p.rows
        .map((r, i) => `${r[0]} → ${Q.challengeSelections[i] || "—"}`)
        .join("; ");
    case "diagnose":
      return p.rows
        .map(
          (r, i) =>
            `${r[0]}: ${Q.challengeSelections[i] === "ready" ? "verificado" : Q.challengeSelections[i] === "pending" ? "pendiente" : "—"}`,
        )
        .join("; ");
    case "tray":
      return Q.challengePick.map((i) => p.choices[i][0]).join(", ") || "—";
    case "handoff":
      return (
        Q.challengeOrder
          .map(
            (k) =>
              ({
                finding: "hallazgo",
                action: "verificación",
                pending: "pendiente",
              })[k],
          )
          .join(" → ") || "—"
      );
  }
  return "";
}
// Misiones que cuentan para la nota: las del módulo del paquete o todas.
function RequiredMissions() {
  return Mt.map((m, i) => i).filter(
    (i) => !CONFIG.module || Mt[i].module === CONFIG.module,
  );
}
function SyncLMS() {
  if (!LMS.connected) return;
  const best = Te(),
    req = RequiredMissions();
  (LMS.report({
    score: req.reduce((a, i) => a + (Number(best[i]) || 0), 0) / req.length,
    done: req.filter((i) => Number(best[i]) > 0).length,
    required: req.length,
    passingScore: CONFIG.passingScore,
  }),
    LMS.saveProgress());
}
Progress.onMedal(() => LMS.saveProgress());

// Cirujano con IA: aparece tras elegir la comunicación, si está disponible.
function Coach() {
  const slot = lt("#coach-slot"),
    show = Q && Q.phase === "talk" && Q.awaiting;
  if (!show) {
    ((slot.hidden = !0), slot.replaceChildren(), (slot.dataset.key = ""));
    return;
  }
  const key = String(Q.missionIndex);
  if (slot.dataset.key === key) return;
  slot.dataset.key = key;
  aiAvailable().then((ok) => {
    if (!ok || slot.dataset.key !== key || Q.phase !== "talk") return;
    const m = ft();
    ((slot.hidden = !1),
      mountCoach(slot, {
        mission: m.title,
        intro: m.intro,
        findings: `${m.identity.finding} ${m.equipment.finding}`,
        question: m.dialogue,
        reference: m.communication.find((c) => c.safe)?.text,
        learning: m.learning,
      }));
  });
}

// Informe del alumno para el docente.
function ExportReport() {
  const dlg = lt("#report-dialog"),
    name = lt("#report-name");
  ((name.value = LMS.learnerName || ye("gpa-guardia-quirofano-name") || ""),
    dlg.showModal(),
    name.focus());
}
lt("#export-report").addEventListener("click", ExportReport);
lt("#report-cancel").addEventListener("click", () =>
  lt("#report-dialog").close(),
);
lt("#report-form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const name = lt("#report-name").value.trim();
  if (!name) return lt("#report-name").focus();
  Pi("gpa-guardia-quirofano-name", name);
  const raw = ye("gpa-guardia-quirofano-progress-v1") || {},
    stars = ye(StarsKey);
  (Report.download(
    Report.build({
      name,
      missions: Mt,
      best: Te(),
      stars: Array.isArray(stars) ? stars : [],
      progress: { ...raw, streak: Progress.streak() },
    }),
  ),
    lt("#report-dialog").close());
});

// Teclado: 1-9 eligen la opción correspondiente del panel.
document.addEventListener("keydown", (ev) => {
  if (
    ev.ctrlKey ||
    ev.metaKey ||
    ev.altKey ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) ||
    lt("#game-view").hidden
  )
    return;
  const n = Number(ev.key);
  if (!n) return;
  const buttons = [
    ...document.querySelectorAll("#decision-options button.option"),
  ];
  buttons[n - 1] && (ev.preventDefault(), buttons[n - 1].click());
});

// Paquete por módulo: solo se muestran y exigen las misiones de ese módulo.
CONFIG.module &&
  ((Ot = CONFIG.module),
  (zt = Mt.findIndex((m) => m.module === CONFIG.module)),
  (lt("#daily-case").hidden = !0));
LMS.connected &&
  ((lt("#lms-chip").hidden = !1),
  ht("#lms-chip", `LMS · ${LMS.learnerName || "Alumno"}`),
  ht(
    ".app-footer span:last-child",
    `Conectado a la LMS (SCORM ${LMS.version})`,
  ));

// ---------------------------------------------------------------------------
// Versión demo para la landing page.

function Locked(i) {
  return CONFIG.demo && !DEMO_MISSIONS.includes(i);
}
// Avisa a la página que contiene el juego (la landing) de lo que hace el
// visitante, para medir conversiones: {source: "guardia-demo", event, ...}.
function Track(event, data = {}) {
  if (!CONFIG.demo || window.parent === window) return;
  try {
    window.parent.postMessage({ source: "guardia-demo", event, ...data }, "*");
  } catch {}
}
function Cta(reason) {
  if (!CONFIG.demo) return;
  (ht("#cta-reason", reason || ""),
    (lt("#cta-link").hidden = !CONFIG.enrollUrl),
    CONFIG.enrollUrl && (lt("#cta-link").href = CONFIG.enrollUrl),
    (lt("#cta-fallback").hidden = !!CONFIG.enrollUrl),
    lt("#cta-dialog").showModal(),
    Track("cta_open", { reason }));
}
lt("#cta-close").addEventListener("click", () => lt("#cta-dialog").close());
lt("#cta-back").addEventListener("click", () => lt("#cta-dialog").close());
lt("#cta-link").addEventListener("click", () => Track("cta_click"));
lt("#demo-ribbon").addEventListener("click", () =>
  Cta("Estás jugando la demo gratuita."),
);
CONFIG.demo &&
  ((lt("#demo-ribbon").hidden = !1),
  (lt("#daily-case").hidden = !0),
  (lt("#streak-chip").hidden = !0),
  (lt("#medals-chip").hidden = !0),
  (lt("#export-report").hidden = !0),
  ht("#program-label", "DEMO GRATUITA"),
  ht("#start-mission", "Jugar la misión 1 →"),
  ht(
    ".app-footer span:last-child",
    "Demo gratuita · Curso de Asistencia Quirúrgica",
  ),
  (zt = 0),
  (Ot = 1));
ye("gpa-guardia-quirofano-sound") === !1 &&
  ((Qt = !1),
  Sound.setEnabled(!1),
  (lt("#sound-toggle").textContent = "×"),
  lt("#sound-toggle").setAttribute("aria-label", "Activar sonido"));
lt("#start-mission").addEventListener("click", () =>
  Locked(zt)
    ? Cta("Esa misión está en el curso completo.")
    : (Track("mission_start", { mission: zt + 1 }), $t(zt)),
);
lt("#resume-mission").addEventListener("click", () => $t(zt, !0));
lt("#back-to-menu").addEventListener("click", Ce);
lt("#restart-mission").addEventListener("click", () => $t(Q.missionIndex));
lt("#sound-toggle").addEventListener("click", () => {
  ((Qt = !Qt),
    Sound.setEnabled(Qt),
    Pi("gpa-guardia-quirofano-sound", Qt),
    (lt("#sound-toggle").textContent = Qt ? "♫" : "×"),
    lt("#sound-toggle").setAttribute(
      "aria-label",
      Qt ? "Desactivar sonido" : "Activar sonido",
    ));
});
lt("#hint-button").addEventListener("click", () => {
  if (!Q || Q.phase === "debrief") return;
  const hk = Q.phase === "observe" ? Q.substep : Q.phase;
  ((Q.hintKeys ??= []),
    Q.hintKeys.includes(hk) || (Q.hintKeys.push(hk), Q.hints++));
  const p = {
      1: "Comprueba integridad, esterilidad y destino de cada elemento.",
      2: "Relaciona cada hallazgo con la categoría descrita en el módulo.",
      3: "Una luz encendida no prueba todos los componentes: lee la evidencia de cada uno.",
      4: "Elige exactamente las tres piezas que cumplen la solicitud de la especialidad.",
      5: "Construye la entrega como hallazgo, verificación y pendiente.",
    },
    T = {
      observe:
        Q.substep === "identity"
          ? "Busca una confirmación activa del expediente antes de continuar."
          : "Un equipo encendido o disponible todavía necesita una comprobación.",
      material: p[ft().module],
      event:
        "Ante una alarma o un imprevisto: detente, comunica y resuelve según protocolo.",
      talk: "Comunica lo confirmado y también lo que permanece pendiente.",
      pause: "Toda incidencia abierta se aclara antes de completar esta fase.",
    };
  ((Q.feedback = { kind: "tip", text: T[Q.phase] }), St(), Zt(), as());
});
Ce();
// PWA: instalable y jugable sin conexión (solo en el build de producción).
import.meta.env.PROD &&
  "serviceWorker" in navigator &&
  !LMS.connected &&
  window.top === window &&
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(() => {}),
  );
// Solo en desarrollo: acceso de lectura para las pruebas automáticas
// (Vite lo elimina del build de producción).
import.meta.env.DEV &&
  (window.__guardia = {
    state: () => Q,
    mission: () => ft(),
    challenge: () => Ht(),
    missions: Mt,
    stability: () => Stability(),
    event: () => CurrentEvent(),
    closure: () => Hi[ft().module - 1],
  });
