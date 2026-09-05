import { getLenis } from './lenis';

export function initCursorFollower(): void {
  const dot = document.getElementById('cursor-dot') as HTMLElement | null;
  const follower = document.getElementById('cursor-follower') as HTMLElement | null;

  // Don't init on touch devices
  if ('ontouchstart' in window) return;

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;
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

  let followerRafId: number | null = null;

  function lerp(start: number, end: number, factor: number) {
    return start + (end - start) * factor;
  }

  function activateFollower() {
    if (isOverCase) return;
    isOverCase = true;
    if (dot) dot.classList.add('is-hidden');
    if (follower) {
      followerX = mouseX;
      followerY = mouseY;
      follower.classList.add('is-active');
      startFollower();
    }
  }

  function deactivateFollower() {
    if (!isOverCase) return;
    isOverCase = false;
    stopFollower();
    if (dot) dot.classList.remove('is-hidden');
    if (follower) {
      follower.classList.remove('is-active');
      follower.style.transform = `translate3d(${followerX - 60}px, ${followerY - 60}px, 0) scale(0.3)`;
    }
  }

  function tickFollower() {
    if (!isOverCase || !follower) {
      followerRafId = null;
      return;
    }

    // Dynamic hit-test verification for trackpad/smooth scroll
    if (isMouseInWindow) {
      const el = document.elementFromPoint(mouseX, mouseY);
      if (!el || !el.closest('.works__item')) {
        deactivateFollower();
        return;
      }
    }

    followerX = lerp(followerX, mouseX, 0.15);
    followerY = lerp(followerY, mouseY, 0.15);
    follower.style.transform = `translate3d(${followerX - 60}px, ${followerY - 60}px, 0) scale(${isOverCase ? 1 : 0.3})`;
    followerRafId = requestAnimationFrame(tickFollower);
  }

  function startFollower() {
    if (followerRafId === null) {
      followerRafId = requestAnimationFrame(tickFollower);
    }
  }

  function stopFollower() {
    if (followerRafId !== null) {
      cancelAnimationFrame(followerRafId);
      followerRafId = null;
    }
  }

  document.addEventListener('mouseleave', () => {
    isMouseInWindow = false;
    if (dot) dot.style.opacity = '0';
    deactivateFollower();
  });

  // Verify element under cursor during scroll (essential for laptop trackpad scrolling where mouse coordinates don't change)
  const onScrollCheck = () => {
    if (!isMouseInWindow) return;
    const el = document.elementFromPoint(mouseX, mouseY);
    const item = el ? el.closest('.works__item') : null;

    if (item && !isOverCase) {
      activateFollower();
    } else if (!item && isOverCase) {
      deactivateFollower();
    }

    if (dot && !item) {
      const isInteractive = !!(el && el.closest('a, button, .process-card, .focus-tile, .focus-tile-btn'));
      dot.classList.toggle('is-hovering', isInteractive);
    }
  };

  window.addEventListener('scroll', onScrollCheck, { passive: true });

  const lenis = getLenis();
  if (lenis) {
    lenis.on('scroll', onScrollCheck);
  }

  // Interactive hover scaling on links, buttons, cards, focus tiles
  const interactiveElements = document.querySelectorAll(
    'a, button, .process-card, .focus-tile, .focus-tile-btn'
  );
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (dot && !isOverCase) dot.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', () => {
      if (dot) dot.classList.remove('is-hovering');
    });
  });

  // Project cards transition (hides dot, activates EXPLORE CASE circle)
  const workItems = document.querySelectorAll('.works__item');
  workItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      activateFollower();
    });

    item.addEventListener('mouseleave', () => {
      deactivateFollower();
    });
  });
}
