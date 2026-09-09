import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let luxuryLenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return luxuryLenis;
}

export function initSmoothLuxury(
  prefersReducedMotion: boolean = false
): Lenis | null {
  if (prefersReducedMotion) return null;

  try {
    // 1. Initialize Lenis with smooth deceleration physics
    luxuryLenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      autoRaf: false // Ensures GSAP ticker is the single source of truth for frames
    });

    document.documentElement.classList.add('lenis');

    // 2. Direct synchronization between Lenis and ScrollTrigger
    luxuryLenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time: number) => {
      luxuryLenis?.raf(time * 1000);
    });

    // 3. Disable lag smoothing to prevent pin hitching during scroll threshold crossing
    gsap.ticker.lagSmoothing(0);

    // 4. Force initial calculation
    ScrollTrigger.refresh();

    return luxuryLenis;
  } catch (err) {
    luxuryLenis = null;
    return null;
  }
}

export function initSmoothScroll(
  prefersReducedMotion: boolean,
  onBeforeScroll?: () => void
): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      if (onBeforeScroll) onBeforeScroll();

      if (luxuryLenis) {
        luxuryLenis.scrollTo(target, { offset: 0, duration: 1.2 });
        return;
      }

      const navHeight = 64;
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });
}
