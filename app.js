/**
 * app.js — Minimalist 3D ASCII Solitaire Ring, 3D ASCII Hello Kitty & 16-Memory Editorial Archive
 */

const PI = Math.PI;
const TAU = 2.0 * PI;

const BAND = 0;   // Ring band OR Kitty head/ears/whiskers (monochrome silver-ivory)
const PRONG = 1;  // Ring prongs OR Kitty eyes/nose detail
const GEM = 2;    // Diamond facets OR Kitty signature ribbon bow (subtle blush-ivory highlight)

const R_BAND = 1.00;
const r_BAND = 0.175;
const CULET_Y = 1.05;
const GIRDLE_Y = 1.50;
const TABLE_Y = 1.70;
const GIRDLE_R = 0.50;
const TABLE_R = 0.33;

const BAND_DONE_T = 7.0;
const DRAW_END_T = 11.5;
const SPIN_DELAY = 1.0;
const TURN = 34.0;

// ============================================================================
// 1A. 3D SOLITAIRE DIAMOND RING POINT-CLOUD BUILDER
// ============================================================================
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function norm3(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1.0;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function sub3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function buildRingGeometry() {
  const P = [];
  const N = [];
  const F = [];
  const ORDER = [];

  function addPoint(pt, n, tag) {
    const nn = norm3(n);
    P.push(pt);
    N.push(nn);
    F.push(tag);

    let ord = 0;
    if (tag === BAND) {
      let ang = Math.atan2(pt[1], pt[0]) + PI / 2;
      while (ang > PI) ang -= TAU;
      while (ang < -PI) ang += TAU;
      ord = Math.abs(ang) / PI;
    } else if (tag === PRONG) {
      ord = 1.0 + ((pt[1] - R_BAND) / (TABLE_Y - R_BAND)) * 0.25;
    } else {
      ord = 1.25 + ((pt[1] - CULET_Y) / (TABLE_Y - CULET_Y)) * 0.45;
    }
    ORDER.push(ord);
  }

  function facet(tri, n, tag = GEM, step = 0.015) {
    const [a, b, c] = tri;
    const ab = sub3(b, a);
    const ac = sub3(c, a);
    const lenAB = Math.hypot(ab[0], ab[1], ab[2]);
    const lenAC = Math.hypot(ac[0], ac[1], ac[2]);
    const steps = Math.max(Math.floor(Math.max(lenAB, lenAC) / step), 7);
    const nn = norm3(n);

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const vSteps = Math.max(Math.floor(steps * (1.0 - u)), 1);
      for (let j = 0; j <= vSteps; j++) {
        const v = (1.0 - u) * (j / vSteps);
        const px = a[0] + u * ab[0] + v * ac[0];
        const py = a[1] + u * ab[1] + v * ac[1];
        const pz = a[2] + u * ab[2] + v * ac[2];
        addPoint([px, py, pz], nn, tag);
      }
    }
  }

  // 1. Ring Band
  const uSteps = 280;
  const vSteps = 44;
  for (let i = 0; i < uSteps; i++) {
    const u = (TAU * i) / uSteps;
    const sinU = Math.sin(u);
    const cosU = Math.cos(u);
    const shoulder = 1.0 - 0.16 * Math.pow(Math.max(0, sinU), 2);
    const rt = r_BAND * shoulder;

    for (let j = 0; j < vSteps; j++) {
      const v = (TAU * j) / vSteps;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      const r = R_BAND + rt * cosV;
      const bx = r * cosU;
      const by = r * sinU;
      const bz = rt * sinV * 1.26;
      const nx = cosV * cosU;
      const ny = cosV * sinU;
      const nz = sinV;
      addPoint([bx, by, bz], [nx, ny, nz], BAND);
    }
  }

  // 2. Prongs & Solitaire Basket
  const numProngs = 6;
  for (let p = 0; p < numProngs; p++) {
    const a = (TAU * p) / numProngs + PI / 6;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const sSteps = 34;
    for (let sIdx = 0; sIdx <= sSteps; sIdx++) {
      const s = sIdx / sSteps;
      const y = R_BAND - 0.04 + s * (GIRDLE_Y + 0.04 - (R_BAND - 0.04));
      const curve = Math.pow(s, 0.85);
      const r = 0.14 + curve * (GIRDLE_R * 1.03 - 0.14);
      for (let t = 0; t < 8; t++) {
        const phi = (TAU * t) / 8;
        const tubeR = 0.036 * (1.0 + 0.25 * s);
        const px = r * cosA + tubeR * Math.cos(phi);
        const pz = r * sinA + tubeR * Math.sin(phi);
        addPoint([px, y, pz], [cosA + 0.3 * Math.cos(phi), 0.22, sinA + 0.3 * Math.sin(phi)], PRONG);
      }
    }
  }

  const collarY = CULET_Y + 0.18;
  const collarR = 0.26;
  for (let i = 0; i < 84; i++) {
    const a = (TAU * i) / 84;
    addPoint([collarR * Math.cos(a), collarY, collarR * Math.sin(a)], [Math.cos(a), 0.1, Math.sin(a)], PRONG);
  }

  // 3. Brilliant-Cut Diamond
  const m = 16;
  for (let i = 0; i < m; i++) {
    const a0 = (TAU * i) / m;
    const a1 = (TAU * (i + 1)) / m;
    const g0 = [GIRDLE_R * Math.cos(a0), GIRDLE_Y, GIRDLE_R * Math.sin(a0)];
    const g1 = [GIRDLE_R * Math.cos(a1), GIRDLE_Y, GIRDLE_R * Math.sin(a1)];
    const t0 = [TABLE_R * Math.cos(a0), TABLE_Y, TABLE_R * Math.sin(a0)];
    const t1 = [TABLE_R * Math.cos(a1), TABLE_Y, TABLE_R * Math.sin(a1)];
    const culet = [0, CULET_Y, 0];

    let crown = cross(sub3(g1, g0), sub3(t0, g0));
    const cSign = Math.sign(crown[1]) || 1;
    crown = [crown[0] * cSign, crown[1] * cSign, crown[2] * cSign];
    facet([g0, g1, t0], crown);
    facet([g1, t1, t0], [crown[0], crown[1] * 1.15, crown[2]]);

    let pav = cross(sub3(culet, g0), sub3(g1, g0));
    const pSign = -Math.sign(pav[1]) || 1;
    pav = [pav[0] * pSign, pav[1] * pSign, pav[2] * pSign];
    facet([g0, g1, culet], pav);

    facet([[0, TABLE_Y, 0], t0, t1], [0, 1.0, 0]);
  }

  return { P, N, F, ORDER };
}

// ============================================================================
// 1B. 3D ASCII HELLO KITTY SCULPTURE BUILDER (Code-Art Point Cloud)
// ============================================================================
function buildKittyGeometry() {
  const P = [];
  const N = [];
  const F = [];
  const ORDER = [];

  function addPt(pt, n, tag) {
    const nn = norm3(n);
    P.push(pt);
    N.push(nn);
    F.push(tag);
    // Smooth bottom-to-top draw order in [0, 1.70]
    const ord = Math.max(0, Math.min(1.7, ((pt[1] + 0.85) / 2.2) * 1.7));
    ORDER.push(ord);
  }

  // 1. Iconic Ellipsoidal Head (wide cheeks, soft rounded crown)
  const rx = 1.12;
  const ry = 0.86;
  const rz = 0.78;
  const uSteps = 150;
  const vSteps = 76;
  for (let i = 0; i < uSteps; i++) {
    const u = (TAU * i) / uSteps;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    for (let j = 1; j < vSteps; j++) {
      const v = (PI * j) / vSteps;
      const sinV = Math.sin(v);
      const cosV = Math.cos(v);

      // Slightly widen lower cheeks for authentic Hello Kitty proportion
      const cheekWiden = 1.0 + 0.08 * Math.max(0, -cosV);
      const px = rx * cheekWiden * sinV * cosU;
      const py = 0.22 + ry * cosV;
      const pz = rz * sinV * sinU;

      // Skip eye and nose cavities on front (+z) so we can sculpt crisp high-contrast eyes & nose
      if (pz > 0.4) {
        const leftEyeDist = Math.hypot((px + 0.46) / 0.11, (py - 0.12) / 0.16);
        const rightEyeDist = Math.hypot((px - 0.46) / 0.11, (py - 0.12) / 0.16);
        const noseDist = Math.hypot(px / 0.13, (py + 0.04) / 0.09);
        if (leftEyeDist < 1.15 || rightEyeDist < 1.15 || noseDist < 1.15) continue;
      }

      const nx = (sinV * cosU) / rx;
      const ny = cosV / ry;
      const nz = (sinV * sinU) / rz;
      addPt([px, py, pz], [nx, ny, nz], BAND);
    }
  }

  // 2. Sculpted Left & Right Cat Ears
  for (const side of [-1, 1]) {
    const earBaseX = side * 0.68;
    const earBaseY = 0.78;
    const earTipX = side * 0.92;
    const earTipY = 1.36;

    for (let h = 0; h <= 36; h++) {
      const s = h / 36;
      const cx = earBaseX + s * (earTipX - earBaseX);
      const cy = earBaseY + s * (earTipY - earBaseY);
      const radius = (1.0 - Math.pow(s, 1.35)) * 0.42;
      const ringPts = Math.max(8, Math.floor(48 * (1.0 - s * 0.7)));
      for (let k = 0; k < ringPts; k++) {
        const a = (TAU * k) / ringPts;
        const px = cx + radius * Math.cos(a) * 0.95;
        const py = cy + radius * 0.25 * Math.cos(a) * (-side);
        const pz = radius * Math.sin(a) * 0.78;
        addPt([px, py, pz], [Math.cos(a) + side * 0.3, 0.45, Math.sin(a)], BAND);
      }
    }
  }

  // 3. Signature 3D Ribbon Bow on Her Left Ear (Viewer's Right: x > 0) — Tagged as GEM for blush-ivory highlight!
  const bowCx = 0.56;
  const bowCy = 0.92;
  const bowCz = 0.48;
  const tilt = -0.32;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  function addBowPt(lx, ly, lz, nx, ny, nz) {
    const rx2 = lx * cosT - ly * sinT;
    const ry2 = lx * sinT + ly * cosT;
    const nrx = nx * cosT - ny * sinT;
    const nry = nx * sinT + ny * cosT;
    addPt([bowCx + rx2, bowCy + ry2, bowCz + lz], [nrx, nry, nz], GEM);
  }

  // Bow Center Knot Sphere
  for (let i = 0; i < 36; i++) {
    const u = (TAU * i) / 36;
    for (let j = 1; j < 20; j++) {
      const v = (PI * j) / 20;
      const rKnot = 0.14;
      const lx = rKnot * Math.sin(v) * Math.cos(u);
      const ly = rKnot * Math.cos(v);
      const lz = rKnot * 0.85 * Math.sin(v) * Math.sin(u);
      addBowPt(lx, ly, lz, Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u));
    }
  }

  // Left & Right Sculpted Bow Loops
  for (const bSide of [-1, 1]) {
    for (let uIdx = 0; uIdx <= 36; uIdx++) {
      const s = uIdx / 36; // 0 at knot -> 1 at outer wing edge
      const loopX = bSide * (0.10 + s * 0.36);
      const loopHalfH = 0.08 + Math.sin(s * PI * 0.82) * 0.22;
      const loopDepth = 0.09 * Math.sin(s * PI);
      for (let vIdx = 0; vIdx < 32; vIdx++) {
        const a = (TAU * vIdx) / 32;
        const ly = loopHalfH * Math.sin(a);
        const lz = loopDepth * Math.cos(a);
        addBowPt(loopX, ly, lz, bSide * 0.35, Math.sin(a), Math.cos(a) + 0.5);
      }
    }
  }

  // 4. Nose & Eyes (High-contrast sculpted features on front face)
  for (let i = 0; i < 28; i++) {
    const u = (TAU * i) / 28;
    for (let j = 1; j < 14; j++) {
      const v = (PI * j) / 14;
      // Button Nose (GEM tag for warm blush nose highlight)
      const nx = 0.10 * Math.sin(v) * Math.cos(u);
      const ny = -0.04 + 0.07 * Math.cos(v);
      const nz = 0.77 + 0.05 * Math.sin(v) * Math.sin(u);
      addPt([nx, ny, nz], [0, 0.2, 1], GEM);
    }
  }

  // 5. Six Whiskers (3 Left, 3 Right)
  const whiskerAngles = [0.16, 0.0, -0.16];
  for (const side of [-1, 1]) {
    for (let w = 0; w < 3; w++) {
      const wa = whiskerAngles[w];
      const startX = side * 0.92;
      const startY = 0.12 + (1 - w) * 0.17;
      const startZ = 0.36;
      for (let step = 0; step <= 26; step++) {
        const s = step / 26;
        const wx = startX + side * s * 0.48;
        const wy = startY + Math.sin(wa) * s * 0.36 - s * s * 0.05;
        const wz = startZ - s * 0.08;
        for (let t = 0; t < 4; t++) {
          const phi = (TAU * t) / 4;
          addPt([wx, wy + 0.014 * Math.cos(phi), wz + 0.014 * Math.sin(phi)], [side * 0.4, 0.2, 0.9], BAND);
        }
      }
    }
  }

  return { P, N, F, ORDER };
}

function buildButterflyWings() {
  const pts = [];
  const steps = 820;
  for (let i = 0; i < steps; i++) {
    const th = (TAU * i) / steps;
    const sin2 = Math.abs(Math.sin(2 * th));
    if (sin2 < 0.14) continue;
    const r = 0.52 + 1.38 * Math.pow(sin2, 0.62);
    const wx = r * Math.cos(th) * 1.15;
    const wy = 0.42 + r * Math.sin(th) * 0.78;

    const distFromBandCenter = Math.hypot(wx, wy);
    if (distFromBandCenter < R_BAND * 0.90) continue;

    for (let k = -1; k <= 1; k++) {
      pts.push({
        x: wx + k * 0.013 * Math.cos(th),
        y: wy + k * 0.013 * Math.sin(th),
        u: i / steps,
        phase: th * 3.0 + k
      });
    }
  }
  return pts;
}

function buildAmbientDust(count = 260) {
  const dust = [];
  const chars = ['.', '·', ':', '+'];
  for (let i = 0; i < count; i++) {
    dust.push({
      x: (Math.random() - 0.5) * 4.6,
      y: (Math.random() - 0.42) * 3.4,
      speed: 0.12 + Math.random() * 0.35,
      phase: Math.random() * TAU,
      char: chars[i % chars.length]
    });
  }
  return dust;
}

const RING_DATA = buildRingGeometry();
const KITTY_DATA = buildKittyGeometry();
const WING_DATA = buildButterflyWings();
const DUST_DATA = buildAmbientDust();

let activeSculpture = 'ring'; // 'ring' | 'kitty'

// ============================================================================
// 2. AUDIO ENGINE (Full Song: Mohamed Rahma - Meen Ye3ayeshak, 5.5s Fade-In)
// ============================================================================
class LoveSongPlayer {
  constructor() {
    this.audio = document.getElementById('bg-love-song') || new Audio('assets/meen_ye3ayeshak.mp3');
    this.audio.src = 'assets/meen_ye3ayeshak.mp3';
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.isPlaying = false;
    this.targetVolume = 0.92;
    this.fadeTimer = null;
  }

  playWithFadeIn(fadeDurationSec = 5.5) {
    const domAudio = document.getElementById('bg-love-song');
    if (domAudio && this.audio !== domAudio) {
      this.audio = domAudio;
    }

    this.audio.volume = 0.02;
    this.audio.muted = false;

    if (this.fadeTimer) clearInterval(this.fadeTimer);
    const startTs = performance.now();
    this.fadeTimer = setInterval(() => {
      const elapsed = (performance.now() - startTs) / 1000;
      const progress = Math.min(1.0, elapsed / fadeDurationSec);
      const curved = progress * progress * (3 - 2 * progress);
      this.audio.volume = Math.max(0.02, Math.min(1.0, curved * this.targetVolume));
      if (progress >= 1.0) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, 50);

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.syncDot();
        })
        .catch(() => {});
    } else {
      this.isPlaying = true;
      this.syncDot();
    }
  }

  play() {
    this.playWithFadeIn(5.5);
  }

  pause() {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.audio.pause();
    this.isPlaying = false;
    this.syncDot();
  }

  toggle() {
    if (this.audio.paused) {
      this.playWithFadeIn(2.5);
    } else {
      this.pause();
    }
  }

  setDucked(ducked) {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.audio.volume = ducked ? 0.10 : this.targetVolume;
  }

  syncDot() {
    const dot = document.getElementById('audio-dot');
    if (!dot) return;
    if (this.audio.paused) {
      dot.classList.add('paused');
    } else {
      dot.classList.remove('paused');
    }
  }

  getAudioEnergy() {
    if (!this.audio || this.audio.paused) return 0.0;
    const ct = this.audio.currentTime || 0;
    const beat1 = 0.5 + 0.5 * Math.sin(ct * 4.2);
    const beat2 = 0.5 + 0.5 * Math.cos(ct * 1.9);
    return (0.18 + 0.42 * beat1 * beat2) * (this.audio.volume || 0.8);
  }
}

const loveSong = new LoveSongPlayer();

// ============================================================================
// 3. MONOCHROME 3D ASCII RENDERER (Solitaire Ring & 3D Hello Kitty)
// ============================================================================
const canvas = document.getElementById('ring-canvas');
const ctx = canvas.getContext('2d');

let animTime = 0.0;
let isRunning = true;
let lastFrameTs = performance.now();
let userYawOffset = 0.0;
let userPitchOffset = 0.0;
let pointerLightX = 0.0;
let pointerLightY = 0.0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

const RING_PHRASE = 'WILLYOUMARRYME';
const KITTY_PHRASE = 'HELLOKITTYLOVE';
const SHADE_CHARS = ' .,:;+i1tfLCG08@';

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const h = Math.max(200, rect.height - 46);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const visualPane = document.getElementById('visual-pane');
visualPane.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.memory-rail') || e.target.closest('.editorial-footer') || e.target.closest('.ring-core-overlay')) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  pointerLightX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 0.45;
  pointerLightY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 0.35;

  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  userYawOffset += dx * 0.009;
  userPitchOffset = Math.max(-0.45, Math.min(0.45, userPitchOffset + dy * 0.007));
});

window.addEventListener('pointerup', () => {
  isDragging = false;
});

function spinAngle(t) {
  if (activeSculpture === 'kitty') {
    // Gentle 3D oscillation so Hello Kitty's face, whiskers, and 3D bow stay mostly front-facing in 3D
    return Math.sin(t * 0.55) * 0.48;
  }
  return (TAU * Math.max(t - DRAW_END_T - SPIN_DELAY, 0)) / TURN;
}

function lightsAt(t) {
  const a = t * 0.2;
  const key = norm3([
    0.62 * Math.cos(a) + pointerLightX,
    0.78 - pointerLightY,
    0.65 + 0.22 * Math.sin(a)
  ]);
  const rim = norm3([-0.58, -0.32, -0.74]);
  return { key, rim };
}

function renderScene(t) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const W = rect.width;
  const H = Math.max(200, rect.height - 46);

  ctx.fillStyle = '#040405';
  ctx.fillRect(0, 0, W, H);

  const audioBoost = loveSong.getAudioEnergy();

  const cellW = 6.0;
  const cellH = 8.4;
  const cols = Math.floor(W / cellW);
  const rows = Math.floor(H / cellH);

  const baseRadiusPx = Math.min(W, H) * 0.285;
  const cx = W * 0.5;
  const cy = H * 0.565;

  let drawProg;
  if (t <= BAND_DONE_T) {
    drawProg = (t / BAND_DONE_T) * 1.0;
  } else {
    drawProg = 1.0 + ((t - BAND_DONE_T) / (DRAW_END_T - BAND_DONE_T)) * 0.70;
  }

  const baseSpin = spinAngle(t);
  const totalYaw = baseSpin + userYawOffset;
  const cosY = Math.cos(totalYaw);
  const sinY = Math.sin(totalYaw);
  const cosP = Math.cos(userPitchOffset);
  const sinP = Math.sin(userPitchOffset);

  const { key, rim } = lightsAt(t);
  const halfVec = norm3([key[0], key[1], key[2] + 1.0]);

  ctx.font = '500 8.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // A. Monochrome Starlight Dust Field
  for (let i = 0; i < DUST_DATA.length; i++) {
    const d = DUST_DATA[i];
    const twinkle = 0.5 + 0.5 * Math.sin(t * d.speed * 1.4 + d.phase);
    const distFromTop = Math.hypot(d.x, d.y - 1.15);
    const drawHalo = t < DRAW_END_T ? Math.exp(-distFromTop * 1.35) * Math.min(1, t / 4.0) : 0.32;
    const alpha = twinkle * (0.12 + 0.36 * drawHalo + 0.16 * audioBoost);

    if (alpha > 0.10) {
      const sx = cx + d.x * baseRadiusPx;
      const sy = cy - (d.y - 0.18) * baseRadiusPx;
      if (sx > 10 && sx < W - 10 && sy > 10 && sy < H - 15) {
        ctx.fillStyle = `rgba(215, 218, 226, ${Math.min(0.68, alpha).toFixed(3)})`;
        ctx.fillText(d.char, sx, sy);
      }
    }
  }

  // B. Caustic Dispersion Wings (Echoing Hello Kitty's Bow Silhouette behind the Sculpture)
  const wingFade = Math.max(0, Math.min(1, (t - 6.0) / 4.5));
  if (wingFade > 0.01) {
    const wingChars = ['.', ':', '+', '*', '·'];
    for (let i = 0; i < WING_DATA.length; i++) {
      const wp = WING_DATA[i];
      const shimmer = 0.45 + 0.55 * Math.sin(t * 1.3 - wp.u * 8.0 + wp.phase);
      const alpha = wingFade * shimmer * (0.28 + 0.22 * audioBoost);
      if (alpha > 0.08) {
        const sx = cx + wp.x * baseRadiusPx;
        const sy = cy - (wp.y - 0.18) * baseRadiusPx;
        ctx.fillStyle = `rgba(208, 204, 214, ${Math.min(0.58, alpha).toFixed(3)})`;
        ctx.fillText(wingChars[i % wingChars.length], sx, sy);
      }
    }
  }

  // C. Z-Buffer Grid for the Active 3D Sculpture (Ring or Hello Kitty)
  const gridSize = cols * rows;
  const zBuf = new Float32Array(gridSize);
  const lumBuf = new Float32Array(gridSize);
  const specBuf = new Float32Array(gridSize);
  const tagBuf = new Int8Array(gridSize);
  zBuf.fill(-9999);

  const activeData = activeSculpture === 'kitty' ? KITTY_DATA : RING_DATA;
  const { P, N, F, ORDER } = activeData;
  const totalPts = P.length;

  for (let i = 0; i < totalPts; i++) {
    const ord = ORDER[i];
    if (ord > drawProg) continue;

    const pt = P[i];
    const nm = N[i];
    const tag = F[i];

    let rx = cosY * pt[0] + sinY * pt[2];
    let ry = pt[1];
    let rz = -sinY * pt[0] + cosY * pt[2];

    if (userPitchOffset !== 0) {
      const ry2 = cosP * ry - sinP * rz;
      const rz2 = sinP * ry + cosP * rz;
      ry = ry2;
      rz = rz2;
    }

    let nx = cosY * nm[0] + sinY * nm[2];
    let ny = nm[1];
    let nz = -sinY * nm[0] + cosY * nm[2];

    const camZ = 4.2;
    const persp = camZ / Math.max(0.5, camZ - rz * 0.55);
    const sx = cx + rx * baseRadiusPx * persp;
    const sy = cy - (ry - 0.18) * baseRadiusPx * persp;

    const gx = Math.floor(sx / cellW);
    const gy = Math.floor(sy / cellH);
    if (gx < 1 || gx >= cols - 1 || gy < 1 || gy >= rows - 1) continue;

    const cellIdx = gy * cols + gx;
    if (rz > zBuf[cellIdx]) {
      zBuf[cellIdx] = rz;
      tagBuf[cellIdx] = tag;

      const diff = Math.max(0, nx * key[0] + ny * key[1] + nz * key[2]);
      const rimDot = Math.max(0, nx * rim[0] + ny * rim[1] + nz * rim[2]);
      const specDot = Math.max(0, nx * halfVec[0] + ny * halfVec[1] + nz * halfVec[2]);
      const spec = Math.pow(specDot, tag === GEM ? 14 : 9);

      const edgeDist = drawProg - ord;
      const edgeFlash = (t < DRAW_END_T + 0.5 && edgeDist >= 0 && edgeDist < 0.10)
        ? (1.0 - edgeDist / 0.10) * 0.65
        : 0.0;

      const lum = Math.min(1.0, 0.16 + 0.66 * diff + 0.32 * rimDot + 0.95 * spec + edgeFlash + audioBoost * 0.14);
      lumBuf[cellIdx] = lum;
      specBuf[cellIdx] = spec + edgeFlash;
    }
  }

  // D. Render Floor Reflection & Sculpture Cells
  const phrase = activeSculpture === 'kitty' ? KITTY_PHRASE : RING_PHRASE;
  const phraseLen = phrase.length;
  const floorY = cy + 1.28 * baseRadiusPx;

  for (let gy = 1; gy < rows - 1; gy++) {
    for (let gx = 1; gx < cols - 1; gx++) {
      const cellIdx = gy * cols + gx;
      if (zBuf[cellIdx] === -9999) continue;

      const lum = lumBuf[cellIdx];
      const spec = specBuf[cellIdx];
      const tag = tagBuf[cellIdx];

      const sx = (gx + 0.5) * cellW;
      const sy = (gy + 0.5) * cellH;

      let ch;
      if (spec > 0.64) {
        ch = ['@', '#', 'W', 'M', '$'][(gx + gy) % 5];
      } else if (lum > 0.52) {
        ch = phrase[(gx * 3 + gy * 7) % phraseLen];
      } else {
        const sIdx = Math.min(SHADE_CHARS.length - 1, Math.max(1, Math.floor(lum * SHADE_CHARS.length)));
        ch = SHADE_CHARS[sIdx];
      }

      const b = Math.floor(68 + lum * 187);
      let r = b;
      let g = b;
      let bl = Math.min(255, b + 8);

      if (activeSculpture === 'kitty' && tag === GEM) {
        // Subtle editorial blush-ivory tint on Hello Kitty's 3D Bow & button nose
        r = Math.min(255, Math.floor(b * 1.08 + 22));
        g = Math.min(255, Math.floor(b * 0.84));
        bl = Math.min(255, Math.floor(b * 0.90));
      } else if (tag === GEM) {
        r = Math.min(255, b + Math.floor(spec * 20));
        g = Math.min(255, b + Math.floor(spec * 20));
      }

      ctx.fillStyle = `rgb(${r}, ${g}, ${bl})`;
      ctx.fillText(ch, sx, sy);

      // Subtle Floor Reflection
      const distBelowCenter = sy - cy;
      if (distBelowCenter > baseRadiusPx * 0.25) {
        const reflY = floorY + (floorY - sy) * 0.34;
        if (reflY > floorY - 12 && reflY < H - 8) {
          const reflAlpha = Math.max(0.02, Math.min(0.16, lum * 0.18 * (1.0 - (reflY - floorY) / (baseRadiusPx * 0.65))));
          ctx.fillStyle = `rgba(185, 190, 202, ${reflAlpha.toFixed(3)})`;
          ctx.fillText('.', sx, reflY);
        }
      }
    }
  }

  // E. Crosshair Alignment Rays & Crown Table Vertical Light Burst (Ring Mode)
  if (activeSculpture === 'ring') {
    const crossFade = t < DRAW_END_T ? Math.min(1, t / 2.5) : Math.max(0.14, 0.38 * Math.cos(totalYaw) ** 2);
    if (crossFade > 0.05) {
      const botY = cy - (-R_BAND - 0.18) * baseRadiusPx;
      ctx.fillStyle = `rgba(175, 180, 194, ${(0.28 * crossFade).toFixed(3)})`;
      for (let k = -6; k <= 8; k++) {
        ctx.fillText('|', cx, botY + k * cellH);
        if (k % 2 === 0) {
          ctx.fillText('|', cx - cellW * 2.5, botY + k * cellH * 0.8);
          ctx.fillText('|', cx + cellW * 2.5, botY + k * cellH * 0.8);
        }
      }
      for (let k = -8; k <= 8; k++) {
        if (k !== 0) ctx.fillText('-', cx + k * cellW, botY + cellH * 2);
      }
    }

    const crownBurstFade = Math.max(0, Math.min(1, (drawProg - 1.35) / 0.35));
    if (crownBurstFade > 0.02) {
      const tableScreenY = cy - (TABLE_Y - 0.18) * baseRadiusPx;
      for (let r = -3; r <= 3; r++) {
        const rayH = (11 - Math.abs(r) * 2) + Math.floor(audioBoost * 4);
        for (let step = 1; step <= rayH; step++) {
          const rx = cx + r * cellW * (1.1 + step * 0.08);
          const ry = tableScreenY - step * cellH * 0.92;
          const rayAlpha = crownBurstFade * (1.0 - step / (rayH + 1)) * (0.52 + 0.25 * audioBoost);
          ctx.fillStyle = `rgba(232, 235, 244, ${Math.min(0.82, rayAlpha).toFixed(3)})`;
          const rayChar = r === 0 ? '|' : (r < 0 ? '\\' : '/');
          ctx.fillText(Math.abs(r) <= 1 ? '|' : rayChar, rx, ry);
        }
      }
    }
  }

  // F. Reveal Quiet Editorial Elements
  const coreOverlay = document.getElementById('ring-core-overlay');
  if (t > 2.5) {
    coreOverlay.classList.add('visible');
  } else {
    coreOverlay.classList.remove('visible');
  }

  const rail = document.getElementById('memory-rail');
  if (t > 3.5) {
    rail.classList.add('visible');
  } else {
    rail.classList.remove('visible');
  }
}

// ============================================================================
// 4. COMPLETE 16-MEMORY ARCHIVE (13 PHOTOS + 3 VIDEOS) & INTERACTIONS
// ============================================================================
const MEMORIES = [
  { type: 'image', src: 'assets/photo3.jpg',  title: 'وعدنا',     caption: 'وعدنا الذي لا ينتهي — إلى الأبد' },
  { type: 'image', src: 'assets/photo1.jpg',  title: 'البداية',   caption: 'من البداية وحتى آخر العمر' },
  { type: 'video', src: 'assets/video1.mp4',  title: 'يداكِ',     caption: 'معاً في كل لحظة' },
  { type: 'image', src: 'assets/photo4.jpg',  title: 'الأمان',    caption: 'في قربكِ كل السكينة والأمان' },
  { type: 'image', src: 'assets/photo2.jpg',  title: 'وردة لكِ',  caption: 'لكِ وحدكِ' },
  { type: 'image', src: 'assets/photo5.jpg',  title: 'الورد',     caption: 'كل تفصيل جميل يشبهكِ' },
  { type: 'video', src: 'assets/video2.mp4',  title: 'ذكرياتنا',  caption: 'ذكريات حلوة لا تُنسى أبداً' },
  { type: 'image', src: 'assets/photo6.jpg',  title: 'خطواتنا',   caption: 'كل خطوة معكِ هي حياة' },
  { type: 'image', src: 'assets/photo7.jpg',  title: 'بهجتنا',    caption: 'فرحة قلبي وأنا بجانبكِ' },
  { type: 'image', src: 'assets/photo8.jpg',  title: 'معاً',      caption: 'بجانبكِ في كل مكان' },
  { type: 'image', src: 'assets/photo9.jpg',  title: 'تفاصيلكِ',  caption: 'أحب كل تفاصيلكِ الصغيرة' },
  { type: 'image', src: 'assets/photo10.jpg', title: 'ابتسامتكِ', caption: 'ضحكتكِ تضيء أيامي' },
  { type: 'image', src: 'assets/photo11.jpg', title: 'نفس الروح', caption: 'روح واحدة في قلبين' },
  { type: 'image', src: 'assets/photo12.jpg', title: 'أوقاتنا',   caption: 'أجمل أوقاتي هي التي تجمعني بكِ' },
  { type: 'image', src: 'assets/photo13.jpg', title: 'عفويتنا',   caption: 'حتى لحظاتنا العفوية معاً لا مثيل لها' },
  { type: 'video', src: 'assets/video3.mp4',  title: 'ضحكتنا',    caption: 'ضحكنا معاً من القلب' }
];

let currentMemoryIdx = 0;

function buildArchiveDOM() {
  const railList = document.getElementById('rail-scroll-list');
  const gridBox = document.getElementById('archive-grid-container');
  if (!railList || !gridBox) return;

  railList.innerHTML = '';
  gridBox.innerHTML = '';

  MEMORIES.forEach((item, idx) => {
    const numStr = String(idx + 1).padStart(2, '0');
    const mediaTag = item.type === 'video'
      ? `<video src="${item.src}" muted loop playsinline preload="metadata"></video><span class="rail-type-tag">FILM</span>`
      : `<img src="${item.src}" alt="${numStr}" loading="lazy" />`;

    // 1. Left Rail Item
    const btn = document.createElement('button');
    btn.className = 'rail-item';
    btn.type = 'button';
    btn.setAttribute('data-index', String(idx));
    btn.innerHTML = `
      <span class="rail-num">${numStr}</span>
      <div class="rail-thumb">${mediaTag}</div>
      <span class="rail-label" dir="rtl">${item.title}</span>
    `;
    btn.addEventListener('click', () => openSpotlight(idx));
    railList.appendChild(btn);

    // 2. Contact Sheet Grid Cell
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.innerHTML = `
      <div class="grid-cell-media">${mediaTag}</div>
      <div class="grid-cell-meta">
        <span class="grid-cell-num">${numStr}</span>
        <span class="grid-cell-title" dir="rtl">${item.title}</span>
      </div>
    `;
    cell.addEventListener('click', () => {
      document.getElementById('grid-modal').classList.add('hidden');
      openSpotlight(idx);
    });
    gridBox.appendChild(cell);
  });
}

function setSculptureMode(mode) {
  activeSculpture = mode;
  userYawOffset = 0;
  userPitchOffset = 0;
  if (animTime < DRAW_END_T) {
    animTime = DRAW_END_T + 0.5;
  }

  const ringBtn = document.getElementById('mode-ring-btn');
  const kittyBtn = document.getElementById('mode-kitty-btn');
  const coreOverlay = document.getElementById('ring-core-overlay');

  if (mode === 'kitty') {
    ringBtn.classList.remove('active');
    kittyBtn.classList.add('active');
    coreOverlay.classList.add('kitty-mode');
  } else {
    kittyBtn.classList.remove('active');
    ringBtn.classList.add('active');
    coreOverlay.classList.remove('kitty-mode');
  }
}

function openSpotlight(index) {
  currentMemoryIdx = (index + MEMORIES.length) % MEMORIES.length;
  const item = MEMORIES[currentMemoryIdx];
  const modal = document.getElementById('spotlight-modal');
  const box = document.getElementById('spotlight-media-box');
  const cap = document.getElementById('spotlight-caption');
  const idxLabel = document.getElementById('viewer-index-label');

  box.innerHTML = '';
  cap.textContent = item.caption;
  if (idxLabel) {
    const numStr = String(currentMemoryIdx + 1).padStart(2, '0');
    idxLabel.textContent = `ARCHIVE // ${numStr} OF ${MEMORIES.length}`;
  }

  if (item.type === 'video') {
    loveSong.setDucked(true);
    const vid = document.createElement('video');
    vid.src = item.src;
    vid.controls = true;
    vid.autoplay = true;
    vid.loop = true;
    vid.playsInline = true;
    box.appendChild(vid);
  } else {
    loveSong.setDucked(false);
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.caption;
    box.appendChild(img);
  }

  modal.classList.remove('hidden');
}

function closeSpotlight() {
  const modal = document.getElementById('spotlight-modal');
  const box = document.getElementById('spotlight-media-box');
  box.innerHTML = '';
  modal.classList.add('hidden');
  loveSong.setDucked(false);
}

function tickFrame(now) {
  const dt = Math.min(0.1, (now - lastFrameTs) / 1000);
  lastFrameTs = now;

  if (isRunning) {
    animTime += dt;
  }

  renderScene(animTime);
  requestAnimationFrame(tickFrame);
}

window.addEventListener('DOMContentLoaded', () => {
  buildArchiveDOM();

  const SECRET_PASSCODE = 'l0vey0u@';
  const introOverlay = document.getElementById('intro-overlay');
  const introCard = document.getElementById('intro-card');
  const secretForm = document.getElementById('secret-form');
  const secretInput = document.getElementById('secret-code-input');
  const secretWrap = document.getElementById('secret-input-wrap');
  const secretError = document.getElementById('secret-error-msg');

  let isUnlocked = false;

  function unlockSurprise() {
    if (isUnlocked) return;
    isUnlocked = true;
    secretError.classList.remove('visible');
    secretWrap.classList.add('unlocked');

    loveSong.play();

    document.querySelectorAll('.rail-thumb video').forEach((v) => {
      v.muted = true;
      v.play().catch(() => {});
    });

    setTimeout(() => {
      introOverlay.classList.add('hidden');
      animTime = 0.0;
      isRunning = true;
    }, 280);
  }

  if (secretInput) {
    secretInput.addEventListener('input', () => {
      secretError.classList.remove('visible');
      if (secretInput.value.trim().toLowerCase() === SECRET_PASSCODE) {
        unlockSurprise();
      }
    });
  }

  if (secretForm) {
    secretForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = secretInput ? secretInput.value.trim().toLowerCase() : '';
      if (val === SECRET_PASSCODE) {
        unlockSurprise();
      } else {
        secretError.classList.add('visible');
        introCard.classList.remove('shake-error');
        void introCard.offsetWidth;
        introCard.classList.add('shake-error');
        if (secretInput) secretInput.focus();
      }
    });
  }

  window.addEventListener('pointerdown', () => {
    if (isUnlocked && loveSong.audio && loveSong.audio.paused) {
      loveSong.audio.play().catch(() => {});
    }
  }, { once: true });

  // Sculpture Mode Switchers (01 / SOLITAIRE vs 02 / HELLO KITTY)
  document.getElementById('mode-ring-btn').addEventListener('click', () => setSculptureMode('ring'));
  document.getElementById('mode-kitty-btn').addEventListener('click', () => setSculptureMode('kitty'));
  document.getElementById('ring-core-overlay').addEventListener('click', () => {
    setSculptureMode(activeSculpture === 'ring' ? 'kitty' : 'ring');
  });

  // Complete Archive Grid Sheet Modal (03 / ARCHIVE 16)
  const gridModal = document.getElementById('grid-modal');
  const openGrid = () => {
    gridModal.classList.remove('hidden');
    gridModal.querySelectorAll('video').forEach((v) => {
      v.muted = true;
      v.play().catch(() => {});
    });
  };
  document.getElementById('open-grid-btn').addEventListener('click', openGrid);
  document.getElementById('footer-grid-btn').addEventListener('click', openGrid);
  document.getElementById('close-grid-btn').addEventListener('click', () => {
    gridModal.classList.add('hidden');
  });
  gridModal.addEventListener('click', (e) => {
    if (e.target.id === 'grid-modal') gridModal.classList.add('hidden');
  });

  // Footer Audio Mute / Play Toggle
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      loveSong.toggle();
    });
  }

  // Quiet Poetic Lines in Footer
  const POETIC_LINES = [
    'وجودك في حياتي هو كل ما أملك',
    'كل لحظة معكِ هي عمر جديد',
    'بحبك اليوم، وغداً، وإلى الأبد'
  ];
  let poeticIdx = 0;
  setInterval(() => {
    const msgEl = document.getElementById('dedication-message');
    if (!msgEl || !isUnlocked) return;
    poeticIdx = (poeticIdx + 1) % POETIC_LINES.length;
    msgEl.style.opacity = '0';
    setTimeout(() => {
      msgEl.textContent = POETIC_LINES[poeticIdx];
      msgEl.style.opacity = '1';
    }, 600);
  }, 9000);

  // Editorial Note Drawer / Modal
  const LOVE_LETTER_TEXT =
    'منذ اللحظة الأولى التي دخلتِ فيها حياتي تغير كل شيء للأجمل. ' +
    'كل ذكرى تجمعنا هي أثر لا يُمحى، وكل تفصيل صغير معكِ يعني لي العالم بأكمله. ' +
    'أحبكِ اليوم، وغداً، ولآخر العمر.';
  let typewriterTimer = null;

  const letterModal = document.getElementById('letter-modal');
  const openLetterBtn = document.getElementById('open-letter-btn');
  const closeLetterBtn = document.getElementById('close-letter-btn');
  const typewriterEl = document.getElementById('typewriter-text');

  if (openLetterBtn && letterModal) {
    openLetterBtn.addEventListener('click', () => {
      letterModal.classList.remove('hidden');
      typewriterEl.textContent = '';
      if (typewriterTimer) clearInterval(typewriterTimer);
      let charIdx = 0;
      typewriterTimer = setInterval(() => {
        if (charIdx < LOVE_LETTER_TEXT.length) {
          typewriterEl.textContent += LOVE_LETTER_TEXT[charIdx++];
        } else {
          clearInterval(typewriterTimer);
        }
      }, 32);
    });
  }

  if (closeLetterBtn && letterModal) {
    closeLetterBtn.addEventListener('click', () => {
      if (typewriterTimer) clearInterval(typewriterTimer);
      letterModal.classList.add('hidden');
    });
    letterModal.addEventListener('click', (e) => {
      if (e.target.id === 'letter-modal') {
        if (typewriterTimer) clearInterval(typewriterTimer);
        letterModal.classList.add('hidden');
      }
    });
  }

  document.getElementById('close-spotlight-btn').addEventListener('click', closeSpotlight);
  document.getElementById('spotlight-modal').addEventListener('click', (e) => {
    if (e.target.id === 'spotlight-modal') closeSpotlight();
  });
  document.getElementById('prev-mem-btn').addEventListener('click', () => {
    openSpotlight(currentMemoryIdx - 1);
  });
  document.getElementById('next-mem-btn').addEventListener('click', () => {
    openSpotlight(currentMemoryIdx + 1);
  });

  requestAnimationFrame(tickFrame);
});
