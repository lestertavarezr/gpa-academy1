// Prueba de extremo a extremo sobre dist/index.html (ejecutar después de `npm run build`).
// Uso: npm run test:e2e   ·   Navegador: CHROMIUM_PATH=/ruta/chrome si Playwright no tiene el suyo instalado.
import { chromium } from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SP = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-qa-'));
const url = pathToFileURL(path.join(root, 'dist/index.html')).href;
const src = fs.readFileSync(path.join(root, 'src/data.js'), 'utf8');
fs.writeFileSync(SP + '/data-qa.mjs', src.replace(/^import (\w+) from .*$/gm, "const $1 = '$1';"));
const { cases, sources } = await import(pathToFileURL(SP + '/data-qa.mjs').href);
const fails = [], notes = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function newPage(opts = {}) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => m.type() === 'error' && page.errors.push(m.text()));
  page.on('request', r => { const u = r.url(); if (!u.startsWith('file:') && !u.startsWith('data:')) page.errors.push('externa: ' + u); });
  page.on('dialog', d => d.accept());
  return page;
}
const ids = cs => cs.map(o => typeof o === 'string' ? o : o.id);
const corr = s => Array.isArray(s.correct) ? s.correct : [s.correct];

// 1. Los 15 casos, todo correcto al primer intento
{
  const page = await newPage(); await page.goto(url);
  for (const c of cases) {
    await page.click('[data-action="home"] >> nth=0');
    await page.click(`[data-action="start"][data-id="${c.id}"]`);
    check(await page.textContent('.game-header h1') === c.title, c.id + ' título');
    for (const [i, s] of c.steps.entries()) {
      const sel = s.kind === 'dressing' ? '.dressing-option' : '.answer-option';
      const shown = await page.$$eval(sel, els => els.map(e => e.dataset.id));
      check(shown.length === s.options.length && ids(s.options).every(x => shown.includes(x)), `${c.id}#${i+1} opciones mostradas ${shown}`);
      check(await page.locator('[data-action="submit"]').isDisabled(), `${c.id}#${i+1} confirmar debería estar deshabilitado`);
      if (s.kind === 'dressing') { const imgs = await page.$$eval('.dressing-option img', els => els.map(e => e.complete && e.naturalWidth > 0)); check(imgs.every(Boolean), `${c.id}#${i+1} imagen rota`); }
      for (const id of corr(s)) await page.click(`${sel}[data-id="${id}"]`);
      await page.click('[data-action="submit"]');
      const fb = await page.textContent('.feedback');
      check(fb.includes('Decisión fundamentada'), `${c.id}#${i+1} no marcó correcta`);
      check(fb.includes(s.explanation.slice(0, 30)), `${c.id}#${i+1} explicación ausente`);
      const href = await page.getAttribute('.feedback a', 'href');
      check(href === sources[s.source].url && /^https:\/\//.test(href), `${c.id}#${i+1} enlace de fuente ${href}`);
      await page.click('[data-action="next"]');
    }
    const pct = await page.textContent('.result-score strong');
    check(pct.startsWith('100'), c.id + ' resultado ' + pct);
    check(await page.evaluate(() => location.hash) === `#/caso/${c.id}/informe`, c.id + ' hash informe');
  }
  const side = (await page.textContent('.sidebar-bottom')).replace(/\s+/g, ' ');
  check(side.includes('4500 XP') && side.includes('15 de 15') && side.includes('Nivel 10'), 'XP final: ' + side);
  await page.click('[data-action="home"] >> nth=0');
  check((await page.$$('.card-status.is-done')).length === 15, 'tarjetas completadas');
  // repetir un caso con peor nota no quita XP
  await page.click('[data-action="start"][data-id="m1-a"]');
  const s0 = cases[0].steps;
  for (const s of s0) { const sel = s.kind === 'dressing' ? '.dressing-option' : '.answer-option'; const wrong = ids(s.options).filter(x => !corr(s).includes(x)); await page.click(`${sel}[data-id="${wrong[0]}"]`); await page.click('[data-action="submit"]'); await page.click('[data-action="retry"]'); await page.click(`${sel}[data-id="${wrong[1]}"]`); await page.click('[data-action="submit"]'); check(await page.$('.answer-option.is-correct, .dressing-option.is-correct') !== null, 'revela correcta'); await page.click('[data-action="next"]'); }
  check((await page.textContent('.result-score strong')).startsWith('0'), 'repetición todo mal = 0 %');
  check((await page.textContent('.sidebar-bottom')).includes('4500 XP'), 'repetición peor no cambia XP');
  check(page.errors.length === 0, 'errores flujo 1: ' + page.errors.join(' | '));
}

// 2. Selección múltiple: tercera elección, orden y fallo
{
  const page = await newPage(); await page.goto(url + '#/caso/m1-b');
  check(await page.textContent('.game-header h1') === 'La cicatrización se detiene', 'deep link a caso');
  await page.click('.answer-option[data-id="daily"]'); await page.click('.answer-option[data-id="swab"]');
  check(!(await page.locator('[data-action="submit"]').isDisabled()), 'select 2 habilita confirmar');
  await page.click('.answer-option[data-id="glucose"]');
  const chosen = await page.$$eval('.answer-option.chosen', els => els.map(e => e.dataset.id));
  check(chosen.length === 2, 'select máximo 2: ' + chosen);
  await page.click('.answer-option[data-id="glucose"]');
  check((await page.$$('.answer-option.chosen')).length === 1, 'select deseleccionar');
  check(await page.locator('[data-action="submit"]').isDisabled(), 'select 1 deshabilita confirmar');
  check(page.errors.length === 0, 'errores flujo 2: ' + page.errors.join(' | '));
}

// 3. Arrastrar y soltar un apósito
{
  const page = await newPage(); await page.goto(url + '#/caso/m1-a');
  await page.click('.answer-option[data-id="proliferation"]'); await page.click('[data-action="submit"]'); await page.click('[data-action="next"]');
  await page.dragAndDrop('.dressing-option[data-id="dry"]', '.wound-stage');
  check(await page.$('.applied-dressing') !== null, 'drag&drop aplica apósito');
  check(page.errors.length === 0, 'errores flujo 3: ' + page.errors.join(' | '));
}

// 4. Historial: atrás/adelante
{
  const page = await newPage(); await page.goto(url);
  await page.click('.nav-item[data-action="library"]');
  await page.click('[data-action="home"] >> nth=0');
  await page.click('[data-action="start"][data-id="m2-a"]');
  await page.goBack(); check(await page.$('.home-page') !== null, 'atrás desde caso -> panel');
  await page.goBack(); check(await page.$('.library-page') !== null, 'atrás -> biblioteca');
  await page.goForward(); await page.goForward(); check(await page.$('.game-page') !== null, 'adelante -> caso');
  await page.goto(url + '#/caso/m2-a/informe'); check(await page.$('.home-page') !== null, 'informe sin jugar -> panel');
  await page.goto(url + '#/caso/noexiste'); check(await page.$('.home-page') !== null, 'caso inexistente -> panel');
  await page.goto(url + '#/ruta/m4'); check((await page.$$('.case-card')).length === 5, 'ruta m4 filtra 5');
  check(page.errors.length === 0, 'errores flujo 4: ' + page.errors.join(' | '));
}

// 5. Progreso dañado
for (const bad of ['123', 'null', '"texto"', '[1,2]', '{"completed":[],"xp":"mucho"}', '{"completed":{"zz":{"score":1}},"xp":-5}', '{roto']) {
  const page = await newPage(); await page.goto(url);
  await page.evaluate(v => localStorage.setItem('atlas-heridas-v1', v), bad); await page.reload();
  const t = await page.textContent('.sidebar-bottom').catch(() => '');
  check(t.includes('0 XP') && t.includes('0 de 15'), 'progreso dañado ' + bad + ' -> ' + t.replace(/\s+/g, ' '));
  check(page.errors.length === 0, 'errores progreso ' + bad + ': ' + page.errors.join(' | '));
}

// 6. Móvil: sin scroll horizontal en todas las pantallas, menú y Esc
for (const width of [360, 390, 768]) {
  const page = await newPage({ viewport: { width, height: width === 360 ? 640 : 800 }, hasTouch: true, isMobile: width < 700 });
  const over = async name => { const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); check(w[0] <= w[1], `${width}px ${name}: scroll horizontal ${w}`);
    const cut = await page.evaluate(() => [...document.querySelectorAll('.main-shell *')].filter(el => { const r = el.getBoundingClientRect(); if (!r.width || el.closest('.hero-art, svg')) return false; return r.right > innerWidth + 1 || r.left < -1; }).slice(0, 3).map(el => el.className || el.tagName));
    check(cut.length === 0, `${width}px ${name}: elementos cortados ${cut}`); };
  await page.goto(url); await over('panel');
  await page.goto(url + '#/biblioteca'); await over('biblioteca');
  await page.goto(url + '#/guias'); await over('guías');
  for (const c of cases) { await page.goto(url + '#/caso/' + c.id); await over('caso ' + c.id); }
  await page.goto(url + '#/caso/m4-b');
  if (width < 900) {
    await page.click('.mobile-menu'); check(await page.$('.sidebar.open') !== null, width + ' menú abre');
    await page.keyboard.press('Escape'); check(await page.$('.sidebar.open') === null, width + ' Esc cierra menú');
  }
  await page.tap('.answer-option >> nth=0'); check((await page.$$('.answer-option.chosen')).length === 1, width + ' tap selecciona');
  const inView = sel => page.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 200 && r.top < innerHeight; }, sel);
  await page.tap('.answer-option[data-id="infected"]'); await page.tap('[data-action="submit"]'); await page.waitForTimeout(700);
  check(await inView('#feedback'), width + ' feedback visible tras confirmar');
  await page.tap('[data-action="next"]'); await page.waitForTimeout(700);
  check(await inView('.decision-panel h2'), width + ' pregunta visible tras avanzar');
  check(page.errors.length === 0, `errores móvil ${width}: ` + page.errors.join(' | '));
}

// 7. Solo teclado: completar el caso 05 con Tab/Enter/Espacio
{
  const page = await newPage(); await page.goto(url + '#/caso/m3-a');
  const c = cases.find(x => x.id === 'm3-a');
  async function activate(selector) {
    for (let k = 0; k < 60; k++) { await page.keyboard.press('Tab'); if (await page.evaluate(sel => document.activeElement?.matches(sel), selector)) { await page.keyboard.press('Enter'); return true; } }
    return false;
  }
  for (const s of c.steps) {
    const sel = s.kind === 'dressing' ? '.dressing-option' : '.answer-option';
    for (const id of corr(s)) check(await activate(`${sel}[data-id="${id}"]`), 'teclado: llegar a ' + id);
    check(await activate('[data-action="submit"]'), 'teclado: confirmar');
    check(await page.evaluate(() => document.activeElement?.id) === 'feedback', 'teclado: foco en feedback');
    check(await activate('[data-action="next"]'), 'teclado: siguiente');
  }
  check(await page.$('.result-page') !== null, 'teclado: llega al informe');
  const outline = await page.evaluate(() => { const b = document.querySelector('.result-actions .btn'); b.focus(); return getComputedStyle(b).outlineStyle; });
  check(outline !== 'none', 'foco visible en botones: ' + outline);
  check(page.errors.length === 0, 'errores teclado: ' + page.errors.join(' | '));
}

// 8. Varias partidas: la correcta no se queda en una posición fija
{
  const page = await newPage(); await page.goto(url);
  const pos = new Set();
  for (let k = 0; k < 15; k++) { await page.goto(url + '#/'); await page.goto(url + '#/caso/m4-d'); pos.add(await page.$$eval('.answer-option', els => els.findIndex(e => e.dataset.id === 'vascular'))); }
  check(pos.size >= 2, 'barajado: posiciones ' + [...pos]);
}

await browser.close();
console.log(fails.length ? 'FALLOS (' + fails.length + '):\n- ' + fails.join('\n- ') : 'TODO OK');
process.exitCode = fails.length ? 1 : 0;
