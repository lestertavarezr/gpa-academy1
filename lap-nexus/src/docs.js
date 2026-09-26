import estudio from '../docs/ESTUDIO-MERCADO-30-DESAFIOS.md?raw';
import auditoria from '../docs/AUDITORIA-INSTRUMENTAL.md?raw';
import creditos from '../docs/CREDITOS-IMAGENES.md?raw';

export const documents = {
  estudio:{label:'Estudio y fuentes',source:estudio},
  auditoria:{label:'Auditoría instrumental',source:auditoria},
  creditos:{label:'Créditos de imágenes',source:creditos},
};

const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Escapa primero y solo después aplica el marcado permitido; los enlaces se limitan a https.
function inline(text){
  return esc(text)
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https:\/\/(?:[^()\s]|\([^()\s]*\))+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g,'$1<em>$2</em>');
}
const cells=line=>line.trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(c=>c.trim().replace(/\\\|/g,'|'));

export function renderMarkdown(md){
  const lines=md.replace(/\r/g,'').split('\n'),out=[];
  for(let i=0;i<lines.length;){
    const line=lines[i];
    if(!line.trim()){i++;continue;}
    const h=line.match(/^(#{1,4})\s+(.*)/);
    if(h){const n=Math.min(h[1].length+1,5);out.push(`<h${n}>${inline(h[2])}</h${n}>`);i++;continue;}
    if(line.trim().startsWith('|')&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1]||'')){
      const head=cells(line);i+=2;const rows=[];
      while(i<lines.length&&lines[i].trim().startsWith('|'))rows.push(cells(lines[i++]));
      out.push(`<div class="doc-table"><table><thead><tr>${head.map(c=>`<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    const list=line.match(/^\s*(-|\d+\.)\s+/);
    if(list){
      const ordered=list[1]!=='-',items=[];
      while(i<lines.length&&/^\s*(-|\d+\.)\s+/.test(lines[i]))items.push(lines[i++].replace(/^\s*(-|\d+\.)\s+/,''));
      out.push(`<${ordered?'ol':'ul'}>${items.map(t=>`<li>${inline(t)}</li>`).join('')}</${ordered?'ol':'ul'}>`);
      continue;
    }
    const para=[];
    while(i<lines.length&&lines[i].trim()&&!/^(#{1,4}\s|\s*\||\s*(-|\d+\.)\s)/.test(lines[i]))para.push(lines[i++]);
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}
