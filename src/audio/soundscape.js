/**
 * Spectral Soundscape Generator
 * Procedural Web Audio API sound synthesizer - zero external audio assets required!
 */

class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.ambientGain = null;
    this.windOsc = null;
    this.droneOsc = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbient();
    } else {
      this.startAmbient();
      this.playChime(440, 'sine', 0.2);
    }
    return !this.isMuted;
  }

  startAmbient() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.stopAmbient();

      // Master ambient gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Low frequency spectral drone (55Hz / A1)
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Lowpass filter for deep rumbling dark warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      // LFO for breathing swell
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // slow breathing cycle
      lfoGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(this.ambientGain.gain);
      lfo.start();

      this.droneOsc.connect(filter);
      filter.connect(this.ambientGain);
      this.droneOsc.start();
    } catch (e) {
      console.warn('Ambient start failed:', e);
    }
  }

  stopAmbient() {
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch (_) {}
      this.droneOsc = null;
    }
  }

  // Mechanical retro key click
  playKeyclick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (_) {}
  }

  // Ghostly manifestation chime / bell resonance
  playChime(freq = 520, type = 'sine', duration = 1.2) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = type;
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.5, now); // perfect fifth

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (_) {}
  }

  // Glitch static burst for terminal possession
  playGlitch() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch (_) {}
  }

  // Candle lighting gentle harmonic sizzle
  playCandleFlame() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.3);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (_) {}
  }
}

export const soundscape = new SoundscapeEngine();
