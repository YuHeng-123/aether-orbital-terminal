// Lightweight Web Audio API synthesizer for sci-fi tactical micro-sounds
let audioCtx = null;
let soundEnabled = true;
let cabinHumNodes = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleAudio() {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    playBip(880, 0.04);
  } else {
    stopCabinHum();
  }
  return soundEnabled;
}

export function isAudioEnabled() {
  return soundEnabled;
}

// Crisp mechanical tactical click
export function playClick() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}

// Frequency dial tick
export function playTick() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(2200, ctx.currentTime);

  gain.gain.setValueAtTime(0.015, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.012);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.012);
}

// Mode switch chirp
export function playModeChirp(frequency = 600) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(frequency * 1.8, ctx.currentTime + 0.06);

  gain.gain.setValueAtTime(0.035, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.07);
}

// Target lock-on alert
export function playLockOn() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  [1200, 1600].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + i * 0.05;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, start);

    gain.gain.setValueAtTime(0.04, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.04);
  });
}

// RCS Gas Thruster Pneumatic Puff
export function playThrusterWhoosh() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.35);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.35);
}

// Module Hotspot Inspection Diagnostic Chime
export function playInspectionPing() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  [1800, 2400].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + idx * 0.04;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  });
}

// Ultra-subtle ambient spacecraft cabin pressure hum (48Hz low drone)
export function startCabinHum() {
  if (!soundEnabled || cabinHumNodes) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(48, ctx.currentTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(95, ctx.currentTime);

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.015, ctx.currentTime + 2.0); // smooth fade in

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  cabinHumNodes = { osc, gain };
}

export function stopCabinHum() {
  if (!cabinHumNodes) return;
  const ctx = getAudioContext();
  if (ctx && cabinHumNodes.gain) {
    cabinHumNodes.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    setTimeout(() => {
      if (cabinHumNodes && cabinHumNodes.osc) {
        cabinHumNodes.osc.stop();
        cabinHumNodes = null;
      }
    }, 550);
  } else {
    cabinHumNodes = null;
  }
}

function playBip(freq, duration) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Emergency Red Alert Klaxon Alarm (Pulsed tactical warning siren)
export function playKlaxonAlarm() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Two pulses of descending warning siren
  [0, 0.45].forEach((offset) => {
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(780, now + offset);
    osc.frequency.exponentialRampToValueAtTime(460, now + offset + 0.35);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now + offset);
    subOsc.frequency.exponentialRampToValueAtTime(60, now + offset + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now + offset);
    filter.frequency.exponentialRampToValueAtTime(500, now + offset + 0.35);

    gain.gain.setValueAtTime(0.06, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.38);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    subOsc.start(now + offset);
    osc.stop(now + offset + 0.38);
    subOsc.stop(now + offset + 0.38);
  });
}

// Cinematic Camera Dolly Glide Whoosh
export function playDollyZoom() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.25);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(350, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.25);
  filter.Q.value = 3.0;

  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.55);
}

// High-speed telemetry downlink chatter
export function playTelemetryChirp() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [1900, 2400, 1600, 3100];
  freqs.forEach((f, idx) => {
    const t = ctx.currentTime + idx * 0.025;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t);
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.02);
  });
}

