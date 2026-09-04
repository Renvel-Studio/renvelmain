import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let luxuryLenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return luxuryLenis;
}

export function initSmoothLuxury(prefersReducedMotion: boolean): Lenis | null {
  if (prefersReducedMotion) return null;
  try {
    luxuryLenis = new Lenis({ duration: 1.15, smoothWheel: true });
    document.documentElement.classList.add('lenis');

    luxuryLenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => luxuryLenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
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
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      if (onBeforeScroll) onBeforeScroll();

      if (luxuryLenis) {
        luxuryLenis.scrollTo(target, { offset: -64, duration: 1.4 });
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
