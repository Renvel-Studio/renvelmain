import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PHYSICS_EASE = 'expo.out';

export function initHeroEntrance(prefersReducedMotion: boolean): void {
  const h1 = document.querySelector('.hero__statement h1') as HTMLElement | null;
  if (!h1) return;

  // Split existing <br> lines into masked spans once
  if (!h1.querySelector('.hero-line')) {
    const parts = h1.innerHTML.split(/<br\s*\/?>/i);
    h1.innerHTML = parts
      .map(
        (p) => `<span class="hero-line"><span class="hero-line__inner">${p.trim()}</span></span>`
      )
      .join('');
  }
  const inners = h1.querySelectorAll('.hero-line__inner');

  // If GSAP drives the hero, don't let the generic .reveal hide it
  if (!prefersReducedMotion) {
    h1.classList.remove('reveal', 'is-visible');
    h1.style.opacity = '1';
    h1.style.transform = 'none';
  }

  if (prefersReducedMotion) return;

  gsap.set(inners, { yPercent: 110, opacity: 0 });
  gsap.to(inners, {
    yPercent: 0,
    opacity: 1,
    duration: 1.15,
    stagger: 0.12,
    ease: PHYSICS_EASE,
    delay: 0.15
  });

  gsap.fromTo(
    '.hero__sub, .hero__badge-wrap',
    { y: 28, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.05,
      stagger: 0.15,
      ease: PHYSICS_EASE,
      delay: 0.6,
      clearProps: 'transform'
    }
  );
}

export function initMagneticBadge(): void {
  // Static button - magnetic movement disabled per design direction
}

export function initMagneticButtons(): void {
  const buttons = document.querySelectorAll<HTMLElement>('.magnetic-btn');
  if ('ontouchstart' in window) return;

  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
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

  // Set starting values based on viewport
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
        nav.style.maxWidth = isScrolled ? '45vw' : '60vw';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return;
  }

  // Progressive ScrollTrigger from 60vw down to 45vw
  ScrollTrigger.create({
    start: 'top top',
    end: '+=260',
    scrub: 0.8,
    onUpdate: (self) => {
      const p = self.progress; // 0 to 1
      if (window.innerWidth > 768) {
        // Cubic bezier easing curve: 1 - Math.pow(1 - p, 3)
        const ease = 1 - Math.pow(1 - p, 3);
        const targetWidth = 60 - (15 * ease); // 60vw -> 45vw
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
      // When scrolling all the way to the top, reset completely to starting values
      nav.classList.remove('is-scrolled');
      if (window.innerWidth > 768) {
        nav.style.maxWidth = '60vw';
      } else {
        nav.style.maxWidth = '92vw';
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      nav.style.maxWidth = '92vw';
    } else {
      const isScrolled = nav.classList.contains('is-scrolled');
      nav.style.maxWidth = isScrolled ? '45vw' : '60vw';
    }
  }, { passive: true });
}
