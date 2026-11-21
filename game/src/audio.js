// audio.js — tiny WebAudio bleeps, synthesised, no sound files.
// One job: turn game events into sound. Silent until the first gesture.

let ctx = null;

function ac() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch (e) { ctx = false; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx || null;
}

function tone(freq, dur, type, gain, when) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + (when || 0);
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

export function unlockAudio() { ac(); }

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(880, 0.16, 'sine', 0.14, 0);
  tone(1318, 0.22, 'sine', 0.12, 0.09);
}

// A low buzz for a wrong click.
export function playWrong() {
  tone(160, 0.2, 'square', 0.06, 0);
  tone(120, 0.22, 'square', 0.05, 0.05);
}

// A short arpeggio for a finished level.
export function playWin() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.11, i * 0.11));
}

// A soft tick for a hint.
export function playHint() {
  tone(1047, 0.1, 'sine', 0.08, 0);
}
