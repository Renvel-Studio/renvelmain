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

  // Magnetic hover pull for burger button
  if (!('ontouchstart' in window)) {
    burger.addEventListener('mousemove', (e) => {
      const rect = burger.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      burger.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
    });
    burger.addEventListener('mouseleave', () => {
      burger.style.transform = 'translate(0, 0)';
    });
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
