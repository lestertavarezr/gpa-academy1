"use strict";
/* =========================================================================
   Dr. Mario Estudiante — El Camino a la Bata Blanca
   Plataformas estilo Mario Bros con un estudiante de medicina como héroe.
   Motor propio en Canvas 2D, sin dependencias externas.
   ========================================================================= */

const TILE = 32;
const COLS_VISIBLE = 25;
const ROWS_VISIBLE = 15;
const CANVAS_W = TILE * COLS_VISIBLE;
const CANVAS_H = TILE * ROWS_VISIBLE;

const GRAVITY = 0.62;
const MAX_FALL = 14;
const MOVE_SPEED = 3.6;
const MOVE_SPEED_BOOST = 5.6;
const JUMP_VEL = -12.6;
const FRICTION = 0.78;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ---------------------------- Audio (WebAudio synth, no assets) --------- */
const Sound = (() => {
  let actx = null;
  function ctxReady() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    return actx;
  }
  function tone(freq, dur, type = "square", vol = 0.08, delay = 0) {
    const ac = ctxReady();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }
  return {
    jump: () => tone(520, 0.12, "square", 0.07),
    stomp: () => { tone(200, 0.08, "square", 0.09); tone(120, 0.1, "square", 0.07, 0.05); },
    coin: () => { tone(988, 0.08, "square", 0.06); tone(1318, 0.12, "square", 0.06, 0.07); },
    power: () => { tone(300, 0.1, "sawtooth", 0.07); tone(500, 0.1, "sawtooth", 0.07, 0.1); tone(700, 0.16, "sawtooth", 0.07, 0.2); },
    hurt: () => { tone(180, 0.2, "sawtooth", 0.09); tone(90, 0.25, "sawtooth", 0.08, 0.08); },
    hit: () => tone(150, 0.1, "square", 0.08),
    win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, "triangle", 0.08, i * 0.14)); },
    lose: () => { [400, 300, 200, 120].forEach((f, i) => tone(f, 0.3, "sawtooth", 0.08, i * 0.18)); },
    resume: () => ctxReady(),
  };
})();

/* ---------------------------- Input -------------------------------------- */
const keys = {};
const Input = { left: false, right: false, jumpPressed: false, jumpHeld: false };

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  if (e.code === "KeyP" || e.code === "Escape") togglePause();
  Sound.resume();
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function readInput() {
  Input.left = !!(keys["ArrowLeft"] || keys["KeyA"] || touchState.left);
  Input.right = !!(keys["ArrowRight"] || keys["KeyD"] || touchState.right);
  const jumpNow = !!(keys["ArrowUp"] || keys["KeyW"] || keys["Space"] || touchState.jump);
  Input.jumpPressed = jumpNow && !Input.jumpHeld;
  Input.jumpHeld = jumpNow;
}

const touchState = { left: false, right: false, jump: false };
function bindTouch(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  const on = (v) => (e) => { e.preventDefault(); touchState[key] = v; Sound.resume(); };
  el.addEventListener("touchstart", on(true), { passive: false });
  el.addEventListener("touchend", on(false), { passive: false });
  el.addEventListener("touchcancel", on(false), { passive: false });
  el.addEventListener("mousedown", on(true));
  el.addEventListener("mouseup", on(false));
  el.addEventListener("mouseleave", on(false));
}
bindTouch("btn-left", "left");
bindTouch("btn-right", "right");
bindTouch("btn-jump", "jump");

/* ---------------------------- Level building ------------------------------
   Tile legend:
   '.' empty   '#' ground/solid   'B' brick(solid, breakable in caffeine mode)
   '?' item block (solid, pops coffee/note when hit from below)
   'U' used block   'F' flagpole column (goal trigger, not solid)
   --------------------------------------------------------------------------*/
function emptyGrid(cols, rows) {
  const g = [];
  for (let r = 0; r < rows; r++) g.push(new Array(cols).fill("."));
  return g;
}

function buildLevel(spec) {
  const rows = ROWS_VISIBLE;
  const grid = emptyGrid(spec.cols, rows);
  const enemies = [];
  const items = [];
  const decor = [];
  let col = 0;
  const groundRow = rows - 2; // two-tile-deep ground

  function setSolidCol(c, top, char) {
    for (let r = top; r < rows; r++) {
      if (r === top) grid[r][c] = char;
      else grid[r][c] = char === "#" ? "#" : grid[r][c];
    }
  }

  for (const chunk of spec.chunks) {
    switch (chunk.type) {
      case "ground": {
        for (let i = 0; i < chunk.len; i++) {
          grid[groundRow][col + i] = "#";
          grid[groundRow + 1][col + i] = "#";
          if (chunk.enemyEvery && i > 1 && i % chunk.enemyEvery === 0) {
            enemies.push({ x: (col + i) * TILE, y: (groundRow) * TILE, type: chunk.enemyType || "germ" });
          }
        }
        if (chunk.items) {
          chunk.items.forEach((off) => items.push({ x: (col + off) * TILE, y: (groundRow - 2) * TILE, type: "note" }));
        }
        col += chunk.len;
        break;
      }
      case "gap": {
        col += chunk.len;
        break;
      }
      case "platform": {
        const row = chunk.row;
        for (let i = 0; i < chunk.len; i++) {
          grid[row][col + i] = chunk.brick ? "B" : "#";
        }
        if (chunk.item) {
          const mid = col + Math.floor(chunk.len / 2);
          grid[row - 1][mid] = "?";
        }
        if (chunk.enemyOnTop) {
          enemies.push({ x: (col + 1) * TILE, y: (row - 1) * TILE, type: chunk.enemyType || "germ" });
        }
        col += chunk.len;
        break;
      }
      case "stairs": {
        // ascending staircase made of solid blocks
        const dir = chunk.dir || 1; // 1 = up going right, -1 = down going right
        for (let i = 0; i < chunk.steps; i++) {
          const h = dir === 1 ? i + 1 : chunk.steps - i;
          for (let s = 0; s < h; s++) {
            const r = groundRow - s;
            grid[r][col + i] = "#";
          }
        }
        col += chunk.steps;
        break;
      }
      case "gapAfterStairsDown": {
        col += chunk.len || 2;
        break;
      }
      case "coffeeBlock": {
        grid[chunk.row][col] = "?";
        col += 1;
        break;
      }
      case "flag": {
        for (let r = 2; r <= groundRow - 1; r++) grid[r][col] = "F";
        grid[groundRow][col] = "#";
        grid[groundRow + 1][col] = "#";
        spec.flagCol = col;
        col += 3;
        break;
      }
      case "space": {
        col += chunk.len;
        break;
      }
    }
  }

  // Fill remaining ground to end
  while (col < spec.cols) {
    grid[groundRow][col] = "#";
    grid[groundRow + 1][col] = "#";
    col++;
  }

  return { grid, enemies, items, cols: spec.cols, rows, theme: spec.theme, name: spec.name, decor, flagCol: spec.flagCol };
}

function level1Spec() {
  return {
    name: "Aula de Anatomía",
    theme: "classroom",
    cols: 140,
    chunks: [
      { type: "ground", len: 14 },
      { type: "gap", len: 2 },
      { type: "ground", len: 10, enemyEvery: 6, items: [3, 7] },
      { type: "platform", row: 9, len: 4, item: true },
      { type: "gap", len: 3 },
      { type: "ground", len: 8 },
      { type: "stairs", steps: 5, dir: 1 },
      { type: "stairs", steps: 5, dir: -1 },
      { type: "ground", len: 6, enemyEvery: 3, enemyType: "germ" },
      { type: "gap", len: 2 },
      { type: "platform", row: 10, len: 3 },
      { type: "platform", row: 7, len: 3, item: true },
      { type: "ground", len: 12, enemyEvery: 5, items: [2, 6, 10] },
      { type: "gap", len: 3 },
      { type: "ground", len: 6 },
      { type: "platform", row: 9, len: 5, enemyOnTop: true },
      { type: "ground", len: 10, enemyEvery: 4 },
      { type: "stairs", steps: 4, dir: 1 },
      { type: "ground", len: 8, items: [1, 3, 5] },
      { type: "gap", len: 4 },
      { type: "ground", len: 10, enemyEvery: 3 },
      { type: "platform", row: 8, len: 4, item: true },
      { type: "ground", len: 8 },
      { type: "flag" },
    ],
  };
}

function level2Spec() {
  return {
    name: "Guardia en el Hospital",
    theme: "hospital",
    cols: 150,
    chunks: [
      { type: "ground", len: 10 },
      { type: "platform", row: 10, len: 3, item: true },
      { type: "gap", len: 3 },
      { type: "ground", len: 8, enemyEvery: 3, enemyType: "bacteria" },
      { type: "platform", row: 8, len: 4, enemyOnTop: true },
      { type: "gap", len: 3 },
      { type: "ground", len: 6 },
      { type: "stairs", steps: 6, dir: 1 },
      { type: "gap", len: 3 },
      { type: "stairs", steps: 6, dir: -1 },
      { type: "ground", len: 10, enemyEvery: 4, items: [2, 5, 8] },
      { type: "gap", len: 4 },
      { type: "ground", len: 6 },
      { type: "platform", row: 9, len: 3, item: true },
      { type: "platform", row: 6, len: 3 },
      { type: "ground", len: 12, enemyEvery: 3, enemyType: "bacteria" },
      { type: "gap", len: 2 },
      { type: "ground", len: 8 },
      { type: "platform", row: 10, len: 5, enemyOnTop: true },
      { type: "gap", len: 3 },
      { type: "ground", len: 10, items: [1, 4, 7] },
      { type: "stairs", steps: 5, dir: 1 },
      { type: "ground", len: 6, enemyEvery: 3 },
      { type: "gap", len: 4 },
      { type: "ground", len: 10, enemyEvery: 3, enemyType: "bacteria" },
      { type: "platform", row: 8, len: 4, item: true },
      { type: "ground", len: 10 },
      { type: "flag" },
    ],
  };
}

function bossSpec() {
  return {
    name: "Examen Final",
    theme: "boss",
    cols: 44,
    chunks: [
      { type: "ground", len: 44 },
    ],
  };
}

/* ---------------------------- Entities ------------------------------------ */
class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 24; this.h = 34;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.caffeinated = false;
    this.caffeineTimer = 0;
    this.invincible = 0;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.dead = false;
    this.winPose = false;
  }
  get hitH() { return this.caffeinated ? 42 : 34; }
}

class Enemy {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.w = 26; this.h = 22;
    this.type = type;
    this.vx = type === "bacteria" ? -1.1 : -1.4;
    this.vy = 0;
    this.alive = true;
    this.squish = 0;
    this.wobble = Math.random() * Math.PI * 2;
  }
}

class Item {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.w = 20; this.h = 20;
    this.type = type; // 'note' | 'coffee' | 'coffeePower'
    this.collected = false;
    this.vy = 0;
    this.popTimer = type === "coffeePower" ? 1 : 0;
    this.bob = Math.random() * Math.PI * 2;
  }
}

class Particle {
  constructor(x, y, vx, vy, color, life, text) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.color = color; this.life = life; this.maxLife = life; this.text = text;
  }
}

/* ---------------------------- Game state ----------------------------------- */
const Game = {
  state: "menu", // menu, playing, paused, transition, gameover, win, bossintro
  levelIndex: 0,
  levels: [level1Spec(), level2Spec(), bossSpec()],
  current: null,
  player: null,
  enemies: [],
  items: [],
  particles: [],
  score: 0,
  lives: 3,
  time: 300,
  timeAccum: 0,
  cameraX: 0,
  frame: 0,
  boss: null,
  transitionTimer: 0,
  transitionMsg: "",
  flagged: false,
};

function tileAt(grid, col, row) {
  if (col < 0 || col >= grid[0].length) return "#"; // side walls block escaping the level
  if (row < 0) return "#"; // ceiling
  if (row >= grid.length) return "."; // below the map is open air (pit death), not solid
  return grid[row][col];
}
function isSolid(ch) {
  return ch === "#" || ch === "B" || ch === "?" || ch === "U";
}

function loadLevel(index) {
  Game.levelIndex = index;
  const spec = Game.levels[index];
  Game.current = buildLevel(spec);
  Game.player = new Player(TILE * 2, (ROWS_VISIBLE - 4) * TILE);
  Game.enemies = Game.current.enemies.map((e) => new Enemy(e.x, e.y, e.type));
  Game.items = Game.current.items.map((it) => new Item(it.x, it.y, it.type));
  // sprinkle coffee power blocks: convert some '?' already in grid; also add a guaranteed one early
  Game.particles = [];
  Game.time = spec.theme === "boss" ? 200 : 300;
  Game.timeAccum = 0;
  Game.cameraX = 0;
  Game.flagged = false;
  Game.boss = spec.theme === "boss" ? makeBoss() : null;
  document.getElementById("hud-level").textContent = spec.name;
}

function makeBoss() {
  return {
    x: 40 * TILE - 5 * TILE,
    y: (ROWS_VISIBLE - 2) * TILE - 90,
    w: 70, h: 90,
    vx: 1.6,
    hp: 3,
    maxHp: 3,
    hitTimer: 0,
    attackTimer: 90,
    projectiles: [],
    alive: true,
    introTimer: 60,
    defeated: false,
    shakeTimer: 0,
  };
}

function resetRun() {
  Game.score = 0;
  Game.lives = 3;
  loadLevel(0);
}

/* ---------------------------- Collision helpers ---------------------------- */
function moveAndCollide(entity, grid, opts = {}) {
  const cols = grid[0].length;
  const rows = grid.length;

  // Horizontal
  entity.x += entity.vx;
  let box = { x: entity.x, y: entity.y, w: entity.w, h: entity.hitH || entity.h };
  let c0 = Math.floor(box.x / TILE);
  let c1 = Math.floor((box.x + box.w - 1) / TILE);
  let r0 = Math.floor(box.y / TILE);
  let r1 = Math.floor((box.y + box.h - 1) / TILE);
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      if (c < 0) { entity.x = 0; entity.vx = 0; continue; }
      if (isSolid(tileAt(grid, c, r))) {
        if (entity.vx > 0) entity.x = c * TILE - box.w;
        else if (entity.vx < 0) entity.x = (c + 1) * TILE;
        entity.vx = opts.bounceOnHit ? -entity.vx : 0;
      }
    }
  }

  // Vertical
  entity.y += entity.vy;
  entity.onGround = false;
  box = { x: entity.x, y: entity.y, w: entity.w, h: entity.hitH || entity.h };
  c0 = Math.floor(box.x / TILE);
  c1 = Math.floor((box.x + box.w - 1) / TILE);
  r0 = Math.floor(box.y / TILE);
  r1 = Math.floor((box.y + box.h - 1) / TILE);
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      if (r >= rows) continue;
      const ch = tileAt(grid, c, r);
      if (isSolid(ch)) {
        if (entity.vy > 0) {
          entity.y = r * TILE - box.h;
          entity.vy = 0;
          entity.onGround = true;
        } else if (entity.vy < 0) {
          entity.y = (r + 1) * TILE;
          entity.vy = 0;
          if (opts.onHeadBump) opts.onHeadBump(c, r);
        }
      }
    }
  }
  if (entity.y + (entity.hitH || entity.h) > rows * TILE + 200) {
    if (opts.onFallDeath) opts.onFallDeath();
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/* ---------------------------- Update logic --------------------------------- */
function addParticle(x, y, color, text) {
  Game.particles.push(new Particle(x, y, (Math.random() - 0.5) * 2, -2 - Math.random(), color, 40, text));
}

function damagePlayer() {
  const p = Game.player;
  if (p.invincible > 0 || Game.flagged) return;
  Sound.hurt();
  if (p.caffeinated) {
    p.caffeinated = false;
    p.invincible = 90;
  } else {
    Game.lives--;
    document.getElementById("hud-lives").textContent = "❤️".repeat(Math.max(Game.lives, 0));
    if (Game.lives <= 0) {
      Game.state = "gameover";
      Sound.lose();
    } else {
      p.invincible = 120;
      // small knockback reset position slightly back
      p.x = Math.max(p.x - 60, Game.cameraX + 20);
      p.vy = -6;
    }
  }
}

function updatePlayer() {
  const p = Game.player;
  const grid = Game.current.grid;
  if (p.dead) return;

  const speed = p.caffeinated ? MOVE_SPEED_BOOST : MOVE_SPEED;
  if (Input.left) { p.vx = -speed; p.facing = -1; }
  else if (Input.right) { p.vx = speed; p.facing = 1; }
  else { p.vx *= FRICTION; if (Math.abs(p.vx) < 0.05) p.vx = 0; }

  if (Input.jumpPressed && p.onGround) {
    p.vy = JUMP_VEL;
    p.onGround = false;
    Sound.jump();
  }

  p.vy += GRAVITY;
  if (p.vy > MAX_FALL) p.vy = MAX_FALL;

  moveAndCollide(p, grid, {
    onHeadBump: (c, r) => {
      const ch = grid[r][c];
      if (ch === "?") {
        grid[r][c] = "U";
        const type = Math.random() < 0.5 ? "coffeePower" : "note";
        const it = new Item(c * TILE, r * TILE - TILE, type);
        it.vy = -1.5;
        it.popping = true;
        Game.items.push(it);
        Sound.hit();
      } else if (ch === "B" && p.caffeinated) {
        grid[r][c] = ".";
        Sound.hit();
        for (let i = 0; i < 4; i++) addParticle(c * TILE + 16, r * TILE + 16, "#c9a06a");
      } else if (ch === "B" || ch === "U") {
        Sound.hit();
      }
    },
    onFallDeath: () => damagePlayer2Death(),
  });

  if (p.x < 0) p.x = 0;

  // walk animation
  if (Math.abs(p.vx) > 0.3 && p.onGround) {
    p.walkTimer++;
    if (p.walkTimer > 6) { p.walkFrame = (p.walkFrame + 1) % 2; p.walkTimer = 0; }
  } else {
    p.walkFrame = 0;
  }

  if (p.invincible > 0) p.invincible--;
  if (p.caffeineTimer > 0) {
    p.caffeineTimer--;
    if (p.caffeineTimer === 0) p.caffeinated = false;
  }

  // camera
  const levelPxW = Game.current.cols * TILE;
  Game.cameraX = Math.max(0, Math.min(p.x - CANVAS_W / 2 + 60, levelPxW - CANVAS_W));

  // flagpole check
  if (!Game.flagged && Game.current.flagCol !== undefined) {
    const flagX = Game.current.flagCol * TILE;
    if (p.x + p.w >= flagX) {
      Game.flagged = true;
      p.winPose = true;
      p.vx = 0;
      Sound.win();
      Game.transitionTimer = 100;
      Game.transitionMsg = Game.levelIndex === 0
        ? "¡Aprobaste Anatomía! Cargando el Hospital…"
        : "¡Turno completado! Preparando el Examen Final…";
      Game.state = "transition";
    }
  }
}

function damagePlayer2Death() {
  // fell in a pit -> always lose a life regardless of caffeine
  const p = Game.player;
  if (Game.flagged) return;
  Sound.hurt();
  Game.lives--;
  document.getElementById("hud-lives").textContent = "❤️".repeat(Math.max(Game.lives, 0));
  if (Game.lives <= 0) {
    Game.state = "gameover";
    Sound.lose();
  } else {
    p.x = Math.max(p.x - 80, TILE);
    p.y = (ROWS_VISIBLE - 4) * TILE;
    p.vx = 0; p.vy = 0;
    p.caffeinated = false;
    p.invincible = 120;
  }
}

function updateEnemies() {
  const grid = Game.current.grid;
  const p = Game.player;
  for (const en of Game.enemies) {
    if (!en.alive) {
      en.squish += 1;
      continue;
    }
    en.vy += GRAVITY;
    if (en.vy > MAX_FALL) en.vy = MAX_FALL;
    en.wobble += 0.15;

    const prevX = en.x;
    moveAndCollide(en, grid, {});
    // reverse on wall hit
    if (Math.abs(en.vx) < 0.01) en.vx = (prevX < en.x ? -1 : 1) * Math.abs(en.type === "bacteria" ? 1.1 : 1.4);
    // simple ledge/gap detection: check tile ahead-below
    if (en.onGround) {
      const dir = en.vx < 0 ? -1 : 1;
      const aheadCol = Math.floor((en.x + (dir > 0 ? en.w + 2 : -2)) / TILE);
      const belowRow = Math.floor((en.y + en.h + 2) / TILE);
      if (!isSolid(tileAt(grid, aheadCol, belowRow))) {
        en.vx *= -1;
      }
    }

    if (!p.dead && p.invincible <= 0) {
      const pb = { x: p.x, y: p.y, w: p.w, h: p.hitH };
      const eb = { x: en.x, y: en.y, w: en.w, h: en.h };
      if (rectsOverlap(pb, eb)) {
        const stomping = p.vy > 1 && (p.y + p.hitH) - en.y < 16;
        if (stomping) {
          en.alive = false;
          en.squish = 0;
          p.vy = JUMP_VEL * 0.55;
          Game.score += 100;
          Sound.stomp();
          addParticle(en.x + 10, en.y, "#7CFC00", "+100");
        } else {
          damagePlayer();
        }
      }
    }
  }
  Game.enemies = Game.enemies.filter((en) => en.alive || en.squish < 20);
}

function updateItems() {
  const p = Game.player;
  for (const it of Game.items) {
    if (it.collected) continue;
    it.bob += 0.1;
    if (it.popping) {
      it.y += it.vy;
      it.vy += 0.15;
      if (it.vy >= 0) it.popping = false;
    }
    const ib = { x: it.x, y: it.y, w: it.w, h: it.h };
    const pb = { x: p.x, y: p.y, w: p.w, h: p.hitH };
    if (rectsOverlap(pb, ib)) {
      it.collected = true;
      if (it.type === "note") {
        Game.score += 50;
        Sound.coin();
        addParticle(it.x, it.y, "#ffd54a", "+50");
      } else if (it.type === "coffee") {
        Game.score += 30;
        Sound.coin();
        addParticle(it.x, it.y, "#c9a06a", "+30");
      } else if (it.type === "coffeePower") {
        Game.score += 200;
        p.caffeinated = true;
        p.caffeineTimer = 60 * 12;
        p.invincible = Math.max(p.invincible, 30);
        Sound.power();
        addParticle(it.x, it.y, "#ff8a3d", "¡Cafeína!");
      }
    }
  }
  Game.items = Game.items.filter((it) => !it.collected);
}

function updateParticles() {
  for (const pt of Game.particles) {
    pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.05; pt.life--;
  }
  Game.particles = Game.particles.filter((pt) => pt.life > 0);
}

function updateBoss() {
  const boss = Game.boss;
  const p = Game.player;
  if (!boss || boss.defeated) return;

  if (boss.introTimer > 0) { boss.introTimer--; return; }

  boss.x += boss.vx;
  if (boss.x < CANVAS_W - 260) boss.vx = Math.abs(boss.vx);
  if (boss.x > CANVAS_W - 90) boss.vx = -Math.abs(boss.vx);

  if (boss.hitTimer > 0) boss.hitTimer--;
  if (boss.shakeTimer > 0) boss.shakeTimer--;

  boss.attackTimer--;
  if (boss.attackTimer <= 0) {
    boss.attackTimer = 100 - boss.hp * 10;
    boss.projectiles.push({
      x: boss.x + boss.w / 2, y: boss.y + 20,
      vx: (p.x - boss.x) > 0 ? 3.2 : -3.2, vy: -6,
      life: 120,
    });
  }
  for (const pr of boss.projectiles) {
    pr.vy += 0.28;
    pr.x += pr.vx; pr.y += pr.vy;
    pr.life--;
  }
  boss.projectiles = boss.projectiles.filter((pr) => pr.life > 0 && pr.y < CANVAS_H + 40);

  if (p.invincible <= 0) {
    for (const pr of boss.projectiles) {
      const pb = { x: p.x, y: p.y, w: p.w, h: p.hitH };
      if (rectsOverlap(pb, { x: pr.x - 6, y: pr.y - 6, w: 12, h: 12 })) {
        pr.life = 0;
        damagePlayer();
      }
    }
    const pb = { x: p.x, y: p.y, w: p.w, h: p.hitH };
    const bb = { x: boss.x, y: boss.y, w: boss.w, h: boss.h };
    if (rectsOverlap(pb, bb)) {
      const stomping = p.vy > 1 && (p.y + p.hitH) - boss.y < 26;
      if (stomping && boss.hitTimer <= 0) {
        boss.hp--;
        boss.hitTimer = 60;
        boss.shakeTimer = 20;
        p.vy = JUMP_VEL * 0.6;
        Sound.stomp();
        addParticle(boss.x + boss.w / 2, boss.y, "#ff5b5b", "¡Golpe!");
        if (boss.hp <= 0) {
          boss.defeated = true;
          boss.alive = false;
          Game.score += 1000;
          Game.transitionMsg = "¡Aprobaste el Examen Final! Ya eres Doctor/a 🎓";
          Game.transitionTimer = 140;
          Game.state = "transition";
          Game.flagged = true;
          Sound.win();
        }
      } else if (!stomping) {
        damagePlayer();
      }
    }
  }
}

function togglePause() {
  if (Game.state === "playing") Game.state = "paused";
  else if (Game.state === "paused") Game.state = "playing";
}

/* ---------------------------- Rendering ------------------------------------ */
const THEMES = {
  classroom: { sky1: "#bcd9ff", sky2: "#e8f3ff", ground: "#8a5a34", groundTop: "#6bb14a", brick: "#c98a4b", accent: "#3a6ea5" },
  hospital: { sky1: "#d7ecff", sky2: "#f2fbff", ground: "#9aa7b0", groundTop: "#e7edf1", brick: "#7fb8d6", accent: "#ff6b6b" },
  boss: { sky1: "#3a1030", sky2: "#7a1f3d", ground: "#4a2536", groundTop: "#7a3a3a", brick: "#5c2a3a", accent: "#ffd54a" },
};

function drawBackground(theme) {
  const t = THEMES[theme] || THEMES.classroom;
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, t.sky1);
  g.addColorStop(1, t.sky2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const parallax = Game.cameraX * 0.3;
  ctx.save();
  ctx.translate(-parallax % 400, 0);
  for (let i = -1; i < CANVAS_W / 400 + 2; i++) {
    if (theme === "classroom") {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(i * 400 + 40, 60, 120, 70); // window
      ctx.strokeStyle = "#5a7a9a"; ctx.lineWidth = 4;
      ctx.strokeRect(i * 400 + 40, 60, 120, 70);
    } else if (theme === "hospital") {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillRect(i * 400 + 60, 40, 60, 100);
      ctx.strokeStyle = "#ff6b6b"; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(i * 400 + 90, 55); ctx.lineTo(i * 400 + 90, 125);
      ctx.moveTo(i * 400 + 60, 90); ctx.lineTo(i * 400 + 120, 90);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(255,213,74,0.15)";
      ctx.beginPath();
      ctx.arc(i * 400 + 200, 100, 60, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawTile(ch, x, y, theme) {
  const t = THEMES[theme] || THEMES.classroom;
  if (ch === "#") {
    ctx.fillStyle = t.ground;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = t.groundTop;
    ctx.fillRect(x, y, TILE, 6);
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
  } else if (ch === "B") {
    ctx.fillStyle = t.brick;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
    ctx.beginPath();
    ctx.moveTo(x, y + TILE / 2); ctx.lineTo(x + TILE, y + TILE / 2);
    ctx.stroke();
  } else if (ch === "?") {
    ctx.fillStyle = "#ffd54a";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = "#a5760a"; ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
    ctx.fillStyle = "#a5760a";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("?", x + TILE / 2, y + TILE / 2 + 7);
  } else if (ch === "U") {
    ctx.fillStyle = "#b89b6b";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
  } else if (ch === "F") {
    ctx.fillStyle = "#8a8a8a";
    ctx.fillRect(x + TILE / 2 - 2, y, 4, TILE);
  }
}

function drawLevel() {
  const grid = Game.current.grid;
  const c0 = Math.max(0, Math.floor(Game.cameraX / TILE) - 1);
  const c1 = Math.min(grid[0].length, c0 + COLS_VISIBLE + 3);
  for (let r = 0; r < grid.length; r++) {
    for (let c = c0; c < c1; c++) {
      const ch = grid[r][c];
      if (ch === ".") continue;
      drawTile(ch, c * TILE - Game.cameraX, r * TILE, Game.current.theme);
    }
  }
  // flag pole flag cloth
  if (Game.current.flagCol !== undefined) {
    const fx = Game.current.flagCol * TILE - Game.cameraX;
    ctx.fillStyle = "#ff5b5b";
    const fy = Game.flagged ? TILE * 3 : TILE * 3;
    ctx.beginPath();
    ctx.moveTo(fx + 2, fy);
    ctx.lineTo(fx + 26, fy + 8);
    ctx.lineTo(fx + 2, fy + 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "10px sans-serif";
    ctx.fillText("🎓", fx - 4, fy + 12);
  }
}

function drawPlayer() {
  const p = Game.player;
  const x = p.x - Game.cameraX;
  const y = p.y;
  const big = p.caffeinated;
  const flicker = p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0;
  if (flicker) return;

  ctx.save();
  ctx.translate(x + p.w / 2, y + p.hitH);
  ctx.scale(p.facing, 1);

  const legOffset = p.onGround && Math.abs(p.vx) > 0.3 ? (p.walkFrame === 0 ? 4 : -4) : 0;
  const scaleY = big ? 1.25 : 1;
  const h = p.hitH;

  // legs (scrub pants, navy blue)
  ctx.fillStyle = "#2d3b6b";
  ctx.fillRect(-9 + legOffset * 0.3, -h * 0.32, 7, h * 0.32);
  ctx.fillRect(2 - legOffset * 0.3, -h * 0.32, 7, h * 0.32);
  // shoes
  ctx.fillStyle = "#222";
  ctx.fillRect(-10 + legOffset * 0.3, -3, 9, 4);
  ctx.fillRect(1 - legOffset * 0.3, -3, 9, 4);

  // white coat torso
  ctx.fillStyle = big ? "#fffdf5" : "#f5f5f5";
  ctx.fillRect(-11, -h * 0.72, 22, h * 0.42);
  ctx.strokeStyle = "#d8d8d8";
  ctx.lineWidth = 1;
  ctx.strokeRect(-11, -h * 0.72, 22, h * 0.42);
  // coat collar/lapels
  ctx.fillStyle = "#3a6ea5";
  ctx.fillRect(-4, -h * 0.72, 8, 6);
  // ID badge
  ctx.fillStyle = "#3ad0ff";
  ctx.fillRect(4, -h * 0.66, 5, 7);

  // arms
  ctx.fillStyle = big ? "#fffdf5" : "#f5f5f5";
  ctx.fillRect(-14, -h * 0.68, 4, 16);
  ctx.fillRect(10, -h * 0.68, 4, 16);

  // stethoscope
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -h * 0.6, 6, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(0, -h * 0.52, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = "#e8b48a";
  ctx.beginPath();
  ctx.arc(0, -h * 0.86, 9, 0, Math.PI * 2);
  ctx.fill();
  // hair
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(0, -h * 0.90, 9.5, Math.PI, Math.PI * 2);
  ctx.fill();
  // eyes
  ctx.fillStyle = "#222";
  ctx.fillRect(2, -h * 0.87, 2, 2.5);
  // little reflex hammer / red accent if caffeinated (aura)
  if (big) {
    ctx.strokeStyle = "rgba(255,140,0,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -h * 0.4, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEnemy(en) {
  const x = en.x - Game.cameraX;
  const y = en.y;
  if (!en.alive) {
    const sq = Math.min(en.squish / 12, 1);
    ctx.save();
    ctx.translate(x + en.w / 2, y + en.h);
    ctx.scale(1 + sq * 0.4, 1 - sq * 0.9);
    ctx.fillStyle = en.type === "bacteria" ? "#a06bd6" : "#5cc95c";
    ctx.beginPath();
    ctx.ellipse(0, -en.h / 2, en.w / 2, en.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const bob = Math.sin(en.wobble) * 2;
  ctx.save();
  ctx.translate(x + en.w / 2, y + en.h / 2 + bob);
  if (en.type === "bacteria") {
    ctx.fillStyle = "#a06bd6";
    ctx.beginPath();
    ctx.ellipse(0, 0, en.w / 2, en.h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6b3aa0"; ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.arc(i * en.w * 0.35, 0, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#5cc95c";
    ctx.beginPath();
    ctx.arc(0, 0, en.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2e8b2e"; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * (en.w / 2), Math.sin(ang) * (en.w / 2));
      ctx.lineTo(Math.cos(ang) * (en.w / 2 + 5), Math.sin(ang) * (en.w / 2 + 5));
      ctx.stroke();
    }
  }
  // angry eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-4, -2, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -2, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath(); ctx.arc(-4, -2, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -2, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawItem(it) {
  const x = it.x - Game.cameraX;
  const y = it.y + Math.sin(it.bob) * 3;
  if (it.type === "note") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, it.w, it.h);
    ctx.strokeStyle = "#c9c9c9"; ctx.strokeRect(x, y, it.w, it.h);
    ctx.strokeStyle = "#7aa5d6"; ctx.lineWidth = 1;
    for (let i = 4; i < it.h; i += 5) { ctx.beginPath(); ctx.moveTo(x + 2, y + i); ctx.lineTo(x + it.w - 2, y + i); ctx.stroke(); }
  } else {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 6); ctx.lineTo(x + it.w - 3, y + 6);
    ctx.lineTo(x + it.w - 5, y + it.h); ctx.lineTo(x + 5, y + it.h);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#8a5a2a"; ctx.stroke();
    ctx.strokeStyle = it.type === "coffeePower" ? "#ff8a3d" : "#c9a06a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + it.w - 2, y + 8, 4, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    // steam
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.moveTo(x + 6, y - 2 + Math.sin(it.bob) * 1);
    ctx.quadraticCurveTo(x + 9, y - 8, x + 6, y - 12);
    ctx.stroke();
    if (it.type === "coffeePower") {
      ctx.fillStyle = "#ff8a3d";
      ctx.font = "bold 8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("+", x + it.w / 2, y + it.h / 2 + 3);
    }
  }
}

function drawParticles() {
  for (const pt of Game.particles) {
    const a = Math.max(pt.life / pt.maxLife, 0);
    ctx.globalAlpha = a;
    if (pt.text) {
      ctx.fillStyle = pt.color;
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(pt.text, pt.x - Game.cameraX, pt.y);
    } else {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - Game.cameraX, pt.y, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
}

function drawBoss() {
  const boss = Game.boss;
  if (!boss) return;
  const shake = boss.shakeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
  const x = boss.x - Game.cameraX + shake;
  const y = boss.y;

  // HP hearts
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Prof. Estrés: " + "💢".repeat(Math.max(boss.hp, 0)), 20, 30);

  if (boss.hitTimer > 0 && Math.floor(boss.hitTimer / 4) % 2 === 0) {
    // flicker when hit
  } else {
    ctx.save();
    ctx.translate(x + boss.w / 2, y + boss.h);
    // body: giant stressed professor with red pen & stack of exams
    ctx.fillStyle = "#3a2a4a";
    ctx.fillRect(-boss.w / 2, -boss.h, boss.w, boss.h * 0.65);
    // head
    ctx.fillStyle = "#e8b48a";
    ctx.beginPath();
    ctx.arc(0, -boss.h * 0.78, 22, 0, Math.PI * 2);
    ctx.fill();
    // angry eyebrows
    ctx.strokeStyle = "#222"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-14, -boss.h * 0.82); ctx.lineTo(-4, -boss.h * 0.78);
    ctx.moveTo(14, -boss.h * 0.82); ctx.lineTo(4, -boss.h * 0.78);
    ctx.stroke();
    // glasses
    ctx.strokeStyle = "#222"; ctx.lineWidth = 2;
    ctx.strokeRect(-14, -boss.h * 0.80, 10, 8);
    ctx.strokeRect(4, -boss.h * 0.80, 10, 8);
    // mouth (yelling)
    ctx.fillStyle = "#7a1f1f";
    ctx.beginPath();
    ctx.ellipse(0, -boss.h * 0.68, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // arms holding giant red pen
    ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-boss.w / 2 - 6, -boss.h * 0.4);
    ctx.lineTo(-boss.w / 2 - 30, -boss.h * 0.75);
    ctx.stroke();
    ctx.restore();
  }

  // projectiles (red pens / question marks)
  ctx.fillStyle = "#ff3b3b";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  for (const pr of boss.projectiles) {
    ctx.save();
    ctx.translate(pr.x - Game.cameraX, pr.y);
    ctx.fillText("✎", 0, 0);
    ctx.restore();
  }
}

function drawHUD() {
  document.getElementById("hud-score").textContent = Game.score;
  document.getElementById("hud-time").textContent = Math.max(Math.ceil(Game.time), 0);
  document.getElementById("hud-lives").textContent = "❤️".repeat(Math.max(Game.lives, 0));
  if (Game.player && Game.player.caffeinated) {
    ctx.fillStyle = "#ff8a3d";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("☕ Modo Cafeína", 20, CANVAS_H - 16);
  }
}

function drawTransition() {
  ctx.fillStyle = "rgba(10,14,22,0.85)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "#ffd54a";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  wrapText(Game.transitionMsg, CANVAS_W / 2, CANVAS_H / 2, 600, 30);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w + " ";
    } else line = test;
  }
  lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, startY + i * lineHeight));
}

function drawPaused() {
  ctx.fillStyle = "rgba(10,14,22,0.7)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⏸ Pausa", CANVAS_W / 2, CANVAS_H / 2);
  ctx.font = "14px sans-serif";
  ctx.fillText("Presiona P para continuar", CANVAS_W / 2, CANVAS_H / 2 + 30);
}

/* ---------------------------- Main loop ------------------------------------ */
let lastTime = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  const dt = Math.min((ts - lastTime) / 16.67, 3);
  lastTime = ts;
  Game.frame++;

  readInput();

  if (Game.state === "playing") {
    updatePlayer();
    updateEnemies();
    updateItems();
    updateParticles();
    if (Game.boss) updateBoss();

    Game.timeAccum += dt;
    if (Game.timeAccum >= 60) {
      Game.timeAccum = 0;
      Game.time -= 1;
      if (Game.time <= 0 && Game.state === "playing") {
        Game.lives = 0;
        Game.state = "gameover";
        Sound.lose();
      }
    }
  } else if (Game.state === "transition") {
    Game.transitionTimer--;
    if (Game.transitionTimer <= 0) {
      if (Game.levelIndex < Game.levels.length - 1) {
        loadLevel(Game.levelIndex + 1);
        Game.state = "playing";
      } else {
        Game.state = "win";
        showEndOverlay(true);
      }
    }
  }

  render();

  if (Game.state === "gameover") {
    showEndOverlay(false);
  }
}

function render() {
  const theme = Game.current ? Game.current.theme : "classroom";
  drawBackground(theme);
  if (Game.current) {
    drawLevel();
    for (const it of Game.items) drawItem(it);
    for (const en of Game.enemies) drawEnemy(en);
    if (Game.boss) drawBoss();
    if (Game.player) drawPlayer();
    drawParticles();
  }
  drawHUD();
  if (Game.state === "paused") drawPaused();
  if (Game.state === "transition") drawTransition();
}

/* ---------------------------- Overlay / menu -------------------------------- */
const overlay = document.getElementById("overlay-panel");
const overlayWrap = document.getElementById("overlay");

function showEndOverlay(won) {
  if (overlayWrap.dataset.shown === "end") return;
  overlayWrap.dataset.shown = "end";
  overlay.innerHTML = won
    ? `<h1>🎓 ¡Felicidades, Doctor/a!</h1>
       <p class="subtitle">Completaste la carrera con ${Game.score} puntos</p>
       <p class="desc">Superaste el aula, sobreviviste la guardia del hospital y aprobaste el examen final.
       ¡Ya puedes ponerte la bata blanca!</p>
       <button class="overlay-btn" id="btn-restart">🔁 Jugar otra vez</button>`
    : `<h1>💀 Reprobaste esta vez</h1>
       <p class="subtitle">Puntaje final: ${Game.score}</p>
       <p class="desc">No te rindas — hasta los mejores médicos repiten un examen. ¡Inténtalo de nuevo!</p>
       <button class="overlay-btn" id="btn-restart">🔁 Reintentar</button>`;
  overlayWrap.classList.remove("hidden");
  document.getElementById("btn-restart").addEventListener("click", startGame);
}

function startGame() {
  overlayWrap.classList.add("hidden");
  overlayWrap.dataset.shown = "";
  resetRun();
  Game.state = "playing";
  Sound.resume();
}

document.getElementById("btn-start").addEventListener("click", startGame);

requestAnimationFrame(loop);
