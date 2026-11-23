// Ember Clash — tiny WebAudio bleeps, synthesized live, no sound files.
// All sounds are short oscillator notes so the game needs zero assets.

let ctx = null;
let muted = false;

function audioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = value;
  return muted;
}

export function isMuted() {
  return muted;
}

// One note: frequency, seconds, waveform, volume.
export function blip(freq, seconds = 0.12, type = 'sine', volume = 0.12) {
  if (muted) return;
  const ac = audioContext();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + seconds);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + seconds);
}

export const sfx = {
  playCard() { blip(520, 0.1, 'triangle', 0.14); setTimeout(() => blip(780, 0.12, 'triangle', 0.12), 70); },
  damage() { blip(180, 0.18, 'sawtooth', 0.1); },
  heal() { blip(660, 0.15, 'sine', 0.1); setTimeout(() => blip(880, 0.18, 'sine', 0.1), 90); },
  shield() { blip(340, 0.12, 'square', 0.06); },
  draw() { blip(980, 0.07, 'sine', 0.07); },
  turn() { blip(440, 0.1, 'triangle', 0.1); },
  win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.25, 'triangle', 0.14), i * 130)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => blip(f, 0.3, 'sine', 0.12), i * 150)); },
};
