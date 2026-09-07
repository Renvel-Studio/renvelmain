/* ============================================================
   RENVEL STUDIO — Main Application Orchestrator
   Modular Architecture (GSAP + Lenis + Lucide)
   ============================================================ */
import { createIcons } from 'lucide';
import { initParticleField } from './modules/particles';
import { initSmoothLuxury, initSmoothScroll } from './modules/lenis';
import { initClock } from './modules/clock';
import { initSiteMenu, initMenuActiveLinks, closeSiteMenu } from './modules/menu';
import { initScrollReveal } from './modules/reveal';
import {
  initHeroEntrance,
  initMagneticButtons,
  initMagneticBadge,
  initNavScrollBehavior
} from './modules/hero';
import { initNewsletter } from './modules/newsletter';
import { initCursorFollower } from './modules/cursor';
import { initStickyCardStack, initPremiumParallax } from './modules/cards';
import { initFocusHorizontalScroll } from './modules/focus';
import { initVideoWorks } from './modules/videoWorks';
import { initStatsCounter } from './modules/statsCounter';

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

document.addEventListener('DOMContentLoaded', () => {
  try {
    createIcons();
  } catch (err) {
    /* icons are progressive enhancement; inline fallbacks remain */
  }

  const year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Initialize Core Systems
  initParticleField(prefersReducedMotion);
  initSmoothLuxury(prefersReducedMotion);
  initClock();
  initSiteMenu(prefersReducedMotion);
  initMenuActiveLinks();
  initSmoothScroll(prefersReducedMotion, () => closeSiteMenu());
  initScrollReveal();

  // Initialize Interactive & Motion Modules
  initHeroEntrance(prefersReducedMotion);
  initNewsletter();
  initCursorFollower();
  initMagneticButtons();
  initMagneticBadge();
  initNavScrollBehavior();
  initStickyCardStack();
  initFocusHorizontalScroll(prefersReducedMotion);
  initPremiumParallax(prefersReducedMotion);
  initVideoWorks(prefersReducedMotion);
  initStatsCounter(prefersReducedMotion);
});
