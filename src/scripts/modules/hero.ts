import { gsap } from 'gsap';

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
  const badge = document.getElementById('hero-badge') as HTMLElement | null;
  if (!badge || 'ontouchstart' in window) return;

  badge.addEventListener('mousemove', (e) => {
    const rect = badge.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    badge.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
  });

  badge.addEventListener('mouseleave', () => {
    badge.style.transform = 'translate(0, 0)';
  });
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
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
