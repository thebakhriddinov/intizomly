import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#b6f36b', '#06b6d4', '#a855f7', '#f59e0b', '#ffffff'],
      disableForReducedMotion: true
    });
  } catch (e) {
    console.warn('Confetti error:', e);
  }
}
