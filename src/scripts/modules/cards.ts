import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initStickyCardStack(
  prefersReducedMotion: boolean = false
): void {
  const cards = document.querySelectorAll<HTMLElement>('.process-card');
  if (!cards.length) return;

  const baseRotations = [-4, 4, -2.5];
  const isMobile = () => window.innerWidth <= 768;

  // Mobile or reduced motion: keep all cards static and unstacked
  if (prefersReducedMotion || isMobile()) {
    cards.forEach(card => {
      gsap.set(card, { clearProps: 'transform,filter' });
      const textLayer = card.querySelector<HTMLElement>(
        '.process-card__text-layer'
      );
      if (textLayer) gsap.set(textLayer, { clearProps: 'opacity,y' });
      const media = card.querySelector<HTMLElement>('.process-card__media');
      if (media)
        gsap.set(media, { clearProps: 'top,left,width,height,borderRadius' });
      card.style.marginBlockEnd = '';
    });
    return;
  }

  // Runway for Card 3: comfortable reading dwell time
  const lastCard = cards[cards.length - 1];
  if (lastCard) {
    lastCard.style.marginBlockEnd = '35vh';
  }

  const getStickyTop = (el: HTMLElement): number => {
    const val = parseFloat(window.getComputedStyle(el).top);
    return isNaN(val) ? 84 : val;
  };

  // Base physical rotation for natural editorial stacking
  cards.forEach((card, i) => {
    gsap.set(card, {
      rotate: baseRotations[i] || 0,
      transformPerspective: 1000
    });
  });

  const getSlotRect = (
    card: HTMLElement,
    slot: HTMLElement,
    textLayer: HTMLElement
  ) => {
    const currentY = (gsap.getProperty(textLayer, 'y') as number) || 0;
    const cardRect = card.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();

    return {
      top: slotRect.top - cardRect.top - currentY,
      left: slotRect.left - cardRect.left,
      width: slot.offsetWidth,
      height: slot.offsetHeight
    };
  };

  // --- All Cards: Permanently docked in their end-state (No image expand/shrink animation) ---
  const dockAllCardsInPlace = () => {
    cards.forEach(card => {
      const media = card.querySelector<HTMLElement>('.process-card__media');
      const slot = card.querySelector<HTMLElement>('.process-card__media-slot');
      const textLayer = card.querySelector<HTMLElement>(
        '.process-card__text-layer'
      );
      if (!media || !slot || !textLayer) return;

      // Text layer is permanently 100% visible and settled
      gsap.set(textLayer, { opacity: 1, y: 0 });

      // Image is neatly locked into its designated slot area from the start
      const rect = getSlotRect(card, slot, textLayer);
      gsap.set(media, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 20
      });

      const img = media.querySelector<HTMLElement>('img');
      if (img) {
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center 20%';
      }
    });
  };

  dockAllCardsInPlace();
  ScrollTrigger.addEventListener('refresh', dockAllCardsInPlace);

  // --- Stack-Cover Dimming (Cards dim and scale gently as subsequent cards stack over them) ---
  cards.forEach((card, i) => {
    const nextCard = cards[i + 1];
    if (!nextCard) return;

    ScrollTrigger.create({
      trigger: nextCard,
      start: 'top bottom',
      end: () => `top ${getStickyTop(nextCard)}px`,
      scrub: 0.2,
      invalidateOnRefresh: true,
      onUpdate: self => {
        gsap.set(card, {
          scale: 1 - self.progress * 0.04,
          opacity: 1 - self.progress * 0.18
        });
      }
    });
  });

  // --- Interactive 3D micro-tilt on desktop hover ---
  if (!('ontouchstart' in window)) {
    cards.forEach(card => {
      const tiltX = gsap.quickTo(card, 'rotateX', {
        duration: 0.4,
        ease: 'power2.out'
      });
      const tiltY = gsap.quickTo(card, 'rotateY', {
        duration: 0.4,
        ease: 'power2.out'
      });
      const lift = gsap.quickTo(card, 'y', {
        duration: 0.4,
        ease: 'power2.out'
      });

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        tiltX(-y * 3.5);
        tiltY(x * 3.5);
        lift(-3);
        card.style.boxShadow =
          '0 -8px 30px rgba(0, 0, 0, 0.4), 0 40px 85px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.15)';
      });

      card.addEventListener('mouseleave', () => {
        tiltX(0);
        tiltY(0);
        lift(0);
        card.style.boxShadow = '';
      });
    });
  }

  window.addEventListener('resize', () => {
    if (lastCard) {
      lastCard.style.marginBlockEnd =
        prefersReducedMotion || isMobile() ? '' : '35vh';
    }
    dockAllCardsInPlace();
    ScrollTrigger.refresh();
  });
}

export function initPremiumParallax(prefersReducedMotion: boolean): void {
  const statementLine = document.querySelector<SVGPathElement>(
    '.statement-line-path'
  );
  const statementBanner =
    document.querySelector<HTMLElement>('.gradient-banner');
  if (statementLine) {
    const pathLength = statementLine.getTotalLength
      ? statementLine.getTotalLength()
      : 1000;
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

    const introImages = document.querySelectorAll<HTMLElement>('.intro__image');
    introImages.forEach(img => {
      const parentCard =
        img.closest<HTMLElement>('.intro__media-card') ||
        img.closest<HTMLElement>('.intro__panoramic-card');
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

    if (!('ontouchstart' in window)) {
      const introTiltCards = document.querySelectorAll<HTMLElement>(
        '.intro__media-card--tilt'
      );
      introTiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
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

    const headlineLines = document.querySelectorAll<HTMLElement>(
      '.intro__headline-line'
    );
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

    const textCards =
      document.querySelectorAll<HTMLElement>('[data-intro-text]');
    textCards.forEach(card => {
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
