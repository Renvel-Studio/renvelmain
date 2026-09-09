import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PHYSICS_EASE = 'power4.out';

export function initHeroEntrance(prefersReducedMotion: boolean = false): void {
  const h1 = document.querySelector<HTMLElement>('.hero__statement h1');
  if (!h1) return;

  const sub = document.querySelector<HTMLElement>('.hero__sub');
  const badgeWrap = document.querySelector<HTMLElement>('.hero__badge-wrap');

  // Split lines into masked spans once
  if (!h1.querySelector('.hero-line')) {
    const parts = h1.innerHTML.split(/<br\s*\/?>/i);
    h1.innerHTML = parts
      .map(
        p =>
          `<span class="hero-line" style="display:block;overflow:hidden;"><span class="hero-line__inner" style="display:inline-block;">${p.trim()}</span></span>`
      )
      .join('');
  }

  const inners = h1.querySelectorAll<HTMLElement>('.hero-line__inner');

  // Accessibility: instant static visibility on reduced motion
  if (prefersReducedMotion) {
    h1.classList.remove('reveal', 'is-visible');
    h1.style.opacity = '1';
    h1.style.transform = 'none';
    if (sub) {
      sub.style.opacity = '1';
      sub.style.transform = 'none';
    }
    if (badgeWrap) {
      badgeWrap.style.opacity = '1';
      badgeWrap.style.transform = 'none';
    }
    initHeroCtaInteraction(true);
    return;
  }

  h1.classList.remove('reveal', 'is-visible');
  h1.style.opacity = '1';
  h1.style.transform = 'none';

  // Master time-based physics cascade timeline
  const tl = gsap.timeline({
    defaults: {
      ease: PHYSICS_EASE
    }
  });

  // 1. Headline masked lines drop into place
  tl.set(inners, { yPercent: 115, opacity: 0 });
  tl.to(inners, {
    yPercent: 0,
    opacity: 1,
    duration: 1.15,
    stagger: 0.1,
    delay: 0.12
  });

  // 2. Paragraph cascades in seamlessly as the headline finishes settling
  if (sub) {
    tl.fromTo(
      sub,
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.95,
        clearProps: 'transform'
      },
      '-=0.75'
    );
  }

  // 3. CTA button docks into position (strictly no scale-grow)
  if (badgeWrap) {
    tl.fromTo(
      badgeWrap,
      { y: 22, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        clearProps: 'transform'
      },
      '-=0.65'
    );
  }

  // Initialize button hover micro-interactions
  initHeroCtaInteraction(false);
}

export function initHeroCtaInteraction(
  prefersReducedMotion: boolean = false
): () => void {
  const btn = document.querySelector<HTMLElement>('.hero__cta-btn');
  if (!btn) return () => {};

  const textEl = btn.querySelector<HTMLElement>('.hero__cta-text');
  const icon = btn.querySelector<HTMLElement>('.hero__cta-icon');
  const iconSvg = icon ? icon.querySelector<SVGElement>('svg') || icon : null;

  if (icon) {
    icon.style.overflow = 'hidden';
  }

  const originalText = textEl ? (textEl.textContent || '').trim() : '';
  const glyphChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789_#';

  let scrambleRafId: number | null = null;
  let iconTl: gsap.core.Timeline | null = null;

  const stopScramble = () => {
    if (scrambleRafId !== null) {
      cancelAnimationFrame(scrambleRafId);
      scrambleRafId = null;
    }
    if (textEl && originalText) {
      textEl.textContent = originalText;
    }
  };

  const startScramble = () => {
    if (prefersReducedMotion || !textEl || !originalText) return;
    stopScramble();

    const duration = 380;
    const startTime = performance.now();
    const length = originalText.length;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      let scrambled = '';
      for (let i = 0; i < length; i++) {
        const char = originalText[i];
        if (char === ' ') {
          scrambled += ' ';
          continue;
        }

        const charThreshold = (i + 1) / (length + 1);
        if (progress >= charThreshold) {
          scrambled += char;
        } else {
          scrambled +=
            glyphChars[Math.floor(Math.random() * glyphChars.length)];
        }
      }

      textEl.textContent = scrambled;

      if (progress < 1) {
        scrambleRafId = requestAnimationFrame(tick);
      } else {
        textEl.textContent = originalText;
        scrambleRafId = null;
      }
    };

    scrambleRafId = requestAnimationFrame(tick);
  };

  // Hover handlers: ONLY solid swap, letter scramble & SVG fly-back
  const onMouseEnter = () => {
    startScramble();

    if (!prefersReducedMotion) {
      // 1. Solid amber background swap — strictly no shadow bloom, no transform
      gsap.to(btn, {
        backgroundColor: '#d4af37',
        color: '#08090d',
        borderColor: '#d4af37',
        boxShadow: 'none',
        y: 0,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // 2. Inverted solid dark badge (no circle rotation)
      if (icon) {
        gsap.to(icon, {
          backgroundColor: '#08090d',
          rotate: 0,
          duration: 0.28,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // 3. Diagonal fly-out and re-entry on SVG arrow only
      if (iconSvg) {
        gsap.to(iconSvg, {
          stroke: '#d4af37',
          duration: 0.28,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        if (iconTl) iconTl.kill();
        iconTl = gsap.timeline();
        iconTl
          .to(iconSvg, {
            x: 16,
            y: -16,
            opacity: 0,
            duration: 0.24,
            ease: 'power2.inOut'
          })
          .set(iconSvg, {
            x: -16,
            y: 16
          })
          .to(iconSvg, {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.32,
            ease: 'power3.out'
          });
      }
    }
  };

  const onMouseLeave = () => {
    stopScramble();

    if (!prefersReducedMotion) {
      gsap.to(btn, {
        backgroundColor: 'rgba(14, 20, 36, 0.75)',
        color: '#f5f4f0',
        borderColor: 'rgba(255, 200, 0, 0.35)',
        boxShadow: 'none',
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      if (icon) {
        gsap.to(icon, {
          backgroundColor: '#d4af37',
          rotate: 0,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      if (iconSvg) {
        if (iconTl) iconTl.kill();
        gsap.to(iconSvg, {
          x: 0,
          y: 0,
          opacity: 1,
          stroke: '#08090d',
          duration: 0.26,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }
  };

  btn.addEventListener('mouseenter', onMouseEnter);
  btn.addEventListener('mouseleave', onMouseLeave);

  return () => {
    stopScramble();
    if (iconTl) iconTl.kill();
    btn.removeEventListener('mouseenter', onMouseEnter);
    btn.removeEventListener('mouseleave', onMouseLeave);
  };
}

export function initMagneticBadge(): void {
  // Static badge - magnetic disabled per studio design direction
}

export function initMagneticButtons(): void {
  const buttons = document.querySelectorAll<HTMLElement>('.magnetic-btn');
  if ('ontouchstart' in window) return;

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

export function initNavScrollBehavior(): void {
  const nav = document.querySelector<HTMLElement>('.nav');
  if (!nav) return;

  const applyWidth = () => {
    if (window.innerWidth > 768) {
      if (!nav.classList.contains('is-scrolled')) {
        nav.style.maxWidth = '60vw';
      }
    } else {
      nav.style.maxWidth = '92vw';
    }
  };
  applyWidth();

  if (typeof ScrollTrigger === 'undefined') {
    const onScroll = () => {
      const isScrolled = window.scrollY > 40;
      nav.classList.toggle('is-scrolled', isScrolled);
      if (window.innerWidth > 768) {
        nav.style.maxWidth = isScrolled ? '22.5vw' : '60vw';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return;
  }

  // Progressive ScrollTrigger from 60vw down to 22.5vw
  ScrollTrigger.create({
    start: 'top top',
    end: '+=260',
    scrub: 0.8,
    onUpdate: self => {
      const p = self.progress;
      if (window.innerWidth > 768) {
        const ease = 1 - Math.pow(1 - p, 3);
        const targetWidth = 60 - 37.5 * ease;
        nav.style.maxWidth = `${targetWidth.toFixed(2)}vw`;
      } else {
        nav.style.maxWidth = '92vw';
      }

      if (p > 0.05) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    },
    onLeaveBack: () => {
      nav.classList.remove('is-scrolled');
      if (window.innerWidth > 768) {
        nav.style.maxWidth = '60vw';
      } else {
        nav.style.maxWidth = '92vw';
      }
    }
  });

  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth <= 768) {
        nav.style.maxWidth = '92vw';
      } else {
        const isScrolled = nav.classList.contains('is-scrolled');
        nav.style.maxWidth = isScrolled ? '22.5vw' : '60vw';
      }
    },
    { passive: true }
  );
}
