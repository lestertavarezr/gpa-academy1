import foamImg from './images/foam.jpg';
import alginateImg from './images/alginate.jpg';
import hydrocolloidImg from './images/hydrocolloid.jpg';
import hydrogelImg from './images/hydrogel.jpg';
import antimicrobialImg from './images/antimicrobial.jpg';
import npwtImg from './images/npwt.jpg';
import ostomyImg from './images/ostomy.jpg';
import filmImg from './images/film.svg';
import contactImg from './images/contact.svg';
import dryImg from './images/dry.svg';

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
  healing: { label: 'StatPearls · Fases de la cicatrización', url: 'https://www.ncbi.nlm.nih.gov/books/NBK470443/' },
  exudate: { label: 'WUWHS · Exudado: valoración y manejo (2019)', url: 'https://woundsinternational.com/world-union-resources/wuwhs-consensus-document-wound-exudate-effective-assessment-and-management/' },
  timers: { label: 'Atkin et al. · Implementing TIMERS, J Wound Care (2019)', url: 'https://doi.org/10.12968/jowc.2019.28.Sup3a.S1' },
  venous: { label: 'EWMA · Manejo de úlceras venosas de pierna (2016)', url: 'https://ewma.org/wp-content/uploads/2024/02/Management-of-patients-with-venous-leg-ulcers_FINAL_2016.pdf' },
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
  { id: 'film', name: 'Película transparente', detail: 'Protege y permite ver la herida; no absorbe exudado.', image: filmImg, credit: 'Ilustración ATLAS', source: '' },
  { id: 'contact', name: 'Apósito no adherente (interfase)', detail: 'Capa de contacto que evita que la cobertura se pegue al lecho.', image: contactImg, credit: 'Ilustración ATLAS', source: '' },
  { id: 'dry', name: 'Apósito seco con almohadilla', detail: 'Cobertura simple para incisiones cerradas o heridas limpias.', image: dryImg, credit: 'Ilustración ATLAS', source: '' },
];

const option = (id, label, note = '') => ({ id, label, note });
const choice = (title, prompt, options, correct, explanation, source, hint) => ({ kind: 'choice', title, prompt, options, correct, explanation, source, hint });
const patch = (title, prompt, options, correct, explanation, source, hint) => ({ kind: 'dressing', title, prompt, options, correct, explanation, source, hint });
const select = (title, prompt, options, correct, explanation, source, hint) => ({ kind: 'select', title, prompt, options, correct, explanation, source, hint });

export const cases = [
  {
    id: 'm1-a', module: 'm1', number: '01', title: 'Una herida que progresa', tag: 'Cicatrización', difficulty: 'Inicial', time: '4 min',
    patient: 'Lucía, 34 años', history: 'Corte superficial suturado hace 5 días. Sin fiebre. Bordes aproximados y tejido rosado.',
    wound: { site: 'Antebrazo', bed: 'Rosado', drainage: 'Escaso', edge: 'Aproximado', visual: 'linear' },
    scene: 'La herida luce estable. Tu tarea es leer su evolución antes de intervenir.',
    steps: [
      choice('Lee la fase', '¿Qué proceso predomina tras la hemostasia y la inflamación inicial?', [option('proliferation','Proliferación: granulación y epitelización'),option('inflammation','Inflamación: debe persistir hasta retirar los puntos'),option('maturation','Remodelación: la cicatriz ya alcanzó su resistencia final')], 'proliferation', 'La fase proliferativa suele incluir granulación y epitelización; la remodelación continúa durante semanas o meses.', 'healing', '¿Qué indican el tejido rosado y los bordes aproximados al día 5?'),
      patch('Protege el lecho', 'Incisión suturada, limpia y con exudado escaso. ¿Qué cobertura es suficiente?', ['dry','alginate','hydrogel'], 'dry', 'Una incisión cerrada con exudado escaso solo necesita una cobertura simple que la proteja; un apósito avanzado no aporta beneficio. La elección final sigue el protocolo local.', 'surgical', 'Incisión cerrada con exudado escaso: ¿hace falta absorber o humectar?'),
      choice('Decide el seguimiento', '¿Qué hallazgo obliga a reevaluar, aunque hoy no haya signos de infección?', [option('spreading','Enrojecimiento que se extiende y dolor creciente'),option('edge','Leve enrojecimiento limitado al borde de la sutura'),option('itch','Picor alrededor de la cicatriz')], 'spreading', 'La progresión del eritema, el dolor o los signos sistémicos requieren valoración; no se prescriben antibióticos de forma preventiva.', 'surgical', 'Distingue la inflamación esperada de la que progresa.'),
    ],
  },
  {
    id: 'm1-b', module: 'm1', number: '02', title: 'La cicatrización se detiene', tag: 'Factores sistémicos', difficulty: 'Inicial', time: '4 min',
    patient: 'Rafael, 69 años', history: 'Herida de pierna de 3 semanas. Diabetes, edema y poca ingesta de proteínas. Sin fiebre ni celulitis.',
    wound: { site: 'Pierna', bed: 'Granulación parcial', drainage: 'Moderado', edge: 'Lento', visual: 'round' },
    scene: 'No todo retraso de cierre significa infección. Investiga el contexto.',
    steps: [
      select('Mira más allá del lecho', 'Selecciona los DOS factores que debes abordar en el plan integral.', [option('glucose','Control metabólico'),option('nutrition','Estado nutricional'),option('daily','Cambiar el apósito a diario para acelerar el cierre'),option('swab','Cultivo superficial para confirmar infección')], ['glucose','nutrition'], 'La glucemia y la nutrición influyen en la cicatrización; el antibiótico no corrige un retraso sin infección clínica.', 'wound', 'El expediente menciona diabetes y poca ingesta: piensa en el huésped, no solo en el lecho.'),
      patch('Controla el exudado', 'Hay exudado moderado, sin signos de infección. ¿Qué apósito puede ayudar a manejar la humedad?', ['foam','hydrogel','hydrocolloid'], 'foam', 'Una espuma absorbente es una opción razonable para controlar exudado moderado y proteger la piel perilesional.', 'exudate', 'Exudado moderado: el material debe absorber, no aportar humedad.'),
      choice('Antibiótico: ¿sí o no?', 'El cultivo superficial informa bacterias, pero no hay signos clínicos de infección.', [option('none','No indicar antibiótico solo por colonización'),option('topical','Antibiótico tópico 2 semanas por el cultivo positivo'),option('silver','Apósito de plata de rutina hasta negativizar el cultivo')], 'none', 'La colonización no equivale a infección. La indicación de antibiótico se basa en la valoración clínica, no en el cultivo aislado.', 'leg', '¿Hay algún signo clínico de infección en el expediente?'),
    ],
  },
  {
    id: 'm2-a', module: 'm2', number: '03', title: 'Presión en el talón', tag: 'Clasificación', difficulty: 'Intermedio', time: '5 min',
    patient: 'Elena, 82 años', history: 'Movilidad reducida. Lesión abierta, superficial, con dermis expuesta, sin esfacelo visible.',
    wound: { site: 'Talón', bed: 'Rosado húmedo', drainage: 'Bajo', edge: 'Superficial', visual: 'pressure' },
    scene: 'Clasifica, protege y quita la presión: las tres decisiones van juntas.',
    steps: [
      choice('Clasifica la lesión', '¿Qué categoría describe mejor este hallazgo?', [option('stage2','Lesión por presión categoría 2'),option('stage1','Categoría 1: eritema no blanqueable'),option('stage3','Categoría 3: pérdida de espesor total')], 'stage2', 'La pérdida parcial de piel con dermis expuesta corresponde a categoría 2; no hay datos de tejido profundo ni escara que oculte el lecho.', 'pressure', 'Dermis expuesta sin tejido profundo: ¿qué espesor de piel se perdió?'),
      patch('Elige cobertura', 'La lesión es superficial, limpia y con exudado bajo.', ['hydrocolloid','alginate','hydrogel'], 'hydrocolloid', 'Una cobertura que mantenga humedad y proteja puede ser apropiada. La guía no impone una marca ni una familia única.', 'pressure', 'Lesión superficial, limpia y con exudado bajo.'),
      choice('Acción imprescindible', '¿Qué intervención no puede omitirse?', [option('offload','Descargar el talón y planificar cambios posturales'),option('padding','Poner un apósito más grueso como almohadilla y mantener la postura'),option('donut','Elevar el talón con un rodete tipo dona')], 'offload', 'Sin alivio sostenido de la presión, el apósito por sí solo no resuelve la causa.', 'pressure', 'Ningún apósito sustituye el tratamiento de la causa.'),
    ],
  },
  {
    id: 'm2-b', module: 'm2', number: '04', title: 'El método TIME', tag: 'Evaluación', difficulty: 'Intermedio', time: '5 min',
    patient: 'Tomás, 58 años', history: 'Herida crónica con esfacelo, exudado abundante y piel perilesional macerada. Afebril.',
    wound: { site: 'Tobillo', bed: 'Esfacelo', drainage: 'Abundante', edge: 'Macerado', visual: 'slough' },
    scene: 'Observa tejido, infección/inflamación, humedad y borde antes de cubrir.',
    steps: [
      select('Registra TIME', 'Marca los DOS problemas directamente visibles que exigen un plan del lecho.', [option('tissue','Tejido desvitalizado'),option('moisture','Exceso de humedad'),option('systemic','Infección sistémica'),option('undermined','Borde socavado')], ['tissue','moisture'], 'Hay esfacelo y maceración. No hay datos de fiebre ni hueso expuesto en este caso.', 'timers', 'Marca solo lo que el expediente describe.'),
      patch('Maneja humedad', 'Mientras el equipo valora el desbridamiento, ¿qué material puede absorber exudado abundante?', ['alginate','hydrogel','hydrocolloid'], 'alginate', 'El alginato puede absorber exudado abundante; suele requerir cobertura secundaria y revisión de la piel perilesional.', 'exudate', 'Exudado abundante y maceración: ¿qué material retiene líquido?'),
      choice('Reevalúa la causa', 'Antes de concluir “herida infectada”, ¿qué corresponde hacer?', [option('assess','Buscar signos clínicos y valorar etiología y perfusión'),option('swab','Cultivo con hisopo y antibiótico si sale positivo'),option('topical','Antimicrobiano tópico por la presencia de esfacelo')], 'assess', 'El enfoque TIME complementa, pero no sustituye, la evaluación de causa, perfusión y signos clínicos de infección.', 'leg', 'El esfacelo y la maceración no son, por sí solos, signos de infección.'),
    ],
  },
  {
    id: 'm3-a', module: 'm3', number: '05', title: 'Corte agudo limpio', tag: 'Herida aguda', difficulty: 'Inicial', time: '4 min',
    patient: 'Nadia, 27 años', history: 'Corte reciente de cocina. Hemorragia controlada. Sin cuerpo extraño visible. Vacunación antitetánica por verificar.',
    wound: { site: 'Mano', bed: 'Limpio', drainage: 'Bajo', edge: 'Lineal', visual: 'linear' },
    scene: 'En la herida aguda, la evaluación inicial importa más que un apósito sofisticado.',
    steps: [
      select('Prioridades iniciales', 'Selecciona DOS acciones esenciales antes del cierre o la cobertura.', [option('irrigate','Irrigar y explorar la herida'),option('tetanus','Verificar estado antitetánico'),option('antibiotic','Antibiótico oral profiláctico por ser herida de cocina'),option('peroxide','Aplicar agua oxigenada dentro del lecho')], ['irrigate','tetanus'], 'La limpieza/exploración y la profilaxis antitetánica según historia son parte de la valoración; antibióticos no son universales.', 'tetanus', 'Antes de cubrir: limpieza, exploración y el dato de vacunación pendiente.'),
      patch('Cubre sin excederte', 'Herida limpia y de exudado bajo en la mano, tras el manejo inicial. ¿Qué cobertura es adecuada?', ['contact','hydrocolloid','alginate'], 'contact', 'Un apósito no adherente protege y se retira sin dañar el tejido nuevo; los apósitos avanzados no aportan beneficio en un corte limpio.', 'cuts', 'Herida limpia en la mano: protege sin pegarse al lecho.'),
      choice('Señal de alarma', 'Si aparece pérdida de sensibilidad o limitación de movimiento, ¿qué sigue?', [option('refer','Evaluación urgente de lesión profunda'),option('watch','Vigilar 48 h y reevaluar si persiste'),option('splint','Inmovilizar con férula y cita rutinaria en una semana')], 'refer', 'Un posible daño neurovascular o tendinoso requiere exploración profesional, no solo cambio de cobertura.', 'cuts', 'Sensibilidad y movimiento hablan de estructuras bajo la piel.'),
    ],
  },
  {
    id: 'm3-b', module: 'm3', number: '06', title: 'Incisión que empeora', tag: 'Sitio quirúrgico', difficulty: 'Avanzado', time: '5 min',
    patient: 'Marcos, 46 años', history: 'Día 7 tras cirugía abdominal. Eritema que se expande, dolor nuevo, secreción purulenta y 38.4 °C.',
    wound: { site: 'Abdomen', bed: 'Purulento', drainage: 'Moderado', edge: 'Eritematoso', visual: 'infected' },
    scene: 'Una complicación postquirúrgica no se resuelve escogiendo la foto de un parche.',
    steps: [
      choice('Reconoce la complicación', '¿Cuál es el siguiente paso más seguro?', [option('urgent','Valoración quirúrgica pronta y evaluación de infección'),option('oral','Antibiótico oral y revisión en 7 días'),option('swab','Cultivo con hisopo y esperar el resultado antes de valorar')], 'urgent', 'Fiebre, secreción purulenta y eritema progresivo obligan a valorar infección del sitio quirúrgico y posible necesidad de drenaje.', 'surgical', 'Fiebre, pus y eritema que avanza: ¿basta un manejo ambulatorio?'),
      choice('Antibiótico contextualizado', 'Tras valoración, hay celulitis asociada. ¿Cómo se elige el antibiótico?', [option('guided','Según foco, gravedad, microbiología y resistencia local'),option('broadest','El de mayor espectro disponible para no fallar'),option('prophylaxis','El mismo que se usó en la profilaxis quirúrgica')], 'guided', 'NICE recomienda antibiótico que cubra organismos probables y tenga en cuenta microbiología y patrones locales; el juego no prescribe un fármaco o dosis universal.', 'surgical', 'Piensa en qué datos del paciente y del hospital cambian la elección.'),
      patch('Cuidado local', 'Tras drenaje y decisión del equipo, queda herida abierta con exudado moderado. ¿Qué cobertura puede manejarlo?', ['foam','hydrogel','film'], 'foam', 'Una espuma puede proteger y absorber; se ajusta al lecho, la piel y el plan de curaciones.', 'surgical', 'Herida abierta con exudado moderado.'),
    ],
  },
  {
    id: 'm4-a', module: 'm4', number: '07', title: 'Pie diabético sin infección', tag: 'Pie diabético', difficulty: 'Intermedio', time: '5 min',
    patient: 'Joel, 61 años', history: 'Úlcera plantar neuropática; sin eritema, calor, dolor nuevo, pus ni fiebre. Camina sobre la zona.',
    wound: { site: 'Planta del pie', bed: 'Granulación', drainage: 'Bajo', edge: 'Calloso', visual: 'foot' },
    scene: 'La clave no es buscar un antibiótico: es identificar lo que impide cicatrizar.',
    steps: [
      choice('Clasifica infección', '¿Cómo se interpreta la información actual?', [option('uninfected','Úlcera sin infección clínica evidente'),option('mild','Infección leve por el callo y el apoyo continuo'),option('osteo','Osteomielitis probable por la localización plantar')], 'uninfected', 'La infección del pie diabético se diagnostica clínicamente, no por la sola presencia de una úlcera.', 'idsa', 'Revisa los signos locales y sistémicos del expediente: ¿hay alguno?'),
      choice('Antibiótico', '¿Qué decisión concuerda con IWGDF/IDSA?', [option('none','No antibiótico para úlcera no infectada'),option('oral','Antibiótico oral corto para prevenir infección en diabéticos'),option('topical','Antimicrobiano tópico para acelerar el cierre')], 'none', 'La guía indica no usar antibióticos sistémicos ni locales para promover la curación o prevenir infección en úlceras clínicamente no infectadas.', 'idsa', 'IWGDF distingue úlcera infectada de no infectada.'),
      choice('Intervención de mayor impacto', 'Se confirma úlcera plantar neuropática en antepié, sin contraindicaciones conocidas. ¿Qué debe valorar el equipo?', [option('offload','Dispositivo de descarga apropiado y evaluación vascular'),option('shoe','Calzado terapéutico removible como primera opción'),option('rest','Reposo en cama sin dispositivo')], 'offload', 'La descarga efectiva es central; IWGDF recomienda como primera opción un dispositivo no removible hasta la rodilla en casos elegibles.', 'offload', '¿Cuál es la primera opción de descarga en una úlcera plantar de antepié elegible?'),
    ],
  },
  {
    id: 'm4-b', module: 'm4', number: '08', title: 'Pie diabético infectado', tag: 'Antimicrobianos', difficulty: 'Avanzado', time: '6 min',
    patient: 'Patricia, 65 años', history: 'Úlcera plantar con eritema local, calor, dolor y pus. Sin fiebre ni compromiso sistémico; perfusión y alergias aún por evaluar.',
    wound: { site: 'Planta del pie', bed: 'Exudado purulento', drainage: 'Moderado', edge: 'Inflamado', visual: 'infected' },
    scene: 'Distingue infección leve de una situación que exige hospitalización.',
    steps: [
      choice('Confirma el problema', '¿Cuál es la lectura más probable con estos datos?', [option('infected','Infección clínica; clasificar gravedad y evaluar perfusión'),option('colonized','Colonización: sin fiebre no hay infección'),option('severe','Infección grave que exige ingreso inmediato')], 'infected', 'Los signos locales apoyan infección clínica aunque no haya fiebre; gravedad, perfusión y profundidad modifican el plan.', 'idsa', 'Cuenta los signos locales; después busca signos sistémicos.'),
      select('Antes del antibiótico', 'Selecciona DOS datos que cambian la elección antimicrobiana.', [option('allergy','Alergias y función renal'),option('culture','Cultivo de tejido apropiado si está indicado'),option('swab','Cultivo con hisopo superficial del exudado'),option('size','Tamaño de la úlcera como criterio principal')], ['allergy','culture'], 'La elección depende de seguridad del paciente y, cuando proceda, una muestra adecuada; también influyen gravedad, exposición previa y resistencias locales.', 'idsa', '¿Qué datos del paciente y de la muestra cambian el fármaco?'),
      choice('Antibiótico: ejemplo guiado', 'Se confirma infección leve, sin alergia a betalactámicos ni antibióticos recientes; no hay datos de infección profunda. Según la tabla IWGDF, ¿qué opción empírica oral es razonable para que el equipo la valore?', [option('cephalexin','Cefalexina o cloxacilina, según disponibilidad y resistencia local'),option('pseudo','Ciprofloxacino para cubrir Pseudomonas'),option('ivamox','Amoxicilina-clavulánico IV con ingreso')], 'cephalexin', 'IWGDF propone una cefalosporina de primera generación (p. ej., cefalexina) o penicilina resistente a penicilinasa (p. ej., cloxacilina) para infección leve sin complicaciones. No es receta: confirmar alergias, perfusión, función renal, cultivos y protocolo local.', 'iwgdfTable', 'Infección leve, sin factores de riesgo para gramnegativos.'),
    ],
  },
  {
    id: 'm4-c', module: 'm4', number: '09', title: 'Úlcera venosa, pierna húmeda', tag: 'Herida crónica', difficulty: 'Intermedio', time: '5 min',
    patient: 'Sofía, 73 años', history: 'Úlcera maleolar superficial, edema, pigmentación ocre y exudado alto. Sin celulitis ni fiebre.',
    wound: { site: 'Maléolo medial', bed: 'Granulación', drainage: 'Abundante', edge: 'Irregular', visual: 'round' },
    scene: 'Controla el exudado, pero no olvides la causa venosa ni la circulación arterial.',
    steps: [
      choice('Antes de comprimir', '¿Qué valoración es clave antes de compresión fuerte?', [option('vascular','Evaluación arterial / índice tobillo-brazo según contexto'),option('culture','Cultivo superficial por el exudado alto'),option('venousdoppler','Doppler venoso antes de cualquier otra prueba')], 'vascular', 'La compresión fuerte puede dañar si hay enfermedad arterial. Debe evaluarse la perfusión y las contraindicaciones.', 'abpi', '¿Qué puede hacer peligrosa la compresión?'),
      patch('Selecciona apósito', 'Exudado alto y piel perilesional en riesgo de maceración. ¿Qué material absorbente es una opción?', ['alginate','hydrogel','hydrocolloid'], 'alginate', 'El alginato puede absorber exudado abundante; hay que proteger piel perilesional y usar cobertura secundaria apropiada.', 'exudate', 'Exudado alto y piel en riesgo de maceración.'),
      choice('Trata la causa', 'El índice tobillo-brazo es 0,9 y no hay contraindicaciones. ¿Qué intervención trata la causa de esta úlcera?', [option('compression','Compresión terapéutica según ITB y tolerancia'),option('dependent','Reposo con la pierna en declive'),option('dressingonly','Solo apósito absorbente hasta el cierre')], 'compression', 'La compresión trata la hipertensión venosa que mantiene abierta la úlcera; el apósito solo maneja el exudado. Nivel y sistema se ajustan al ITB, la tolerancia y el protocolo local.', 'venous', 'Edema y pigmentación ocre: ¿cuál es la causa y cómo se trata?'),
    ],
  },
  {
    id: 'm4-d', module: 'm4', number: '10', title: 'Pie frío, pulso ausente', tag: 'Isquemia', difficulty: 'Experto', time: '5 min',
    patient: 'Andrés, 70 años', history: 'Diabetes y herida en un dedo del pie. Dolor en reposo, pie frío, piel pálida y pulso pedio no palpable.',
    wound: { site: 'Dedo del pie', bed: 'Pálido', drainage: 'Escaso', edge: 'Seco', visual: 'ischemic' },
    scene: 'La perfusión es una condición para cicatrizar. Evita que un apósito o antibiótico retrasen la evaluación vascular.',
    steps: [
      choice('Reconoce el riesgo', '¿Cuál es la prioridad ante dolor en reposo y signos de hipoperfusión?', [option('vascular','Evaluación vascular urgente y valoración de viabilidad del miembro'),option('debride','Desbridamiento cortante para estimular la cicatrización'),option('compress','Compresión para reducir el edema')], 'vascular', 'Los datos sugieren isquemia potencialmente amenazante. La guía IWGDF recomienda evaluación vascular en personas con diabetes y úlcera del pie.', 'pad', 'Dolor en reposo, pie frío y sin pulso.'),
      choice('¿Antibiótico por palidez?', 'No hay eritema, pus, calor ni fiebre. ¿Qué corresponde?', [option('none','No tratar la isquemia con antibiótico sin infección clínica'),option('broad','Antibiótico empírico porque la isquemia favorece la infección'),option('topical','Antibiótico tópico por riesgo de gangrena')], 'none', 'La ausencia de infección clínica no justifica antibióticos; la amenaza principal aquí es vascular.', 'idsa', '¿Hay eritema, pus, calor o fiebre?'),
      choice('Plan completo', 'Además de proteger la herida, ¿qué dato debe documentarse y seguirse?', [option('perfusion','Perfusión, dolor, progresión tisular y respuesta al plan vascular'),option('size','Solo el tamaño de la herida en cada cura'),option('glucose','Solo la glucemia capilar')], 'perfusion', 'La valoración y el seguimiento de perfusión y viabilidad dirigen el manejo; un producto local no resuelve la isquemia.', 'pad', '¿Qué determina si este pie puede cicatrizar?'),
    ],
  },
  {
    id: 'm4-e', module: 'm4', number: '11', title: 'Antibióticos con contexto', tag: 'Guía NICE', difficulty: 'Avanzado', time: '5 min',
    patient: 'Beatriz, 72 años', history: 'Escenario docente situado en Reino Unido. Úlcera venosa con celulitis local que se extiende, dolor nuevo y calor; no está gravemente enferma. Sin alergias conocidas ni embarazo.',
    wound: { site: 'Pierna', bed: 'Granulación', drainage: 'Moderado', edge: 'Eritema extendido', visual: 'infected' },
    scene: 'La guía orienta, pero el lugar, la alergia y la evolución modifican el tratamiento.',
    steps: [
      choice('¿Hay indicación?', 'Con signos de infección que se extienden fuera de la úlcera, ¿qué plantea NICE NG152?', [option('offer','Ofrecer antibiótico tras valoración clínica'),option('topical','Solo antimicrobiano tópico'),option('culture','Tratar solo si un cultivo superficial es positivo')], 'offer', 'NICE recomienda antibiótico en úlcera de pierna cuando hay signos clínicos de infección, como eritema extendido, calor, dolor creciente o fiebre.', 'leg', 'La infección ya se extiende fuera de la úlcera.'),
      choice('Primera opción de la guía', 'Para este adulto en Reino Unido, estable y sin alergia a penicilina, ¿qué antibiótico oral lista NICE como primera opción?', [option('fluclox','Flucloxacilina, sujeta a valoración y protocolo local'),option('amox','Amoxicilina sola'),option('clari','Claritromicina')], 'fluclox', 'La tabla NICE NG152 enumera flucloxacilina como primera opción oral en este contexto británico. No debe extrapolarse de forma automática a otros países o pacientes.', 'leg', 'Sin alergia a penicilina.'),
      choice('Revisión de respuesta', 'Si la celulitis empeora rápidamente o no empieza a mejorar en 2–3 días, ¿qué corresponde?', [option('reassess','Reevaluar gravedad, adherencia, complicaciones y tratamiento'),option('finish','Completar 7 días antes de revisar'),option('add','Añadir un segundo antibiótico sin reevaluar')], 'reassess', 'NICE indica reevaluar si la infección empeora o no comienza a mejorar; valorar necesidad de derivación y ajustar tratamiento con datos clínicos y microbiológicos.', 'leg', '2–3 días sin mejoría es una señal.'),
    ],
  },
  {
    id: 'm5-a', module: 'm5', number: '12', title: 'Presión negativa bien indicada', tag: 'NPWT', difficulty: 'Avanzado', time: '6 min',
    patient: 'Diego, 52 años', history: 'Herida compleja tras desbridamiento quirúrgico. Hemostasia conseguida; exudado abundante; equipo especializado considera NPWT.',
    wound: { site: 'Pierna', bed: 'Viable', drainage: 'Abundante', edge: 'Protegido', visual: 'round' },
    scene: 'NPWT no es un parche universal: verifica indicación, seguridad y respuesta.',
    steps: [
      select('Lista de seguridad', 'Antes de iniciar, selecciona DOS comprobaciones críticas.', [option('hemostasis','Hemostasia y riesgo de sangrado'),option('structures','Estructuras expuestas / protección tisular'),option('culture','Cultivo negativo del lecho antes de iniciar'),option('dry','Esperar a que el exudado cese')], ['hemostasis','structures'], 'La seguridad exige valorar sangrado y evitar contacto directo del material con vasos u órganos expuestos.', 'fda', '¿Qué podría dañar la succión directamente?'),
      patch('Dispositivo', 'El equipo confirma indicación y seguridad. ¿Qué sistema corresponde a esta estrategia?', ['npwt','alginate','foam'], 'npwt', 'La terapia de presión negativa es un sistema, no un simple apósito. Debe instalarse y monitorizarse según protocolo.', 'fda', 'El equipo ya confirmó la indicación y la seguridad.'),
      choice('Monitorización', '¿Qué harías si el sello falla y la bomba alarma repetidamente?', [option('inspect','Inspeccionar el sistema y contactar al equipo responsable'),option('increase','Subir la presión para compensar la fuga'),option('remove','Retirar la NPWT y dejar gasa seca sin avisar')], 'inspect', 'La pérdida de sello impide la terapia prevista y requiere revisión del sistema, la piel y el plan.', 'fda', 'La alarma indica que la terapia no está funcionando como se indicó.'),
    ],
  },
  {
    id: 'm5-b', module: 'm5', number: '13', title: 'Alarma roja en NPWT', tag: 'Seguridad', difficulty: 'Experto', time: '4 min',
    patient: 'Iván, 67 años', history: 'NPWT en herida postoperatoria. Aparece sangre roja brillante en tubo y colector, con mareo.',
    wound: { site: 'Muslo', bed: 'No visible', drainage: 'Sangrado activo', edge: 'Bajo sello', visual: 'npwt' },
    scene: 'Aquí la puntuación pasa a segundo plano: identifica una urgencia.',
    steps: [
      choice('Prioridad absoluta', '¿Qué acción inmediata es la más segura?', [option('stop','Detener NPWT y activar atención urgente por sangrado'),option('lower','Bajar la presión y observar 30 minutos'),option('canister','Cambiar el colector y continuar la terapia')], 'stop', 'La sangre roja brillante o sangrado súbito requiere suspender la terapia y atención inmediata; seguir protocolo local de hemorragia.', 'fda', 'Sangre roja brillante con mareo: ¿es estable?'),
      choice('Después de estabilizar', '¿Qué debe revisar el equipo antes de plantear reinicio?', [option('cause','Fuente del sangrado, hemostasia y contraindicaciones'),option('lowrestart','Reiniciar con presión más baja tras cambiar el apósito'),option('bprestart','Reiniciar cuando se normalice la tensión arterial')], 'cause', 'La causa y el riesgo hemorrágico deben abordarse antes de reiniciar; no basta con cambiar el equipo.', 'fda', 'Estabilizar no es lo mismo que resolver la causa.'),
      choice('Comunicación', '¿Qué información debes transmitir de forma prioritaria?', [option('blood','Inicio, cantidad aproximada, color del drenaje y signos vitales'),option('settings','Solo la presión programada y el modo de la bomba'),option('measure','Esperar a medir el volumen exacto antes de llamar')], 'blood', 'Un reporte estructurado acelera la evaluación y la respuesta a la urgencia.', 'fda', '¿Qué necesita saber quien recibe la llamada para priorizar?'),
    ],
  },
  {
    id: 'ost-a', module: 'ost', number: '14', title: 'Fuga bajo la barrera', tag: 'Ostomía', difficulty: 'Intermedio', time: '5 min',
    patient: 'Clara, 55 años', history: 'Ileostomía. Ardor, picazón y eritema periestomal. La placa muestra efluente por debajo del adhesivo.',
    wound: { site: 'Piel periestomal', bed: 'Eritema húmedo', drainage: 'Fuga', edge: 'Irritado', visual: 'stoma' },
    scene: 'La piel irritada no mejorará mientras el efluente siga filtrándose.',
    steps: [
      choice('Identifica la causa', '¿Qué hallazgo explica mejor la lesión?', [option('leak','Fuga con exposición de piel al efluente'),option('allergy','Alergia al adhesivo de la placa'),option('fungal','Infección fúngica periestomal')], 'leak', 'La guía WOCN recomienda retirar el sistema, observar la cara adhesiva y localizar socavación o fuga.', 'ostomy', '¿Qué muestra la cara adhesiva de la placa retirada?'),
      patch('Reinstala el sistema', 'Tras limpiar con agua y valorar la piel, elige la pieza central del plan.', ['ostomy','hydrocolloid','film'], 'ostomy', 'Una bolsa con barrera bien ajustada al tamaño del estoma reduce el contacto del efluente con la piel; se individualiza el accesorio.', 'ostomy', 'La piel no mejora mientras el efluente siga llegando a ella.'),
      choice('Seguimiento', 'Si la fuga persiste o hay pliegues/retracción, ¿qué sigue?', [option('specialist','Reevaluar ajuste y consultar a enfermería experta en ostomías'),option('often','Cambiar la placa cada 12 horas para evitar fugas'),option('wide','Recortar la abertura bastante más grande que el estoma')], 'specialist', 'La geometría del estoma, los pliegues y el contorno pueden exigir convexidad u otros accesorios indicados por un profesional.', 'ostomy', 'Pliegues y retracción cambian la forma del contorno.'),
    ],
  },
  {
    id: 'ost-b', module: 'ost', number: '15', title: 'El estoma cambia de color', tag: 'Alerta quirúrgica', difficulty: 'Experto', time: '4 min',
    patient: 'Marta, 64 años', history: 'Colostomía reciente. El estoma, antes rojo y húmedo, ahora se observa morado oscuro y doloroso.',
    wound: { site: 'Estoma', bed: 'Morado oscuro', drainage: 'Variable', edge: 'Edematoso', visual: 'stomaDark' },
    scene: 'Un cambio de color no se corrige cambiando la bolsa.',
    steps: [
      choice('Identifica la prioridad', '¿Qué debes hacer ante este cambio de color?', [option('urgent','Avisar de inmediato al equipo quirúrgico / valoración urgente'),option('document','Documentar y revisar en el próximo cambio de bolsa'),option('warm','Aplicar compresas tibias y reevaluar en 24 h')], 'urgent', 'Un estoma que se vuelve morado o negro puede indicar isquemia y precisa valoración inmediata.', 'stomaAlert', 'Un estoma morado oscuro sugiere un problema de riego.'),
      choice('Comunicación clínica', '¿Qué información es más útil transmitir?', [option('status','Color previo y actual, momento del cambio, dolor, salida y signos vitales'),option('size','Solo la medida actual del estoma'),option('output','Solo el volumen de salida')], 'status', 'La evolución del color y la función del estoma permiten priorizar una posible complicación vascular.', 'stomaAlert', '¿Qué permite al cirujano saber cuán rápido avanza?'),
      choice('Antibiótico', '¿Cuál es el papel de un antibiótico empírico decidido solo por el cambio de color?', [option('notfix','No corrige isquemia; primero evaluación urgente de la causa'),option('empiric','Antibiótico empírico como medida principal mientras llega el cirujano'),option('topical','Antibiótico tópico sobre el estoma')], 'notfix', 'El oscurecimiento puede reflejar perfusión comprometida, que no se resuelve con un antibiótico por sí solo.', 'stomaAlert', '¿El problema es infeccioso o de perfusión?'),
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
