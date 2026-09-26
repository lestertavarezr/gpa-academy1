// Prueba de extremo a extremo sobre dist/index.html abierto con file:// (ejecutar después de `npm run build`).
// Uso: npm run test:e2e   ·   Navegador: CHROMIUM_PATH=/ruta/chrome si Playwright no tiene el suyo instalado.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { missions } from '../src/data.js';
import { visualAtlas, toolPhotos } from '../src/media.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URL = pathToFileURL(path.join(root, 'dist/index.html')).href;
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => m.type() === 'error' && page.errors.push(m.text()));
  page.on('requestfailed', r => page.errors.push('falló: ' + r.url()));
  page.on('request', r => { const u = r.url(); if (!u.startsWith('file:') && !u.startsWith('data:')) page.errors.push('petición externa: ' + u); });
  return page;
}
const byId = id => missions.find(m => m.id === id);
async function open(page, m, { clear = true } = {}) {
  await page.goto(URL);
  if (clear) await page.evaluate(() => localStorage.clear());
  await page.goto(`${URL}#/desafio/${m.id}`);
  await page.waitForSelector('.game-panel');
}
async function solve(page, t) {
  const a = t.answer, c = s => page.click(s);
  if (['route', 'order', 'pick', 'fault'].includes(t.mode)) { for (const id of a) await c(`[data-action="select"][data-id="${id}"]`); await c('[data-action="check"]'); }
  else if (t.mode === 'tri') { for (const [k, v] of Object.entries(a)) { await c(`[data-action="role"][data-id="${v}"]`); await c(`[data-action="position"][data-id="${k}"]`); } await c('[data-action="check"]'); }
  else if (t.mode === 'loadout') { for (const [k, v] of Object.entries(a)) { await c(`[data-action="item"][data-id="${v}"]`); await c(`[data-action="slot"][data-id="${k}"]`); } await c('[data-action="check"]'); }
  else if (t.mode === 'response') for (const _ of t.events) { await c('[data-action="answer"][data-id="0"]'); await c('[data-action="q-next"]'); }
  else if (t.mode === 'scan') for (const q of t.targets) { await c(`[data-action="answer"][data-id="${q.answer}"]`); await c('[data-action="q-next"]'); }
}
async function playAll(page, m) {
  const stages = m.stages || [m];
  for (const [i, t] of stages.entries()) { await solve(page, t); if (i < stages.length - 1) await page.click('[data-action="stage-next"]'); }
}
const brokenImages = page => page.$$eval('img', imgs => imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')));
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

// 1. Archivos de imagen referenciados existen en dist/images
const files = new Set();
for (const list of Object.values(visualAtlas)) for (const im of list) files.add(im.file);
for (const t of Object.values(toolPhotos)) files.add(t.file);
for (const m of missions) for (const t of m.stages || [m]) if (t.photo) files.add(t.photo.file);
for (const f of files) { const name = /\.\w+$/.test(f) ? f : f + '.jpg'; check(fs.existsSync(path.join(root, 'dist/images', name)), `falta dist/images/${name}`); }

// 2. Los 48 desafíos se completan con 100 y sin errores; las fotos cargan
const page = await newPage();
const firstPos = [];
for (const m of missions) {
  await open(page, m);
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.images].every(i => i.complete));
  const broken = await brokenImages(page);
  check(!broken.length, `${m.id}: imágenes rotas ${broken.join(', ')}`);
  const t0 = m.stages ? m.stages[0] : m;
  if (t0.cards || t0.nodes) firstPos.push((await page.$$eval('[data-action="select"]', els => els.map(e => e.dataset.id))).indexOf(t0.answer[0]));
  await playAll(page, m);
  const txt = await page.textContent('.result-card').catch(() => '');
  check(txt.includes('DESAFÍO SUPERADO') && /100\s*INTEGRIDAD/.test(txt), `${m.id}: no terminó superado con 100`);
}
check(new Set(firstPos).size >= 3, `el barajado no varía la posición de la primera tarjeta: ${firstPos}`);
check(firstPos.filter(p => p === 0).length < firstPos.length / 2, 'la primera respuesta aparece arriba con demasiada frecuencia');

// 3. Barajado de respuestas en señales: la correcta cambia de posición entre partidas
const positions = new Set();
for (let i = 0; i < 12; i++) { await open(page, byId('5a')); positions.add(await page.$$eval('[data-action="answer"]', els => els.findIndex(e => e.dataset.id === '0'))); }
check(positions.size >= 2, 'la respuesta correcta de 5a siempre está en la misma posición');

// 4. Dos intentos, revelado, umbral de aprobación e informe
await open(page, byId('5a'));
await page.click('[data-action="answer"][data-id="1"]');
check((await page.textContent('.integrity b')) === '85%', 'un error no resta 15');
check(await page.isDisabled('[data-action="q-next"]'), 'tras el primer error no debe poder avanzar');
await page.click('[data-action="answer"][data-id="2"]');
check(await page.isEnabled('[data-action="q-next"]') && (await page.$('.response-choice.is-correct')), 'el segundo error no revela la respuesta');
await page.click('[data-action="q-next"]');
for (let i = 1; i < 3; i++) { await page.click('[data-action="answer"][data-id="0"]'); await page.click('[data-action="q-next"]'); }
check((await page.textContent('.result-card')).includes('DESAFÍO SUPERADO'), '70 debe superar');
await open(page, byId('1d'));
for (let i = 0; i < 3; i++) { await page.click('[data-action="answer"][data-id="1"]'); await page.click('[data-action="answer"][data-id="2"]'); await page.click('[data-action="q-next"]'); }
const failTxt = await page.textContent('.result-card');
check(failTxt.includes('NO SUPERADO') && !(await page.$('[data-action="next"]')), '1d fallado no se marca como no superado');
check((await page.$$('.debrief li')).length === 6, 'el informe no lista las 6 incidencias');
await open(page, byId('4a'));
for (const id of ['insul', 'return', 'bipolar']) await page.click(`[data-action="select"][data-id="${id}"]`);
await page.click('[data-action="check"]'); await page.click('[data-action="check"]');
check((await page.$$('.fault-tile.is-wrong')).length === 1 && (await page.$$('.fault-tile.is-correct')).length === 3, 'la inspección revelada no marca aciertos y trampa');
check(await page.evaluate(() => document.activeElement !== document.body), 'el foco se pierde tras comprobar');
await page.click('[data-action="select"][data-id="bipolar"]'); await page.click('[data-action="select"][data-id="blind"]'); await page.click('[data-action="check"]');
check(/70\s*INTEGRIDAD/.test(await page.textContent('.result-card')), 'tras revelar no debe descontar más');

// 5. Progreso persistente y almacenamiento corrupto
await open(page, byId('1a'));
await playAll(page, byId('1a'));
await page.goto(`${URL}#/sector/1`); await page.reload();
check((await page.textContent('[data-action="start"][data-id="1a"] .mission-result')).includes('SUPERADO'), 'el progreso no persiste al recargar');
for (const bad of ['x', 'null', '[]', '{"best":"a"}', '{"best":{"1a":-5,"2a":999,"3a":"80","zz":100}}']) {
  await page.evaluate(v => localStorage.setItem('gpa-lap-nexus-v3', v), bad);
  page.errors.length = 0;
  await page.goto(`${URL}#/`); await page.reload();
  check(!page.errors.length && await page.$('.mission-panel'), `almacenamiento corrupto rompe el juego: ${bad}`);
}
check((await page.textContent('.hero-stats b')) === '01', 'el saneado del almacenamiento no conserva solo valores válidos');

// 6. Rutas: enlace directo, atrás/adelante, documentos, ruta inválida
await page.goto(`${URL}#/desafio/5c`);
check((await page.textContent('.mission-header h1')) === byId('5c').title, 'el enlace directo no abre el desafío');
await page.goto(`${URL}#/`); await page.click('[data-action="module"][data-id="4"]');
check(page.url().endsWith('#/sector/4'), 'elegir sector no actualiza la ruta');
await page.click('[data-action="start"][data-id="4c"]');
await page.goBack();
check(await page.$('.mission-panel') && (await page.textContent('.mission-panel .section-eyebrow')).includes('SECTOR 04'), 'atrás no vuelve al sector');
await page.goForward();
check((await page.textContent('.mission-header h1')) === byId('4c').title, 'adelante no vuelve al desafío');
await page.click('footer a[href="#/documento/creditos"]');
check(await page.$('.doc-body table') && (await page.$$eval('.doc-body a', as => as.every(a => a.href.startsWith('https://') && a.target === '_blank'))), 'el documento de créditos no se muestra bien');
await page.goBack();
check(await page.$('.game-panel'), 'atrás desde un documento no vuelve al desafío');
await page.goto(`${URL}#/nada/que-ver`);
check(await page.$('.mission-panel'), 'una ruta inválida no cae en el menú');

// 7. Teclado: jugar 1a solo con Enter y comprobar que el foco no se pierde
await open(page, byId('1a'));
for (const id of byId('1a').answer) { await page.focus(`[data-action="select"][data-id="${id}"]`); await page.keyboard.press('Enter'); check(await page.evaluate(() => document.activeElement !== document.body), 'el foco se pierde al seleccionar con teclado'); }
await page.focus('[data-action="check"]'); await page.keyboard.press('Enter');
check(await page.$('.result-card'), 'no se puede completar con teclado');
check(!page.errors.length, `errores en consola: ${page.errors.join(' | ')}`);

// 8. Móvil y tableta: sin desbordamiento horizontal en ninguna pantalla
for (const width of [360, 390, 768]) {
  const p = await newPage({ viewport: { width, height: 800 } });
  await p.goto(URL);
  check(await overflow(p) <= 0, `desborde ${width}px en el menú`);
  for (const id of ['1a', '1d', '1e', '2a', '2g', '3a', '4a', '7a', '8a']) { await open(p, byId(id)); check(await overflow(p) <= 0, `desborde ${width}px en ${id}`); }
  await open(p, byId('2g')); await playAll(p, byId('2g'));
  check(await overflow(p) <= 0, `desborde ${width}px en el informe`);
  for (const d of ['creditos', 'estudio', 'auditoria']) { await p.goto(`${URL}#/documento/${d}`); check(await overflow(p) <= 0, `desborde ${width}px en documento ${d}`); }
  check(!p.errors.length, `errores ${width}px: ${p.errors.join(' | ')}`);
}

await browser.close();
if (fails.length) { console.error(`✗ ${fails.length} fallos:\n- ` + fails.join('\n- ')); process.exit(1); }
console.log(`✓ E2E: ${missions.length} desafíos, barajado, intentos y revelado, persistencia, rutas, teclado y 3 anchos de pantalla sin errores ni peticiones externas.`);
