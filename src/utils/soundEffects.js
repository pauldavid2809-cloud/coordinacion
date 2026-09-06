// Web Audio API Procedural Sound Engine
// Generates cinematic tension, heartbeats, drumroll and triumph fanfare without external audio files

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.droneOscillators = [];
    this.heartbeatTimer = null;
    this.isPlayingSuspense = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tactile button click (subtle 80Hz tick)
  playClick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  }

  // Positive chime for vote submitted
  playSuccess() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.5);
      });
    } catch (e) {
      console.warn('Audio success error:', e);
    }
  }

  // Single realistic cardiac heartbeat thump (lub-dub)
  playSingleHeartbeat(pitch = 55) {
    try {
      this.init();
      const now = this.ctx.currentTime;

      // First beat (Lub)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(pitch, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);
      gain1.gain.setValueAtTime(0.6, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Second beat (Dub) - slightly higher and quicker
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(pitch * 1.15, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(28, now + 0.28);
      gain2.gain.setValueAtTime(0.45, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.28);
    } catch (e) {}
  }

  // Start continuous suspense sound sequence
  startSuspenseSequence() {
    this.init();
    if (this.isPlayingSuspense) return;
    this.isPlayingSuspense = true;

    // 1. Deep cinematic low drone (C2 + G2 + minor third)
    const baseFreqs = [65.41, 98.00, 116.54]; // C2, G2, Bb2 (tension chord)
    this.droneOscillators = baseFreqs.map(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Low pass filter for warm, dark suspense drone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      return { osc, gain };
    });

    // 2. Accelerating heartbeat loop
    let interval = 1200; // start slow
    let minInterval = 450; // accelerate to fast
    let currentPitch = 50;

    const loopBeat = () => {
      if (!this.isPlayingSuspense) return;
      this.playSingleHeartbeat(currentPitch);
      currentPitch = Math.min(75, currentPitch + 1.5);
      interval = Math.max(minInterval, interval - 45);
      this.heartbeatTimer = setTimeout(loopBeat, interval);
    };

    loopBeat();
  }

  // Stop suspense sound sequence
  stopSuspenseSequence() {
    this.isPlayingSuspense = false;
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.droneOscillators && this.droneOscillators.length) {
      const now = this.ctx ? this.ctx.currentTime : 0;
      this.droneOscillators.forEach(({ osc, gain }) => {
        try {
          gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
          osc.stop(now + 0.5);
        } catch (e) {}
      });
      this.droneOscillators = [];
    }
  }

  // Grand triumph fanfare & solemn church bell bells
  playTriumphFanfare() {
    this.stopSuspenseSequence();
    try {
      this.init();
      const now = this.ctx.currentTime;

      // Solemn Church Bell Tolls (Bell harmonics)
      [0, 1.2, 2.6].forEach(delay => {
        const bellHarmonics = [329.63, 659.25, 987.77, 1318.51]; // E4 church bell
        bellHarmonics.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          const amp = 0.25 / (idx + 1);
          gain.gain.setValueAtTime(amp, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 2.9);
        });
      });

      // Majestic Brass Fanfare Chord Progression: C -> F -> G -> C (Octave)
      const chords = [
        { time: 0.1, notes: [261.63, 329.63, 392.00], dur: 0.5 }, // C Major
        { time: 0.65, notes: [261.63, 349.23, 440.00], dur: 0.5 }, // F Major
        { time: 1.2, notes: [293.66, 392.00, 493.88], dur: 0.6 }, // G Major
        { time: 1.85, notes: [523.25, 659.25, 783.99, 1046.50], dur: 2.2 } // High C Grand Triumph
      ];

      chords.forEach(chord => {
        chord.notes.forEach(note => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, now + chord.time);

          gain.gain.setValueAtTime(0, now + chord.time);
          gain.gain.linearRampToValueAtTime(0.18, now + chord.time + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + chord.time);
          osc.stop(now + chord.time + chord.dur + 0.1);
        });
      });
    } catch (e) {
      console.warn('Audio fanfare error:', e);
    }
  }

  // Runoff declared alert sound (dramatic minor chord shift)
  playRunoffAlert() {
    this.stopSuspenseSequence();
    try {
      this.init();
      const now = this.ctx.currentTime;
      // Dramatic brass announcement for 2nd round
      [220, 261.63, 329.63, 415.30].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.9);
      });
    } catch (e) {
      console.warn('Audio runoff error:', e);
    }
  }
}

export const soundEffects = new SoundEngine();
