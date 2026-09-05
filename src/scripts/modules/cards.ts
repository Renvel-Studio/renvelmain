import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const statementLine = document.querySelector<SVGPathElement>('.statement-line-path');
  const statementBanner = document.querySelector<HTMLElement>('.gradient-banner');
  if (statementLine) {
    const pathLength = statementLine.getTotalLength ? statementLine.getTotalLength() : 1000;
    statementLine.style.strokeDasharray = `${pathLength}`;
    if (prefersReducedMotion) {
      statementLine.style.strokeDashoffset = '0';
    } else {
      statementLine.style.strokeDashoffset = `${pathLength}`;
      if (statementBanner) {
        gsap.to(statementLine, {
          strokeDashoffset: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statementBanner,
            start: 'top 80%',
            end: 'center 45%',
            scrub: 1.2
          }
        });
      }
    }
  }

  if (prefersReducedMotion) return;
  try {
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

    // Intro Section Subtle Image Parallax
    const introImages = document.querySelectorAll<HTMLElement>('.intro__image');
    introImages.forEach((img) => {
      const parentCard = img.closest<HTMLElement>('.intro__media-card') || img.closest<HTMLElement>('.intro__panoramic-card');
      if (parentCard) {
        gsap.fromTo(
          img,
          { yPercent: -5, scale: 1.06 },
          {
            yPercent: 5,
            scale: 1.01,
            ease: 'none',
            scrollTrigger: {
              trigger: parentCard,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          }
        );
      }
    });

    // 3D Magnetic Tilt Micro-Interaction on Intro Media Cards
    if (!('ontouchstart' in window)) {
      const introTiltCards = document.querySelectorAll<HTMLElement>('.intro__media-card--tilt');
      introTiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: x * 5,
            rotateX: -y * 5,
            transformPerspective: 1000,
            duration: 0.35,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
        });
      });
    }
    // Intro Section Smooth Scroll-Triggered Text Animation
    const headlineLines = document.querySelectorAll<HTMLElement>('.intro__headline-line');
    if (headlineLines.length) {
      gsap.fromTo(
        headlineLines,
        { y: 35, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.intro__headline',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    const textCards = document.querySelectorAll<HTMLElement>('[data-intro-text]');
    textCards.forEach((card) => {
      const items = card.querySelectorAll<HTMLElement>('.intro__anim-item');
      if (items.length) {
        gsap.fromTo(
          items,
          { y: 32, opacity: 0, filter: 'blur(5px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.05,
            stagger: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    });
  } catch (err) {
    /* non-fatal visual enhancement */
  }
}
