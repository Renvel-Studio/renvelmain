/**
 * Stats Counter & Number Rolling Controller
 * Smoothly rolls/counts up numbers with exponential easing when the section enters the viewport,
 * and re-rolls each number independently and asynchronously on hover.
 */

export function initStatsCounter(prefersReducedMotion: boolean = false): void {
  const statCards = document.querySelectorAll<HTMLElement>('.stat');
  const statNumbers = document.querySelectorAll<HTMLElement>('.stat__number[data-stat-target]');
  if (!statNumbers.length) return;

  if (prefersReducedMotion) {
    // Keep final static values intact for reduced-motion accessibility
    return;
  }

  // Animation frame and timeout trackers for independent async control
  const activeRafMap = new WeakMap<HTMLElement, number>();
  const activeTimeoutMap = new WeakMap<HTMLElement, number>();

  const cancelActiveRoll = (el: HTMLElement) => {
    const existingRaf = activeRafMap.get(el);
    if (existingRaf) {
      cancelAnimationFrame(existingRaf);
      activeRafMap.delete(el);
    }
    const existingTimeout = activeTimeoutMap.get(el);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      activeTimeoutMap.delete(el);
    }
  };

  const rollNumber = (el: HTMLElement, duration = 1500, delay = 0) => {
    cancelActiveRoll(el);

    const target = parseFloat(el.dataset.statTarget || '0');
    const prefix = el.dataset.statPrefix || '';
    const suffix = el.dataset.statSuffix || '';
    const decimals = parseInt(el.dataset.statDecimals || '0', 10);

    // Reset display value to zero at start
    const zeroVal = decimals > 0 ? (0).toFixed(decimals) : '0';
    el.textContent = `${prefix}${zeroVal}${suffix}`;

    const executeRoll = () => {
      const startTime = performance.now();

      function update(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Exponential ease-out: rapid initial roll with smooth decelerating landing
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = target * ease;

        const formattedNumber =
          decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

        el.textContent = `${prefix}${formattedNumber}${suffix}`;

        if (progress < 1) {
          const rafId = requestAnimationFrame(update);
          activeRafMap.set(el, rafId);
        } else {
          // Guarantee exact final value
          const finalStr =
            decimals > 0 ? target.toFixed(decimals) : Math.round(target).toString();
          el.textContent = `${prefix}${finalStr}${suffix}`;
          el.classList.add('is-finished');
          activeRafMap.delete(el);
        }
      }

      const rafId = requestAnimationFrame(update);
      activeRafMap.set(el, rafId);
    };

    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        activeTimeoutMap.delete(el);
        executeRoll();
      }, delay);
      activeTimeoutMap.set(el, timeoutId);
    } else {
      executeRoll();
    }
  };

  // Set initial zero values before viewport entry
  statNumbers.forEach((el) => {
    const prefix = el.dataset.statPrefix || '';
    const suffix = el.dataset.statSuffix || '';
    const decimals = parseInt(el.dataset.statDecimals || '0', 10);
    const zeroVal = decimals > 0 ? (0).toFixed(decimals) : '0';
    el.textContent = `${prefix}${zeroVal}${suffix}`;
  });

  // Attach asynchronous hover re-roll to each individual stat card
  statCards.forEach((card) => {
    const numberEl = card.querySelector<HTMLElement>('.stat__number[data-stat-target]');
    if (!numberEl) return;

    card.addEventListener('mouseenter', () => {
      // Re-roll this individual stat asynchronously from 0 to its target
      rollNumber(numberEl, 1400, 0);
    });
  });

  // Intersection Observer for viewport entry: roll numbers one by one asynchronously
  let hasTriggered = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTriggered) {
          hasTriggered = true;
          const container = entry.target;
          const numbers = container.querySelectorAll<HTMLElement>(
            '.stat__number[data-stat-target]'
          );

          // Stagger each column asynchronously one by one
          numbers.forEach((el, index) => {
            const delay = index * 260; // 0ms, 260ms, 520ms stagger
            rollNumber(el, 1600, delay);
          });

          observer.unobserve(container);
        }
      });
    },
    { threshold: 0.15 }
  );

  const statsContainer = document.querySelector('.stats-section, .manifesto__stats');
  if (statsContainer) {
    observer.observe(statsContainer);
  }
}
