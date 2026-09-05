/* ============================================================
   RENVEL STUDIO — Interactive Behaviors
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticleField();
  initSmoothLuxury();
  initClock();
  initSiteMenu();
  initMenuActiveLinks();
  initSmoothScroll();
  initScrollReveal();
  initHeroEntrance();
  initNewsletter();
  initCursorFollower();
  initMagneticButtons();
  initMagneticBadge();
  initNavScrollBehavior();
  initStickyCardStack();
  initFocusHorizontalScroll();
  initPremiumParallax();
});

/* Global luxury scroll instance (Lenis) shared with anchor + ScrollTrigger */
let luxuryLenis = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -----------------------------------------------------------
   PREMIUM PARTICLE / STARFIELD CANVAS BACKGROUND
   Lime + cyan + white dust, connecting lines, mouse interaction
   ----------------------------------------------------------- */
function initParticleField() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas || prefersReducedMotion) {
    if (canvas) canvas.style.display = 'none';
    return;
  }
  // Keep it subtle on small touch screens for perf
  if (window.innerWidth <= 768) {
    canvas.style.opacity = '0.55';
  }

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let rafId = null;
  let running = true;
  const mouse = { x: -9999, y: -9999 };

  const COLORS = ['57,255,20', '0,255,163', '220,255,80', '255,255,255'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function countForWidth() {
    if (w < 640) return 42;
    if (w < 1200) return 78;
    return 110;
  }

  function seed() {
    const n = countForWidth();
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 0.6 + Math.random() * 1.9,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      tw: Math.random() * Math.PI * 2,
      twSpeed: 0.008 + Math.random() * 0.02
    }));
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    // Links
    const LINK = 130;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK) {
          const a = (1 - dist / LINK) * 0.16;
          ctx.strokeStyle = `rgba(57,255,20,${a.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      // Gentle mouse repel for interactivity
      const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 160 && md > 0.01) {
        const force = (1 - md / 160) * 0.6;
        p.vx += (mdx / md) * force * 0.04;
        p.vy += (mdy / md) * force * 0.04;
      }
      // Damping + drift
      p.vx *= 0.985;
      p.vy *= 0.985;
      if (Math.abs(p.vx) < 0.08) p.vx += (Math.random() - 0.5) * 0.01;
      if (Math.abs(p.vy) < 0.08) p.vy += (Math.random() - 0.5) * 0.01;

      p.x += p.vx;
      p.y += p.vy;
      p.tw += p.twSpeed;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      const alpha = 0.35 + Math.sin(p.tw) * 0.3;
      const glow = p.c === '57,255,20' ? 8 : 5;
      ctx.save();
      ctx.shadowBlur = glow;
      ctx.shadowColor = `rgba(${p.c},0.9)`;
      ctx.fillStyle = `rgba(${p.c},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    rafId = requestAnimationFrame(step);
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseout', () => {
    mouse.x = -9999; mouse.y = -9999;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else if (!running) {
      running = true;
      step();
    }
  });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(resize, 200);
  });

  resize();
  step();
}

/* -----------------------------------------------------------
   LUXURY SMOOTH SCROLL — Lenis + GSAP ScrollTrigger wiring
   ----------------------------------------------------------- */
function initSmoothLuxury() {
  if (prefersReducedMotion) return;
  try {
    if (typeof Lenis !== 'undefined') {
      luxuryLenis = new Lenis({ duration: 1.15, smoothWheel: true });
      document.documentElement.classList.add('lenis');

      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        luxuryLenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => luxuryLenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (time) => {
          luxuryLenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      }
    } else if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  } catch (err) {
    luxuryLenis = null;
  }
}

/* -----------------------------------------------------------
   HERO ENTRANCE — line-mask stagger, GSAP with CSS fallback
   ----------------------------------------------------------- */
function initHeroEntrance() {
  const h1 = document.querySelector('.hero__statement h1');
  if (!h1) return;

  // Split existing <br> lines into masked spans once
  if (!h1.querySelector('.hero-line')) {
    const parts = h1.innerHTML.split(/<br\s*\/?>/i);
    h1.innerHTML = parts
      .map((p) => `<span class="hero-line"><span class="hero-line__inner">${p}</span></span>`)
      .join('');
  }
  const inners = h1.querySelectorAll('.hero-line__inner');

  // If GSAP drives the hero, don't let the generic .reveal hide it
  if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
    h1.classList.remove('reveal', 'is-visible');
    h1.style.opacity = '1';
    h1.style.transform = 'none';
  }

  if (prefersReducedMotion || typeof gsap === 'undefined') return;

  gsap.set(inners, { yPercent: 110, opacity: 0 });
  gsap.to(inners, {
    yPercent: 0,
    opacity: 1,
    duration: 1.1,
    stagger: 0.12,
    ease: 'power4.out',
    delay: 0.15
  });

  gsap.fromTo('.hero__positioning, .hero__right',
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.6, clearProps: 'transform' });
}

/* -----------------------------------------------------------
   PREMIUM PARALLAX — subtle GSAP ScrollTrigger touches
   ----------------------------------------------------------- */
function initPremiumParallax() {
  if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  try {
    gsap.to('.gradient-banner__content', {
      y: -40, ease: 'none',
      scrollTrigger: { trigger: '.gradient-banner', scrub: true, start: 'top bottom', end: 'bottom top' }
    });
  } catch (err) { /* non-fatal polish */ }
}

/* -----------------------------------------------------------
   NEWSLETTER — inline success instead of alert()
   ----------------------------------------------------------- */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  const input = form.querySelector('input[type="email"]');
  const msg = document.getElementById('newsletter-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (input.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) {
      if (msg) msg.textContent = 'Please enter a valid business email.';
      input.focus();
      return;
    }
    if (msg) msg.textContent = 'You’re in — check your inbox for the Growth Brief.';
    form.reset();
  });
}

/* -----------------------------------------------------------
   LIVE CLOCK — Athens timezone
   ----------------------------------------------------------- */
function initClock() {
  const clockEl = document.getElementById('footer-clock');
  if (!clockEl) return;

  function update() {
    const now = new Date();

    const athensTime = now.toLocaleTimeString('en-GB', {
      timeZone: 'Europe/Athens',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    clockEl.textContent = `Athens, Greece ${athensTime}`;
  }

  update();
  setInterval(update, 1000);
}

/* -----------------------------------------------------------
   SMOOTH SCROLL — Anchor navigation with nav offset (Lenis-aware)
   ----------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      const closeMenu = () => {
        closeSiteMenu();
      };

      if (luxuryLenis) {
        closeMenu();
        luxuryLenis.scrollTo(target, { offset: -64, duration: 1.4 });
        return;
      }

      const navHeight = 64;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      // Close site menu if open (fallback if helper missing)
      closeSiteMenu();
    });
  });
}

/* -----------------------------------------------------------
   SCROLL REVEAL — IntersectionObserver driven
   ----------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* -----------------------------------------------------------
   SITE MENU — SCHAU & HORCH fullscreen burger menu
   Circle burger morph, GSAP stagger, focus trap, Lenis lock
   ----------------------------------------------------------- */
function isSiteMenuOpen() {
  const menu = document.getElementById('site-menu');
  return !!(menu && menu.classList.contains('is-open'));
}

function openSiteMenu() {
  const menu = document.getElementById('site-menu');
  const burger = document.getElementById('nav-burger');
  if (!menu || !burger || isSiteMenuOpen()) return;

  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden', 'false');
  burger.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';
  if (luxuryLenis) luxuryLenis.stop();

  // GSAP stagger for links + left panel
  const links = menu.querySelectorAll('.site-menu__link');
  const left = menu.querySelector('.site-menu__left');
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    gsap.fromTo(links,
      { y: 46, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: 'power4.out', delay: 0.15, overwrite: true });
    if (left) {
      gsap.fromTo(left,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.3, overwrite: true });
    }
  } else {
    links.forEach((l) => { l.style.opacity = '1'; l.style.transform = 'none'; });
  }

  // Focus first link for a11y
  const first = menu.querySelector('.site-menu__link');
  if (first) first.focus({ preventScroll: true });
}

function closeSiteMenu() {
  const menu = document.getElementById('site-menu');
  const burger = document.getElementById('nav-burger');
  if (!menu || !burger || !isSiteMenuOpen()) return;

  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
  if (luxuryLenis) luxuryLenis.start();
  burger.focus({ preventScroll: true });
}

function initSiteMenu() {
  const burger = document.getElementById('nav-burger');
  const menu = document.getElementById('site-menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    if (isSiteMenuOpen()) closeSiteMenu();
    else openSiteMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSiteMenuOpen()) closeSiteMenu();
    // Simple focus trap: keep Tab inside menu
    if (e.key === 'Tab' && isSiteMenuOpen()) {
      const focusables = menu.querySelectorAll('a[href], button');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Stronger magnetic pull for the circle burger (reference feel)
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

/* -----------------------------------------------------------
   MENU ACTIVE LINK — green dash tracking like reference
   ----------------------------------------------------------- */
function initMenuActiveLinks() {
  const links = document.querySelectorAll('.site-menu__link');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map = {};
  links.forEach((l) => {
    const id = (l.getAttribute('href') || '').replace('#', '');
    if (id) map[id] = l;
  });

  const setActive = (id) => {
    links.forEach((l) => l.classList.remove('is-active'));
    if (id && map[id]) map[id].classList.add('is-active');
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  Object.keys(map).forEach((id) => {
    const sec = document.getElementById(id);
    if (sec) observer.observe(sec);
  });

  // Click sets active immediately so reopening the menu shows the right dash
  links.forEach((l) => {
    const id = (l.getAttribute('href') || '').replace('#', '');
    l.addEventListener('click', () => setActive(id));
  });

  setActive('hero');
}

/* -----------------------------------------------------------
   CUSTOM CURSOR — Bulletproof Neon dot + Case follower expand
   ----------------------------------------------------------- */
function initCursorFollower() {
  const dot = document.getElementById('cursor-dot');
  const follower = document.getElementById('cursor-follower');

  // Don't init on touch devices
  if ('ontouchstart' in window) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let isOverCase = false;
  let isMouseInWindow = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (dot) {
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
      if (!isMouseInWindow && !isOverCase) {
        dot.style.opacity = '1';
        isMouseInWindow = true;
      }
    }
  });

  document.addEventListener('mouseleave', () => {
    isMouseInWindow = false;
    if (dot) dot.style.opacity = '0';
  });

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function animateFollower() {
    if (isOverCase && follower) {
      followerX = lerp(followerX, mouseX, 0.15);
      followerY = lerp(followerY, mouseY, 0.15);
      follower.style.transform = `translate3d(${followerX - 60}px, ${followerY - 60}px, 0) scale(${isOverCase ? 1 : 0.3})`;
    }
    requestAnimationFrame(animateFollower);
  }

  animateFollower();

  // Interactive hover scaling on links, buttons, cards, focus tiles
  const interactiveElements = document.querySelectorAll('a, button, .process-card, .focus-tile, .focus-tile-btn');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (dot && !isOverCase) dot.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', () => {
      if (dot) dot.classList.remove('is-hovering');
    });
  });

  // Project cards transition (hides dot, activates EXPLORE CASE circle)
  const workItems = document.querySelectorAll('.works__item');
  workItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      isOverCase = true;
      if (dot) dot.classList.add('is-hidden');
      if (follower) {
        followerX = mouseX;
        followerY = mouseY;
        follower.classList.add('is-active');
      }
    });

    item.addEventListener('mouseleave', () => {
      isOverCase = false;
      if (dot) dot.classList.remove('is-hidden');
      if (follower) {
        follower.classList.remove('is-active');
        follower.style.transform = `translate3d(${followerX - 60}px, ${followerY - 60}px, 0) scale(0.3)`;
      }
    });
  });
}

/* -----------------------------------------------------------
   MAGNETIC BUTTONS — CTA pull toward cursor
   ----------------------------------------------------------- */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.magnetic-btn');
  if ('ontouchstart' in window) return;

  buttons.forEach(btn => {
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

/* -----------------------------------------------------------
   MAGNETIC ROTATING HERO BADGE
   ----------------------------------------------------------- */
function initMagneticBadge() {
  const badge = document.getElementById('hero-badge');
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

/* -----------------------------------------------------------
   NAV SCROLL BEHAVIOR
   ----------------------------------------------------------- */
function initNavScrollBehavior() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* -----------------------------------------------------------
   STICKY STACKING CARDS SCROLL & 3D TILT CONTROLLER
   ----------------------------------------------------------- */
function initStickyCardStack() {
  const cards = document.querySelectorAll('.process-card');
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
        let progress = 1 - Math.min(Math.max(distance / totalDistance, 0), 1);

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

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateStack);
      isTicking = true;
    }
  }, { passive: true });

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

/* -----------------------------------------------------------
   OUR FOCUS — PINNED HORIZONTAL SCROLL & BLUR REVEAL
   Matching user reference images (Schau & Horch minimal interaction)
   ----------------------------------------------------------- */
function initFocusHorizontalScroll() {
  const section = document.getElementById('focus');
  const title = document.getElementById('focus-blur-title');
  const strip = document.getElementById('focus-horizontal-strip');
  if (!section || !title || !strip) return;

  let ticking = false;

  function update() {
    ticking = false;
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      title.style.filter = '';
      title.style.opacity = '';
      title.style.transform = '';
      strip.style.transform = '';
      return;
    }

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const windowHeight = window.innerHeight;
    const maxScroll = sectionHeight - windowHeight;

    if (maxScroll <= 0) return;

    // Progress from 0 (entry into pinned section) to 1 (exit of section)
    const rawProgress = -rect.top / maxScroll;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // 1. Blur to sharp title effect & vertical elevation (progress 0 to 0.22)
    // Starts centered in the viewport heavily blurred (Screenshot 1),
    // and floats up to the top becoming completely sharp and clear (Screenshot 2 & 3).
    const blurProgress = Math.min(progress / 0.22, 1);
    const blurAmount = (1 - blurProgress) * 26; // 26px -> 0px
    const titleOpacity = 0.25 + blurProgress * 0.75; // 0.25 -> 1.0
    const titleScale = 0.90 + blurProgress * 0.10; // 0.90 -> 1.0

    // Vertical center offset when entering section (approx 22vh down)
    const initialCenterY = window.innerHeight * 0.22;
    const titleY = (1 - blurProgress) * initialCenterY;

    title.style.filter = `blur(${blurAmount.toFixed(1)}px)`;
    title.style.opacity = titleOpacity.toFixed(2);
    title.style.transform = `translateY(${titleY.toFixed(1)}px) scale(${titleScale.toFixed(3)})`;

    // 2. Horizontal scroll of the three tiles (from progress 0.15 to 1.0)
    // Tiles glide from right to left across the viewport
    const moveProgress = Math.min(Math.max((progress - 0.15) / 0.85, 0), 1);
    const stripWidth = strip.scrollWidth;
    const viewportWidth = window.innerWidth;
    const maxTranslate = Math.max(stripWidth - viewportWidth + viewportWidth * 0.18, 0);
    const translateX = moveProgress * maxTranslate;

    strip.style.transform = `translateX(-${translateX.toFixed(1)}px)`;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    requestAnimationFrame(update);
  });

  // Initial call
  update();

  // 3D subtle perspective tilt on hovering tiles
  const tiles = document.querySelectorAll('.focus-tile');
  tiles.forEach(tile => {
    tile.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;
      const rect = tile.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      tile.style.transform = `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
    });

    tile.addEventListener('mouseleave', () => {
      tile.style.transform = '';
    });
  });
}



