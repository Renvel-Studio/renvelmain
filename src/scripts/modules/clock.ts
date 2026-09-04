export function initClock(): void {
  const clockEl = document.getElementById('footer-clock');
  if (!clockEl) return;
  const clock: HTMLElement = clockEl;

  function update() {
    const now = new Date();

    const athensTime = now.toLocaleTimeString('en-GB', {
      timeZone: 'Europe/Athens',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    clock.textContent = `Athens, Greece ${athensTime}`;
  }

  update();
  setInterval(update, 1000);
}
