import assert from 'node:assert/strict';
import {missions,modules} from '../src/data.js';
import {toolPhotos,visualAtlas} from '../src/media.js';

const ids=new Set();
const flat=[];
for(const m of missions){
  assert(!ids.has(m.id),`id duplicado ${m.id}`);ids.add(m.id);
  assert(modules.some(x=>x.id===m.module),`${m.id}: módulo inexistente`);
  assert(visualAtlas[m.module]?.length||m.mode==='scan',`${m.id}: sin atlas visual`);
  assert(m.lesson,`${m.id}: sin lección`);
  for(const [i,t] of (m.stages||[m]).entries())flat.push({t,name:m.stages?`${m.id}#${i+1}`:m.id});
}
let longest=0,events=0;
for(const {t,name} of flat){
  assert(t.hint,`${name}: sin pista`);
  if(t.mode==='response')for(const e of t.events){
    assert.equal(e.choices.length,3,`${name}: ${e.signal} necesita 3 opciones`);
    for(const c of e.choices)assert(c[0]&&c[1],`${name}: opción sin texto o porqué`);
    const L=e.choices.map(c=>c[0].length);events++;
    if(L[0]===Math.max(...L))longest++;
    assert(L[0]<=Math.min(...L.slice(1))*1.5,`${name}: la correcta «${e.choices[0][0]}» es mucho más larga que los distractores`);
  }
  if(t.mode==='pick'||t.mode==='fault'){
    assert.equal(t.answer.length,t.count,`${name}: count`);
    for(const o of t.options)assert(o[2],`${name}: ${o[0]} sin porqué`);
    for(const a of t.answer)assert(t.options.some(o=>o[0]===a),`${name}: respuesta ${a} no está en opciones`);
    if(t.mode==='pick')for(const o of t.options)assert(toolPhotos[o[0]],`${name}: sin foto para ${o[0]}`);
  }
  if(t.mode==='order'||t.mode==='route'){
    const list=t.nodes||t.cards;
    for(const a of t.answer)assert(list.some(c=>c[0]===a),`${name}: ${a} no existe`);
    assert(list.length>t.answer.length,`${name}: necesita al menos un señuelo`);
    if(t.cards)for(const c of t.cards)if(!t.answer.includes(c[0]))assert(c[2],`${name}: señuelo ${c[0]} sin porqué`);
  }
  if(t.mode==='loadout'){
    assert(t.items.length>t.slots.length,`${name}: necesita un elemento que sobre`);
    for(const i of t.items)assert(toolPhotos[i[0]]&&i[2],`${name}: ${i[0]} sin foto o porqué`);
    for(const v of Object.values(t.answer))assert(t.items.some(i=>i[0]===v),`${name}: ${v}`);
  }
  if(t.mode==='scan'){
    assert(t.photo?.file&&t.photo.credit&&t.photo.source.startsWith('https://'),`${name}: foto sin crédito`);
    for(const q of t.targets){assert(t.markers.some(k=>k[0]===q.answer),`${name}: objetivo ${q.answer}`);assert(q.why&&q.prompt);}
    assert(t.markers.length>=t.targets.length+1,`${name}: necesita marcadores señuelo`);
    for(const [,x,y] of t.markers)assert(x>=0&&x<=100&&y>=0&&y<=100);
  }
}
const ratio=longest/events;
console.log(`${missions.length} desafíos · ${flat.length} tableros · ${events} señales · correcta más larga: ${longest}/${events} (${Math.round(ratio*100)} %)`);
assert(ratio<=0.5,'La respuesta correcta sigue siendo casi siempre la más larga');
console.log('OK');
