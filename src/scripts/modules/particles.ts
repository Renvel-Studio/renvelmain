export function initParticleField(prefersReducedMotion: boolean): void {
  const canvasEl = document.getElementById('bg-particles') as HTMLCanvasElement | null;
  if (!canvasEl || prefersReducedMotion) {
    if (canvasEl) canvasEl.style.display = 'none';
    return;
  }
  const canvas: HTMLCanvasElement = canvasEl;

  if (window.innerWidth <= 768) {
    canvas.style.opacity = '0.55';
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    c: string;
    tw: number;
    twSpeed: number;
  }

  let particles: Particle[] = [];
  let running = true;
  const mouse = { x: -9999, y: -9999 };

  /* Approved 8-color palette RGB triplets with enhanced emerald green presence */
  const COLORS = ['0,200,101', '0,200,101', '255,115,59', '240,171,150', '245,245,247'];

  function countForWidth() {
    if (w < 640) return 42;
    if (w < 1200) return 78;
    return 110;
  }

  function seed() {
    const n = countForWidth();
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 0.6 + Math.random() * 1.9,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      tw: Math.random() * Math.PI * 2,
      twSpeed: 0.008 + Math.random() * 0.02
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function step() {
    if (!running) return;
    ctx!.clearRect(0, 0, w, h);

    // Connecting lines between nearby particles
    const LINK = 130;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK) {
          const a = (1 - dist / LINK) * 0.16;
          ctx!.strokeStyle = `rgba(255,200,0,${a.toFixed(3)})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(q.x, q.y);
          ctx!.stroke();
        }
      }
    }

    for (const p of particles) {
      // Gentle mouse repulsion
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 160 && md > 0.01) {
        const force = (1 - md / 160) * 0.6;
        p.vx += (mdx / md) * force * 0.04;
        p.vy += (mdy / md) * force * 0.04;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Friction
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Wrap around edges
      if (p.x < -20) p.x = w + 20;
      else if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      else if (p.y > h + 20) p.y = -20;

      // Twinkle
      p.tw += p.twSpeed;
      const alpha = 0.35 + Math.sin(p.tw) * 0.35;

      ctx!.fillStyle = `rgba(${p.c},${alpha.toFixed(3)})`;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx!.fill();
    }

    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(step);
  });

  requestAnimationFrame(step);
}
