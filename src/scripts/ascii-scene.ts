import * as THREE from 'three';

/**
 * ASCII Atom: a small Three.js scene (nucleus, orbit rings, electrons, embers)
 * rendered into a tiny render target. Each pixel is then mapped to a character
 * by brightness and drawn onto a 2D canvas, tinted with the pixel's own colour.
 */

export interface SceneState {
  /** 0..1 scroll-driven: rings open up and the camera pulls in */
  spread: number;
  /** 0..1 click/hold "charge" pulse */
  charge: number;
  /** 0..1 scroll-driven: Atom the robot rises and takes the nucleus in his hands */
  robot: number;
  /** 0..1 scroll-driven: Atom lifts the nucleus overhead */
  lift: number;
}

const RAMP = ' .\'`:;-~=+*xoO#%@';
const CELL_ASPECT = 1.8; // cell height / cell width
const EYE = new THREE.Color('#ffd23f');
const RED = new THREE.Color('#c8372d');
const STEEL = new THREE.Color('#9aa7b5');
const EMBER = new THREE.Color('#ffa24a');
// render targets are linear; lift to display gamma before picking glyphs
const GAMMA = new Uint8Array(256).map((_, i) => Math.round(255 * Math.pow(i / 255, 1 / 2.2)));

export function createAsciiScene(canvas: HTMLCanvasElement, state: SceneState, opts: { animate: boolean }) {
  const ctx = canvas.getContext('2d', { alpha: true })!;
  const mobile = matchMedia('(max-width: 700px)').matches;
  const targetCols = mobile ? 70 : 150;

  // ---------- three scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0, 7);

  const root = new THREE.Group();
  scene.add(root);

  // nucleus
  const coreMat = new THREE.MeshStandardMaterial({
    color: STEEL, metalness: 0.6, roughness: 0.35,
    emissive: EYE, emissiveIntensity: 0.28, flatShading: true,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), coreMat);
  root.add(core);
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, 1),
    new THREE.MeshBasicMaterial({ color: RED, wireframe: true, transparent: true, opacity: 0.8 }),
  );
  root.add(shell);

  // lights
  scene.add(new THREE.AmbientLight(0x334455, 0.5));
  const key = new THREE.PointLight(EYE, 14, 20); // eye glow
  key.position.set(0, 0, 1.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(RED, 1.6);
  rim.position.set(-4, 3, 2);
  scene.add(rim);
  const front = new THREE.DirectionalLight(0xffffff, 1.5); // keeps Atom readable
  front.position.set(0.5, 1.5, 5);
  scene.add(front);
  const fill = new THREE.DirectionalLight(STEEL, 0.9);
  fill.position.set(4, -2, 3);
  scene.add(fill);

  // orbit rings + electrons
  interface Orbit { pivot: THREE.Group; ring: THREE.Mesh; electron: THREE.Mesh; r: number; speed: number; phase: number }
  const orbits: Orbit[] = [];
  const specs = [
    { r: 2.1, tilt: [0.0, 0.0, 0.0], speed: 1.0 },
    { r: 2.7, tilt: [Math.PI / 3, 0.0, Math.PI / 6], speed: -0.75 },
    { r: 3.3, tilt: [-Math.PI / 3, 0.0, -Math.PI / 6], speed: 0.55 },
  ];
  specs.forEach((s, i) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(s.tilt[0], s.tilt[1], s.tilt[2]);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(s.r, 0.05, 6, 120),
      new THREE.MeshBasicMaterial({ color: i === 0 ? STEEL : i === 1 ? RED : STEEL, transparent: true, opacity: 0.85 }),
    );
    const electron = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), new THREE.MeshBasicMaterial({ color: EYE }));
    pivot.add(ring, electron);
    root.add(pivot);
    orbits.push({ pivot, ring, electron, r: s.r, speed: s.speed, phase: i * 2.1 });
  });

  // embers
  const EMBERS = mobile ? 60 : 130;
  const emberPos = new Float32Array(EMBERS * 3);
  const emberVel = new Float32Array(EMBERS);
  const seedEmber = (i: number, anywhere: boolean) => {
    emberPos[i * 3] = (Math.random() - 0.5) * 18;
    emberPos[i * 3 + 1] = anywhere ? (Math.random() - 0.5) * 10 : -5.5;
    emberPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    emberVel[i] = 0.25 + Math.random() * 0.7;
  };
  for (let i = 0; i < EMBERS; i++) seedEmber(i, true);
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(
    emberGeo,
    new THREE.PointsMaterial({ color: EMBER, size: 1.0, sizeAttenuation: false, transparent: true, opacity: 0.9 }),
  );
  scene.add(embers);

  // ---------- Atom, the robot (boxes only) ----------
  const bot = new THREE.Group();
  bot.visible = false;
  scene.add(bot);
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xb4c0cc, metalness: 0.35, roughness: 0.6, flatShading: true });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x6c7886, metalness: 0.35, roughness: 0.7, flatShading: true });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xe0473a, metalness: 0.2, roughness: 0.6, flatShading: true });
  const eyeMat = new THREE.MeshBasicMaterial({ color: EYE });
  const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = bot) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  // torso, waist, pelvis, neck
  box(1.5, 1.3, 0.9, steelMat);
  box(1.1, 0.55, 0.12, redMat, 0, 0.2, 0.5);
  box(0.9, 0.5, 0.7, darkMat, 0, -0.9, 0);
  box(1.3, 0.4, 0.8, steelMat, 0, -1.25, 0);
  box(0.4, 0.25, 0.4, darkMat, 0, 0.75, 0);
  // head: crest, visor, glowing eyes
  const head = new THREE.Group();
  head.position.set(0, 1.2, 0.05);
  bot.add(head);
  box(0.8, 0.7, 0.7, steelMat, 0, 0, 0, head);
  box(0.5, 0.14, 0.5, darkMat, 0, 0.42, 0, head);
  box(0.64, 0.24, 0.06, darkMat, 0, 0.04, 0.36, head);
  box(0.2, 0.1, 0.07, eyeMat, -0.16, 0.04, 0.4, head);
  box(0.2, 0.1, 0.07, eyeMat, 0.16, 0.04, 0.4, head);
  // legs and feet
  for (const sx of [-1, 1]) {
    box(0.55, 1.3, 0.55, steelMat, sx * 0.42, -2.0, 0);
    box(0.7, 0.25, 0.9, darkMat, sx * 0.42, -2.75, 0.15);
  }
  // arms: shoulder -> elbow -> fist
  const arms = [-1, 1].map((side) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 1.0, 0.5, 0);
    shoulder.rotation.order = 'YXZ';
    bot.add(shoulder);
    box(0.6, 0.6, 0.6, redMat, 0, 0, 0, shoulder);
    box(0.38, 0.9, 0.38, steelMat, 0, -0.5, 0, shoulder);
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.95, 0);
    shoulder.add(elbow);
    box(0.36, 0.85, 0.36, darkMat, 0, -0.4, 0, elbow);
    const fist = box(0.55, 0.5, 0.55, redMat, 0, -0.92, 0, elbow);
    return { side, shoulder, elbow, fist };
  });
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), held = new THREE.Vector3();
  const heroPos = new THREE.Vector3();

  // ---------- sizing ----------
  let cols = targetCols, rows = 40, cellW = 8, cellH = 14;
  let target = new THREE.WebGLRenderTarget(cols, rows, { depthBuffer: true });
  let pixels = new Uint8Array(cols * rows * 4);
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cols = targetCols;
    cellW = w / cols;
    cellH = cellW * CELL_ASPECT;
    rows = Math.max(10, Math.floor(h / cellH));
    cellH = h / rows;
    target.dispose();
    target = new THREE.WebGLRenderTarget(cols, rows, { depthBuffer: true });
    pixels = new Uint8Array(cols * rows * 4);
    renderer.setSize(cols, rows, false);
    camera.aspect = (cols * cellW) / (rows * cellH);
    // keep the atom fully visible on narrow/portrait screens
    camera.position.z = camera.aspect < 1 ? 7 / Math.max(camera.aspect, 0.55) : 7;
    camera.updateProjectionMatrix();
    const wide = camera.aspect > 1.25;
    xOff = wide ? Math.min(2.4, camera.aspect * 1.15) : 0;
    yOff = wide ? 0 : 2.0;
    base = wide ? 0.72 : 0.6;
    botScale = wide ? 0.62 : 0.5;
    botY = wide ? -0.3 : -0.1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${Math.round(cellH * 0.95)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  }

  let xOff = 0, yOff = 0, base = 0.72, botScale = 0.62, botY = -0.3;

  // pointer parallax
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  };
  addEventListener('pointermove', onMove, { passive: true });

  // ---------- draw ----------
  function draw() {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.readRenderTargetPixels(target, 0, 0, cols, rows, pixels);
    renderer.setRenderTarget(null);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const n = RAMP.length - 1;
    for (let y = 0; y < rows; y++) {
      const srcRow = rows - 1 - y; // readPixels is bottom-up
      for (let x = 0; x < cols; x++) {
        const i = (srcRow * cols + x) * 4;
        const a = pixels[i + 3];
        if (a < 16) continue;
        const r = GAMMA[pixels[i]], g = GAMMA[pixels[i + 1]], b = GAMMA[pixels[i + 2]];
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const idx = Math.min(n, Math.floor(lum * n * 1.05));
        if (idx <= 0) continue;
        // lift colour so dim glyphs stay readable on a dark background
        const k = 0.6 + 0.4 * lum;
        ctx.fillStyle = `rgb(${Math.min(255, r / k | 0)},${Math.min(255, g / k | 0)},${Math.min(255, b / k | 0)})`;
        ctx.fillText(RAMP[idx], x * cellW + cellW / 2, y * cellH + cellH / 2);
      }
    }
  }

  // ---------- loop ----------
  const clock = new THREE.Clock();
  let raf = 0, last = 0, running = false;
  const FRAME = mobile ? 1 / 24 : 1 / 40;

  function update(t: number, dt: number) {
    pointer.sx += (pointer.x - pointer.sx) * 0.06;
    pointer.sy += (pointer.y - pointer.sy) * 0.06;

    const s = state.spread, ch = state.charge, lift = state.lift;
    const rb = state.robot * state.robot * (3 - 2 * state.robot); // smoothstep

    // --- Atom the robot ---
    bot.visible = rb > 0.002;
    if (bot.visible) {
      bot.scale.setScalar(botScale);
      bot.position.set(xOff, botY - (1 - rb) * 7, -0.4);
      bot.rotation.y = -0.18 + pointer.sx * 0.3;
      head.rotation.set(pointer.sy * 0.2, pointer.sx * 0.45, 0);
      eyeMat.color.copy(EYE).multiplyScalar(0.8 + ch * 0.6 + Math.sin(t * 3) * 0.08);
      const a1 = -0.7 - lift * 1.9 + Math.sin(t * 1.4) * 0.03;
      const a2 = -1.3 + lift * 0.3;
      for (const a of arms) {
        a.shoulder.rotation.set(a1, -a.side * 0.45, 0);
        a.elbow.rotation.set(a2, 0, 0);
      }
      bot.updateMatrixWorld(true);
      arms[0].fist.getWorldPosition(tmpA);
      arms[1].fist.getWorldPosition(tmpB);
      held.addVectors(tmpA, tmpB).multiplyScalar(0.5);
      held.y += (0.3 - lift * 0.05) * botScale;
    }

    // --- the atom: hero position, blending into Atom's hands as he rises ---
    heroPos.set(xOff * (1 - s * 0.6), yOff - s * 0.6, 0);
    root.rotation.y = t * 0.15 + pointer.sx * 0.6 * (1 - rb);
    root.rotation.x = pointer.sy * 0.4 * (1 - rb);
    root.position.lerpVectors(heroPos, bot.visible ? held : heroPos, rb);
    const heroScale = base * (1 + s * 0.35 + ch * 0.25);
    const heldScale = 0.22 * (botScale / 0.62) * (1 + ch * 0.25);
    root.scale.setScalar(heroScale + (heldScale - heroScale) * rb);

    core.rotation.y = t * 0.5;
    core.rotation.x = t * 0.3;
    shell.rotation.y = -t * 0.35;
    shell.rotation.z = t * 0.2;
    coreMat.emissiveIntensity = 0.18 + Math.sin(t * 2.2) * 0.06 + ch * 0.8 + rb * 0.25;
    key.intensity = 14 + Math.sin(t * 2.2) * 3 + ch * 40;
    key.position.copy(root.position).add(tmpA.set(0, 0, 1.6));

    orbits.forEach((o, i) => {
      const ang = t * o.speed * (1 + ch * 2) + o.phase;
      const r = o.r * (1 + s * (1 - rb) * 0.25 * (i + 1)) * (1 - 0.4 * rb);
      o.ring.scale.setScalar(r / o.r);
      o.electron.position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0);
    });

    for (let i = 0; i < EMBERS; i++) {
      emberPos[i * 3 + 1] += emberVel[i] * dt;
      emberPos[i * 3] += Math.sin(t + i) * 0.003;
      if (emberPos[i * 3 + 1] > 5.5) seedEmber(i, false);
    }
    emberGeo.attributes.position.needsUpdate = true;
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = clock.getDelta();
    last += dt;
    if (last < FRAME) return;
    update(clock.elapsedTime, last);
    last = 0;
    draw();
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const ro = new ResizeObserver(() => {
    resize();
    if (!opts.animate) { update(1.2, 0); draw(); }
  });
  ro.observe(canvas);

  // pause when tab hidden
  const onVis = () => (document.hidden ? stop() : opts.animate && start());
  document.addEventListener('visibilitychange', onVis);

  resize();
  if (opts.animate) start(); else { update(1.2, 0); draw(); }

  return {
    destroy() {
      stop(); ro.disconnect();
      removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      renderer.dispose(); target.dispose();
    },
  };
}
