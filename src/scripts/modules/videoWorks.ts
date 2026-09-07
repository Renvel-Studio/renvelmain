/**
 * Selected Works Video Controller
 * Handles performance-conscious playback, viewport intersection,
 * zero-flicker poster crossfades, and reduced-motion preferences.
 */

export function initVideoWorks(prefersReducedMotion: boolean = false): void {
  const videoElements = document.querySelectorAll<HTMLVideoElement>(
    '.works__item-image-wrap video, .works__item-video'
  );

  if (!videoElements.length) return;

  // Track which videos are currently in viewport
  const inViewportMap = new WeakMap<HTMLVideoElement, boolean>();

  videoElements.forEach((video) => {
    // Ensure standard HTML5 attributes for inline autoplay
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    // Smooth reveal when video data is decoding and playing
    const markPlaying = () => {
      video.classList.add('is-playing');
      const wrap = video.closest('.works__item-image-wrap');
      if (wrap) wrap.classList.add('is-video-playing');
    };

    video.addEventListener('playing', markPlaying, { passive: true });
    video.addEventListener('canplaythrough', () => {
      video.classList.add('is-ready');
    }, { passive: true });

    // If reduced motion is requested, pause and keep poster intact
    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    // Hover acceleration: ensure immediate play on user intent
    const item = video.closest('.works__item');
    if (item) {
      item.addEventListener('mouseenter', () => {
        if (!prefersReducedMotion && video.paused) {
          video.play().catch(() => {});
        }
      });
    }
  });

  if (prefersReducedMotion) return;

  // IntersectionObserver to stream & decode only when in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        const isVisible = entry.isIntersecting;
        inViewportMap.set(video, isVisible);

        if (isVisible) {
          // Play smoothly when in viewport
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Gracefully handle browser battery saver / autoplay policy restrictions
            });
          }
        } else {
          // Pause when scrolled offscreen to conserve GPU/CPU resources
          if (!video.paused) {
            video.pause();
          }
        }
      });
    },
    {
      root: null,
      rootMargin: '120px 0px 120px 0px',
      threshold: 0.15,
    }
  );

  videoElements.forEach((video) => observer.observe(video));

  // Tab visibility management (pause background tab to save battery)
  document.addEventListener('visibilitychange', () => {
    const isHidden = document.hidden;
    videoElements.forEach((video) => {
      if (isHidden) {
        if (!video.paused) video.pause();
      } else if (inViewportMap.get(video)) {
        video.play().catch(() => {});
      }
    });
  });
}
