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
   * Play iconic Apple iPhone SMS "Ding" (Note) glass bell chime
   */
  playNotification() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const now = this.ctx.currentTime;
      // Authentic iPhone SMS "Ding" (Note / Bell chime)
      // Crystal strike with lingering harmonic overtone resonance
      const harmonics = [
        { freq: 1318.51, gain: 0.42, decay: 0.90 }, // Fundamental E6
        { freq: 2637.02, gain: 0.24, decay: 0.55 }, // 2nd harmonic E7
        { freq: 3951.07, gain: 0.11, decay: 0.35 }, // 3rd harmonic B7
        { freq: 5274.04, gain: 0.07, decay: 0.18 }  // 4th harmonic E8 crisp strike transient
      ];

      harmonics.forEach(({ freq, gain, decay }) => {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(0.0001, now);
        // Instantaneous 2ms strike attack
        gainNode.gain.linearRampToValueAtTime(gain, now + 0.002);
        // Resonant smooth exponential bell ring
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + decay + 0.02);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Alias for iPhone "Ding" chime
   */
  playDing() {
    this.playNotification();
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
