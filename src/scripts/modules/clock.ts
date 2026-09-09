let clockIntervalId: number | undefined;

export function initClock(): () => void {
  const clock = document.getElementById('footer-clock');
  if (!clock) return () => {};

  // Clear any pre-existing interval to prevent stacking on Astro page transitions
  if (clockIntervalId !== undefined) {
    window.clearInterval(clockIntervalId);
    clockIntervalId = undefined;
  }

  // Instantiate the formatter once outside the loop to eliminate GC overhead
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Athens',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const update = (): void => {
    const athensTime = formatter.format(new Date());
    clock.textContent = `Athens, Greece ${athensTime}`;
  };

  // Immediate initial render
  update();

  // Tick every second
  clockIntervalId = window.setInterval(update, 1000);

  // Instantly re-sync if the tab was suspended or minimized by the browser
  const handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      update();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return a cleanup callback for Astro page unmount / teardown
  return () => {
    if (clockIntervalId !== undefined) {
      window.clearInterval(clockIntervalId);
      clockIntervalId = undefined;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
