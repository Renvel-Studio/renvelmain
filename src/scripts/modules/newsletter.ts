export function initNewsletter(): void {
  const form = document.getElementById('newsletter-form') as HTMLFormElement | null;
  if (!form) return;
  const input = form.querySelector('input[type="email"]') as HTMLInputElement | null;
  const msg = document.getElementById('newsletter-success');
  if (!input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (input.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) {
      if (msg) msg.textContent = 'Please enter a valid business email.';
      input.focus();
      return;
    }
    if (msg) {
      msg.textContent = 'You’re in — check your inbox for the Growth Brief.';
    }
    form.reset();
  });
}
