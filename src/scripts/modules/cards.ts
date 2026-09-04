import { gsap } from 'gsap';

export function initStickyCardStack(): void {
  const cards = document.querySelectorAll<HTMLElement>('.process-card');
  if (!cards.length) return;

  const baseRotations = [-1.8, 1.8, -0.8];
  let isTicking = false;

  function updateStack() {
    const windowHeight = window.innerHeight;

    cards.forEach((card, i) => {
      const nextCard = cards[i + 1];

      if (nextCard) {
        const nextRect = nextCard.getBoundingClientRect();
        const stickyTop = parseInt(window.getComputedStyle(card).top, 10) || 96;
        const distance = nextRect.top - stickyTop;
        const totalDistance = windowHeight * 0.55;

        // Progress goes from 0 (card far away) to 1 (card fully stacked over)
        const progress = 1 - Math.min(Math.max(distance / totalDistance, 0), 1);

        const currentScale = 1 - progress * 0.055;
        const brightness = 1 - progress * 0.12;
        const baseRot = baseRotations[i] || 0;

        card.style.transform = `scale(${currentScale}) rotate(${baseRot}deg)`;
        card.style.filter = `brightness(${brightness})`;
      } else {
        const baseRot = baseRotations[i] || 0;
        card.style.transform = `rotate(${baseRot}deg)`;
        card.style.filter = 'brightness(1)';
      }
    });

    isTicking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateStack);
        isTicking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', updateStack);
  updateStack();

  // Interactive 3D tilt on card hover
  if (!('ontouchstart' in window)) {
    cards.forEach((card, index) => {
      const baseRot = baseRotations[index] || 0;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `rotate(${baseRot}deg) perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-3px)`;
        card.style.boxShadow = `0 -8px 30px rgba(0, 0, 0, 0.4), 0 40px 85px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.15)`;
      });

      card.addEventListener('mouseleave', () => {
        updateStack();
        card.style.boxShadow = '';
      });
    });
  }
}

export function initPremiumParallax(prefersReducedMotion: boolean): void {
  if (prefersReducedMotion) return;
  try {
    gsap.utils.toArray<HTMLElement>('.works__item-image').forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -6, scale: 1.12 },
        {
          yPercent: 6,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.works__item') ?? img,
            scrub: true,
            start: 'top bottom',
            end: 'bottom top'
          }
        }
      );
    });

    gsap.to('.gradient-banner__content', {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.gradient-banner',
        scrub: true,
        start: 'top bottom',
        end: 'bottom top'
      }
    });
  } catch (err) {
    /* non-fatal visual enhancement */
  }
}
