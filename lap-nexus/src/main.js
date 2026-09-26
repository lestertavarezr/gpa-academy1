import {modules,missions,PASS,COST} from './data.js';
import {visualAtlas,toolPhotos} from './media.js';
import {documents,renderMarkdown} from './docs.js';
import './style.css';
import './visual.css';
import './design.css';

const app=document.querySelector('#app');
// v3: el rediseño introduce umbral de aprobación; los puntajes sin umbral de v2 no son comparables.
const SAVE_KEY='gpa-lap-nexus-v3';
const modeNames={route:'CIRCUITO',pick:'CARGA',tri:'GEOMETRÍA',fault:'INSPECCIÓN',response:'SEÑALES',order:'SECUENCIA',loadout:'SET-UP',scan:'ESCANEO',op:'GUARDIA'};
const modeIcons={route:'⟡',pick:'▤',tri:'△',fault:'ϟ',response:'◉',order:'⇢',loadout:'✳',scan:'⌖',op:'⬡'};
const LETTERS='ABCDEFGH';
let selectedModule=1;
let current=null;
let run=null;
let soundOn=false;
let audioContext;
let save=readSave();
let lightbox=null;

function readSave(){
  try{
    const raw=JSON.parse(localStorage.getItem(SAVE_KEY));
    const best={};
    if(raw?.best&&typeof raw.best==='object')for(const mission of missions){
      const n=Number(raw.best[mission.id]);
      if(Number.isFinite(n)&&n>=0&&n<=100)best[mission.id]=Math.round(n);
    }
    return {best};
  }catch{return {best:{}};}
}
function writeSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch{/* Juego funcional sin almacenamiento. */}}
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function moduleOf(mission){return modules[mission.module-1];}
function passed(id){return (save.best[id]??-1)>=PASS;}
function completed(){return missions.filter(m=>passed(m.id)).length;}
function stars(score){return score>=100?'✦ ✦ ✦':score>=85?'✦ ✦':score>=PASS?'✦':'—';}
function photo(file){return `images/${file}${/\.(?:svg|jpe?g|png|webp)$/i.test(file)?'':'.jpg'}`;}
function shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function shuffleAvoiding(list,isBad){let r=shuffle(list);for(let n=0;n<20&&list.length>1&&isBad(r);n++)r=shuffle(list);return r;}
function task(){return current.mode==='op'?current.stages[run.stage]:current;}
function cost(){return current.cost||COST;}
function isQuestionMode(t){return t.mode==='response'||t.mode==='scan';}
function questions(t){return t.events||t.targets;}
function tone(kind='select'){
  if(!soundOn)return;
  try{
    audioContext??=new(window.AudioContext||window.webkitAudioContext)();
    const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
    oscillator.type='sine';oscillator.frequency.value=kind==='win'?720:kind==='error'?180:460;
    gain.gain.setValueAtTime(.0001,audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.055,audioContext.currentTime+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.17);
    oscillator.connect(gain).connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+.18);
  }catch{/* Audio opcional. */}
}
function focusSelector(el){
  if(!el||!app.contains(el))return null;
  if(el.dataset.key)return `[data-key="${CSS.escape(el.dataset.key)}"]`;
  if(el.dataset.action)return `[data-action="${el.dataset.action}"]${el.dataset.id!==undefined?`[data-id="${CSS.escape(el.dataset.id)}"]`:''}`;
  return null;
}
function shell(content,accent='#a4ffdc'){
  const previous=focusSelector(document.activeElement);
  app.style.setProperty('--accent',accent);
  app.innerHTML=`<div class="shell">
    <header class="topbar"><a class="brand" href="#/" data-action="home" aria-label="LAP Nexus, volver al mapa"><span class="brand-symbol">◇</span><span><strong>LAP<span>//</span>NEXUS</strong><small>GPA ACADEMY · SIMULADOR DE INSTRUMENTACIÓN</small></span></a><div class="top-actions"><span class="live-pill"><i></i> ENTRENAMIENTO ACTIVO</span><button class="icon-button" data-action="sound" aria-label="${soundOn?'Desactivar':'Activar'} sonido">${soundOn?'♪':'♪̸'}</button></div></header>
    ${content}
    <footer class="footer"><span>ENTRENA LA PREPARACIÓN · NO SUSTITUYE LA PRÁCTICA SUPERVISADA</span><span><a href="#/documento/estudio">ESTUDIO Y FUENTES</a> · <a href="#/documento/auditoria">AUDITORÍA</a> · <a href="#/documento/creditos">CRÉDITOS</a></span></footer>
  </div>`;
  if(!previous)return;
  // Si el elemento enfocado ya no existe, el foco pasa al mensaje de estado en vez de perderse en <body>.
  const target=[app.querySelector(previous)].find(el=>el&&!el.disabled)||app.querySelector('.game-feedback')||app.querySelector('main h1');
  if(target){if(!target.matches('button,a,[tabindex]'))target.tabIndex=-1;target.focus({preventScroll:true});}
}
function focusAfter(key,selector){requestAnimationFrame(()=>{const target=selector?app.querySelector(selector):app.querySelector(`[data-key="${CSS.escape(key)}"]`);if(target){if(!target.matches('button,a,[tabindex]'))target.tabIndex=-1;target.focus();}});}

function missionStatus(m){
  const best=save.best[m.id];
  if(best===undefined)return '<span class="mission-result">SIN JUGAR · LISTO</span>';
  if(best>=PASS)return `<span class="mission-result pass">SUPERADO · MEJOR ${best} · ${stars(best)}</span>`;
  return `<span class="mission-result fail">NO SUPERADO · MEJOR ${best} · NECESITAS ${PASS}</span>`;
}
function renderMenu(focusKey){
  current=null;run=null;
  const module=modules[selectedModule-1],list=missions.filter(m=>m.module===selectedModule);
  const allDone=completed();
  shell(`<main class="menu-layout">
    <section class="hero"><div class="hero-photo" aria-hidden="true"></div><div class="hero-kicker"><span class="line"></span> SISTEMA DE ENTRENAMIENTO / ${String(modules.length).padStart(2,'0')} SECTORES</div><div class="hero-title">DOMINA EL<br><em>CAMPO INVISIBLE.</em></div><p class="hero-copy">Una consola de desafíos para instrumentación laparoscópica. Lee fotografías reales, conecta sistemas, detecta riesgos y responde a señales del equipo.</p><div class="hero-stats"><div><b>${allDone.toString().padStart(2,'0')}</b><span>DESAFÍOS SUPERADOS</span></div><div><b>${String(missions.length).padStart(2,'0')}</b><span>DESAFÍOS DISPONIBLES</span></div><div><b>${String(Object.keys(modeNames).length).padStart(2,'0')}</b><span>MECÁNICAS</span></div></div><div class="campaign-meter"><div style="width:${allDone/missions.length*100}%"></div></div><p class="hero-tip">Sin cronómetro. Cada error resta integridad al quirófano: necesitas ${PASS} % para superar un desafío. Tienes dos intentos por decisión antes de ver la respuesta.</p><span class="hero-photo-credit">FOTO REAL · Dr.jayesh amin / CC BY-SA 3.0</span></section>
    <section class="map-panel" aria-label="Mapa de sectores"><div class="panel-head"><div><span class="section-eyebrow">SELECCIÓN DE SECTOR</span><h1>Mapa de misión</h1></div><span class="panel-counter">${String(selectedModule).padStart(2,'0')} / ${String(modules.length).padStart(2,'0')}</span></div><div class="module-list">${modules.map(item=>{const moduleMissions=missions.filter(m=>m.module===item.id);const complete=moduleMissions.filter(m=>passed(m.id)).length;return `<button class="module-chip ${item.id===selectedModule?'selected':''} ${complete===moduleMissions.length?'mastered':''}" data-action="module" data-id="${item.id}" data-key="module-${item.id}" aria-pressed="${item.id===selectedModule}"><span class="module-icon" style="--chip:${item.color}">${item.icon}</span><span class="module-info"><b>${item.code} · ${esc(item.title)}</b><small>${esc(item.sub)}</small></span><span class="module-count">${complete}/${moduleMissions.length}</span></button>`}).join('')}</div></section>
    <section class="mission-panel"><div class="panel-head"><div><span class="section-eyebrow">SECTOR ${module.code} / ${esc(module.title.toUpperCase())}</span><h2>Elige un desafío</h2></div><span class="mission-emblem">${module.icon}</span></div><div class="mission-list">${list.map((m,index)=>`<button class="mission-card" data-action="start" data-id="${m.id}"><span class="mission-index">${String(index+1).padStart(2,'0')}</span><span class="mission-content"><span class="mission-mode">${modeIcons[m.mode]} ${modeNames[m.mode]}${m.stages?` · ${m.stages.length} ETAPAS`:''}</span><strong>${esc(m.title)}</strong><small>${esc(m.brief)}</small>${missionStatus(m)}</span><span class="mission-arrow">↗</span></button>`).join('')}</div>${module.source?`<a class="source-link" href="${module.source}" target="_blank" rel="noopener noreferrer">Ver presentación del módulo <span>↗</span></a>`:''}</section>
  </main>`,module.color);
  if(focusKey)focusAfter(focusKey);
}

function startMission(id){
  current=missions.find(m=>m.id===id);if(!current)return;
  selectedModule=current.module;
  run={stage:0,integrity:100,log:[],won:false,visualIndex:0,visualNote:null,visualSeen:new Set()};
  enterStage();
  tone();renderGame();window.scrollTo({top:0,behavior:'smooth'});
}
function enterStage(){
  const t=task(),ids=list=>list.map(x=>x[0]);
  Object.assign(run,{selected:[],assignments:{},activeRole:null,activeItem:null,index:0,strikes:0,revealed:false,feedback:null,stageDone:false,deck:null});
  // Barajar evitando que el orden mostrado coincida con la solución.
  if(t.nodes||t.cards){const list=ids(t.nodes||t.cards);run.deck=shuffleAvoiding(list,r=>t.answer.every((a,i)=>r[i]===a));}
  else if(t.options){const list=ids(t.options);run.deck=shuffleAvoiding(list,r=>r.slice(0,t.answer.length).every(id=>t.answer.includes(id)));}
  else if(t.items)run.deck=shuffle(ids(t.items));
  else if(t.roles)run.deck=shuffleAvoiding(ids(t.roles),r=>r[0]===t.answer.top);
  enterQuestion();
}
function enterQuestion(){
  const t=task();
  run.answer=null;run.tried=[];run.strikes=0;run.revealed=false;
  if(t.mode==='response')run.qorder=shuffle(t.events[run.index].choices.map((_,i)=>i));
}

function renderGame(focusKey){
  if(!current)return;
  const mod=moduleOf(current),t=task(),q=isQuestionMode(t);
  const stageBar=current.stages?`<ol class="stage-track" aria-label="Etapas del caso">${current.stages.map((s,i)=>`<li class="${i<run.stage||(i===run.stage&&run.stageDone)?'done':i===run.stage?'active':''}"><span>${String(i+1).padStart(2,'0')}</span>${esc(s.title)}</li>`).join('')}</ol>`:'';
  const danger=run.integrity<PASS?'danger':run.integrity<85?'warn':'';
  const body=run.stageDone?renderStageDone():`${renderBoard()}<div class="game-feedback ${run.feedback?.kind||''}" role="status" aria-live="polite">${run.feedback?run.feedback.html:esc(q?'Elige una respuesta. Si fallas, tendrás una segunda oportunidad con pista.':'Configura el tablero y comprueba. Cada comprobación fallida resta integridad.')}</div><div class="game-actions"><div class="secondary-actions">${q?'':`<button class="secondary-button" data-action="reset">↶ Reiniciar selección</button>${['route','order'].includes(t.mode)&&run.selected.length?'<button class="secondary-button" data-action="undo">↶ Deshacer último</button>':''}`}</div>${q?renderQuestionAction():`<button class="primary-button" data-action="check" ${ready()?'':'disabled'}>COMPROBAR CONFIGURACIÓN <span>→</span></button>`}</div>`;
  shell(`<main class="game-layout"><div class="game-toolbar"><button class="back-button" data-action="home">← MAPA DE SECTORES</button><div class="breadcrumb">SECTOR ${mod.code} <span>/</span> ${esc(mod.title.toUpperCase())} <span>/</span> ${esc(modeNames[t.mode])}</div><div class="score-chip">MEJOR ${save.best[current.id]??'—'}</div></div>
    <section class="mission-header"><div><span class="section-eyebrow">${modeIcons[current.mode]} MODO ${modeNames[current.mode]} · DESAFÍO ${current.id.toUpperCase()}</span><h1>${esc(current.title)}</h1><p>${esc(current.brief)}</p>${stageBar}</div><div class="mission-orbit" aria-hidden="true"><span>${mod.icon}</span></div></section>
    ${t.mode==='scan'?'':renderVisualDossier()}<section class="game-panel">${current.stages&&!run.stageDone?`<div class="stage-brief"><span>ETAPA ${run.stage+1} / ${current.stages.length} · ${modeIcons[t.mode]} ${modeNames[t.mode]}</span><strong>${esc(t.title)}</strong><p>${esc(t.brief)}</p></div>`:''}<div class="game-panel-top"><span><i></i> CONSOLA ACTIVA</span><span class="integrity ${danger}" aria-label="Integridad del quirófano ${run.integrity} por ciento; mínimo para superar ${PASS}">INTEGRIDAD <b>${run.integrity}%</b><span class="integrity-bar"><span style="width:${run.integrity}%"></span><i style="left:${PASS}%"></i></span><small>−${cost()} POR ERROR</small></span></div>${body}</section>
    <aside class="learn-panel"><div><span class="section-eyebrow">GUÍA DE APRENDIZAJE</span><h2>Observa. Anticipa. Verifica.</h2><p>Este simulador representa tareas de preparación y comunicación. Las decisiones clínicas y técnicas reales corresponden al equipo responsable y a sus protocolos.</p></div>${mod.source?`<a href="${mod.source}" target="_blank" rel="noopener noreferrer">Presentación del módulo ↗</a>`:''}</aside>
  </main>`,mod.color);
  if(focusKey)focusAfter(focusKey);
}
function renderStageDone(){
  const next=current.stages[run.stage+1];
  return `<div class="stage-done" role="status"><span class="section-eyebrow">ETAPA ${run.stage+1} COMPLETADA</span><h2>«${esc(task().title)}» resuelta.</h2><p>Siguiente: <b>${esc(next.title)}</b> · ${modeNames[next.mode]}. La integridad se mantiene en ${run.integrity} %.</p><button class="primary-button" data-action="stage-next">CONTINUAR CON LA ETAPA ${run.stage+2} <span>→</span></button></div>`;
}
function renderVisualDossier(){
  const images=visualAtlas[current.module],item=images[run.visualIndex]||images[0];
  const total=images.reduce((sum,im)=>sum+(im.points?.length||0),0);
  return `<section class="visual-dossier" aria-label="Atlas fotográfico del módulo"><div class="visual-image-wrap"><img src="${photo(item.file)}" alt="${esc(item.title)}" loading="eager"><div class="visual-image-shade"></div><span class="visual-kind">${esc(item.kind)}</span>${(item.points||[]).map((p,i)=>`<button class="visual-hotspot ${run.visualNote===i?'active':''} ${run.visualSeen.has(`${run.visualIndex}-${i}`)?'seen':''}" style="left:${p.x}%;top:${p.y}%" data-action="visual-point" data-id="${i}" aria-label="Inspeccionar: ${esc(p.label)}">${i+1}</button>`).join('')}<button class="visual-zoom" data-action="visual-zoom" aria-label="Ampliar ${esc(item.title)}">⤢ AMPLIAR</button></div><div class="visual-copy"><div class="visual-kicker">ATLAS VISUAL <span>${String(run.visualIndex+1).padStart(2,'0')} / ${String(images.length).padStart(2,'0')}</span></div><h2>${esc(item.title)}</h2><p>${esc(run.visualNote===null?item.caption:item.points?.[run.visualNote]?.note||item.caption)}</p>${total?`<div class="visual-progress">${run.visualSeen.size} / ${total} DETALLES INSPECCIONADOS ${run.visualSeen.size===total?'· ESCANEO COMPLETO':''}</div>`:''}<div class="visual-tabs" role="group" aria-label="Elegir imagen">${images.map((im,i)=>`<button class="visual-tab ${i===run.visualIndex?'active':''}" data-action="visual-select" data-id="${i}" aria-label="Mostrar ${esc(im.title)}" aria-pressed="${i===run.visualIndex}"><img src="${photo(im.file)}" alt="" loading="lazy"><span>${String(i+1).padStart(2,'0')}</span></button>`).join('')}</div><a class="visual-credit" href="${item.source}" target="_blank" rel="noopener noreferrer">${esc(item.credit)} · VER FUENTE ↗</a></div></section>`;
}
function openLightbox(){
  const item=visualAtlas[current.module][run.visualIndex];
  lightbox=document.createElement('div');lightbox.className='image-lightbox';lightbox.innerHTML=`<div class="lightbox-card" role="dialog" aria-modal="true" aria-label="${esc(item.title)}"><button class="lightbox-close" data-action="visual-close" aria-label="Cerrar imagen">✕</button><img src="${photo(item.file)}" alt="${esc(item.title)}"><div><strong>${esc(item.title)}</strong><span>${esc(item.credit)}</span></div></div>`;
  document.body.append(lightbox);lightbox.querySelector('button').focus();
}
function closeLightbox(){lightbox?.remove();lightbox=null;app.querySelector('[data-action="visual-zoom"]')?.focus();}

function ready(){
  const t=task();
  if(t.mode==='route'||t.mode==='order')return run.selected.length===t.answer.length;
  if(t.mode==='pick'||t.mode==='fault')return run.selected.length===t.count;
  if(t.mode==='tri'||t.mode==='loadout')return Object.keys(run.assignments).length===Object.keys(t.answer).length;
  return false;
}
function renderBoard(){
  switch(task().mode){
    case 'route':return renderRoute();
    case 'pick':return renderPick();
    case 'tri':return renderTri();
    case 'fault':return renderFault();
    case 'response':return renderResponse();
    case 'order':return renderOrder();
    case 'loadout':return renderLoadout();
    case 'scan':return renderScan();
  }
}
function mark(ok){return run.revealed?(ok?' is-correct':' is-wrong'):'';}
function whyLine(text){return run.revealed&&text?`<small class="option-why">${esc(text)}</small>`:'';}
function renderSequenceSlots(t,labels,cls){
  return t.answer.map((ans,i)=>`<div class="${cls}-slot ${run.selected[i]?'filled':''}${run.selected[i]?mark(run.selected[i]===ans):''}"><small>${String(i+1).padStart(2,'0')}</small><b>${run.selected[i]?esc(labels.get(run.selected[i])):cls==='route'?'NODO VACÍO':'PENDIENTE'}</b></div>`);
}
function renderRoute(){
  const t=task(),labels=new Map(t.nodes);
  return `<div class="board board-route"><div class="board-intro"><span>RUTA DE SEÑAL</span><strong>Conecta el origen con el destino · ${t.answer.length} nodos</strong></div><div class="route-track">${renderSequenceSlots(t,labels,'route').join('<span class="route-link">↣</span>')}</div><div class="node-grid">${run.deck.map((id,i)=>`<button class="node-card ${run.selected.includes(id)?'used':''}${run.revealed&&!t.answer.includes(id)?' is-decoy':''}" data-action="select" data-id="${id}" data-key="node-${id}" ${run.selected.includes(id)?'disabled':''}><span class="node-pip">${String(i+1).padStart(2,'0')}</span><span class="node-glyph">${['◉','✳','▣','◎','▤','⊙'][i%6]}</span><b>${esc(labels.get(id))}</b><small>${run.selected.includes(id)?'EN LA RUTA':run.revealed&&!t.answer.includes(id)?'OTRA RUTA':'CONECTAR →'}</small></button>`).join('')}</div></div>`;
}
function renderPick(){
  const t=task(),selected=new Set(run.selected),opt=new Map(t.options.map(o=>[o[0],o]));
  return `<div class="board board-pick"><div class="board-intro"><span>BAHÍA DE INSTRUMENTAL</span><strong>${run.selected.length} / ${t.count} piezas cargadas · arrastra o toca</strong></div><div class="pick-slots">${Array.from({length:t.count},(_,i)=>`<div class="pick-slot ${run.selected[i]?'filled':''}${run.selected[i]?mark(t.answer.includes(run.selected[i])):''}" data-drop-kind="tool"><small>BAHÍA 0${i+1}</small><b>${run.selected[i]?esc(opt.get(run.selected[i])[1]):'ARRASTRA UNA PIEZA'}</b></div>`).join('')}</div><div class="pick-grid">${run.deck.map(id=>{const [,label,why]=opt.get(id),inAns=t.answer.includes(id);return `<button class="tool-card ${selected.has(id)?'selected':''}${run.revealed&&(inAns||selected.has(id))?mark(inAns):''}" data-action="select" data-id="${id}" data-key="tool-${id}" data-drag-kind="tool" draggable="true" aria-pressed="${selected.has(id)}"><span class="tool-photo"><img src="${photo(toolPhotos[id].file)}" alt="${esc(toolPhotos[id].note)}" loading="lazy" draggable="false"></span><b>${esc(label)}</b><small>${esc(toolPhotos[id].note)}</small>${whyLine(why)}<small class="tool-state">${selected.has(id)?'✓ CARGADO':'ARRASTRA O TOCA PARA CARGAR'}</small></button>`}).join('')}</div></div>`;
}
function renderTri(){
  const t=task(),roleLabel=new Map(t.roles);
  return `<div class="board board-tri"><div class="board-intro"><span>DIAGRAMA ESQUEMÁTICO</span><strong>Asigna roles a los tres puntos</strong></div><div class="tri-layout"><div class="tri-figure"><div class="tri-beam beam-left"></div><div class="tri-beam beam-right"></div><div class="tri-target">OBJETIVO</div>${t.positions.map(([id,label])=>`<button class="tri-port ${id} ${run.assignments[id]?'filled':''}${run.assignments[id]?mark(run.assignments[id]===t.answer[id]):''}" data-action="position" data-id="${id}" data-key="position-${id}" data-drop-kind="role"><small>${esc(label)}</small><b>${esc(roleLabel.get(run.assignments[id])||'ARRASTRA O TOCA')}</b></button>`).join('')}</div><div class="role-stack"><span class="stack-label">ROLES DISPONIBLES</span>${run.deck.map(id=>`<button class="role-card ${run.activeRole===id?'active':''} ${Object.values(run.assignments).includes(id)?'assigned':''}" data-action="role" data-id="${id}" data-key="role-${id}" data-drag-kind="role" draggable="true" aria-pressed="${run.activeRole===id}"><span>◈</span>${esc(roleLabel.get(id))}</button>`).join('')}<p>Arrastra cada rol a un punto; también puedes elegir el rol y tocar el punto. Sin rol activo, toca un punto para vaciarlo.</p></div></div></div>`;
}
function renderFault(){
  const t=task(),selected=new Set(run.selected),opt=new Map(t.options.map(o=>[o[0],o]));
  return `<div class="board board-fault"><div class="board-intro"><span>BARRIDO DE SEGURIDAD</span><strong>${run.selected.length} / ${t.count} alertas marcadas</strong></div><div class="fault-panel"><div class="fault-core"><div class="fault-ring"><span>ϟ</span></div><strong>DISPOSITIVO EN REVISIÓN</strong><small>NO ACTIVAR SIN CONFIRMACIÓN</small></div><div class="fault-grid">${run.deck.map((id,i)=>{const [,label,why]=opt.get(id),inAns=t.answer.includes(id);return `<button class="fault-tile ${selected.has(id)?'flagged':''}${run.revealed&&(inAns||selected.has(id))?mark(inAns):''}" data-action="select" data-id="${id}" data-key="fault-${id}" aria-pressed="${selected.has(id)}"><span class="fault-id">S${String(i+1).padStart(2,'0')}</span><span class="fault-led"></span><b>${esc(label)}</b>${whyLine((run.revealed?(inAns?'ALERTA · ':'NO ES ALERTA · '):'')+why)}<small>${selected.has(id)?'MARCADA PARA VERIFICAR':'TOCAR SI ES UNA ALERTA'}</small></button>`}).join('')}</div></div></div>`;
}
function renderOrder(){
  const t=task(),labels=new Map(t.cards),whys=new Map(t.cards.map(c=>[c[0],c[2]])),available=run.deck.filter(id=>!run.selected.includes(id));
  return `<div class="board board-order"><div class="board-intro"><span>CONSOLA DE SECUENCIA</span><strong>Ordena ${t.answer.length} etapas · ${t.cards.length-t.answer.length?`${t.cards.length-t.answer.length} tarjeta no pertenece`:'todas pertenecen'}</strong></div><div class="order-track">${t.answer.map((ans,i)=>`<div class="order-slot ${run.selected[i]?'filled':''}${run.selected[i]?mark(run.selected[i]===ans):''}"><span>0${i+1}</span><b>${run.selected[i]?esc(labels.get(run.selected[i])):'PENDIENTE'}</b></div>`).join('')}</div><div class="order-deck">${available.map(id=>`<button class="order-card${run.revealed&&!t.answer.includes(id)?' is-decoy':''}" data-action="select" data-id="${id}" data-key="order-${id}"><span>⇢</span><span class="order-text">${esc(labels.get(id))}${run.revealed&&!t.answer.includes(id)?`<small class="option-why">NO PERTENECE · ${esc(whys.get(id))}</small>`:''}</span></button>`).join('')}</div></div>`;
}
function renderLoadout(){
  const t=task(),labels=new Map(t.items),whys=new Map(t.items.map(i=>[i[0],i[2]]));
  return `<div class="board board-loadout"><div class="board-intro"><span>SET-UP POR ESPECIALIDAD</span><strong>Asigna cada elemento a su función · uno sobra</strong></div><div class="loadout-slots">${t.slots.map(([id,label])=>`<button class="loadout-slot ${run.assignments[id]?'filled':''}${run.assignments[id]?mark(run.assignments[id]===t.answer[id]):''}" data-action="slot" data-id="${id}" data-key="slot-${id}" data-drop-kind="item"><small>${esc(label.toUpperCase())}</small><b>${run.assignments[id]?esc(labels.get(run.assignments[id])):'ARRASTRA O SELECCIONA'}</b><span>↗</span></button>`).join('')}</div><div class="loadout-drawer"><span>ARRASTRA UN ELEMENTO A SU FUNCIÓN, O USA LOS BOTONES</span><div>${run.deck.map(id=>`<button class="loadout-item ${run.activeItem===id?'active':''} ${Object.values(run.assignments).includes(id)?'assigned':''}" data-action="item" data-id="${id}" data-key="item-${id}" data-drag-kind="item" draggable="true" aria-pressed="${run.activeItem===id}"><img src="${photo(toolPhotos[id].file)}" alt="${esc(toolPhotos[id].note)}" loading="lazy" draggable="false"><b>${esc(labels.get(id))}</b><small>${esc(toolPhotos[id].note)}</small>${whyLine(whys.get(id))}</button>`).join('')}</div></div></div>`;
}
function renderResponse(){
  const t=task(),event=t.events[run.index];
  return `<div class="board board-response"><div class="board-intro"><span>CENTRO DE SEÑALES</span><strong>Alerta ${run.index+1} de ${t.events.length}</strong></div><div class="signal-screen"><div class="signal-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="signal-copy"><small>SEÑAL DETECTADA / CANAL ${String(run.index+1).padStart(2,'0')}</small><h2>${esc(event.signal)}</h2><span>${run.answer===null?(run.tried.length?'SEGUNDA OPORTUNIDAD':'ESPERANDO RESPUESTA'):'RESPUESTA REGISTRADA'}</span></div><div class="signal-pulse" aria-hidden="true"></div></div><div class="response-options">${run.qorder.map((i,pos)=>{const tried=run.tried.includes(i),right=run.answer===i;return `<button class="response-choice${right?' is-correct':''}${tried?' is-wrong':''}" data-action="answer" data-id="${i}" data-key="answer-${i}" ${run.answer!==null||tried?'disabled':''}><span>0${pos+1}</span><b>${esc(event.choices[i][0])}</b><span>${right?'✓':tried?'✕':'↗'}</span></button>`}).join('')}</div></div>`;
}
function renderScan(){
  const t=task(),target=t.targets[run.index];
  return `<div class="board board-scan"><div class="board-intro"><span>ESCANEO VISUAL · OBJETIVO ${run.index+1} DE ${t.targets.length}</span><strong>${esc(target.prompt)}</strong></div><figure class="scan-figure"><div class="scan-wrap"><img src="${photo(t.photo.file)}" alt="Fotografía para el escaneo: ${esc(current.title)}">${t.markers.map(([id,x,y,name],i)=>{const tried=run.tried.includes(id),right=run.answer===id;return `<button class="scan-marker${right?' is-correct':''}${tried?' is-wrong':''}" style="left:${x}%;top:${y}%" data-action="answer" data-id="${id}" data-key="answer-${id}" ${run.answer!==null||tried?'disabled':''} aria-label="Marcador ${LETTERS[i]}${tried||right?`: ${esc(name)}`:''}">${LETTERS[i]}${tried||right?`<span class="scan-name">${esc(name)}</span>`:''}</button>`}).join('')}</div><figcaption><a href="${t.photo.source}" target="_blank" rel="noopener noreferrer">${esc(t.photo.credit)} · VER FUENTE ↗</a></figcaption></figure></div>`;
}
function renderQuestionAction(){
  const t=task(),last=run.index===questions(t).length-1;
  const label=last?(current.stages&&run.stage<current.stages.length-1?'CERRAR ETAPA':'VER INFORME'):t.mode==='scan'?'SIGUIENTE OBJETIVO':'SIGUIENTE SEÑAL';
  return `<button class="primary-button" data-action="q-next" ${run.answer===null?'disabled':''}>${label} <span>→</span></button>`;
}

function setFeedback(kind,html){run.feedback={kind,html};}
function penalize(what,why){
  if(!run.revealed)run.integrity=Math.max(0,run.integrity-cost());
  run.log.push({stage:current.stages?task().title:null,what,why});
  tone('error');
}
function resetSelection(){run.selected=[];run.assignments={};run.activeRole=null;run.activeItem=null;run.feedback=null;renderGame();}
function select(id){
  const t=task();
  if(t.mode==='route'||t.mode==='order'){
    if(!run.selected.includes(id)&&run.selected.length<t.answer.length)run.selected.push(id);
  }else if(t.mode==='pick'||t.mode==='fault'){
    if(run.selected.includes(id))run.selected=run.selected.filter(v=>v!==id);
    else if(run.selected.length<t.count)run.selected.push(id);
  }
  run.feedback=null;tone();renderGame(`${t.mode==='route'?'node':t.mode==='pick'?'tool':t.mode==='fault'?'fault':'order'}-${id}`);
}
function assign(position,type){
  const active=type==='tri'?run.activeRole:run.activeItem;
  if(!active){delete run.assignments[position];}
  else{
    for(const [key,value] of Object.entries(run.assignments))if(value===active)delete run.assignments[key];
    run.assignments[position]=active;
  }
  run.feedback=null;tone();renderGame(`${type==='tri'?'position':'slot'}-${position}`);
}

// Devuelve cuántos elementos están bien, el total y los errores concretos que se registran en el informe.
function evaluate(t){
  if(t.mode==='route'||t.mode==='order'){
    const list=t.nodes||t.cards,label=new Map(list),why=new Map(list.map(x=>[x[0],x[2]]));
    const right=run.selected.filter((id,i)=>id===t.answer[i]).length;
    const decoys=run.selected.filter(id=>!t.answer.includes(id));
    const errors=decoys.length?decoys.map(id=>({what:label.get(id),why:why.get(id)||'No forma parte de esta ruta.'})):right<t.answer.length?[{what:'Secuencia fuera de orden',why:`Orden correcto: ${t.answer.map(id=>label.get(id)).join(' → ')}.`}]:[];
    return {right,total:t.answer.length,errors};
  }
  if(t.mode==='pick'||t.mode==='fault'){
    const opt=new Map(t.options.map(o=>[o[0],o]));
    const wrong=run.selected.filter(id=>!t.answer.includes(id));
    return {right:t.count-wrong.length,total:t.count,errors:wrong.map(id=>({what:opt.get(id)[1],why:opt.get(id)[2]}))};
  }
  const labels=new Map(t.items||t.roles),slotName=new Map(t.slots||t.positions);
  const wrong=Object.keys(t.answer).filter(k=>run.assignments[k]!==t.answer[k]);
  return {right:Object.keys(t.answer).length-wrong.length,total:Object.keys(t.answer).length,errors:wrong.map(k=>({what:`${labels.get(run.assignments[k])} en «${slotName.get(k)}»`,why:`Corresponde: ${labels.get(t.answer[k])}.`}))};
}
function solutionText(t){
  if(t.mode==='route'||t.mode==='order'){const label=new Map(t.nodes||t.cards);return t.answer.map((id,i)=>`${i+1}. ${label.get(id)}`).join(' · ');}
  if(t.mode==='pick'||t.mode==='fault'){const label=new Map(t.options);return t.answer.map(id=>label.get(id)).join(' · ');}
  const labels=new Map(t.items||t.roles),slotName=new Map(t.slots||t.positions);
  return Object.entries(t.answer).map(([k,v])=>`${slotName.get(k)}: ${labels.get(v)}`).join(' · ');
}
function check(){
  if(!ready())return;
  const t=task(),{right,total,errors}=evaluate(t);
  if(right===total&&!errors.length){stageComplete();return;}
  if(!run.revealed){run.strikes++;penalize(errors[0].what,errors[0].why);}
  if(run.strikes>=2&&!run.revealed){
    run.revealed=true;
    setFeedback('reveal',`<b>Solución revelada.</b> ${esc(solutionText(t))}<br>Corrige el tablero para continuar; ya no se descuenta integridad en este paso.`);
  }else if(run.revealed){
    setFeedback('error',`Todavía no coincide con la solución marcada. ${esc(solutionText(t))}`);
  }else{
    setFeedback('error',`<b>${right} de ${total} correctos.</b> Pista: ${esc(t.hint)} <span class="strike-note">Un error más y se revela la solución.</span>`);
  }
  renderGame();
}
function answer(choice){
  const t=task(),q=questions(t)[run.index];
  if(run.answer!==null||run.tried.includes(choice))return;
  const correctId=t.mode==='response'?0:q.answer;
  const text=id=>t.mode==='response'?q.choices[id][0]:t.markers.find(m=>m[0]===id)[3];
  const why=id=>t.mode==='response'?q.choices[id][1]:(id===correctId?q.why:`Eso es: ${text(id)}.`);
  if(choice===correctId){
    run.answer=choice;tone();
    setFeedback('success',`<b>${run.tried.length?'Bien corregido.':'Correcto.'}</b> ${esc(why(choice))}`);
  }else{
    run.tried.push(choice);run.strikes++;
    penalize(t.mode==='scan'?`${q.prompt}: tocaste «${text(choice)}»`:text(choice),why(choice));
    if(run.strikes>=2){
      run.revealed=true;run.answer=correctId;
      setFeedback('reveal',`<b>${esc(why(choice))}</b><br>Respuesta: ${esc(text(correctId))}. ${esc(t.mode==='response'?q.choices[0][1]:q.why)}`);
    }else{
      setFeedback('error',`<b>${esc(why(choice))}</b> Pista: ${esc(t.hint)} <span class="strike-note">Te queda un intento.</span>`);
    }
  }
  renderGame(`answer-${run.answer??choice}`);
  if(run.answer!==null)focusAfter(null,'[data-action="q-next"]');
}
function nextQuestion(){
  const t=task();
  if(run.answer===null)return;
  if(run.index===questions(t).length-1){stageComplete();return;}
  run.index++;enterQuestion();run.feedback=null;renderGame();focusAfter(null,t.mode==='scan'?'.board-scan strong':'.signal-copy h2');
}
function stageComplete(){
  if(current.stages&&run.stage<current.stages.length-1){
    run.stageDone=true;tone('win');renderGame();focusAfter(null,'.stage-done h2');return;
  }
  finish();
}
function nextStage(){run.stage++;enterStage();renderGame();focusAfter(null,'.stage-brief strong');}
function finish(){
  if(!current||run.won)return;
  run.won=true;
  const score=run.integrity,ok=score>=PASS,prev=save.best[current.id];
  save.best[current.id]=Math.max(prev??0,score);writeSave();tone(ok?'win':'error');
  const mod=moduleOf(current),next=missions[missions.findIndex(m=>m.id===current.id)+1];
  const debrief=run.log.length?`<div class="debrief"><span class="section-eyebrow">INFORME DE INCIDENCIAS · ${run.log.length}</span><ul>${run.log.map(e=>`<li>${e.stage?`<small>${esc(e.stage)}</small>`:''}<b>${esc(e.what)}</b><span>${esc(e.why)}</span></li>`).join('')}</ul></div>`:'<div class="debrief clean"><span class="section-eyebrow">INFORME DE INCIDENCIAS</span><p>Sin incidencias. Ejecución limpia.</p></div>';
  const headline=ok?(score===100?'Ejecución<br><em>impecable.</em>':'Señal<br><em>restablecida.</em>'):'Revisa<br><em>y reintenta.</em>';
  shell(`<main class="result-layout"><div class="result-halo ${ok?'':'failed'}" aria-hidden="true"><span>${mod.icon}</span></div><div class="result-card ${ok?'':'failed'}"><span class="section-eyebrow">${ok?'DESAFÍO SUPERADO':'NO SUPERADO · NECESITAS '+PASS} · SECTOR ${mod.code}</span><h1>${headline}</h1><p>${esc(current.lesson)}</p><div class="result-score"><div><strong>${score}</strong><span>INTEGRIDAD FINAL</span></div><div><strong>${save.best[current.id]}</strong><span>MEJOR RESULTADO</span></div><div><strong>${stars(score)}</strong><span>${ok?'DISTINTIVO OBTENIDO':'SIN DISTINTIVO'}</span></div></div>${debrief}<div class="result-actions"><button class="primary-button" data-action="retry">${ok?'REPETIR Y MEJORAR':'REINTENTAR'} ↗</button>${next&&ok?`<button class="secondary-button" data-action="next" data-id="${next.id}">SIGUIENTE DESAFÍO →</button>`:''}<button class="secondary-button" data-action="home">VOLVER AL MAPA</button></div></div></main>`,mod.color);
  focusAfter(null,'.result-card h1');
}

app.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action,id=button.dataset.id;
  if(action==='visual-select'&&current&&run){run.visualIndex=Number(id);run.visualNote=null;renderGame();focusAfter(null,`[data-action="visual-select"][data-id="${id}"]`);return;}
  if(action==='visual-point'&&current&&run){run.visualNote=Number(id);run.visualSeen.add(`${run.visualIndex}-${id}`);tone();renderGame();focusAfter(null,`[data-action="visual-point"][data-id="${id}"]`);return;}
  if(action==='visual-zoom'&&current&&run){openLightbox();return;}
  if(action==='home'){event.preventDefault();go(`#/sector/${selectedModule}`);return;}
  if(action==='sound'){soundOn=!soundOn;button.textContent=soundOn?'♪':'♪̸';button.setAttribute('aria-label',soundOn?'Desactivar sonido':'Activar sonido');return;}
  if(action==='module'){go(`#/sector/${id}`,`module-${id}`);return;}
  if(action==='start'||action==='next'){go(`#/desafio/${id}`);return;}
  if(action==='retry'){startMission(current.id);return;}
  if(!current||!run||run.won)return;
  if(action==='stage-next'){nextStage();return;}
  if(action==='reset'){resetSelection();return;}
  if(action==='undo'){run.selected.pop();run.feedback=null;renderGame();focusAfter(null,'[data-action="undo"]');return;}
  if(action==='check'){check();return;}
  if(action==='select'){select(id);return;}
  if(action==='role'){run.activeRole=id;tone();renderGame(`role-${id}`);return;}
  if(action==='item'){run.activeItem=id;tone();renderGame(`item-${id}`);return;}
  if(action==='position'){assign(id,'tri');return;}
  if(action==='slot'){assign(id,'loadout');return;}
  if(action==='answer'){answer(task().mode==='response'?Number(id):id);return;}
  if(action==='q-next'){nextQuestion();}
});

// El arrastre mejora la interacción de escritorio; los botones mantienen la ruta táctil/teclado.
let dragging=null;
app.addEventListener('dragstart',event=>{
  const source=event.target.closest('[data-drag-kind]');
  if(!source||!current||!run)return;
  dragging={kind:source.dataset.dragKind,id:source.dataset.id};
  event.dataTransfer.effectAllowed='move';
  event.dataTransfer.setData('text/plain',JSON.stringify(dragging));
  requestAnimationFrame(()=>source.classList.add('dragging'));
});
app.addEventListener('dragover',event=>{
  const target=event.target.closest('[data-drop-kind]');
  if(!target||!dragging||target.dataset.dropKind!==dragging.kind)return;
  event.preventDefault();event.dataTransfer.dropEffect='move';target.classList.add('drop-ready');
});
app.addEventListener('dragleave',event=>{
  const target=event.target.closest('[data-drop-kind]');
  if(target&&!target.contains(event.relatedTarget))target.classList.remove('drop-ready');
});
app.addEventListener('drop',event=>{
  const target=event.target.closest('[data-drop-kind]');
  if(!target||!dragging||target.dataset.dropKind!==dragging.kind)return;
  event.preventDefault();target.classList.remove('drop-ready');
  const {kind,id}=dragging,mode=task().mode;dragging=null;
  if(kind==='tool'&&mode==='pick'&&!run.selected.includes(id))select(id);
  if(kind==='role'&&mode==='tri'){run.activeRole=id;assign(target.dataset.id,'tri');}
  if(kind==='item'&&mode==='loadout'){run.activeItem=id;assign(target.dataset.id,'loadout');}
});
app.addEventListener('dragend',()=>{dragging=null;app.querySelectorAll('.dragging,.drop-ready').forEach(el=>el.classList.remove('dragging','drop-ready'));});

document.addEventListener('click',event=>{if(event.target.closest('[data-action="visual-close"]')||event.target===lightbox)closeLightbox();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&lightbox)closeLightbox();});

// Rutas con hash: el botón «atrás» del navegador navega dentro del juego y funcionan con file://.
let renderedRoute=null;
function go(hash,focusKey){
  if(location.hash!==hash)history.pushState(null,'',hash);
  route(focusKey);
}
function route(focusKey){
  renderedRoute=location.hash;
  if(lightbox)closeLightbox();
  const [,kind,value]=location.hash.match(/^#\/(sector|desafio|documento)\/([\w-]+)$/)||[];
  if(kind==='desafio'&&missions.some(m=>m.id===value)){startMission(value);return;}
  if(kind==='documento'&&documents[value]){renderDocument(value);return;}
  if(kind==='sector'&&modules.some(m=>String(m.id)===value))selectedModule=Number(value);
  renderMenu(focusKey);
}
window.addEventListener('popstate',()=>route());
window.addEventListener('hashchange',()=>{if(location.hash!==renderedRoute)route();});
function renderDocument(key){
  current=null;run=null;
  const doc=documents[key];
  shell(`<main class="doc-layout"><div class="game-toolbar"><a class="back-button" href="#/sector/${selectedModule}">← MAPA DE SECTORES</a><nav class="doc-tabs" aria-label="Documentos">${Object.entries(documents).map(([k,d])=>`<a href="#/documento/${k}" ${k===key?'aria-current="page"':''}>${esc(d.label)}</a>`).join('')}</nav></div><article class="doc-body">${renderMarkdown(doc.source)}</article></main>`);
  window.scrollTo({top:0});
  focusAfter(null,'.doc-body h2');
}
route();
