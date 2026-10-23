/**
 * Intizomly — Web Audio API Synthesizer
 * Generates crisp, satisfying audio feedback without any external asset dependencies.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
  }

  /**
   * Play high-pitched satisfying checkmark chime
   */
  playCheck() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Harmonic pleasant jump: E6 (1318.5Hz) -> B6 (1975.5Hz)
      osc.frequency.setValueAtTime(1046.5, now); // C6
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08); // G6
      osc.frequency.exponentialRampToValueAtTime(2093.0, now + 0.16); // C7

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Play soft subtle uncheck sound
   */
  playUncheck() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Play authentic Apple iPhone Tri-tone notification chime
   */
  playNotification() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      // iPhone Tri-tone notes: G#5, B5, E6
      const tones = [
        { freq: 830.6, delay: 0.00, dur: 0.28, vol: 0.25 }, // G#5
        { freq: 987.8, delay: 0.09, dur: 0.32, vol: 0.28 }, // B5
        { freq: 1318.5, delay: 0.18, dur: 0.55, vol: 0.32 } // E6
      ];

      tones.forEach(({ freq, delay, dur, vol }) => {
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur + 0.05);
      });
    } catch (e) {
      console.warn('Audio iPhone chime error:', e);
    }
  }

  /**
   * Play celebration fanfare when 100% completion is reached
   */
  playCelebration() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [
        { f: 523.25, t: 0, d: 0.14 },    // C5
        { f: 659.25, t: 0.12, d: 0.14 }, // E5
        { f: 783.99, t: 0.24, d: 0.14 }, // G5
        { f: 1046.5, t: 0.38, d: 0.45 }  // C6
      ];

      notes.forEach(({ f, t, d }) => {
        const now = this.ctx.currentTime + t;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + d + 0.05);
      });
    } catch (e) {
      console.warn('Audio fanfare error:', e);
    }
  }
}

window.soundSystem = new AudioManager();
