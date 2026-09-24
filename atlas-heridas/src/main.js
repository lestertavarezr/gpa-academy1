import './fonts.js';
import './style.css';
import { modules, cases, dressings, sources, moduleNote } from './data.js';

const app = document.getElementById('app');
const key = 'atlas-heridas-v1';
let progress;
try { progress = JSON.parse(localStorage.getItem(key)) || { completed: {}, xp: 0 }; }
catch { progress = { completed: {}, xp: 0 }; }
progress.completed ||= {};
progress.xp ||= 0;
const state = { page: 'home', module: 'all', caseId: null, step: 0, picks: [], feedback: null, misses: 0, score: 0, first: 0, menu: false, order: [] };
const E = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const byId = id => cases.find(c => c.id === id);
const current = () => byId(state.caseId);
const currentStep = () => current().steps[state.step];
const moduleFor = c => modules.find(m => m.id === c.module);
const dressingFor = id => dressings.find(d => d.id === id);
const imageAlt = d => (d.source ? 'Fotografía de ' : 'Ilustración de ') + E(d.name);
const optionId = o => typeof o === 'string' ? o : o.id;
const correctIds = step => Array.isArray(step.correct) ? step.correct : [step.correct];
const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// El orden se baraja al entrar en cada decisión y se guarda en el estado para que no cambie al redibujar.
const orderedOptions = step => state.order.map(id => step.options.find(o => optionId(o) === id));
const MAX_ATTEMPTS = 2;
const GENERIC_HINT = 'Vuelve a leer el expediente y la valoración del lecho: ¿qué dato cambia la decisión? Tienes un intento más.';
function optionState(step, id) {
  const chosen = state.picks.includes(id), fb = state.feedback;
  const cls = chosen ? ['chosen'] : [];
  if (fb?.final && correctIds(step).includes(id)) cls.push('is-correct');
  else if (fb && chosen && !fb.correct) cls.push('is-wrong');
  return cls.join(' ');
}
function saveProgress() { try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* almacenamiento no disponible: el juego sigue funcionando */ } }
const I = (name, size=20) => {
  const paths = { arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>', back:'<path d="M19 12H5m6 6-6-6 6-6"/>', pulse:'<path d="M2 12h4l2-5 4 10 2-5h8"/>', check:'<path d="m4 12 5 5L20 6"/>', image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>', book:'<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2"/>', shield:'<path d="M12 2 4 5v6c0 5 3 8 8 11 5-3 8-6 8-11V5l-8-3Z"/><path d="m8 12 3 3 5-6"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', alert:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>', target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>' };
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.pulse)+'</svg>';
};
const btn = (action, label, cls='primary', id='') => '<button class="btn btn-'+cls+'" data-action="'+action+'"'+(id?' data-id="'+id+'"':'')+'>'+label+'</button>';
const link = id => '<a href="'+sources[id].url+'" target="_blank" rel="noopener noreferrer">'+E(sources[id].label)+' ↗</a>';

function shell(body) {
  const done = Object.keys(progress.completed).length;
  return '<div class="shell"><aside class="sidebar '+(state.menu?'open':'')+'">'+
    '<button class="brand" data-action="home"><span class="brand-mark">A<i></i></span><span><strong>ATLAS</strong><small>WOUND LAB / GPA</small></span></button>'+
    '<div class="nav-label">EXPLORAR</div>'+
    '<button class="nav-item '+(state.page==='home'?'active':'')+'" data-action="home">'+I('target')+' Panel de misiones</button>'+
    '<button class="nav-item '+(state.page==='library'?'active':'')+'" data-action="library">'+I('image')+' Biblioteca de apósitos</button>'+
    '<button class="nav-item '+(state.page==='evidence'?'active':'')+'" data-action="evidence">'+I('book')+' Guías y seguridad</button>'+
    '<div class="nav-label modules-label">RUTAS CLÍNICAS</div>'+
    modules.map(m=>'<button class="nav-item '+(state.page==='home'&&state.module===m.id?'active':'')+'" data-action="module" data-id="'+m.id+'"><span class="module-glyph" style="--glyph:'+m.color+'">'+m.icon+'</span>'+E(m.name)+'<b class="nav-count">'+cases.filter(c=>c.module===m.id).length+'</b></button>').join('')+
    '<div class="sidebar-bottom"><div class="level-pill">'+I('pulse',17)+' Nivel '+(Math.floor(progress.xp/500)+1)+' <strong>'+progress.xp+' XP</strong></div><div class="level-track"><i style="width:'+(progress.xp%500/5)+'%"></i></div><p>'+done+' de '+cases.length+' misiones completadas</p>'+(done?'<button class="reset-link" data-action="reset">Reiniciar progreso</button>':'')+'</div></aside>'+
    '<div class="main-shell"><header class="topbar"><button class="mobile-menu" data-action="menu" aria-label="Abrir menú" aria-expanded="'+state.menu+'">☰</button><span>GPA ACADEMY <i>/</i> MANEJO DE HERIDAS Y OSTOMÍAS</span><strong><span class="status-dot"></span> SIMULACIÓN FORMATIVA</strong></header>'+body+'</div>'+
    '<div class="mobile-scrim '+(state.menu?'visible':'')+'" data-action="menu"></div></div>';
}

function card(c) {
  const m=moduleFor(c), done=progress.completed[c.id];
  return '<button class="case-card" data-action="start" data-id="'+c.id+'" style="--case-accent:'+m.color+'"><div class="card-top"><span>CASO '+c.number+'</span><span class="card-status '+(done?'is-done':'')+'">'+(done?'✓ COMPLETADO':'DISPONIBLE')+'</span></div><div class="card-icon">'+m.icon+'</div><div class="card-tag">'+E(m.name)+' <i>·</i> '+E(c.tag)+'</div><h3>'+E(c.title)+'</h3><p>'+E(c.scene)+'</p><div class="card-bottom"><span>'+I('clock',15)+' '+E(c.time)+' · '+E(c.difficulty)+'</span><span class="card-arrow">'+I('arrow',19)+'</span></div></button>';
}

function home() {
  const filter=state.module, m=modules.find(x=>x.id===filter), selected=filter==='all'?cases:cases.filter(c=>c.module===filter);
  const next=cases.find(c=>!progress.completed[c.id])||cases[0];
  return shell('<main class="page home-page"><section class="hero"><div class="hero-art"><div class="ring one"></div><div class="ring two"></div><div class="hero-core"><span>ATLAS</span><b>WOUND LAB</b></div><span class="hero-cross">✚</span></div><div class="hero-copy"><div class="eyebrow">LABORATORIO CLÍNICO INTERACTIVO</div><h1>Aprende a leer<br><em>cada herida.</em></h1><p>Analiza casos, reconoce señales de alarma y construye un plan de cuidado. Cada decisión cambia tu informe de desempeño.</p><div class="hero-actions">'+btn('start','Continuar entrenamiento '+I('arrow',18),'primary',next.id)+btn('library','Explorar apósitos '+I('image',18),'ghost')+'</div><div class="hero-metrics"><div><strong>'+cases.length+'</strong><span>casos clínicos</span></div><div><strong>'+modules.length+'</strong><span>rutas</span></div><div><strong>'+Object.keys(progress.completed).length+'</strong><span>resueltos</span></div></div></div></section>'+
    '<div class="section-head"><div><div class="eyebrow muted">ELIGE TU RUTA</div><h2>'+(m?E(m.name):'Misiones clínicas')+'</h2><p>'+(m?E(moduleNote[m.id]):'De la valoración inicial al manejo seguro. Puedes entrar a cualquier caso.')+'</p></div><button class="text-link" data-action="evidence">Ver metodología '+I('arrow',16)+'</button></div>'+
    '<div class="filters"><button class="filter '+(filter==='all'?'selected':'')+'" data-action="module" data-id="all">Todas <span>'+cases.length+'</span></button>'+modules.map(m=>'<button class="filter '+(filter===m.id?'selected':'')+'" data-action="module" data-id="'+m.id+'">'+E(m.name)+' <span>'+cases.filter(c=>c.module===m.id).length+'</span></button>').join('')+'</div>'+
    '<div class="case-grid">'+selected.map(card).join('')+'</div><div class="safety-strip">'+I('shield',23)+'<div><strong>Un espacio para practicar sin riesgo.</strong><span>Casos ficticios. No diagnostica pacientes reales ni emite recetas; aplica siempre valoración profesional y protocolos locales.</span></div></div></main>');
}

function woundSVG(type) {
  const shapes={
    linear:'<path d="M173 80 C190 112 174 145 194 183 C205 202 193 218 211 239" stroke="#8e4543" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M175 80 C192 112 176 145 196 183 C207 202 195 218 213 239" stroke="#c37c75" stroke-width="4" stroke-linecap="round" fill="none"/>',
    round:'<path d="M190 79 C225 74 253 105 256 141 C263 181 231 218 198 223 C157 219 136 183 143 140 C148 103 162 84 190 79Z" fill="#9e5250"/><path d="M188 101 C221 96 239 122 240 150 C239 183 219 202 195 203 C164 200 154 179 157 151 C159 122 169 107 188 101Z" fill="#d38d80"/>',
    pressure:'<ellipse cx="200" cy="150" rx="78" ry="67" fill="#a65c58"/><ellipse cx="200" cy="150" rx="58" ry="48" fill="#dc9486"/><ellipse cx="200" cy="150" rx="41" ry="34" fill="#e8aa9a"/>',
    slough:'<ellipse cx="200" cy="150" rx="77" ry="70" fill="#9a574b"/><ellipse cx="200" cy="150" rx="61" ry="52" fill="#d1a66c"/><path d="M166 144 Q189 115 224 144 Q235 175 192 185 Q158 175 166 144" fill="#e5c48c"/>',
    foot:'<ellipse cx="200" cy="150" rx="70" ry="80" fill="#a65d55"/><ellipse cx="200" cy="150" rx="54" ry="60" fill="#d4927e"/><ellipse cx="199" cy="152" rx="25" ry="22" fill="#8f5547"/><ellipse cx="199" cy="152" rx="13" ry="11" fill="#e3a79c"/>',
    infected:'<ellipse cx="200" cy="150" rx="80" ry="72" fill="#b9534c"/><ellipse cx="200" cy="150" rx="57" ry="50" fill="#df8d70"/><ellipse cx="200" cy="150" rx="29" ry="24" fill="#e7c087"/>',
    bleeding:'<ellipse cx="200" cy="150" rx="81" ry="73" fill="#a84342"/><ellipse cx="200" cy="150" rx="56" ry="51" fill="#d45d56"/><path d="M192 153 C189 175 181 186 190 205 C205 181 212 170 203 153Z" fill="#f08177"/>',
    ischemic:'<ellipse cx="200" cy="150" rx="66" ry="74" fill="#c9b3a6"/><ellipse cx="200" cy="152" rx="30" ry="26" fill="#8a6d5f"/><ellipse cx="200" cy="152" rx="17" ry="14" fill="#5e4a41"/><path d="M178 132 q22 -10 44 0" stroke="#a88f82" stroke-width="3" fill="none"/>',
    npwt:'<rect x="112" y="78" width="176" height="146" rx="18" fill="#e9eef0" fill-opacity=".85" stroke="#9fb3ba" stroke-width="3"/><rect x="146" y="104" width="108" height="94" rx="10" fill="#3b3f45"/><path d="M200 104 C200 70 260 58 330 40" stroke="#b64a48" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M200 104 C200 70 260 58 330 40" stroke="#e0706a" stroke-width="4" fill="none" stroke-linecap="round"/>',
    stomaDark:'<circle cx="200" cy="150" r="80" fill="#d49b85"/><circle cx="200" cy="150" r="49" fill="#b98a8f"/><circle cx="200" cy="150" r="30" fill="#4b2a45"/><ellipse cx="190" cy="137" rx="10" ry="5" fill="#6d4462"/>',
    stoma:'<circle cx="200" cy="150" r="80" fill="#d49b85"/><circle cx="200" cy="150" r="49" fill="#d47878"/><circle cx="200" cy="150" r="30" fill="#ad434b"/><ellipse cx="188" cy="135" rx="11" ry="6" fill="#eaa29d"/>'
  };
  return '<svg class="wound-svg" viewBox="0 0 400 300" role="img" aria-label="Ilustración esquemática de la lesión"><defs><radialGradient id="skin"><stop offset="0%" stop-color="#e7bca5"/><stop offset="65%" stop-color="#dba994"/><stop offset="100%" stop-color="#b78170"/></radialGradient></defs><ellipse cx="200" cy="150" rx="163" ry="113" fill="url(#skin)"/>'+ (shapes[type]||shapes.round) +'</svg>';
}

function options(step) {
  const lock = state.feedback ? 'disabled' : '';
  if(step.kind==='dressing') return '<div class="panel-minihead">ARMARIO DE APÓSITOS <span>TOCA O ARRASTRA AL LECHO</span></div><div class="dressing-options">'+orderedOptions(step).map(id=>{const d=dressingFor(id), cls=optionState(step,id); return '<button class="dressing-option '+cls+'" draggable="'+!state.feedback+'" data-action="pick" data-id="'+id+'" aria-pressed="'+state.picks.includes(id)+'" '+lock+'><img src="'+d.image+'" alt="'+imageAlt(d)+'" width="64" height="62" loading="lazy"/><span><strong>'+E(d.name)+'</strong><small>'+E(d.detail)+'</small></span><i aria-hidden="true">'+(cls.includes('is-wrong')?'✕':cls.includes('is-correct')||state.picks.includes(id)?'✓':'+')+'</i></button>';}).join('')+'</div>';
  return (step.kind==='select'?'<div class="select-hint">'+I('target',16)+' Selecciona exactamente '+step.correct.length+' opciones.</div>':'')+
    '<div class="answers-panel">'+orderedOptions(step).map((o,n)=>{const cls=optionState(step,o.id); return '<button class="answer-option '+cls+'" data-action="pick" data-id="'+o.id+'" aria-pressed="'+state.picks.includes(o.id)+'" '+lock+'><span class="answer-key">'+String.fromCharCode(65+n)+'</span><span class="answer-copy"><strong>'+E(o.label)+'</strong></span><span class="answer-radio">'+(cls.includes('is-wrong')?I('alert',15):cls.includes('is-correct')||state.picks.includes(o.id)?I('check',15):'')+'</span></button>';}).join('')+'</div>';
}

function feedbackBlock(step) {
  const fb = state.feedback;
  if (!fb) return '';
  if (!fb.final) return '<div class="feedback bad" id="feedback" tabindex="-1" role="status"><strong>'+I('alert',18)+' Aún no es la mejor decisión</strong><p>'+E(step.hint || GENERIC_HINT)+'</p></div>';
  return '<div class="feedback '+(fb.correct?'good':'reveal')+'" id="feedback" tabindex="-1" role="status"><strong>'+I(fb.correct?'check':'alert',18)+(fb.correct?' Decisión fundamentada':' La opción correcta está resaltada')+'</strong><p>'+E(step.explanation)+'</p>'+link(step.source)+'</div>';
}

function game() {
  const c=current(), step=currentStep(), m=moduleFor(c), selected=step.kind==='dressing'?dressingFor(state.picks[0]):null;
  const bar=(state.step+(state.feedback?.final?1:0))/c.steps.length*100;
  return shell('<main class="page game-page"><div class="game-top"><button class="back-link" data-action="home">'+I('back',17)+' Volver a misiones</button><span>CASO '+c.number+' / '+E(m.name.toUpperCase())+'</span><span class="score-pill">'+I('pulse',16)+' '+state.score+' PTS</span></div>'+
    '<div class="game-header"><div><div class="eyebrow" style="color:'+m.color+'">MISIÓN '+c.number+' · '+E(c.tag.toUpperCase())+'</div><h1>'+E(c.title)+'</h1><p>'+E(c.scene)+'</p></div><div class="step-counter"><strong>'+String(state.step+1).padStart(2,'0')+' <span>/ '+String(c.steps.length).padStart(2,'0')+'</span></strong><small>DECISIÓN ACTUAL</small></div></div><div class="progress-track"><i style="width:'+bar+'%"></i></div>'+
    '<div class="game-grid"><aside class="patient-panel"><div class="panel-heading"><span class="panel-icon">'+I('pulse')+'</span><div><small>EXPEDIENTE SIMULADO</small><strong>'+E(c.patient)+'</strong></div></div><p class="patient-history">'+E(c.history)+'</p><div class="data-label">VALORACIÓN DEL LECHO</div><div class="patient-facts">'+Object.entries({Localización:c.wound.site,Tejido:c.wound.bed,Exudado:c.wound.drainage,Bordes:c.wound.edge}).map(([k,v])=>'<div><span>'+k+'</span><strong>'+E(v)+'</strong></div>').join('')+'</div><div class="chart-note">'+I('alert',18)+'<p>No introduzcas datos de pacientes reales. Escenario ficticio.</p></div></aside>'+
    '<div class="simulation"><div class="simulation-top"><strong><i></i> VISOR DE HERIDA</strong><span>ILUSTRACIÓN EDUCATIVA</span></div><div class="wound-stage '+(step.kind==='dressing'?'droppable':'')+'" data-dropzone="true">'+woundSVG(c.wound.visual)+(selected?'<div class="applied-dressing"><img src="'+selected.image+'" alt="'+E(selected.name)+' seleccionado"/><span>'+E(selected.name)+'</span></div>':step.kind==='dressing'?'<div class="drop-hint">'+I('target',21)+' Aplica aquí el apósito elegido</div>':'')+'</div><div class="simulation-footer"><span><i></i> '+E(c.wound.site)+'</span><span>NO ES DIAGNÓSTICO AUTOMÁTICO</span></div></div>'+
    '<section class="decision-panel"><div class="decision-head"><span>DECISIÓN '+(state.step+1)+' DE '+c.steps.length+'</span><b>'+(step.kind==='dressing'?'SELECCIÓN DE APÓSITO':step.kind==='select'?'SELECCIÓN MÚLTIPLE':'CRITERIO CLÍNICO')+'</b></div><h2>'+E(step.title)+'</h2><p class="decision-prompt">'+E(step.prompt)+'</p>'+options(step)+
    feedbackBlock(step)+
    '<div class="decision-actions">'+(state.feedback?.final?btn('next',(state.step===c.steps.length-1?'Ver informe final':'Siguiente decisión')+' '+I('arrow',18)):state.feedback?btn('retry','Intentar de nuevo '+I('arrow',18)):submitBtn(step))+'</div></section></div><div class="game-footer-note">'+I('shield',17)+' Las guías orientan el aprendizaje; en atención real aplica valoración profesional y protocolos locales.</div></main>');
}

function submitBtn(step) {
  const ready = state.picks.length && (step.kind!=='select' || state.picks.length===step.correct.length);
  return '<button class="btn btn-primary" data-action="submit"'+(ready?'':' disabled')+'>Confirmar decisión '+I('arrow',18)+'</button>';
}

function result() {
  const c=current(), total=c.steps.length*100, percent=Math.round(state.score/total*100), next=cases[cases.findIndex(x=>x.id===c.id)+1];
  return shell('<main class="page result-page"><button class="back-link" data-action="home">'+I('back',17)+' Panel de misiones</button><div class="result-wrap"><div class="result-badge'+(percent>=70?'':' needs-practice')+'">'+I(percent>=70?'check':'alert',34)+'</div><div class="eyebrow">INFORME DE MISIÓN · CASO '+c.number+'</div><h1>'+(percent===100?'Criterio excelente':percent>=70?'Buen razonamiento':'Vuelve a practicar')+'</h1><p>Completaste <strong>'+E(c.title)+'</strong>. El criterio más importante es reconocer cuándo una cobertura basta y cuándo debes escalar.</p><div class="result-score"><strong>'+percent+'<span>%</span></strong><div><b>'+state.score+' / '+total+' puntos</b><small>'+state.first+' de '+c.steps.length+' decisiones correctas al primer intento</small></div></div><div class="result-lessons"><h2>Lo que este caso consolida</h2><ol>'+c.steps.map(s=>'<li><strong>'+E(s.title)+'</strong><span>'+E(s.explanation)+'</span></li>').join('')+'</ol></div><div class="result-sources"><h2>Fundamento clínico</h2>'+[...new Set(c.steps.map(s=>s.source))].map(id=>link(id)).join('')+'</div><div class="result-actions">'+btn('restart','Repetir caso','ghost')+(next?btn('start','Siguiente misión '+I('arrow',18),'primary',next.id):btn('home','Ver todas las misiones '+I('arrow',18)))+'</div></div></main>');
}

function library() {
  return shell('<main class="page library-page"><div class="page-intro"><div class="eyebrow">FOTOGRAFÍAS REALES E ILUSTRACIONES · LICENCIAS VERIFICADAS</div><h1>Armario de apósitos</h1><p>Las fotografías muestran productos y dispositivos auténticos; los materiales sin foto libre disponible se muestran como ilustración. No sustituyen la valoración clínica ni implican que una marca sea superior.</p></div><div class="library-grid">'+dressings.map(d=>'<article class="library-card"><img src="'+d.image+'" alt="'+imageAlt(d)+'" loading="lazy"/><div><small>MATERIAL CLÍNICO</small><h2>'+E(d.name)+'</h2><p>'+E(d.detail)+'</p>'+(d.source?'<a href="'+d.source+'" target="_blank" rel="noopener noreferrer">Foto: '+E(d.credit)+' ↗</a>':'<span class="credit">'+E(d.credit)+'</span>')+'</div></article>').join('')+'</div><div class="safety-strip">'+I('alert',23)+'<div><strong>El material no determina por sí solo el tratamiento.</strong><span>Etiología, perfusión, profundidad, exudado, infección, piel perilesional y dolor guían la elección.</span></div></div></main>');
}

function evidence() {
  return shell('<main class="page evidence-page"><div class="page-intro"><div class="eyebrow">TRANSPARENCIA CLÍNICA</div><h1>Guías, límites y seguridad</h1><p>El juego transforma recomendaciones en decisiones de casos ficticios. No es una herramienta de diagnóstico o prescripción para pacientes reales.</p></div><div class="evidence-grid"><section class="evidence-card feature">'+I('shield',29)+'<h2>Primero, reconocer el riesgo</h2><p>Sepsis, isquemia, infección profunda, sangrado y otras complicaciones requieren evaluación urgente. La selección de apósito no reemplaza esa decisión.</p></section><section class="evidence-card">'+I('target',29)+'<h2>Antibióticos con criterio</h2><p>Diferenciamos colonización de infección. En pie diabético leve se enseña el espectro objetivo, no una receta universal; fármaco, dosis y vía requieren criterio local.</p></section><section class="evidence-card">'+I('image',29)+'<h2>Apósitos con contexto</h2><p>Las fotos son auténticas; película, interfase y apósito seco se muestran como ilustración. Cada selección es plausible para un escenario definido; ninguna familia de productos resuelve por sí sola la causa de la herida.</p></section></div><div class="source-section"><div class="section-head"><div><div class="eyebrow muted">FUENTES PRIMARIAS</div><h2>Referencias usadas</h2></div></div><div class="source-list">'+Object.values(sources).map((s,i)=>'<a href="'+s.url+'" target="_blank" rel="noopener noreferrer"><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+E(s.label)+'</strong>'+I('arrow',17)+'</a>').join('')+'</div></div><div class="source-section"><h2>Correspondencia académica</h2><p class="course-note">Los cinco módulos siguen las presentaciones del programa en Drive: cicatrización, clasificación/evaluación, heridas agudas y postquirúrgicas, heridas crónicas y presión negativa. La ruta de ostomías amplía la valoración periestomal con WOCN.</p></div></main>');
}

function render(focus) {
  app.innerHTML=state.page==='game'?game():state.page==='result'?result():state.page==='library'?library():state.page==='evidence'?evidence():home();
  document.title=(state.page==='game'?current().title+' · ':'')+'ATLAS · Laboratorio de heridas';
  document.querySelectorAll('.dressing-option').forEach(el=>el.addEventListener('dragstart',ev=>{ev.dataTransfer.setData('text/plain',el.dataset.id);ev.dataTransfer.effectAllowed='copy';}));
  const drop=document.querySelector('[data-dropzone]');
  if(drop){drop.addEventListener('dragover',ev=>{if(currentStep().kind==='dressing'&&!state.feedback){ev.preventDefault();drop.classList.add('dragover');}});drop.addEventListener('dragleave',()=>drop.classList.remove('dragover'));drop.addEventListener('drop',ev=>{ev.preventDefault();drop.classList.remove('dragover');const id=ev.dataTransfer.getData('text/plain');if(currentStep().options.includes(id))pick(id);});}
  // Redibujar con innerHTML destruye el foco: se restaura para quien navega con teclado o lector de pantalla.
  const target=focus&&app.querySelector(focus);
  if(target&&!target.disabled){if(target.tabIndex<0&&!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
}
const focusFor=el=>'[data-action="'+el.dataset.action+'"]'+(el.dataset.id?'[data-id="'+el.dataset.id+'"]':'');
function enterStep(){state.picks=[];state.feedback=null;state.misses=0;state.order=shuffle(currentStep().options.map(optionId));}
function start(id){if(!byId(id))return;Object.assign(state,{page:'game',caseId:id,step:0,score:0,first:0,menu:false});enterStep();render('h1');window.scrollTo(0,0);}
function pick(id,focus){if(state.feedback)return;const s=currentStep();if(s.kind==='select')state.picks=state.picks.includes(id)?state.picks.filter(x=>x!==id):state.picks.length<s.correct.length?[...state.picks,id]:[...state.picks.slice(1),id];else state.picks=[id];render(focus);}
function submit(){const s=currentStep();if(!state.picks.length||(s.kind==='select'&&state.picks.length!==s.correct.length))return;const ok=s.kind==='select'?s.correct.every(x=>state.picks.includes(x)):state.picks[0]===s.correct;if(ok){state.score+=100-state.misses*30;if(!state.misses)state.first++;state.feedback={correct:true,final:true};}else{state.misses++;state.feedback={correct:false,final:state.misses>=MAX_ATTEMPTS};}render('#feedback');}
function advance(){const c=current();if(state.step<c.steps.length-1){state.step++;enterStep();render('.decision-panel h2');return;}const prior=progress.completed[c.id]?.score||0,wasCompleted=Boolean(progress.completed[c.id]);progress.completed[c.id]={score:Math.max(prior,state.score),date:new Date().toISOString()};progress.xp+=wasCompleted?Math.max(0,state.score-prior):state.score;saveProgress();state.page='result';render('h1');window.scrollTo(0,0);}
function retry(){state.feedback=null;state.picks=[];render('.answer-option, .dressing-option');}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-action]');if(!el)return;const a=el.dataset.action,id=el.dataset.id;if(a==='home'){state.page='home';state.menu=false;render('h1');window.scrollTo(0,0);}else if(a==='module'){state.page='home';state.module=id;state.menu=false;render(focusFor(el));window.scrollTo(0,0);}else if(a==='library'||a==='evidence'){state.page=a;state.menu=false;render('h1');window.scrollTo(0,0);}else if(a==='menu'){state.menu=!state.menu;render('.mobile-menu');}else if(a==='start')start(id);else if(a==='restart')start(state.caseId);else if(a==='pick')pick(id,focusFor(el));else if(a==='submit')submit();else if(a==='next')advance();else if(a==='retry')retry();else if(a==='reset'&&confirm('¿Borrar el progreso y la XP guardados en este navegador?')){progress={completed:{},xp:0};saveProgress();render();}});
render();
