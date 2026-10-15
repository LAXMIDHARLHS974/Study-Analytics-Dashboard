import confetti from 'canvas-confetti';

export const triggerConfetti = (origin = { x: 0.5, y: 0.6 }) => {
  try {
    confetti({
      particleCount: 50,
      spread: 70,
      origin,
      colors: ['#5FB3B3', '#6A9AC4', '#7B7FBF', '#4EBA88', '#F6B26B'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.warn('Confetti error', e);
  }
};

export const triggerBigMilestone = () => {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#5FB3B3', '#6A9AC4', '#7B7FBF', '#F6B26B'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    console.warn('Big confetti error', e);
  }
};
