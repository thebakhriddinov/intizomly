export async function fireCelebrationConfetti() {
  try {
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default || confettiModule;
    
    // Check if device is low-memory/mobile or user prefers reduced motion
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    confetti({
      particleCount: isMobile ? 35 : 75,
      spread: isMobile ? 55 : 70,
      origin: { y: 0.65 },
      colors: ['#10b981', '#b6f36b', '#06b6d4', '#a855f7', '#f59e0b', '#ffffff'],
      disableForReducedMotion: true
    });
  } catch (e) {
    console.warn('Confetti error:', e);
  }
}
