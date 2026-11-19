import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { createAsciiScene, type SceneState } from './ascii-scene';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state: SceneState = { spread: 0, charge: 0, robot: 0, lift: 0 };

// dev-only: ?spread=.5&robot=1&lift=.5 pins the scene for screenshots
if (import.meta.env.DEV) {
  const q = new URLSearchParams(location.search);
  for (const k of ['spread', 'robot', 'lift', 'charge'] as const) if (q.has(k)) state[k] = parseFloat(q.get(k)!);
  // ?hide=hero,about hides sections so a screenshot can frame the rest
  q.get('hide')?.split(',').forEach((id) => document.getElementById(id)?.style.setProperty('display', 'none'));
}

// ---- ASCII background scene ----
const canvas = document.getElementById('ascii') as HTMLCanvasElement | null;
if (canvas) {
  try {
    createAsciiScene(canvas, state, { animate: !reduce });
    document.documentElement.classList.add('has-ascii');
  } catch (err) {
    console.warn('ASCII scene unavailable (WebGL?)', err);
  }
}

if (!reduce) {
  // scroll drives the atom: rings open as you move down the page
  gsap.to(state, {
    spread: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });

  // Atom rises from below and takes the nucleus in his hands...
  gsap.to(state, {
    robot: 1, ease: 'none',
    scrollTrigger: { trigger: '#about', start: 'top 92%', end: 'top 25%', scrub: 1 },
  });
  // ...then lifts it overhead at the end of the page
  gsap.to(state, {
    lift: 1, ease: 'none',
    scrollTrigger: { trigger: '#contact', start: 'top 85%', end: 'top 35%', scrub: 1 },
  });

  // hold / press to charge (hero only)
  const hero = document.querySelector<HTMLElement>('#hero');
  if (hero) {
    const up = () => gsap.to(state, { charge: 0, duration: 0.9, ease: 'power3.out', overwrite: true });
    hero.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('a, button')) return;
      gsap.to(state, { charge: 1, duration: 0.35, ease: 'power2.out', overwrite: true });
    });
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  }

  // boot sequence
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.nav', { y: -20, opacity: 0, duration: 0.6 })
    .to('#boot', { duration: 0.9, scrambleText: { text: '> ./atomtr --boot', chars: '01#%@*+<>/', speed: 0.5 } }, '<')
    .to('#title', { duration: 1.3, scrambleText: { text: 'atomtr', chars: '01#%@&$', revealDelay: 0.3, speed: 0.4 } }, '-=0.3')
    .from('#tagline', { opacity: 0, y: 12, duration: 0.7 }, '-=0.6')
    .from('.hero .cta a', { opacity: 0, y: 12, stagger: 0.12, duration: 0.5 }, '-=0.4')
    .from('.hint', { opacity: 0, duration: 0.8 }, '-=0.2');

  // scramble-in for section headings
  gsap.utils.toArray<HTMLElement>('[data-scramble]').forEach((el) => {
    const text = el.textContent ?? '';
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      duration: 1,
      scrambleText: { text, chars: '01#%@*+<>/', speed: 0.5 },
    });
  });

  // business card tilts toward the pointer, like it's being held
  const card = document.querySelector<HTMLElement>('.bizcard');
  if (card) {
    gsap.set(card, { transformPerspective: 900 });
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 16);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 16);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  // the 👀 on the card follow the cursor
  const eyes = [...document.querySelectorAll<SVGGElement>('.eyes .eye')].map((g) => {
    const white = g.querySelector('ellipse')!;
    const pupil = g.querySelector<SVGCircleElement>('.pupil')!;
    return {
      white,
      x: gsap.quickTo(pupil, 'x', { duration: 0.3, ease: 'power3.out' }),
      y: gsap.quickTo(pupil, 'y', { duration: 0.3, ease: 'power3.out' }),
    };
  });
  if (eyes.length) {
    const MAX_X = 3.8, MAX_Y = 3.2; // pupil travel inside the eye, in SVG units
    addEventListener('pointermove', (e) => {
      for (const eye of eyes) {
        const r = eye.white.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const k = Math.min(1, Math.hypot(dx, dy) / 140); // glance harder the further away you are
        const a = Math.atan2(dy, dx);
        eye.x(Math.cos(a) * MAX_X * k);
        eye.y(Math.sin(a) * MAX_Y * k);
      }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => eyes.forEach((eye) => { eye.x(0); eye.y(0); }));
  }

  // reveal blocks
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      opacity: 0, y: 24, duration: 0.7, ease: 'power3.out',
    });
  });
}
