import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from './lenis';

gsap.registerPlugin(ScrollTrigger);

interface ScrollTriggerWithSpacer extends ScrollTrigger {
  spacer?: HTMLElement;
}

export function initFocusHorizontalScroll(
  prefersReducedMotion: boolean = false
): () => void {
  const section = document.getElementById('focus');
  const strip = document.getElementById('focus-horizontal-strip');
  if (!section || !strip) return () => {};

  const lineOur = document.getElementById('focus-line-our');
  const lineFocus = document.getElementById('focus-line-focus');
  const counter = document.getElementById('focus-counter');
  const counterCurrent = document.getElementById('focus-counter-current');
  const ambientGlow = document.getElementById('focus-ambient-glow');
  const tiles = Array.from(strip.querySelectorAll<HTMLElement>('.focus-tile'));

  if (ambientGlow) {
    ambientGlow.style.display = 'none';
  }

  if (counter) {
    counter.setAttribute('aria-live', 'polite');
    counter.setAttribute('aria-atomic', 'true');
  }

  const mm = gsap.matchMedia();

  // Mobile / Reduced Motion Profile
  mm.add(
    {
      isReduced: '(prefers-reduced-motion: reduce)',
      isMobile: '(max-width: 900px)'
    },
    context => {
      const { isReduced, isMobile } = context.conditions as {
        isReduced: boolean;
        isMobile: boolean;
      };

      if (prefersReducedMotion || isReduced || isMobile) {
        if (lineOur) gsap.set(lineOur, { clearProps: 'all', opacity: 1 });
        if (lineFocus) gsap.set(lineFocus, { clearProps: 'all', opacity: 1 });
        if (counter) gsap.set(counter, { clearProps: 'all', opacity: 1 });
        if (strip) gsap.set(strip, { clearProps: 'all' });

        tiles.forEach(tile => {
          gsap.set(tile, { clearProps: 'all', opacity: 1 });
          tile.classList.add('is-active');
          tile.removeAttribute('aria-current');
        });
      }
    }
  );

  // Desktop Motion Profile
  mm.add('(min-width: 901px)', () => {
    if (prefersReducedMotion) return;

    gsap.set(strip, {
      transformPerspective: 1400,
      transformStyle: 'preserve-3d'
    });

    // Cache layout metrics to prevent layout thrashing on RAF scroll frames
    interface TileMetrics {
      tile: HTMLElement;
      offsetLeft: number;
      halfWidth: number;
    }

    let cachedTileMetrics: TileMetrics[] = [];

    const measureTiles = () => {
      cachedTileMetrics = tiles.map(tile => ({
        tile,
        offsetLeft: tile.offsetLeft,
        halfWidth: tile.offsetWidth * 0.5
      }));
    };

    measureTiles();

    // Exact horizontal distance needed to bring the 3rd tile into prime view
    const getScrollDistance = (): number => {
      if (cachedTileMetrics.length < 2) return 0;
      const first = cachedTileMetrics[0];
      const last = cachedTileMetrics[cachedTileMetrics.length - 1];
      return Math.max(last.offsetLeft - first.offsetLeft, 0);
    };

    let currentActiveIndex = -1;

    const setActiveDiscipline = (index: number) => {
      if (index === currentActiveIndex) return;
      currentActiveIndex = index;

      if (counterCurrent) {
        counterCurrent.textContent = `0${index + 1}`;
      }

      tiles.forEach((tile, idx) => {
        const isActive = idx === index;
        tile.classList.toggle('is-active', isActive);
        if (isActive) {
          tile.setAttribute('aria-current', 'step');
        } else {
          tile.removeAttribute('aria-current');
        }
      });
    };

    setActiveDiscipline(0);

    // Dynamic 3D rotation & perspective in place (zero layout reflows)
    const updateSpatialRotation = () => {
      const currentStripX = (gsap.getProperty(strip, 'x') as number) || 0;
      const focalPoint = window.innerWidth * 0.44;
      const halfWindow = window.innerWidth * 0.5;

      let minDistance = Infinity;
      let closestIdx = 0;

      for (let idx = 0; idx < cachedTileMetrics.length; idx++) {
        const metric = cachedTileMetrics[idx];
        const tileCenter = metric.offsetLeft + currentStripX + metric.halfWidth;
        const distFromFocal = tileCenter - focalPoint;
        const absDist = Math.abs(distFromFocal);

        if (absDist < minDistance) {
          minDistance = absDist;
          closestIdx = idx;
        }

        const normalizedOffset = gsap.utils.clamp(
          -1.2,
          1.2,
          distFromFocal / halfWindow
        );

        const rotate2D = normalizedOffset * 1.8;
        const rotateY = normalizedOffset * 5.0;
        const zDepth = -Math.abs(normalizedOffset) * 20;
        const scale = 1 - Math.min(Math.abs(normalizedOffset) * 0.03, 0.04);
        const opacity = 1 - Math.min(Math.abs(normalizedOffset) * 0.15, 0.2);

        gsap.set(metric.tile, {
          rotate: rotate2D,
          rotateY: rotateY,
          z: zDepth,
          scale: scale,
          opacity: opacity,
          transformPerspective: 1200,
          transformOrigin: 'center center',
          overwrite: 'auto'
        });
      }

      setActiveDiscipline(closestIdx);
    };

    // --- Master Timeline with 100vw Pin Spacer Correction ---
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        pinSpacing: true,
        pinType: 'fixed',
        scrub: 0.3, // Silky 1:1 synchronization with Lenis smooth scroll
        anticipatePin: 1,
        start: 'top top',
        end: () => `+=${getScrollDistance() + window.innerHeight * 1.15}`, // Generous runway for comfortable reading pace
        invalidateOnRefresh: true,
        onRefresh: self => {
          measureTiles();
          // Type-safe access to internal spacer and HTML pin element
          const typedSelf = self as ScrollTriggerWithSpacer;
          const spacer = typedSelf.spacer;
          const pin = self.pin as HTMLElement | null;

          if (spacer) {
            spacer.style.width = '100vw';
            spacer.style.maxWidth = '100vw';
            spacer.style.minWidth = '100vw';
            spacer.style.marginLeft = 'calc(50% - 50vw)';
            spacer.style.marginRight = 'calc(50% - 50vw)';
            spacer.style.paddingLeft = '0px';
            spacer.style.paddingRight = '0px';
            spacer.style.boxSizing = 'border-box';
          }
          if (pin) {
            pin.style.width = '100vw';
            pin.style.maxWidth = '100vw';
            pin.style.minWidth = '100vw';
            pin.style.boxSizing = 'border-box';
          }
        },
        onUpdate: () => {
          updateSpatialRotation();
        }
      }
    });

    // Linear continuous glide across the entire pinned scroll:
    // Zero deadzones, zero stutter, zero sudden acceleration
    masterTl.to(
      strip,
      {
        x: () => -getScrollDistance(),
        duration: 1,
        ease: 'none'
      },
      0
    );

    if (lineOur && lineFocus) {
      masterTl.fromTo(
        [lineOur, lineFocus],
        { opacity: 0.85, y: 10 },
        { opacity: 1, y: 0, duration: 0.15, ease: 'power1.out' },
        0
      );
    }
    if (counter) {
      masterTl.fromTo(
        counter,
        { opacity: 0.85 },
        { opacity: 1, duration: 0.15, ease: 'power1.out' },
        0
      );
    }

    const st = masterTl.scrollTrigger!;

    // Accessibility Tab Support (WCAG 2.4.11)
    const handleFocusIn = (e: FocusEvent) => {
      const focusedTarget = e.target as HTMLElement | null;
      if (!focusedTarget) return;

      const targetTile = focusedTarget.closest<HTMLElement>('.focus-tile');
      if (!targetTile) return;

      const targetIndex = tiles.indexOf(targetTile);
      if (targetIndex === -1) return;

      if (targetIndex === currentActiveIndex) {
        const rect = targetTile.getBoundingClientRect();
        if (rect.left >= 0 && rect.right <= window.innerWidth) return;
      }

      const totalScroll = st.end - st.start;
      const firstTile = tiles[0];
      const maxDist = getScrollDistance();
      const targetOffset =
        targetTile.offsetLeft - (firstTile ? firstTile.offsetLeft : 0);
      const glideProgress =
        maxDist > 0 ? gsap.utils.clamp(0, 1, targetOffset / maxDist) : 0;

      const targetScrollY = st.start + glideProgress * totalScroll;

      setActiveDiscipline(targetIndex);

      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(targetScrollY, {
          duration: 0.9,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      }
    };

    strip.addEventListener('focusin', handleFocusIn);

    // Desktop 3D Hover Tilt
    const cleanupHoverListeners: Array<() => void> = [];

    if (
      !('ontouchstart' in window) &&
      !window.matchMedia('(pointer: coarse)').matches
    ) {
      tiles.forEach(tile => {
        const cardInner = (tile.querySelector('.focus-tile__inner') ||
          tile) as HTMLElement;

        const tiltX = gsap.quickTo(cardInner, 'rotateX', {
          duration: 0.4,
          ease: 'power2.out'
        });
        const tiltY = gsap.quickTo(cardInner, 'rotateY', {
          duration: 0.4,
          ease: 'power2.out'
        });
        const liftY = gsap.quickTo(cardInner, 'y', {
          duration: 0.4,
          ease: 'power2.out'
        });

        const onMouseMove = (e: MouseEvent) => {
          const rect = cardInner.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          tiltX(-y * 3.5);
          tiltY(x * 3.5);
          liftY(-3);
        };

        const onMouseLeave = () => {
          tiltX(0);
          tiltY(0);
          liftY(0);
        };

        tile.addEventListener('mousemove', onMouseMove);
        tile.addEventListener('mouseleave', onMouseLeave);

        cleanupHoverListeners.push(() => {
          tile.removeEventListener('mousemove', onMouseMove);
          tile.removeEventListener('mouseleave', onMouseLeave);
        });
      });
    }

    return () => {
      strip.removeEventListener('focusin', handleFocusIn);
      cleanupHoverListeners.forEach(cleanup => cleanup());
    };
  });

  return () => {
    mm.revert();
  };
}
