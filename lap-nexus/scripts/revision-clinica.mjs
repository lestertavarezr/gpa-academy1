// Genera REVISION-CLINICA.md a partir de src/data.js: npm run revision
import {writeFileSync} from 'node:fs';
import {modules,missions,PASS,COST} from '../src/data.js';

const verify={
  '1d':'Nivelar el horizonte girando el cabezal (no la óptica) en óptica de 30°.',
  '1f':'Torre al lado opuesto del operador presentada como correcta.',
  '2e':'Pinza sin cremallera y rueda con resistencia uniforme presentadas como normales.',
  '2g':'El poste metálico superior del disector se identifica como conexión del cable de energía; confirmar con el modelo de la foto.',
  '3c':'Inversión y escala del movimiento por efecto fulcro.',
  '4a':'Bipolar sin placa de retorno presentada como correcta.',
  '4e':'Cánula híbrida como riesgo capacitivo y cánula totalmente metálica como no alerta (FUSE).',
  '5c':'Patrones del insuflador: fuga (presión baja, flujo alto) y obstrucción (presión alta, sin flujo).',
  '7e':'Mismo mango para varias recargas en un paciente; colores de cartucho según altura de grapa.',
  '8a':'Etapa 3: el instrumentista recuerda la pausa acordada sin bloquear la entrega.',
  '8b':'Etapa 1: cánula híbrida frente a totalmente metálica.',
};
const cell=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
const out=[];
out.push('# LAP//NEXUS · Revisión clínica del rediseño','',
`Documento generado desde \`src/data.js\` para que el docente clínico apruebe el contenido. Cada desafío empieza con 100 % de integridad, cada error resta ${COST} % (10 % en casos encadenados) y se supera con ${PASS} %. El juego baraja el orden de las opciones; aquí aparecen en el orden de los datos.`,'',
'**Cómo revisar:** en la columna *Revisión* marque ✅ si está de acuerdo o escriba el cambio. Las filas marcadas con ⚠ contienen afirmaciones técnicas que conviene confirmar expresamente.','');
for(const mod of modules){
  out.push(`## Sector ${mod.code} · ${mod.title}`,'');
  for(const m of missions.filter(x=>x.module===mod.id)){
    out.push(`### ${m.id.toUpperCase()} · ${m.title}${verify[m.id]?' ⚠':''}`,'',`*${m.brief}*`,'');
    if(verify[m.id])out.push(`> ⚠ Confirmar: ${verify[m.id]}`,'');
    const stages=m.stages||[m];
    for(const [n,t] of stages.entries()){
      if(m.stages)out.push(`**Etapa ${n+1} · ${t.title}** (${t.mode}) — ${t.brief}`,'');
      out.push('| Elemento | ¿Correcto? | Explicación / consecuencia que ve el alumno | Revisión |','|---|---|---|---|');
      if(t.events)for(const e of t.events){out.push(`| **Señal:** ${cell(e.signal)} | | | |`);e.choices.forEach((c,i)=>out.push(`| ${cell(c[0])} | ${i?'✗':'✔'} | ${cell(c[1])} | |`));}
      if(t.options)for(const o of t.options)out.push(`| ${cell(o[1])} | ${t.answer.includes(o[0])?'✔ '+(t.mode==='fault'?'alerta':'elegir'):'✗ '+(t.mode==='fault'?'trampa':'no')} | ${cell(o[2])} | |`);
      if(t.cards||t.nodes){const list=t.cards||t.nodes;t.answer.forEach((id,i)=>out.push(`| ${i+1}. ${cell(list.find(c=>c[0]===id)[1])} | ✔ paso ${i+1} | | |`));list.filter(c=>!t.answer.includes(c[0])).forEach(c=>out.push(`| ${cell(c[1])} | ✗ señuelo | ${cell(c[2]||'Pertenece a otra ruta.')} | |`));}
      if(t.slots){const lab=new Map(t.items.map(i=>[i[0],i]));t.slots.forEach(([k,l])=>out.push(`| ${cell(l)} → ${cell(lab.get(t.answer[k])[1])} | ✔ | ${cell(lab.get(t.answer[k])[2])} | |`));t.items.filter(i=>!Object.values(t.answer).includes(i[0])).forEach(i=>out.push(`| ${cell(i[1])} | ✗ sobra | ${cell(i[2])} | |`));}
      if(t.roles){const lab=new Map(t.roles);t.positions.forEach(([k,l])=>out.push(`| ${cell(l)} → ${cell(lab.get(t.answer[k]))} | ✔ | | |`));}
      if(t.targets){const mk=new Map(t.markers.map(k=>[k[0],k[3]]));out.push(`| *Foto:* ${cell(t.photo.credit)} · marcadores: ${cell(t.markers.map(k=>k[3]).join(', '))} | | | |`);t.targets.forEach(q=>out.push(`| ${cell(q.prompt)} | ✔ ${cell(mk.get(q.answer))} | ${cell(q.why)} | |`));}
      out.push('',`Pista: ${t.hint}`,'');
    }
    out.push(`Lección final: ${m.lesson}`,'');
  }
}
writeFileSync(new URL('../REVISION-CLINICA.md',import.meta.url),out.join('\n'));
console.log('REVISION-CLINICA.md generado');
