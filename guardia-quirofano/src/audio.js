// Motor de sonido procedural del quirófano (Web Audio, sin archivos externos).
// Ambiente: zumbido de sala, ciclo del ventilador y pitido del monitor
// que la escena marca al ritmo de la frecuencia cardiaca que dibuja.

let ctx = null;
let master = null;
let ambientBus = null;
let enabled = true;
let ambientOn = false;
let heartRate = 72;
let ventTimer = null;
let humNodes = [];

function ensureContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = enabled ? 1 : 0;
    master.connect(ctx.destination);
    ambientBus = ctx.createGain();
    ambientBus.gain.value = 0.9;
    ambientBus.connect(master);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function noiseBuffer(seconds, brown = false) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buffer;
}

function tone({
  freq,
  type = "sine",
  start = 0,
  dur = 0.15,
  gain = 0.05,
  to,
  bus,
}) {
  if (!ensureContext()) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur * 0.8);
  g.gain.setValueAtTime(1e-4, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
  osc.connect(g).connect(bus || master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function startHum() {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(4, true);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 180;
  const g = ctx.createGain();
  g.gain.value = 0.05;
  src.connect(lp).connect(g).connect(ambientBus);
  src.start();
  // Zumbido eléctrico de 50/100 Hz de lámparas y equipos.
  const mains = ctx.createOscillator();
  mains.frequency.value = 100;
  const mg = ctx.createGain();
  mg.gain.value = 0.004;
  mains.connect(mg).connect(ambientBus);
  mains.start();
  humNodes = [src, mains];
}

function ventilatorBreath() {
  if (!ambientOn || !ctx) return;
  const t0 = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(2.4);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(420, t0);
  bp.frequency.linearRampToValueAtTime(760, t0 + 1.1);
  bp.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(1e-4, t0);
  g.gain.exponentialRampToValueAtTime(0.022, t0 + 0.5);
  g.gain.exponentialRampToValueAtTime(0.008, t0 + 1.2);
  g.gain.exponentialRampToValueAtTime(1e-4, t0 + 2.3);
  src.connect(bp).connect(g).connect(ambientBus);
  src.start(t0);
  src.stop(t0 + 2.4);
  ventTimer = setTimeout(ventilatorBreath, 5000);
}

export const Sound = {
  get enabled() {
    return enabled;
  },
  setEnabled(value) {
    enabled = value;
    if (ctx) master.gain.setTargetAtTime(value ? 1 : 0, ctx.currentTime, 0.05);
  },
  /** Arranca el ambiente de sala; debe llamarse tras un gesto del usuario. */
  startAmbient() {
    if (ambientOn || !ensureContext()) return;
    ambientOn = true;
    startHum();
    ventilatorBreath();
  },
  stopAmbient() {
    ambientOn = false;
    clearTimeout(ventTimer);
    humNodes.forEach((n) => {
      try {
        n.stop();
      } catch {}
    });
    humNodes = [];
  },
  setHeartRate(bpm) {
    heartRate = Math.max(50, Math.min(150, bpm));
  },
  get heartRate() {
    return heartRate;
  },
  /** Pitido del monitor; la escena lo marca al ritmo de la FC que dibuja. */
  beep() {
    if (!ambientOn || !enabled || !ctx) return;
    const alert = heartRate >= 90;
    tone({ freq: alert ? 1046 : 988, dur: 0.09, gain: 0.018, bus: ambientBus });
  },
  play(kind = "good") {
    if (!enabled || !ensureContext()) return;
    switch (kind) {
      case "good":
        tone({ freq: 660, dur: 0.14, gain: 0.05 });
        tone({ freq: 990, start: 0.09, dur: 0.22, gain: 0.045 });
        break;
      case "bad":
        tone({ freq: 220, type: "triangle", dur: 0.16, gain: 0.06 });
        tone({
          freq: 185,
          type: "triangle",
          start: 0.14,
          dur: 0.24,
          gain: 0.06,
        });
        break;
      case "select":
        tone({ freq: 1320, type: "square", dur: 0.04, gain: 0.012 });
        break;
      case "streak":
        [660, 830, 990, 1320].forEach((f, i) =>
          tone({ freq: f, start: i * 0.06, dur: 0.16, gain: 0.035 }),
        );
        break;
      case "complete":
        [523, 659, 784, 1047, 1319].forEach((f, i) =>
          tone({ freq: f, start: i * 0.1, dur: 0.35, gain: 0.04 }),
        );
        break;
      case "alarm":
        tone({ freq: 880, type: "square", dur: 0.12, gain: 0.02 });
        tone({ freq: 880, type: "square", start: 0.2, dur: 0.12, gain: 0.02 });
        break;
      default:
        tone({ freq: 480, to: 760, dur: 0.22, gain: 0.05 });
    }
  },
};
