import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initNewsletter(
  prefersReducedMotion: boolean = false
): () => void {
  const section = document.querySelector<HTMLElement>('.newsletter-section');
  const form = document.getElementById(
    'newsletter-form'
  ) as HTMLFormElement | null;
  if (!form || !section) return () => {};

  const input = form.querySelector<HTMLInputElement>('input[type="email"]');
  const msg = document.getElementById(
    'newsletter-success'
  ) as HTMLElement | null;
  const canvasBlob =
    document.getElementById('bg-canvas') || document.querySelector('canvas');

  if (msg) {
    msg.setAttribute('aria-live', 'polite');
    msg.setAttribute('role', 'status');
  }

  let triggerInstance: ScrollTrigger | null = null;
  let bgFadeTrigger: ScrollTrigger | null = null;

  // --- 1. Seamless Liquid Dissolve: Amber Blob -> Pure Pitch Black ---
  if (canvasBlob) {
    bgFadeTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom', // Ξεκινάει ομαλά μόλις η περιοχή του newsletter μπει στο κάδρο
      end: 'top 20%', // Ολοκληρώνεται απαλά πριν το περιεχόμενο φτάσει στο κέντρο
      scrub: 1.2, // Liquid interpolation χωρίς απότομα σκαλοπάτια
      onUpdate: self => {
        const opacity = Math.max(0, 1 - self.progress);
        gsap.set(canvasBlob, { opacity });
      }
    });
  }

  // --- 2. GSAP Editorial Entrance ---
  if (!prefersReducedMotion) {
    const targets = section.querySelectorAll<HTMLElement>(
      '.newsletter-card__kicker, .newsletter-card__title, .newsletter-card__desc, .newsletter-card__form-group, .newsletter-card__disclaimer'
    );

    gsap.set(targets, { y: 28, opacity: 0 });

    triggerInstance = ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'power4.out',
          clearProps: 'transform'
        });
      }
    });
  } else {
    const targets = section.querySelectorAll<HTMLElement>(
      '.newsletter-card__kicker, .newsletter-card__title, .newsletter-card__desc, .newsletter-card__form-group, .newsletter-card__disclaimer'
    );
    gsap.set(targets, { opacity: 1, y: 0 });
    if (canvasBlob) gsap.set(canvasBlob, { opacity: 0 });
  }

  // --- 3. Form Submission Handling ---
  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!input) return;

    const val = (input.value || '').trim();
    const isBusinessEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);

    if (!isBusinessEmail) {
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('is-invalid');
      if (msg) {
        msg.textContent = 'Please enter a valid business email address.';
        msg.classList.remove('is-success');
        msg.classList.add('is-error');
      }
      input.focus();
      return;
    }

    input.removeAttribute('aria-invalid');
    input.classList.remove('is-invalid');

    if (msg) {
      msg.textContent = 'You’re in — Growth Brief dispatch scheduled.';
      msg.classList.add('is-success');
    }

    form.reset();
  };

  form.addEventListener('submit', handleSubmit);

  return () => {
    if (triggerInstance) triggerInstance.kill();
    if (bgFadeTrigger) bgFadeTrigger.kill();
    form.removeEventListener('submit', handleSubmit);
  };
}
