let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

export const playCorrect = () => {
  playTone(880, 0.15, 'sine', 0.4);
  setTimeout(() => playTone(1100, 0.2, 'sine', 0.4), 100);
};

export const playWrong = () => {
  playTone(220, 0.3, 'sawtooth', 0.3);
};

export const playTick = () => {
  playTone(660, 0.05, 'sine', 0.2);
};

export const playWinner = () => {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.3, 'sine', 0.5), i * 150);
  });
};
