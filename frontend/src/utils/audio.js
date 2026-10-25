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
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
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
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Play festive celebration fanfare when all habits are complete
   */
  playCelebration() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const chords = [
        { freq: 523.25, time: 0.00, dur: 0.18 }, // C5
        { freq: 659.25, time: 0.08, dur: 0.18 }, // E5
        { freq: 783.99, time: 0.16, dur: 0.22 }, // G5
        { freq: 1046.50, time: 0.24, dur: 0.65 } // C6
      ];

      chords.forEach(({ freq, time, dur }) => {
        const now = this.ctx.currentTime + time;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur + 0.05);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Play resonant deep Zen Focus bell upon completing a study focus session
   */
  playFocusDone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Multi-layered resonant bell harmonics: fundamental 528 Hz, 1056 Hz, 1584 Hz
      const harmonics = [
        { freq: 528, gainVal: 0.35, decay: 2.2 },
        { freq: 1056, gainVal: 0.22, decay: 1.8 },
        { freq: 1584, gainVal: 0.15, decay: 1.2 },
        { freq: 2112, gainVal: 0.08, decay: 0.8 }
      ];

      harmonics.forEach(({ freq, gainVal, decay }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(gainVal, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + decay + 0.05);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const audioManager = new AudioManager();
