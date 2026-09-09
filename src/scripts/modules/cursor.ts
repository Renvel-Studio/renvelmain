import { getLenis } from './lenis';

export function initCursorFollower(): () => void {
  // Never run on touch or stylus devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    return () => {};
  }

  const dot = document.getElementById('cursor-dot');
  const follower = document.getElementById('cursor-follower');

  if (!dot && !follower) return () => {};

  // Position coordinates
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  let followerX = mouseX;
  let followerY = mouseY;

  let isMouseInWindow = false;
  let isOverCase = false;
  let isHoveringInteractive = false;
  let rafId: number | null = null;

  // Linear interpolation for organic spring inertia
  const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };

  // Dedicated RAF animation loop
  const loop = (): void => {
    // Dot trails mouse with a natural delay
    dotX = lerp(dotX, mouseX, 0.2);
    dotY = lerp(dotY, mouseY, 0.2);

    if (dot) {
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    }

    // "Explore Case" follower trails with deeper, heavier damping
    if (follower && isOverCase) {
      followerX = lerp(followerX, mouseX, 0.12);
      followerY = lerp(followerY, mouseY, 0.12);
      follower.style.transform = `translate3d(${followerX - 60}px, ${followerY - 60}px, 0) scale(1)`;
    }

    rafId = requestAnimationFrame(loop);
  };

  const onMouseMove = (e: MouseEvent): void => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isMouseInWindow) {
      isMouseInWindow = true;
      if (dot && !isOverCase) dot.style.opacity = '1';
    }

    // Delegated hit-testing for hover states
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check project cards for "Explore Case" follower activation
    const workItem = target.closest('.works__item');
    if (workItem && !isOverCase) {
      isOverCase = true;
      followerX = mouseX;
      followerY = mouseY;
      if (dot) dot.classList.add('is-hidden');
      if (follower) follower.classList.add('is-active');
    } else if (!workItem && isOverCase) {
      isOverCase = false;
      if (dot) dot.classList.remove('is-hidden');
      if (follower) {
        follower.classList.remove('is-active');
        follower.style.transform = `translate3d(${followerX - 60}px, ${followerY - 60}px, 0) scale(0.3)`;
      }
    }

    // Check links and interactive surfaces
    const isInteractive = !!target.closest(
      'a, button, [role="button"], .process-card, .focus-tile, .focus-tile-btn'
    );
    if (isInteractive !== isHoveringInteractive) {
      isHoveringInteractive = isInteractive;
      if (dot && !isOverCase) {
        dot.classList.toggle('is-hovering', isHoveringInteractive);
      }
    }
  };

  const onMouseLeave = (): void => {
    isMouseInWindow = false;
    if (dot) dot.style.opacity = '0';
    if (follower) {
      follower.classList.remove('is-active');
      isOverCase = false;
    }
  };

  const onScrollCheck = (): void => {
    if (!isMouseInWindow) return;
    const el = document.elementFromPoint(mouseX, mouseY);
    if (!el) return;

    const workItem = el.closest('.works__item');
    if (workItem && !isOverCase) {
      isOverCase = true;
      followerX = mouseX;
      followerY = mouseY;
      if (dot) dot.classList.add('is-hidden');
      if (follower) follower.classList.add('is-active');
    } else if (!workItem && isOverCase) {
      isOverCase = false;
      if (dot) dot.classList.remove('is-hidden');
      if (follower) follower.classList.remove('is-active');
    }
  };

  // Event bindings
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('scroll', onScrollCheck, { passive: true });

  const lenis = getLenis();
  if (lenis) {
    lenis.on('scroll', onScrollCheck);
  }

  // Start rendering loop
  rafId = requestAnimationFrame(loop);

  // Return unbind handler for transitions / unmount
  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    window.removeEventListener('scroll', onScrollCheck);
  };
}
