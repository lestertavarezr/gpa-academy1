import foamImg from './images/foam.jpg';
import alginateImg from './images/alginate.jpg';
import hydrocolloidImg from './images/hydrocolloid.jpg';
import hydrogelImg from './images/hydrogel.jpg';
import antimicrobialImg from './images/antimicrobial.jpg';
import npwtImg from './images/npwt.jpg';
import ostomyImg from './images/ostomy.jpg';

export const modules = [
  { id: 'm1', label: '01', name: 'Cicatrización', short: 'Fases y factores', icon: '✦', color: '#61b49a' },
  { id: 'm2', label: '02', name: 'Evaluación', short: 'Clasificación y TIME', icon: '◈', color: '#dfa976' },
  { id: 'm3', label: '03', name: 'Heridas agudas', short: 'Trauma y postquirúrgicas', icon: '✚', color: '#a9b9e8' },
  { id: 'm4', label: '04', name: 'Heridas crónicas', short: 'Vascular y pie diabético', icon: '◎', color: '#d697a8' },
  { id: 'm5', label: '05', name: 'Presión negativa', short: 'NPWT y seguridad', icon: '◉', color: '#bda8e8' },
  { id: 'ost', label: 'EX', name: 'Ostomías', short: 'Piel periestomal', icon: '◌', color: '#e2bd79' },
];

export const sources = {
  idsa: { label: 'IWGDF/IDSA · Infección del pie diabético (2023)', url: 'https://www.idsociety.org/practice-guideline/diabetic-foot-infections/' },
  iwgdfTable: { label: 'IWGDF · Tabla de antibióticos para pie diabético (2023)', url: 'https://iwgdfguidelines.org/wp-content/uploads/2023/07/IWGDF-Guidelines-2023.pdf' },
  offload: { label: 'IWGDF · Descarga del pie diabético (2023)', url: 'https://iwgdfguidelines.org/offloading-guideline-2023/' },
  pad: { label: 'IWGDF · Enfermedad arterial periférica (2023)', url: 'https://iwgdfguidelines.org/wp-content/uploads/2023/07/IWGDF-2023-05-PAD-Guideline.pdf' },
  wound: { label: 'IWGDF · Cicatrización (2023)', url: 'https://iwgdfguidelines.org/wound-healing-2023/' },
  pressure: { label: 'NICE CG179 · Lesiones por presión', url: 'https://www.nice.org.uk/guidance/cg179/chapter/Recommendations' },
  leg: { label: 'NICE NG152 · Infección de úlcera de pierna', url: 'https://www.nice.org.uk/guidance/ng152/chapter/recommendations' },
  surgical: { label: 'NICE NG125 · Infección del sitio quirúrgico', url: 'https://www.nice.org.uk/guidance/ng125/chapter/recommendations' },
  tetanus: { label: 'CDC · Prevención de tétanos en heridas', url: 'https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html' },
  cuts: { label: 'NHS · Cortes y abrasiones', url: 'https://www.nhs.uk/conditions/cuts-and-grazes/' },
  stomaAlert: { label: 'UOAA · Complicaciones de ostomía', url: 'https://www.ostomy.org/wp-content/uploads/2023/09/CE_Nursing_Care_for_Patients_After_Ostomy_Surgery.pdf' },
  abpi: { label: 'NICE · Evaluación vascular antes de compresión', url: 'https://www.nice.org.uk/guidance/htg677/chapter/2-The-diagnostic-tests' },
  ostomy: { label: 'WOCN · Guía de piel periestomal', url: 'https://psag.wocn.org/index.html' },
  fda: { label: 'FDA · Seguridad de NPWT', url: 'https://www.fda.gov/medical-devices/guidance-documents-medical-devices-and-radiation-emitting-products/non-powered-suction-apparatus-device-intended-negative-pressure-wound-therapy-npwt-class-ii-special' },
};

export const dressings = [
  { id: 'foam', name: 'Espuma absorbente', detail: 'Absorbe exudado moderado y protege la piel.', image: foamImg, credit: 'Enter · CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Schaumverband.JPG' },
  { id: 'alginate', name: 'Alginato', detail: 'Opción para exudado abundante; requiere cobertura secundaria.', image: alginateImg, credit: 'Enter · CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Alginat_Wundauflagen.JPG' },
  { id: 'hydrocolloid', name: 'Hidrocoloide', detail: 'Ambiente húmedo en herida limpia con exudado bajo.', image: hydrocolloidImg, credit: 'Enter · CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Hydrokolloid.JPG' },
  { id: 'hydrogel', name: 'Hidrogel', detail: 'Aporta humedad a un lecho seco cuando está indicado.', image: hydrogelImg, credit: 'Korrupt · CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Hydrogel-Wundauflage.jpg' },
  { id: 'antimicrobial', name: 'Compresa antimicrobiana', detail: 'Uso selectivo tras valoración; no sustituye el manejo de la infección.', image: antimicrobialImg, credit: 'Enter · CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Antibakterielle_Saugkompresse.JPG' },
  { id: 'npwt', name: 'Sistema NPWT', detail: 'Terapia avanzada bajo indicación y supervisión clínica.', image: npwtImg, credit: 'Noles1984 · dominio público', source: 'https://commons.wikimedia.org/wiki/File:KCI_Wound_Vac01.jpg' },
  { id: 'ostomy', name: 'Bolsa + barrera', detail: 'Sistema de recogida con abertura ajustada al estoma.', image: ostomyImg, credit: 'DCwom · dominio público', source: 'https://commons.wikimedia.org/wiki/File:OstomyPouch.jpg' },
];

const option = (id, label, note = '') => ({ id, label, note });
const choice = (title, prompt, options, correct, explanation, source) => ({ kind: 'choice', title, prompt, options, correct, explanation, source });
const patch = (title, prompt, options, correct, explanation, source) => ({ kind: 'dressing', title, prompt, options, correct, explanation, source });
const select = (title, prompt, options, correct, explanation, source) => ({ kind: 'select', title, prompt, options, correct, explanation, source });

export const cases = [
  {
    id: 'm1-a', module: 'm1', number: '01', title: 'Una herida que progresa', tag: 'Cicatrización', difficulty: 'Inicial', time: '4 min',
    patient: 'Lucía, 34 años', history: 'Corte superficial suturado hace 5 días. Sin fiebre. Bordes aproximados y tejido rosado.',
    wound: { site: 'Antebrazo', bed: 'Rosado', drainage: 'Escaso', edge: 'Aproximado', visual: 'linear' },
    scene: 'La herida luce estable. Tu tarea es leer su evolución antes de intervenir.',
    steps: [
      choice('Lee la fase', '¿Qué proceso predomina tras la hemostasia y la inflamación inicial?', [option('proliferation','Proliferación: granulación y epitelización'),option('necrosis','Necrosis inevitable del tejido'),option('maturation','Remodelación completa a los 5 días')], 'proliferation', 'La fase proliferativa suele incluir granulación y epitelización; la remodelación continúa durante semanas o meses.', 'wound'),
      patch('Protege el lecho', 'Herida limpia, superficial y con muy poco exudado. Elige una cobertura plausible para esta simulación.', ['hydrocolloid','alginate','npwt'], 'hydrocolloid', 'Un hidrocoloide puede mantener un entorno húmedo en una herida limpia con exudado bajo. La elección real depende de piel, localización y protocolo.', 'pressure'),
      choice('Decide el seguimiento', '¿Qué hallazgo obliga a reevaluar, aunque hoy no haya signos de infección?', [option('spreading','Enrojecimiento que se extiende y dolor creciente'),option('pink','Tejido rosado estable'),option('scar','Inicio de cicatriz')], 'spreading', 'La progresión del eritema, el dolor o los signos sistémicos requieren valoración; no se prescriben antibióticos de forma preventiva.', 'surgical'),
    ],
  },
  {
    id: 'm1-b', module: 'm1', number: '02', title: 'La cicatrización se detiene', tag: 'Factores sistémicos', difficulty: 'Inicial', time: '4 min',
    patient: 'Rafael, 69 años', history: 'Herida de pierna de 3 semanas. Diabetes, edema y poca ingesta de proteínas. Sin fiebre ni celulitis.',
    wound: { site: 'Pierna', bed: 'Granulación parcial', drainage: 'Moderado', edge: 'Lento', visual: 'round' },
    scene: 'No todo retraso de cierre significa infección. Investiga el contexto.',
    steps: [
      select('Mira más allá del lecho', 'Selecciona los DOS factores que debes abordar en el plan integral.', [option('glucose','Control metabólico'),option('nutrition','Estado nutricional'),option('color','Color favorito de la venda'),option('antibiotic','Antibiótico preventivo')], ['glucose','nutrition'], 'La glucemia y la nutrición influyen en la cicatrización; el antibiótico no corrige un retraso sin infección clínica.', 'wound'),
      patch('Controla el exudado', 'Hay exudado moderado, sin signos de infección. ¿Qué apósito puede ayudar a manejar la humedad?', ['foam','hydrogel','hydrocolloid'], 'foam', 'Una espuma absorbente es una opción razonable para controlar exudado moderado y proteger la piel perilesional.', 'pressure'),
      choice('Antibiótico: ¿sí o no?', 'El cultivo superficial informa bacterias, pero no hay signos clínicos de infección.', [option('none','No indicar antibiótico solo por colonización'),option('broad','Iniciar amplio espectro por el cultivo'),option('silver','Sustituir evaluación por plata')], 'none', 'La colonización no equivale a infección. La indicación de antibiótico se basa en la valoración clínica, no en el cultivo aislado.', 'leg'),
    ],
  },
  {
    id: 'm2-a', module: 'm2', number: '03', title: 'Presión en el talón', tag: 'Clasificación', difficulty: 'Intermedio', time: '5 min',
    patient: 'Elena, 82 años', history: 'Movilidad reducida. Lesión abierta, superficial, con dermis expuesta, sin esfacelo visible.',
    wound: { site: 'Talón', bed: 'Rosado húmedo', drainage: 'Bajo', edge: 'Superficial', visual: 'pressure' },
    scene: 'Clasifica, protege y quita la presión: las tres decisiones van juntas.',
    steps: [
      choice('Clasifica la lesión', '¿Qué categoría describe mejor este hallazgo?', [option('stage2','Lesión por presión categoría 2'),option('stage4','Categoría 4 con hueso expuesto'),option('unstageable','No clasificable por escara')], 'stage2', 'La pérdida parcial de piel con dermis expuesta corresponde a categoría 2; no hay datos de tejido profundo ni escara que oculte el lecho.', 'pressure'),
      patch('Elige cobertura', 'La lesión es superficial, limpia y con exudado bajo.', ['hydrocolloid','alginate','npwt'], 'hydrocolloid', 'Una cobertura que mantenga humedad y proteja puede ser apropiada. La guía no impone una marca ni una familia única.', 'pressure'),
      choice('Acción imprescindible', '¿Qué intervención no puede omitirse?', [option('offload','Descargar el talón y planificar cambios posturales'),option('antibiotic','Antibiótico sistémico rutinario'),option('massage','Masajear directamente el área lesionada')], 'offload', 'Sin alivio sostenido de la presión, el apósito por sí solo no resuelve la causa.', 'pressure'),
    ],
  },
  {
    id: 'm2-b', module: 'm2', number: '04', title: 'El método TIME', tag: 'Evaluación', difficulty: 'Intermedio', time: '5 min',
    patient: 'Tomás, 58 años', history: 'Herida crónica con esfacelo, exudado abundante y piel perilesional macerada. Afebril.',
    wound: { site: 'Tobillo', bed: 'Esfacelo', drainage: 'Abundante', edge: 'Macerado', visual: 'slough' },
    scene: 'Observa tejido, infección/inflamación, humedad y borde antes de cubrir.',
    steps: [
      select('Registra TIME', 'Marca los DOS problemas directamente visibles que exigen un plan del lecho.', [option('tissue','Tejido desvitalizado'),option('moisture','Exceso de humedad'),option('fever','Fiebre documentada'),option('bone','Hueso expuesto')], ['tissue','moisture'], 'Hay esfacelo y maceración. No hay datos de fiebre ni hueso expuesto en este caso.', 'pressure'),
      patch('Maneja humedad', 'Mientras el equipo valora el desbridamiento, ¿qué material puede absorber exudado abundante?', ['alginate','hydrogel','hydrocolloid'], 'alginate', 'El alginato puede absorber exudado abundante; suele requerir cobertura secundaria y revisión de la piel perilesional.', 'pressure'),
      choice('Reevalúa la causa', 'Antes de concluir “herida infectada”, ¿qué corresponde hacer?', [option('assess','Buscar signos clínicos y valorar etiología y perfusión'),option('culture','Tratar cualquier cultivo positivo'),option('wait','Ignorar la maceración')], 'assess', 'El enfoque TIME complementa, pero no sustituye, la evaluación de causa, perfusión y signos clínicos de infección.', 'leg'),
    ],
  },
  {
    id: 'm3-a', module: 'm3', number: '05', title: 'Corte agudo limpio', tag: 'Herida aguda', difficulty: 'Inicial', time: '4 min',
    patient: 'Nadia, 27 años', history: 'Corte reciente de cocina. Hemorragia controlada. Sin cuerpo extraño visible. Vacunación antitetánica por verificar.',
    wound: { site: 'Mano', bed: 'Limpio', drainage: 'Bajo', edge: 'Lineal', visual: 'linear' },
    scene: 'En la herida aguda, la evaluación inicial importa más que un apósito sofisticado.',
    steps: [
      select('Prioridades iniciales', 'Selecciona DOS acciones esenciales antes del cierre o la cobertura.', [option('irrigate','Irrigar y explorar la herida'),option('tetanus','Verificar estado antitetánico'),option('antibiotic','Dar antibiótico a toda cortada'),option('glue','Cerrar sin explorar')], ['irrigate','tetanus'], 'La limpieza/exploración y la profilaxis antitetánica según historia son parte de la valoración; antibióticos no son universales.', 'tetanus'),
      patch('Cubre sin excederte', 'Herida limpia y de exudado bajo tras manejo inicial. ¿Cuál cobertura es plausible?', ['hydrocolloid','alginate','npwt'], 'hydrocolloid', 'Un apósito que proteja y mantenga humedad puede utilizarse según el tipo de herida y la valoración local.', 'surgical'),
      choice('Señal de alarma', 'Si aparece pérdida de sensibilidad o limitación de movimiento, ¿qué sigue?', [option('refer','Evaluación urgente de lesión profunda'),option('ignore','Cambio de apósito en una semana'),option('silver','Solo compresa antimicrobiana')], 'refer', 'Un posible daño neurovascular o tendinoso requiere exploración profesional, no solo cambio de cobertura.', 'cuts'),
    ],
  },
  {
    id: 'm3-b', module: 'm3', number: '06', title: 'Incisión que empeora', tag: 'Sitio quirúrgico', difficulty: 'Avanzado', time: '5 min',
    patient: 'Marcos, 46 años', history: 'Día 7 tras cirugía abdominal. Eritema que se expande, dolor nuevo, secreción purulenta y 38.4 °C.',
    wound: { site: 'Abdomen', bed: 'Purulento', drainage: 'Moderado', edge: 'Eritematoso', visual: 'infected' },
    scene: 'Una complicación postquirúrgica no se resuelve escogiendo la foto de un parche.',
    steps: [
      choice('Reconoce la complicación', '¿Cuál es el siguiente paso más seguro?', [option('urgent','Valoración quirúrgica pronta y evaluación de infección'),option('cover','Cubrir y esperar 7 días'),option('routine','Antibiótico preventivo sin evaluar')], 'urgent', 'Fiebre, secreción purulenta y eritema progresivo obligan a valorar infección del sitio quirúrgico y posible necesidad de drenaje.', 'surgical'),
      choice('Antibiótico contextualizado', 'Tras valoración, hay celulitis asociada. ¿Cómo se elige el antibiótico?', [option('guided','Según foco, gravedad, microbiología y resistencia local'),option('same','La misma molécula para todos los casos'),option('topical','Solo producto tópico aunque haya fiebre')], 'guided', 'NICE recomienda antibiótico que cubra organismos probables y tenga en cuenta microbiología y patrones locales; el juego no prescribe un fármaco o dosis universal.', 'surgical'),
      patch('Cuidado local', 'Tras drenaje y decisión del equipo, queda herida abierta con exudado moderado. ¿Qué cobertura puede manejarlo?', ['foam','hydrogel','hydrocolloid'], 'foam', 'Una espuma puede proteger y absorber; se ajusta al lecho, la piel y el plan de curaciones.', 'surgical'),
    ],
  },
  {
    id: 'm4-a', module: 'm4', number: '07', title: 'Pie diabético sin infección', tag: 'Pie diabético', difficulty: 'Intermedio', time: '5 min',
    patient: 'Joel, 61 años', history: 'Úlcera plantar neuropática; sin eritema, calor, dolor nuevo, pus ni fiebre. Camina sobre la zona.',
    wound: { site: 'Planta del pie', bed: 'Granulación', drainage: 'Bajo', edge: 'Calloso', visual: 'foot' },
    scene: 'La clave no es buscar un antibiótico: es identificar lo que impide cicatrizar.',
    steps: [
      choice('Clasifica infección', '¿Cómo se interpreta la información actual?', [option('uninfected','Úlcera sin infección clínica evidente'),option('mild','Infección leve por ser diabetes'),option('severe','Infección grave por estar en el pie')], 'uninfected', 'La infección del pie diabético se diagnostica clínicamente, no por la sola presencia de una úlcera.', 'idsa'),
      choice('Antibiótico', '¿Qué decisión concuerda con IWGDF/IDSA?', [option('none','No antibiótico para úlcera no infectada'),option('oral','Antibiótico oral preventivo'),option('topical','Antibiótico tópico preventivo')], 'none', 'La guía indica no usar antibióticos sistémicos ni locales para promover la curación o prevenir infección en úlceras clínicamente no infectadas.', 'idsa'),
      choice('Intervención de mayor impacto', 'Se confirma úlcera plantar neuropática en antepié, sin contraindicaciones conocidas. ¿Qué debe valorar el equipo?', [option('offload','Dispositivo de descarga apropiado y evaluación vascular'),option('shoe','Solo cambiar a zapato blando'),option('rest','Solo recomendar reposo sin plan')], 'offload', 'La descarga efectiva es central; IWGDF recomienda como primera opción un dispositivo no removible hasta la rodilla en casos elegibles.', 'offload'),
    ],
  },
  {
    id: 'm4-b', module: 'm4', number: '08', title: 'Pie diabético infectado', tag: 'Antimicrobianos', difficulty: 'Avanzado', time: '6 min',
    patient: 'Patricia, 65 años', history: 'Úlcera plantar con eritema local, calor, dolor y pus. Sin fiebre ni compromiso sistémico; perfusión y alergias aún por evaluar.',
    wound: { site: 'Planta del pie', bed: 'Exudado purulento', drainage: 'Moderado', edge: 'Inflamado', visual: 'infected' },
    scene: 'Distingue infección leve de una situación que exige hospitalización.',
    steps: [
      choice('Confirma el problema', '¿Cuál es la lectura más probable con estos datos?', [option('infected','Infección clínica; clasificar gravedad y evaluar perfusión'),option('colonized','Solo colonización porque no hay fiebre'),option('none','No requiere valoración')], 'infected', 'Los signos locales apoyan infección clínica aunque no haya fiebre; gravedad, perfusión y profundidad modifican el plan.', 'idsa'),
      select('Antes del antibiótico', 'Selecciona DOS datos que cambian la elección antimicrobiana.', [option('allergy','Alergias y función renal'),option('culture','Cultivo de tejido apropiado si está indicado'),option('brand','Marca del apósito'),option('ageOnly','Edad como único criterio')], ['allergy','culture'], 'La elección depende de seguridad del paciente y, cuando proceda, una muestra adecuada; también influyen gravedad, exposición previa y resistencias locales.', 'idsa'),
      choice('Antibiótico: ejemplo guiado', 'Se confirma infección leve, sin alergia a betalactámicos ni antibióticos recientes; no hay datos de infección profunda. Según la tabla IWGDF, ¿qué opción empírica oral es razonable para que el equipo la valore?', [option('cephalexin','Cefalexina o cloxacilina, según disponibilidad y resistencia local'),option('pseudo','Ciprofloxacino para cubrir Pseudomonas en todos'),option('none','Ningún antibiótico pese a infección confirmada')], 'cephalexin', 'IWGDF propone una cefalosporina de primera generación (p. ej., cefalexina) o penicilina resistente a penicilinasa (p. ej., cloxacilina) para infección leve sin complicaciones. No es receta: confirmar alergias, perfusión, función renal, cultivos y protocolo local.', 'iwgdfTable'),
    ],
  },
  {
    id: 'm4-c', module: 'm4', number: '09', title: 'Úlcera venosa, pierna húmeda', tag: 'Herida crónica', difficulty: 'Intermedio', time: '5 min',
    patient: 'Sofía, 73 años', history: 'Úlcera maleolar superficial, edema, pigmentación ocre y exudado alto. Sin celulitis ni fiebre.',
    wound: { site: 'Maléolo medial', bed: 'Granulación', drainage: 'Abundante', edge: 'Irregular', visual: 'round' },
    scene: 'Controla el exudado, pero no olvides la causa venosa ni la circulación arterial.',
    steps: [
      choice('Antes de comprimir', '¿Qué valoración es clave antes de compresión fuerte?', [option('vascular','Evaluación arterial / índice tobillo-brazo según contexto'),option('culture','Cultivo superficial rutinario'),option('antibiotic','Antibiótico preventivo')], 'vascular', 'La compresión fuerte puede dañar si hay enfermedad arterial. Debe evaluarse la perfusión y las contraindicaciones.', 'abpi'),
      patch('Selecciona apósito', 'Exudado alto y piel perilesional en riesgo de maceración. ¿Qué material absorbente es una opción?', ['alginate','hydrogel','hydrocolloid'], 'alginate', 'El alginato puede absorber exudado abundante; hay que proteger piel perilesional y usar cobertura secundaria apropiada.', 'pressure'),
      choice('¿Antibiótico?', 'La úlcera no tiene eritema extendido, calor creciente, dolor nuevo ni fiebre.', [option('none','No dar antibiótico para acelerar el cierre'),option('oral','Dar antibiótico oral a todas las úlceras'),option('iv','Iniciar intravenoso por exudado')], 'none', 'La mayoría de úlceras de pierna están colonizadas; sin signos de infección el antibiótico no acelera la cicatrización.', 'leg'),
    ],
  },
  {
    id: 'm4-d', module: 'm4', number: '10', title: 'Pie frío, pulso ausente', tag: 'Isquemia', difficulty: 'Experto', time: '5 min',
    patient: 'Andrés, 70 años', history: 'Diabetes y herida en un dedo del pie. Dolor en reposo, pie frío, piel pálida y pulso pedio no palpable.',
    wound: { site: 'Dedo del pie', bed: 'Pálido', drainage: 'Escaso', edge: 'Seco', visual: 'foot' },
    scene: 'La perfusión es una condición para cicatrizar. Evita que un apósito o antibiótico retrasen la evaluación vascular.',
    steps: [
      choice('Reconoce el riesgo', '¿Cuál es la prioridad ante dolor en reposo y signos de hipoperfusión?', [option('vascular','Evaluación vascular urgente y valoración de viabilidad del miembro'),option('cover','Solo elegir un apósito más absorbente'),option('wait','Esperar varias semanas')], 'vascular', 'Los datos sugieren isquemia potencialmente amenazante. La guía IWGDF recomienda evaluación vascular en personas con diabetes y úlcera del pie.', 'pad'),
      choice('¿Antibiótico por palidez?', 'No hay eritema, pus, calor ni fiebre. ¿Qué corresponde?', [option('none','No tratar la isquemia con antibiótico sin infección clínica'),option('broad','Antibiótico de amplio espectro por pie frío'),option('topical','Antibiótico tópico para recuperar el pulso')], 'none', 'La ausencia de infección clínica no justifica antibióticos; la amenaza principal aquí es vascular.', 'idsa'),
      choice('Plan completo', 'Además de proteger la herida, ¿qué dato debe documentarse y seguirse?', [option('perfusion','Perfusión, dolor, progresión tisular y respuesta al plan vascular'),option('brand','Solo marca del apósito'),option('photo','Solo fotografía sin examen')], 'perfusion', 'La valoración y el seguimiento de perfusión y viabilidad dirigen el manejo; un producto local no resuelve la isquemia.', 'pad'),
    ],
  },
  {
    id: 'm4-e', module: 'm4', number: '11', title: 'Antibióticos con contexto', tag: 'Guía NICE', difficulty: 'Avanzado', time: '5 min',
    patient: 'Beatriz, 72 años', history: 'Escenario docente situado en Reino Unido. Úlcera venosa con celulitis local que se extiende, dolor nuevo y calor; no está gravemente enferma. Sin alergias conocidas ni embarazo.',
    wound: { site: 'Pierna', bed: 'Granulación', drainage: 'Moderado', edge: 'Eritema extendido', visual: 'infected' },
    scene: 'La guía orienta, pero el lugar, la alergia y la evolución modifican el tratamiento.',
    steps: [
      choice('¿Hay indicación?', 'Con signos de infección que se extienden fuera de la úlcera, ¿qué plantea NICE NG152?', [option('offer','Ofrecer antibiótico tras valoración clínica'),option('never','Nunca usar antibióticos en úlceras venosas'),option('culture','Tratar solo si un cultivo superficial es positivo')], 'offer', 'NICE recomienda antibiótico en úlcera de pierna cuando hay signos clínicos de infección, como eritema extendido, calor, dolor creciente o fiebre.', 'leg'),
      choice('Primera opción de la guía', 'Para este adulto en Reino Unido, estable y sin alergia a penicilina, ¿qué antibiótico oral lista NICE como primera opción?', [option('fluclox','Flucloxacilina, sujeta a valoración y protocolo local'),option('cipro','Ciprofloxacino rutinario'),option('none','Ninguno pese a celulitis')], 'fluclox', 'La tabla NICE NG152 enumera flucloxacilina como primera opción oral en este contexto británico. No debe extrapolarse de forma automática a otros países o pacientes.', 'leg'),
      choice('Revisión de respuesta', 'Si la celulitis empeora rápidamente o no empieza a mejorar en 2–3 días, ¿qué corresponde?', [option('reassess','Reevaluar gravedad, adherencia, complicaciones y tratamiento'),option('wait','Esperar sin revisar hasta cerrar la herida'),option('cover','Cambiar solo a un hidrogel')], 'reassess', 'NICE indica reevaluar si la infección empeora o no comienza a mejorar; valorar necesidad de derivación y ajustar tratamiento con datos clínicos y microbiológicos.', 'leg'),
    ],
  },
  {
    id: 'm5-a', module: 'm5', number: '12', title: 'Presión negativa bien indicada', tag: 'NPWT', difficulty: 'Avanzado', time: '6 min',
    patient: 'Diego, 52 años', history: 'Herida compleja tras desbridamiento quirúrgico. Hemostasia conseguida; exudado abundante; equipo especializado considera NPWT.',
    wound: { site: 'Pierna', bed: 'Viable', drainage: 'Abundante', edge: 'Protegido', visual: 'round' },
    scene: 'NPWT no es un parche universal: verifica indicación, seguridad y respuesta.',
    steps: [
      select('Lista de seguridad', 'Antes de iniciar, selecciona DOS comprobaciones críticas.', [option('hemostasis','Hemostasia y riesgo de sangrado'),option('structures','Estructuras expuestas / protección tisular'),option('brand','Color de la marca'),option('speed','Aplicar sin documentar')], ['hemostasis','structures'], 'La seguridad exige valorar sangrado y evitar contacto directo del material con vasos u órganos expuestos.', 'fda'),
      patch('Dispositivo', 'El equipo confirma indicación y seguridad. ¿Qué sistema corresponde a esta estrategia?', ['npwt','hydrocolloid','hydrogel'], 'npwt', 'La terapia de presión negativa es un sistema, no un simple apósito. Debe instalarse y monitorizarse según protocolo.', 'fda'),
      choice('Monitorización', '¿Qué harías si el sello falla y la bomba alarma repetidamente?', [option('inspect','Inspeccionar el sistema y contactar al equipo responsable'),option('ignore','Silenciar alarma y esperar'),option('increase','Subir presión sin indicación')], 'inspect', 'La pérdida de sello impide la terapia prevista y requiere revisión del sistema, la piel y el plan.', 'fda'),
    ],
  },
  {
    id: 'm5-b', module: 'm5', number: '13', title: 'Alarma roja en NPWT', tag: 'Seguridad', difficulty: 'Experto', time: '4 min',
    patient: 'Iván, 67 años', history: 'NPWT en herida postoperatoria. Aparece sangre roja brillante en tubo y colector, con mareo.',
    wound: { site: 'Muslo', bed: 'No visible', drainage: 'Sangrado activo', edge: 'Bajo sello', visual: 'bleeding' },
    scene: 'Aquí la puntuación pasa a segundo plano: identifica una urgencia.',
    steps: [
      choice('Prioridad absoluta', '¿Qué acción inmediata es la más segura?', [option('stop','Detener NPWT y activar atención urgente por sangrado'),option('wait','Esperar a la siguiente curación'),option('pressure','Aumentar presión negativa')], 'stop', 'La sangre roja brillante o sangrado súbito requiere suspender la terapia y atención inmediata; seguir protocolo local de hemorragia.', 'fda'),
      choice('Después de estabilizar', '¿Qué debe revisar el equipo antes de plantear reinicio?', [option('cause','Fuente del sangrado, hemostasia y contraindicaciones'),option('timer','Solo el temporizador de la bomba'),option('cover','Tapar el colector para no ver sangre')], 'cause', 'La causa y el riesgo hemorrágico deben abordarse antes de reiniciar; no basta con cambiar el equipo.', 'fda'),
      choice('Comunicación', '¿Qué información debes transmitir de forma prioritaria?', [option('blood','Inicio, cantidad aproximada, color del drenaje y signos vitales'),option('brand','Marca del apósito únicamente'),option('none','No documentar hasta el alta')], 'blood', 'Un reporte estructurado acelera la evaluación y la respuesta a la urgencia.', 'fda'),
    ],
  },
  {
    id: 'ost-a', module: 'ost', number: '14', title: 'Fuga bajo la barrera', tag: 'Ostomía', difficulty: 'Intermedio', time: '5 min',
    patient: 'Clara, 55 años', history: 'Ileostomía. Ardor, picazón y eritema periestomal. La placa muestra efluente por debajo del adhesivo.',
    wound: { site: 'Piel periestomal', bed: 'Eritema húmedo', drainage: 'Fuga', edge: 'Irritado', visual: 'stoma' },
    scene: 'La piel irritada no mejorará mientras el efluente siga filtrándose.',
    steps: [
      choice('Identifica la causa', '¿Qué hallazgo explica mejor la lesión?', [option('leak','Fuga con exposición de piel al efluente'),option('antibiotic','Falta de antibiótico sistémico'),option('normal','Cambios normales que no precisan revisión')], 'leak', 'La guía WOCN recomienda retirar el sistema, observar la cara adhesiva y localizar socavación o fuga.', 'ostomy'),
      patch('Reinstala el sistema', 'Tras limpiar con agua y valorar la piel, elige la pieza central del plan.', ['ostomy','hydrocolloid','alginate'], 'ostomy', 'Una bolsa con barrera bien ajustada al tamaño del estoma reduce el contacto del efluente con la piel; se individualiza el accesorio.', 'ostomy'),
      choice('Seguimiento', 'Si la fuga persiste o hay pliegues/retracción, ¿qué sigue?', [option('specialist','Reevaluar ajuste y consultar a enfermería experta en ostomías'),option('tape','Añadir cinta indefinidamente'),option('ignore','Dejar la barrera con fuga hasta la próxima semana')], 'specialist', 'La geometría del estoma, los pliegues y el contorno pueden exigir convexidad u otros accesorios indicados por un profesional.', 'ostomy'),
    ],
  },
  {
    id: 'ost-b', module: 'ost', number: '15', title: 'El estoma cambia de color', tag: 'Alerta quirúrgica', difficulty: 'Experto', time: '4 min',
    patient: 'Marta, 64 años', history: 'Colostomía reciente. El estoma, antes rojo y húmedo, ahora se observa morado oscuro y doloroso.',
    wound: { site: 'Estoma', bed: 'Morado oscuro', drainage: 'Variable', edge: 'Edematoso', visual: 'stoma' },
    scene: 'Un cambio de color no se corrige cambiando la bolsa.',
    steps: [
      choice('Identifica la prioridad', '¿Qué debes hacer ante este cambio de color?', [option('urgent','Avisar de inmediato al equipo quirúrgico / valoración urgente'),option('bag','Solo cambiar a una bolsa más grande'),option('wait','Esperar a la siguiente visita semanal')], 'urgent', 'Un estoma que se vuelve morado o negro puede indicar isquemia y precisa valoración inmediata.', 'stomaAlert'),
      choice('Comunicación clínica', '¿Qué información es más útil transmitir?', [option('status','Color previo y actual, momento del cambio, dolor, salida y signos vitales'),option('brand','Solo marca y lote de la bolsa'),option('none','No informar hasta tener una fotografía')], 'status', 'La evolución del color y la función del estoma permiten priorizar una posible complicación vascular.', 'stomaAlert'),
      choice('Antibiótico', '¿Cuál es el papel de un antibiótico empírico decidido solo por el cambio de color?', [option('notfix','No corrige isquemia; primero evaluación urgente de la causa'),option('yes','Sustituye la evaluación quirúrgica'),option('topical','Aplicar antibiótico tópico y ocultar el estoma')], 'notfix', 'El oscurecimiento puede reflejar perfusión comprometida, que no se resuelve con un antibiótico por sí solo.', 'stomaAlert'),
    ],
  },
];

export const moduleNote = {
  m1: 'La cicatrización depende del lecho y del huésped. Nunca traduzcas “retraso” directamente a “infección”.',
  m2: 'Clasificar la lesión y registrar tejido, infección/inflamación, humedad y bordes orienta un plan individualizado.',
  m3: 'En una herida aguda o postquirúrgica, primero descarta daño profundo y complicaciones; luego decide cobertura.',
  m4: 'Pie diabético, úlcera venosa e isquemia requieren estrategias distintas. Antibiótico solo cuando está indicado.',
  m5: 'La presión negativa exige indicación, hemostasia, protección de estructuras y vigilancia de alarmas.',
  ost: 'El ajuste de la barrera y el control de fugas son claves para proteger la piel periestomal.',
};
