import { gsap } from 'gsap';
import { getLenis } from './lenis';

const PHYSICS_EASE = 'expo.out';

export function isSiteMenuOpen(): boolean {
  const menu = document.getElementById('site-menu');
  return !!(menu && menu.classList.contains('is-open'));
}

export function openSiteMenu(prefersReducedMotion: boolean): void {
  const menu = document.getElementById('site-menu');
  const burger = document.getElementById('nav-burger') as HTMLElement | null;
  if (!menu || !burger || isSiteMenuOpen()) return;

  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden', 'false');
  burger.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';

  const lenis = getLenis();
  if (lenis) lenis.stop();

  // GSAP physics-feeling stagger for links + left panel
  const links = menu.querySelectorAll<HTMLElement>('.site-menu__link');
  const left = menu.querySelector('.site-menu__left');

  if (!prefersReducedMotion) {
    gsap.fromTo(
      links,
      { y: 46, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.07,
        ease: PHYSICS_EASE,
        delay: 0.15,
        overwrite: true
      }
    );
    if (left) {
      gsap.fromTo(
        left,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: PHYSICS_EASE,
          delay: 0.3,
          overwrite: true
        }
      );
    }
  } else {
    links.forEach((l) => {
      l.style.opacity = '1';
      l.style.transform = 'none';
    });
  }

  // Focus first link for accessibility
  const first = menu.querySelector('.site-menu__link') as HTMLElement | null;
  if (first) first.focus({ preventScroll: true });
}

export function closeSiteMenu(): void {
  const menu = document.getElementById('site-menu');
  const burger = document.getElementById('nav-burger') as HTMLElement | null;
  if (!menu || !burger || !isSiteMenuOpen()) return;

  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';

  const lenis = getLenis();
  if (lenis) lenis.start();

  burger.focus({ preventScroll: true });
}

export function initSiteMenu(prefersReducedMotion: boolean): void {
  const burger = document.getElementById('nav-burger') as HTMLElement | null;
  const menu = document.getElementById('site-menu') as HTMLElement | null;
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    if (isSiteMenuOpen()) closeSiteMenu();
    else openSiteMenu(prefersReducedMotion);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSiteMenuOpen()) closeSiteMenu();

    // Focus trap: keep Tab inside open menu
    if (e.key === 'Tab' && isSiteMenuOpen()) {
      const focusables = menu.querySelectorAll<HTMLElement>('a[href], button');
      if (!focusables.length) return;
      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length - 1] as HTMLElement;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Magnetic hover pull for burger button (works seamlessly both when closed & open)
  if (!('ontouchstart' in window)) {
    const MAGNETIC_RADIUS = 48; // tuned for text menu button
    const PULL_FACTOR = 0.2;    // subtle attraction ratio
    const MAX_DISPLACEMENT = 8; // maximum travel distance in px
    let currentX = 0;
    let currentY = 0;
    let isTracking = false;

    const resetBurger = () => {
      if (!isTracking && currentX === 0 && currentY === 0) return;
      isTracking = false;
      currentX = 0;
      currentY = 0;
      gsap.to(burger, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      // Calculate stationary center of burger button (subtract current GSAP translation)
      const rect = burger.getBoundingClientRect();
      const untransformedCenterX = rect.left - currentX + rect.width / 2;
      const untransformedCenterY = rect.top - currentY + rect.height / 2;

      const deltaX = e.clientX - untransformedCenterX;
      const deltaY = e.clientY - untransformedCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < MAGNETIC_RADIUS) {
        isTracking = true;
        const targetX = Math.max(-MAX_DISPLACEMENT, Math.min(MAX_DISPLACEMENT, deltaX * PULL_FACTOR));
        const targetY = Math.max(-MAX_DISPLACEMENT, Math.min(MAX_DISPLACEMENT, deltaY * PULL_FACTOR));
        currentX = targetX;
        currentY = targetY;
        gsap.to(burger, {
          x: currentX,
          y: currentY,
          duration: 0.28,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else if (isTracking) {
        resetBurger();
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', resetBurger);
  }
}

export function initMenuActiveLinks(): void {
  const links = document.querySelectorAll<HTMLElement>('.site-menu__link');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map: Record<string, HTMLElement> = {};

  const setActive = (id: string) => {
    links.forEach((l) => l.classList.remove('is-active'));
    if (id && map[id]) map[id].classList.add('is-active');
  };

  links.forEach((l) => {
    const id = (l.getAttribute('href') || '').replace('#', '');
    if (id) {
      map[id] = l;
      l.addEventListener('click', () => setActive(id));
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  Object.keys(map).forEach((id) => {
    const sec = document.getElementById(id);
    if (sec) observer.observe(sec);
  });

  setActive('hero');
}
