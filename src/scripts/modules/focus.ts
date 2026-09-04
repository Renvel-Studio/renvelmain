import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initFocusHorizontalScroll(prefersReducedMotion: boolean = false): void {
  const section = document.getElementById('focus') as HTMLElement | null;
  const strip = document.getElementById('focus-horizontal-strip') as HTMLElement | null;
  const ambientGlow = document.getElementById('focus-ambient-glow') as HTMLElement | null;
  const lineOur = document.getElementById('focus-line-our') as HTMLElement | null;
  const lineFocus = document.getElementById('focus-line-focus') as HTMLElement | null;
  const counter = document.getElementById('focus-counter') as HTMLElement | null;
  const counterCurrent = document.getElementById('focus-counter-current') as HTMLElement | null;
  const tiles = Array.from(document.querySelectorAll<HTMLElement>('.focus-tile'));

  if (!section || !strip) return;

  const isMobile = () => window.innerWidth <= 900;

  // On mobile or reduced motion, ensure everything is statically sharp & visible
  if (prefersReducedMotion || isMobile()) {
    if (lineOur) {
      lineOur.style.opacity = '1';
      lineOur.style.filter = 'none';
      lineOur.style.transform = 'none';
    }
    if (lineFocus) {
      lineFocus.style.opacity = '1';
      lineFocus.style.filter = 'none';
      lineFocus.style.transform = 'none';
    }
    if (ambientGlow) {
      ambientGlow.style.opacity = '0.3';
    }
    tiles.forEach((t) => {
      t.classList.add('is-active');
      t.style.opacity = '1';
      t.style.filter = 'none';
      t.style.transform = 'none';
    });
    return;
  }

  // Calculate the exact horizontal scroll distance so Tile 3 stops perfectly framed
  const getScrollDistance = () => {
    const lastTile = strip.querySelector<HTMLElement>('.focus-tile:last-child');
    const containerPadding =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--container-padding')
      ) || 48;
    const windowWidth = window.innerWidth;

    if (lastTile) {
      // Align lastTile right edge with windowWidth - containerPadding
      const lastTileRight = lastTile.offsetLeft + lastTile.offsetWidth;
      return Math.max(lastTileRight - (windowWidth - containerPadding), 0);
    }

    return Math.max(strip.scrollWidth - windowWidth, 0);
  };

  // Highlighting synchronization: Update counter number and tile active illumination
  let currentActiveIndex = -1;

  const setActiveDiscipline = (index: number) => {
    if (index === currentActiveIndex) return;
    currentActiveIndex = index;

    // 1. Update numeric counter (01, 02, 03)
    if (counterCurrent) {
      counterCurrent.textContent = `0${index + 1}`;
    }

    // 2. Highlight corresponding tile card
    tiles.forEach((tile, idx) => {
      if (idx === index) {
        tile.classList.add('is-active');
      } else {
        tile.classList.remove('is-active');
      }
    });
  };

  // Set initial active state on Discipline 01
  setActiveDiscipline(0);

  // Generous unhurried intro distance for the slow, cinematic "our focus" reveal
  const getIntroDistance = () => window.innerHeight * 0.85;

  // Master GSAP Timeline with 2 Dedicated Phases:
  // Phase 1 (0 to 35%): "our focus" appears slowly with deep radial glow, staggered optical unblur,
  //                     letter-spacing contraction, and vertical settling. Tile 1 grounds into place.
  // Phase 2 (35% to 100%): Seamless horizontal glide through Tile 1, Tile 2, Tile 3 with synchronized counter.
  const introPct = 0.35;
  const glidePct = 0.65;

  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      pin: true,
      anticipatePin: 1,
      scrub: 0.8,
      start: 'top top',
      end: () => `+=${getIntroDistance() + getScrollDistance()}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        if (p < introPct) {
          // During slow title reveal, Tile 1 is active
          setActiveDiscipline(0);
        } else {
          // During horizontal glide, calculate which tile is currently framed
          const glideProgress = (p - introPct) / glidePct;
          if (glideProgress < 0.35) {
            setActiveDiscipline(0);
          } else if (glideProgress < 0.70) {
            setActiveDiscipline(1);
          } else {
            setActiveDiscipline(2);
          }
        }
      }
    }
  });

  // --- Phase 1: Slow, Cinematic Appearance of "our focus" ---
  // 1. Ethereal ambient light bloom expands behind the title
  if (ambientGlow) {
    masterTl.fromTo(
      ambientGlow,
      { opacity: 0, scale: 0.6 },
      { opacity: 0.85, scale: 1.15, duration: 24, ease: 'power2.out' },
      0
    );
  }

  // 2. Line 1: "our" slowly resolves from deep optical blur, rises, and tightens letter-spacing
  if (lineOur) {
    masterTl.fromTo(
      lineOur,
      {
        opacity: 0,
        y: 48,
        scale: 0.9,
        filter: 'blur(26px)',
        letterSpacing: '0.06em'
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        letterSpacing: '-0.04em',
        duration: 22,
        ease: 'power2.out'
      },
      0
    );
  }

  // 3. Line 2: "focus" follows with a graceful staggered wave
  if (lineFocus) {
    masterTl.fromTo(
      lineFocus,
      {
        opacity: 0,
        y: 48,
        scale: 0.9,
        filter: 'blur(26px)',
        letterSpacing: '0.06em'
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        letterSpacing: '-0.04em',
        duration: 24,
        ease: 'power2.out'
      },
      7
    );
  }

  // 4. Counter gently fades into view
  if (counter) {
    masterTl.fromTo(
      counter,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 16, ease: 'power2.out' },
      8
    );
  }

  // 5. First tile grounds softly into place (held strictly at x = 0)
  const firstTile = tiles[0];
  if (firstTile) {
    masterTl.fromTo(
      firstTile,
      { opacity: 0.4, y: 35, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 25, ease: 'power2.out' },
      4
    );
  }

  // Hold pause so the majestic title and Tile 1 are appreciated before horizontal movement starts
  masterTl.to({}, { duration: 6 }, 25);

  // --- Phase 2: Horizontal Glide ---
  // Once the title is fully resolved, cards glide across the screen
  masterTl.to(
    strip,
    {
      x: () => -getScrollDistance(),
      duration: 65,
      ease: 'none'
    },
    35
  );

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}
