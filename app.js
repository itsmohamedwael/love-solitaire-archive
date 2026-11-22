/**
 * app.js — 5-Scene Interactive "Hello Kitty × Spider-Man" Love Experience
 * - Scene 1: 3D Open-Center Tubular Heart (100% hollow center around "بحبك", zero text overlap!)
 *            + Vortex 3D Particle Morphing into Hello Kitty, Spider-Man & Blooming Rose
 * - Scene 2: Couple Duality (Hello Kitty × Spider-Man) + Live Elastic Web String Physics
 * - Scene 3: All 16 Memories Bento Showcase (13 Photos + 3 Live Videos with Audio)
 * - Scene 4: 8 Interactive 3D Flip Cards in Authentic Egyptian Arabic
 * - Scene 5: Grand Finale Live Typewriter Love Letter Page
 */

const PI = Math.PI;
const TAU = 2.0 * PI;

const TAG_IVORY = 0;
const TAG_PINK = 1;
const TAG_CRIMSON = 2;
const TAG_GOLD = 3;

const DRAW_END_T = 6.5;
const MORPH_COUNT = 12000;

function norm3(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1.0;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function normalizePointCloud(raw) {
  const srcLen = raw.P.length;
  const P = new Array(MORPH_COUNT);
  const N = new Array(MORPH_COUNT);
  const F = new Int8Array(MORPH_COUNT);
  const ORDER = new Float32Array(MORPH_COUNT);

  for (let i = 0; i < MORPH_COUNT; i++) {
    const idx = Math.floor((i * srcLen) / MORPH_COUNT) % srcLen;
    P[i] = raw.P[idx];
    N[i] = raw.N[idx];
    F[i] = raw.F[idx];
    ORDER[i] = raw.ORDER[idx];
  }
  return { P, N, F, ORDER };
}

// ============================================================================
// 1A. 3D OPEN-CENTER TUBULAR HEART SCULPTURE (100% Pure Black Center Around "بحبك"!)
// ============================================================================
function buildHeartGeometry() {
  const P = [];
  const N = [];
  const F = [];
  const ORDER = [];

  function heartCenterline(u) {
    const sinU = Math.sin(u);
    const x = 1.18 * (sinU * sinU * sinU);
    const y = 0.22 + (0.94 * Math.cos(u) - 0.36 * Math.cos(2 * u) - 0.15 * Math.cos(3 * u) - 0.06 * Math.cos(4 * u));
    return [x, y];
  }

  const uSteps = 260;
  const vSteps = 44;
  const rTube = 0.165;

  for (let i = 0; i < uSteps; i++) {
    const u = (TAU * i) / uSteps;
    const [cx, cy] = heartCenterline(u);

    // Numerical tangent along the heart curve in XY plane
    const eps = 0.005;
    const [nx1, ny1] = heartCenterline(u + eps);
    const [nx0, ny0] = heartCenterline(u - eps);
    const tx = nx1 - nx0;
    const ty = ny1 - ny0;
    const tLen = Math.hypot(tx, ty) || 1.0;

    // Outward in-plane normal perpendicular to the heart curve
    const inPlaneNx = -ty / tLen;
    const inPlaneNy = tx / tLen;

    // Draw order: 0.0 at bottom tip (u = PI) -> 1.65 at top cleft (u = 0 or TAU)
    const distFromBottom = Math.abs(u - PI) / PI; // 0 at bottom tip, 1 at top cleft
    const ord = (1.0 - distFromBottom) * 1.65;

    // Taper tube slightly at the sharp bottom tip & top cleft for sculptural elegance
    const taper = 0.72 + 0.28 * Math.sin(distFromBottom * PI);
    const rt = rTube * taper;

    for (let j = 0; j < vSteps; j++) {
      const v = (TAU * j) / vSteps;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);

      const px = cx + rt * cosV * inPlaneNx;
      const py = cy + rt * cosV * inPlaneNy;
      const pz = rt * sinV * 1.28;

      const normVec = norm3([cosV * inPlaneNx, cosV * inPlaneNy, sinV]);

      // Left arch (px < 0): Spider-Man Crimson with subtle ivory web rings;
      // Right arch (px >= 0): Hello Kitty Blush Pink & Ivory!
      let tag;
      if (px < -0.02) {
        tag = (i % 12 === 0 || j % 11 === 0) ? TAG_IVORY : TAG_CRIMSON;
      } else {
        tag = (i + j) % 6 === 0 ? TAG_IVORY : TAG_PINK;
      }

      P.push([px, py, pz]);
      N.push(normVec);
      F.push(tag);
      ORDER.push(ord);
    }
  }

  return normalizePointCloud({ P, N, F, ORDER });
}

// ============================================================================
// 1B. 3D HELLO KITTY SCULPTURE
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
    const ord = Math.max(0, Math.min(1.7, ((pt[1] + 0.85) / 2.2) * 1.7));
    ORDER.push(ord);
  }

  const rx = 1.12;
  const ry = 0.86;
  const rz = 0.78;
  const uSteps = 140;
  const vSteps = 72;
  for (let i = 0; i < uSteps; i++) {
    const u = (TAU * i) / uSteps;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    for (let j = 1; j < vSteps; j++) {
      const v = (PI * j) / vSteps;
      const sinV = Math.sin(v);
      const cosV = Math.cos(v);

      const cheekWiden = 1.0 + 0.08 * Math.max(0, -cosV);
      const px = rx * cheekWiden * sinV * cosU;
      const py = 0.22 + ry * cosV;
      const pz = rz * sinV * sinU;

      if (pz > 0.4) {
        const leftEyeDist = Math.hypot((px + 0.46) / 0.11, (py - 0.12) / 0.16);
        const rightEyeDist = Math.hypot((px - 0.46) / 0.11, (py - 0.12) / 0.16);
        const noseDist = Math.hypot(px / 0.13, (py + 0.04) / 0.09);
        if (leftEyeDist < 1.15 || rightEyeDist < 1.15 || noseDist < 1.15) continue;
      }

      addPt([px, py, pz], [(sinV * cosU) / rx, cosV / ry, (sinV * sinU) / rz], TAG_IVORY);
    }
  }

  for (const side of [-1, 1]) {
    const earBaseX = side * 0.68;
    const earBaseY = 0.78;
    const earTipX = side * 0.92;
    const earTipY = 1.36;

    for (let h = 0; h <= 30; h++) {
      const s = h / 30;
      const cx = earBaseX + s * (earTipX - earBaseX);
      const cy = earBaseY + s * (earTipY - earBaseY);
      const radius = (1.0 - Math.pow(s, 1.35)) * 0.42;
      const ringPts = Math.max(8, Math.floor(40 * (1.0 - s * 0.7)));
      for (let k = 0; k < ringPts; k++) {
        const a = (TAU * k) / ringPts;
        const px = cx + radius * Math.cos(a) * 0.95;
        const py = cy + radius * 0.25 * Math.cos(a) * (-side);
        const pz = radius * Math.sin(a) * 0.78;
        addPt([px, py, pz], [Math.cos(a) + side * 0.3, 0.45, Math.sin(a)], TAG_IVORY);
      }
    }
  }

  const bowCx = 0.56;
  const bowCy = 0.92;
  const bowCz = 0.48;
  const tilt = -0.32;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  function addBowPt(lx, ly, lz, nx, ny, nz, tag = TAG_PINK) {
    const rx2 = lx * cosT - ly * sinT;
    const ry2 = lx * sinT + ly * cosT;
    addPt([bowCx + rx2, bowCy + ry2, bowCz + lz], [nx, ny, nz], tag);
  }

  for (let i = 0; i < 30; i++) {
    const u = (TAU * i) / 30;
    for (let j = 1; j < 16; j++) {
      const v = (PI * j) / 16;
      const rKnot = 0.14;
      addBowPt(
        rKnot * Math.sin(v) * Math.cos(u),
        rKnot * Math.cos(v),
        rKnot * 0.85 * Math.sin(v) * Math.sin(u),
        Math.sin(v) * Math.cos(u),
        Math.cos(v),
        Math.sin(v) * Math.sin(u),
        TAG_CRIMSON
      );
    }
  }

  for (const bSide of [-1, 1]) {
    for (let uIdx = 0; uIdx <= 30; uIdx++) {
      const s = uIdx / 30;
      const loopX = bSide * (0.10 + s * 0.36);
      const loopHalfH = 0.08 + Math.sin(s * PI * 0.82) * 0.22;
      const loopDepth = 0.09 * Math.sin(s * PI);
      for (let vIdx = 0; vIdx < 26; vIdx++) {
        const a = (TAU * vIdx) / 26;
        addBowPt(loopX, loopHalfH * Math.sin(a), loopDepth * Math.cos(a), bSide * 0.35, Math.sin(a), Math.cos(a) + 0.5, TAG_PINK);
      }
    }
  }

  for (let i = 0; i < 24; i++) {
    const u = (TAU * i) / 24;
    for (let j = 1; j < 12; j++) {
      const v = (PI * j) / 12;
      addPt([0.10 * Math.sin(v) * Math.cos(u), -0.04 + 0.07 * Math.cos(v), 0.77 + 0.05 * Math.sin(v) * Math.sin(u)], [0, 0.2, 1], TAG_GOLD);
    }
  }

  const whiskerAngles = [0.16, 0.0, -0.16];
  for (const side of [-1, 1]) {
    for (let w = 0; w < 3; w++) {
      const wa = whiskerAngles[w];
      const startX = side * 0.92;
      const startY = 0.12 + (1 - w) * 0.17;
      const startZ = 0.36;
      for (let step = 0; step <= 22; step++) {
        const s = step / 22;
        const wx = startX + side * s * 0.48;
        const wy = startY + Math.sin(wa) * s * 0.36 - s * s * 0.05;
        const wz = startZ - s * 0.08;
        for (let t = 0; t < 4; t++) {
          const phi = (TAU * t) / 4;
          addPt([wx, wy + 0.014 * Math.cos(phi), wz + 0.014 * Math.sin(phi)], [side * 0.4, 0.2, 0.9], TAG_IVORY);
        }
      }
    }
  }

  return normalizePointCloud({ P, N, F, ORDER });
}

// ============================================================================
// 1C. 3D SPIDER-MAN MASK SCULPTURE
// ============================================================================
function buildSpideyGeometry() {
  const P = [];
  const N = [];
  const F = [];
  const ORDER = [];

  function addPt(pt, n, tag) {
    const nn = norm3(n);
    P.push(pt);
    N.push(nn);
    F.push(tag);
    const ord = Math.max(0, Math.min(1.7, ((pt[1] + 1.05) / 2.3) * 1.7));
    ORDER.push(ord);
  }

  const uSteps = 155;
  const vSteps = 82;
  for (let i = 0; i < uSteps; i++) {
    const u = (TAU * i) / uSteps;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);

    for (let j = 1; j < vSteps; j++) {
      const v = (PI * j) / vSteps;
      const sinV = Math.sin(v);
      const cosV = Math.cos(v);

      const jawTaper = cosV < 0 ? 1.0 - 0.28 * Math.pow(-cosV, 1.4) : 1.0;
      const px = 0.88 * jawTaper * sinV * cosU;
      const py = 0.18 + 1.08 * cosV;
      const pz = 0.86 * jawTaper * sinV * sinU;

      if (pz > 0.35) {
        const ax = Math.abs(px);
        const eyeCenterY = 0.22 + (ax - 0.34) * 0.45;
        const dy = py - eyeCenterY;
        const inEyeLens = ax > 0.14 && ax < 0.62 && dy > -0.16 * (1 - Math.abs(ax - 0.38) * 1.8) && dy < 0.18 * (1 - Math.abs(ax - 0.38) * 1.6);

        if (inEyeLens) {
          const inInnerWhite = ax > 0.18 && ax < 0.57 && dy > -0.11 && dy < 0.13;
          if (!inInnerWhite) continue;
          addPt([px * 1.03, py, pz * 1.04], [px, py - 0.18, pz + 0.5], TAG_IVORY);
          continue;
        }
      }

      const isWebMeridian = (i % 10 === 0);
      const isWebRing = (j % 8 === 0);
      const tag = (isWebMeridian || isWebRing) ? TAG_PINK : TAG_CRIMSON;

      addPt([px, py, pz], [px, py - 0.18, pz], tag);
    }
  }

  return normalizePointCloud({ P, N, F, ORDER });
}

// ============================================================================
// 1D. 3D BLOOMING ROSE SCULPTURE
// ============================================================================
function buildRoseGeometry() {
  const P = [];
  const N = [];
  const F = [];
  const ORDER = [];

  function addPt(pt, n, tag) {
    const nn = norm3(n);
    P.push(pt);
    N.push(nn);
    F.push(tag);
    const ord = Math.max(0, Math.min(1.7, ((pt[1] + 1.1) / 2.3) * 1.7));
    ORDER.push(ord);
  }

  const numPetals = 22;
  const goldenAngle = PI * (3 - Math.sqrt(5));

  for (let p = 0; p < numPetals; p++) {
    const layer = p / numPetals;
    const baseAngle = p * goldenAngle;
    const petalRadius = 0.22 + layer * 0.78;
    const petalHeight = 0.65 - layer * 0.38;
    const flare = 0.25 + layer * 0.85;
    const tag = p % 3 === 0 ? TAG_PINK : TAG_CRIMSON;

    for (let uIdx = 0; uIdx <= 26; uIdx++) {
      const u = (uIdx / 26 - 0.5) * 1.35;
      for (let vIdx = 0; vIdx <= 22; vIdx++) {
        const v = vIdx / 22;
        const ang = baseAngle + u * (0.55 + 0.5 * v);
        const curl = Math.pow(v, 2.2) * flare * 0.38;
        const r = petalRadius * (0.35 + 0.65 * Math.sin(v * PI * 0.75)) + curl;
        const y = -0.05 + v * petalHeight * (1.0 - 0.28 * u * u) - curl * 0.35;

        const px = r * Math.cos(ang);
        const pz = r * Math.sin(ang);
        addPt([px, y + 0.32, pz], [Math.cos(ang), 0.45, Math.sin(ang)], tag);
      }
    }
  }

  for (let s = 0; s <= 65; s++) {
    const t = s / 65;
    const y = 0.22 - t * 1.25;
    const stemCurveX = 0.05 * Math.sin(t * PI);
    for (let k = 0; k < 10; k++) {
      const a = (TAU * k) / 10;
      addPt([stemCurveX + 0.04 * Math.cos(a), y, 0.04 * Math.sin(a)], [Math.cos(a), 0, Math.sin(a)], TAG_IVORY);
    }
  }

  return normalizePointCloud({ P, N, F, ORDER });
}

function buildButterflyWings() {
  const pts = [];
  const steps = 820;
  for (let i = 0; i < steps; i++) {
    const th = (TAU * i) / steps;
    const sin2 = Math.abs(Math.sin(2 * th));
    if (sin2 < 0.14) continue;
    const r = 0.56 + 1.38 * Math.pow(sin2, 0.62);
    const wx = r * Math.cos(th) * 1.15;
    const wy = 0.34 + r * Math.sin(th) * 0.76;

    const distFromCenter = Math.hypot(wx, wy - 0.2);
    if (distFromCenter < 0.98) continue;

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

function buildAmbientDust(count = 240) {
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

const SCULPTURES = {
  heart:  buildHeartGeometry(),
  kitty:  buildKittyGeometry(),
  spidey: buildSpideyGeometry(),
  rose:   buildRoseGeometry()
};
const WING_DATA = buildButterflyWings();
const DUST_DATA = buildAmbientDust();

let fromSculpture = 'heart';
let activeSculpture = 'heart';
let morphProgress = 1.0;

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
    const beat1 = 0.5 + 0.5 * Math.sin(ct * 4.4);
    const beat2 = 0.5 + 0.5 * Math.cos(ct * 2.0);
    return (0.20 + 0.45 * beat1 * beat2) * (this.audio.volume || 0.8);
  }
}

const loveSong = new LoveSongPlayer();

// ============================================================================
// 3. 3D VORTEX-MORPHING RENDERER + SILK SPIDER-WEB CURSOR TRAIL
// ============================================================================
const canvas = document.getElementById('ring-canvas');
const ctx = canvas.getContext('2d');

let animTime = 0.0;
let isRunning = true;
let lastFrameTs = performance.now();
let userYawOffset = 0.0;
let userPitchOffset = 0.0;
let smoothLightX = 0.0;
let smoothLightY = 0.0;
let targetLightX = 0.0;
let targetLightY = 0.0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

const WEB_TRAIL = [];

const PHRASE_MAP = {
  heart:  'HELLOKITTYSPIDERMANLOVE',
  kitty:  'HELLOKITTYFOREVERLOVE',
  spidey: 'SPIDERMANHELLOKITTY',
  rose:   'ILOVEYOUFOREVERROSE'
};
const SHADE_CHARS = ' .,:;+i1tfLCG08@';

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const visualPane = document.getElementById('visual-pane');
visualPane.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.scene1-bottom-hud')) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

visualPane.addEventListener('pointermove', (e) => {
  const rect = visualPane.getBoundingClientRect();
  const lx = e.clientX - rect.left;
  const ly = e.clientY - rect.top;

  targetLightX = (lx / Math.max(1, rect.width) - 0.5) * 0.52;
  targetLightY = (ly / Math.max(1, rect.height) - 0.5) * 0.42;

  WEB_TRAIL.push({ x: lx, y: ly, life: 1.0 });
  if (WEB_TRAIL.length > 26) WEB_TRAIL.shift();

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
  if (activeSculpture === 'kitty' || activeSculpture === 'spidey') {
    return Math.sin(t * 0.6) * 0.52;
  }
  return (TAU * Math.max(t - DRAW_END_T - 0.5, 0)) / 30.0;
}

function lightsAt(t) {
  smoothLightX += (targetLightX - smoothLightX) * 0.08;
  smoothLightY += (targetLightY - smoothLightY) * 0.08;
  const a = t * 0.25;
  const key = norm3([
    0.62 * Math.cos(a) + smoothLightX,
    0.78 - smoothLightY,
    0.65 + 0.22 * Math.sin(a)
  ]);
  const rim = norm3([-0.58, -0.32, -0.74]);
  return { key, rim };
}

function renderScene(t, dt) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const W = rect.width;
  const H = rect.height;
  if (W <= 0 || H <= 0) return;

  ctx.fillStyle = '#050408';
  ctx.fillRect(0, 0, W, H);

  const audioBoost = loveSong.getAudioEnergy();

  if (morphProgress < 1.0) {
    morphProgress = Math.min(1.0, morphProgress + dt * 0.72);
  }
  const morphEase = 1.0 - Math.pow(1.0 - morphProgress, 3);
  const vortexTwist = Math.sin(morphProgress * PI) * 1.55;

  const cellW = 5.8;
  const cellH = 8.2;
  const cols = Math.floor(W / cellW);
  const rows = Math.floor(H / cellH);

  const beatScale = activeSculpture === 'heart'
    ? 1.0 + 0.025 * Math.sin(t * 3.2) + audioBoost * 0.03
    : 1.0;

  const baseRadiusPx = Math.min(W, H) * 0.235 * beatScale;
  const cx = W * 0.5;
  const cy = H * 0.44;

  const drawProg = Math.min(1.75, (t / DRAW_END_T) * 1.70);

  const baseSpin = spinAngle(t);
  const totalYaw = baseSpin + userYawOffset;
  const cosY = Math.cos(totalYaw);
  const sinY = Math.sin(totalYaw);
  const cosP = Math.cos(userPitchOffset);
  const sinP = Math.sin(userPitchOffset);

  const { key, rim } = lightsAt(t);
  const halfVec = norm3([key[0], key[1], key[2] + 1.0]);

  ctx.font = '500 8.2px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // A. Starlight Dust Field
  for (let i = 0; i < DUST_DATA.length; i++) {
    const d = DUST_DATA[i];
    const twinkle = 0.5 + 0.5 * Math.sin(t * d.speed * 1.5 + d.phase);
    const alpha = twinkle * (0.16 + 0.20 * audioBoost);

    if (alpha > 0.10) {
      const sx = cx + d.x * baseRadiusPx;
      const sy = cy - (d.y - 0.18) * baseRadiusPx;
      if (sx > 10 && sx < W - 10 && sy > 10 && sy < H - 80) {
        ctx.fillStyle = i % 2 === 0
          ? `rgba(244, 114, 182, ${Math.min(0.62, alpha).toFixed(3)})`
          : `rgba(225, 29, 72, ${Math.min(0.62, alpha).toFixed(3)})`;
        ctx.fillText(d.char, sx, sy);
      }
    }
  }

  // B. Bow / Butterfly Caustic Wings Behind the 3D Sculpture
  const wingFade = Math.max(0, Math.min(1, (t - 2.2) / 3.2));
  if (wingFade > 0.01) {
    const wingChars = ['.', ':', '+', '*', '·'];
    for (let i = 0; i < WING_DATA.length; i++) {
      const wp = WING_DATA[i];
      const shimmer = 0.45 + 0.55 * Math.sin(t * 1.5 - wp.u * 8.0 + wp.phase);
      const alpha = wingFade * shimmer * (0.28 + 0.22 * audioBoost);
      if (alpha > 0.08) {
        const sx = cx + wp.x * baseRadiusPx;
        const sy = cy - (wp.y - 0.18) * baseRadiusPx;
        if (sy < H - 80) {
          ctx.fillStyle = wp.x < 0
            ? `rgba(235, 110, 140, ${Math.min(0.58, alpha).toFixed(3)})`
            : `rgba(248, 175, 210, ${Math.min(0.58, alpha).toFixed(3)})`;
          ctx.fillText(wingChars[i % wingChars.length], sx, sy);
        }
      }
    }
  }

  // C. Z-Buffer Grid with 3D Vortex Morphing
  const gridSize = cols * rows;
  const zBuf = new Float32Array(gridSize);
  const lumBuf = new Float32Array(gridSize);
  const specBuf = new Float32Array(gridSize);
  const tagBuf = new Int8Array(gridSize);
  zBuf.fill(-9999);

  const srcData = SCULPTURES[fromSculpture] || SCULPTURES.heart;
  const dstData = SCULPTURES[activeSculpture] || SCULPTURES.heart;
  const isMorphing = morphProgress < 1.0 && fromSculpture !== activeSculpture;

  for (let i = 0; i < MORPH_COUNT; i++) {
    const ord = dstData.ORDER[i];
    if (ord > drawProg) continue;

    let px, py, pz, nx, ny, nz, tag;
    if (!isMorphing) {
      const pt = dstData.P[i];
      const nm = dstData.N[i];
      px = pt[0]; py = pt[1]; pz = pt[2];
      nx = nm[0]; ny = nm[1]; nz = nm[2];
      tag = dstData.F[i];
    } else {
      const pA = srcData.P[i];
      const pB = dstData.P[i];
      const nA = srcData.N[i];
      const nB = dstData.N[i];

      const lx = pA[0] + (pB[0] - pA[0]) * morphEase;
      const ly = pA[1] + (pB[1] - pA[1]) * morphEase;
      const lz = pA[2] + (pB[2] - pA[2]) * morphEase;

      const localTwist = vortexTwist * (0.5 + 0.5 * Math.sin(ly * 2.2));
      const ct = Math.cos(localTwist);
      const st = Math.sin(localTwist);
      px = ct * lx + st * lz;
      py = ly;
      pz = -st * lx + ct * lz;

      nx = nA[0] + (nB[0] - nA[0]) * morphEase;
      ny = nA[1] + (nB[1] - nA[1]) * morphEase;
      nz = nA[2] + (nB[2] - nA[2]) * morphEase;
      tag = morphEase < 0.5 ? srcData.F[i] : dstData.F[i];
    }

    let rx = cosY * px + sinY * pz;
    let ry = py;
    let rz = -sinY * px + cosY * pz;

    if (userPitchOffset !== 0) {
      const ry2 = cosP * ry - sinP * rz;
      const rz2 = sinP * ry + cosP * rz;
      ry = ry2;
      rz = rz2;
    }

    const rnx = cosY * nx + sinY * nz;
    const rny = ny;
    const rnz = -sinY * nx + cosY * nz;

    const camZ = 4.2;
    const persp = camZ / Math.max(0.5, camZ - rz * 0.55);
    const sx = cx + rx * baseRadiusPx * persp;
    const sy = cy - (ry - 0.18) * baseRadiusPx * persp;

    const gx = Math.floor(sx / cellW);
    const gy = Math.floor(sy / cellH);
    if (gx < 1 || gx >= cols - 1 || gy < 1 || gy >= rows - 10) continue;

    const cellIdx = gy * cols + gx;
    if (rz > zBuf[cellIdx]) {
      zBuf[cellIdx] = rz;
      tagBuf[cellIdx] = tag;

      const diff = Math.max(0, rnx * key[0] + rny * key[1] + rnz * key[2]);
      const rimDot = Math.max(0, rnx * rim[0] + rny * rim[1] + rnz * rim[2]);
      const specDot = Math.max(0, rnx * halfVec[0] + rny * halfVec[1] + rnz * halfVec[2]);
      const spec = Math.pow(specDot, 12);

      const edgeDist = drawProg - ord;
      const edgeFlash = (t < DRAW_END_T + 0.5 && edgeDist >= 0 && edgeDist < 0.10)
        ? (1.0 - edgeDist / 0.10) * 0.65
        : 0.0;

      const morphFlash = isMorphing ? Math.sin(morphProgress * PI) * 0.25 : 0.0;

      const lum = Math.min(1.0, 0.16 + 0.66 * diff + 0.32 * rimDot + 0.92 * spec + edgeFlash + morphFlash + audioBoost * 0.15);
      lumBuf[cellIdx] = lum;
      specBuf[cellIdx] = spec + edgeFlash + morphFlash;
    }
  }

  // D. Render High-Contrast 3D ASCII Cells
  const phrase = PHRASE_MAP[activeSculpture] || PHRASE_MAP.heart;
  const phraseLen = phrase.length;
  const floorY = cy + 1.22 * baseRadiusPx;

  for (let gy = 1; gy < rows - 10; gy++) {
    for (let gx = 1; gx < cols - 1; gx++) {
      const cellIdx = gy * cols + gx;
      if (zBuf[cellIdx] === -9999) continue;

      const lum = lumBuf[cellIdx];
      const spec = specBuf[cellIdx];
      const tag = tagBuf[cellIdx];

      const sx = (gx + 0.5) * cellW;
      const sy = (gy + 0.5) * cellH;

      let ch;
      if (spec > 0.65) {
        ch = ['@', '#', 'W', 'M', '$'][(gx + gy) % 5];
      } else if (lum > 0.56) {
        ch = phrase[(gx * 3 + gy * 7) % phraseLen];
      } else {
        const sIdx = Math.min(SHADE_CHARS.length - 1, Math.max(1, Math.floor(lum * SHADE_CHARS.length)));
        ch = SHADE_CHARS[sIdx];
      }

      const b = Math.floor(72 + lum * 183);
      let r = b;
      let g = b;
      let bl = Math.min(255, b + 10);

      if (tag === TAG_PINK) {
        r = Math.min(255, Math.floor(b * 1.08 + 26));
        g = Math.min(255, Math.floor(b * 0.72));
        bl = Math.min(255, Math.floor(b * 0.92 + 18));
      } else if (tag === TAG_CRIMSON) {
        r = Math.min(255, Math.floor(b * 1.12 + 34));
        g = Math.min(255, Math.floor(b * 0.36));
        bl = Math.min(255, Math.floor(b * 0.52));
      } else if (tag === TAG_GOLD) {
        r = Math.min(255, Math.floor(b * 1.1 + 30));
        g = Math.min(255, Math.floor(b * 0.92 + 10));
        bl = Math.min(255, Math.floor(b * 0.45));
      }

      ctx.fillStyle = `rgb(${r}, ${g}, ${bl})`;
      ctx.fillText(ch, sx, sy);

      const distBelowCenter = sy - cy;
      if (distBelowCenter > baseRadiusPx * 0.25) {
        const reflY = floorY + (floorY - sy) * 0.30;
        if (reflY > floorY - 10 && reflY < H - 82) {
          const reflAlpha = Math.max(0.02, Math.min(0.14, lum * 0.15 * (1.0 - (reflY - floorY) / (baseRadiusPx * 0.55))));
          ctx.fillStyle = `rgba(225, 180, 205, ${reflAlpha.toFixed(3)})`;
          ctx.fillText('.', sx, reflY);
        }
      }
    }
  }

  // E. Silk Spider-Web Cursor Trail
  if (WEB_TRAIL.length > 1) {
    ctx.beginPath();
    for (let i = 0; i < WEB_TRAIL.length; i++) {
      const pt = WEB_TRAIL[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
      pt.life -= 0.035;
    }
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.32)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    for (let i = WEB_TRAIL.length - 1; i >= 0; i--) {
      if (WEB_TRAIL[i].life <= 0) WEB_TRAIL.splice(i, 1);
    }
  }

  const coreOverlay = document.getElementById('ring-core-overlay');
  if (t > 1.8) {
    coreOverlay.classList.add('visible');
  }
}

// ============================================================================
// 4. ELASTIC SPIDER-WEB & PINK RIBBON PHYSICS STRING (Scene 2)
// ============================================================================
class ElasticWebString {
  constructor() {
    this.canvas = document.getElementById('elastic-web-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.midX = 0.5;
    this.midY = 0.5;
    this.vy = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      const ny = (e.clientY - r.top) / Math.max(1, r.height);
      const nx = (e.clientX - r.left) / Math.max(1, r.width);
      this.vy += (ny - this.midY) * 0.38;
      this.midX = 0.25 + nx * 0.5;
    });

    this.canvas.addEventListener('click', () => this.pluck(32));
  }

  resize() {
    if (!this.canvas) return;
    const r = this.canvas.parentElement.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(r.width * dpr);
    this.canvas.height = Math.floor(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  pluck(strength = 28) {
    if (!this.canvas) return;
    const h = this.canvas.parentElement.getBoundingClientRect().height || 60;
    this.vy = strength / h;
  }

  step(t) {
    if (!this.canvas) return;
    const r = this.canvas.parentElement.getBoundingClientRect();
    const W = r.width;
    const H = r.height;
    if (W <= 0 || H <= 0) return;

    const force = (0.5 - this.midY) * 0.16;
    this.vy = (this.vy + force) * 0.88;
    this.midY += this.vy;
    this.midX += (0.5 - this.midX) * 0.08;

    this.ctx.clearRect(0, 0, W, H);

    const x1 = W * 0.12;
    const y1 = H * 0.5;
    const x2 = W * 0.88;
    const y2 = H * 0.5;
    const cx = W * this.midX;
    const cy = H * this.midY;

    const grad = this.ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, '#e11d48');
    grad.addColorStop(0.5, '#fdf2f8');
    grad.addColorStop(1, '#f472b6');

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.quadraticCurveTo(cx, cy, x2, y2);
    this.ctx.strokeStyle = grad;
    this.ctx.lineWidth = 2.0;
    this.ctx.stroke();

    const u = (t * 0.38) % 1.0;
    const um = 1 - u;
    const px = um * um * x1 + 2 * um * u * cx + u * u * x2;
    const py = um * um * y1 + 2 * um * u * cy + u * u * y2;

    this.ctx.fillStyle = '#f472b6';
    this.ctx.beginPath();
    this.ctx.arc(x2, y2, 4.5, 0, TAU);
    this.ctx.fill();

    this.ctx.fillStyle = '#e11d48';
    this.ctx.beginPath();
    this.ctx.arc(x1, y1, 4.5, 0, TAU);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(px, py, 3.8, 0, TAU);
    this.ctx.fill();
  }
}

let elasticString = null;

// ============================================================================
// 5. MULTI-SCENE PAGE CONTROLLER & AUTHENTIC EGYPTIAN ARABIC CONTENT
// ============================================================================
const SCENE_INFO = [
  { prev: 'السابق', next: 'كملي الحكاية: إنتي وأنا' },
  { prev: 'الرجوع للقلب', next: 'شوفي ذكرياتنا وفيديوهاتنا (16)' },
  { prev: 'إنتي وأنا', next: 'حاجات بحبها فيكي' },
  { prev: 'ذكرياتنا', next: 'آخر مفاجأة: رسالتي ليكي' },
  { prev: 'حاجات بحبها فيكي', next: 'من الأول ↺' }
];

let currentSceneIdx = 0;
let typewriterTimer = null;

const LOVE_LETTER_TEXT =
  'بصي بقى يا ستي.. أنا قعدت أعملك الموقع ده تفصيلة تفصيلة عشان يطلع شبهنا إحنا الاتنين، ' +
  'وعشان كل ما تفتحيه تفتكري قد إيه إنتي فارقة في حياتي. ' +
  'من أول قعدتنا في العربية ومسكة إيدك اللي بالدنيا، لخروجة المراجيح بالليل وهبلنا، ' +
  'لحد مكالماتنا بالساعات والفلاتر العجيبة اللي بنفضل نضحك عليها من قلبنا. ' +
  'والله العظيم إنتي أحلى وأغلى حاجة حصلتلي، وربنا يديمك في حياتي وما يحرمنيش من ضحكتك ولا من وجودك جمبي أبداً.. بحبك أوي.';

function startLoveLetterTypewriter() {
  const typewriterEl = document.getElementById('typewriter-text');
  if (!typewriterEl) return;
  typewriterEl.textContent = '';
  if (typewriterTimer) clearInterval(typewriterTimer);
  let charIdx = 0;
  typewriterTimer = setInterval(() => {
    if (charIdx < LOVE_LETTER_TEXT.length) {
      typewriterEl.textContent += LOVE_LETTER_TEXT[charIdx++];
    } else {
      clearInterval(typewriterTimer);
    }
  }, 26);
}

function goToScene(targetIdx) {
  if (targetIdx >= SCENE_INFO.length) {
    targetIdx = 0; // Loop back to Scene 1 when clicking Next on Scene 5
  }
  if (targetIdx < 0) return;

  currentSceneIdx = targetIdx;

  // Toggle active scene page
  document.querySelectorAll('.scene-page').forEach((page, idx) => {
    page.classList.toggle('active', idx === currentSceneIdx);
  });

  // Update top scene tabs
  document.querySelectorAll('.scene-tab').forEach((tab, idx) => {
    tab.classList.toggle('active', idx === currentSceneIdx);
  });

  // Update bottom progress dots
  document.querySelectorAll('.s-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSceneIdx);
  });

  // Update bottom Prev / Next buttons
  const prevBtn = document.getElementById('prev-scene-btn');
  const prevLabel = document.getElementById('prev-scene-label');
  const nextLabel = document.getElementById('next-scene-label');

  if (prevBtn) prevBtn.disabled = currentSceneIdx === 0;
  if (prevLabel) prevLabel.textContent = SCENE_INFO[currentSceneIdx].prev;
  if (nextLabel) nextLabel.textContent = SCENE_INFO[currentSceneIdx].next;

  // Scene-specific triggers
  if (currentSceneIdx === 0) {
    setTimeout(resizeCanvas, 50);
  } else if (currentSceneIdx === 1) {
    setTimeout(() => {
      if (elasticString) {
        elasticString.resize();
        elasticString.pluck(34);
      }
    }, 80);
  } else if (currentSceneIdx === 2) {
    document.querySelectorAll('.bento-media video').forEach((v) => {
      v.muted = true;
      v.play().catch(() => {});
    });
  } else if (currentSceneIdx === 4) {
    startLoveLetterTypewriter();
  }
}

const MEMORIES = [
  { type: 'image', category: 'together', wide: true,  src: 'assets/photo3.jpg',  title: 'مسكة إيدك في العربية',   caption: 'أكتر لحظة بحس فيها إن الدنيا كلها ملكي وأنا ماسك إيدك كده' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo1.jpg',  title: 'إحنا الاتنين',           caption: 'أحلى صورة لينا سوا.. شبهنا وشبه روحنا' },
  { type: 'video', category: 'video',    wide: false, src: 'assets/video1.mp4',  title: 'ضحكنا وإيدك في إيدي',    caption: 'شغلي الفيديو واسمعي ضحكتك اللي بالدنيا كلها' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo2.jpg',  title: 'وردة لأحلى وردة',        caption: 'الوردة دي كانت ليكي، بس والله إنتي اللي بتحلّي أي ورد' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo4.jpg',  title: 'راحتي وأماني',           caption: 'طول ما إيدك في إيدي مبيهمنيش أي حاجة في الدنيا' },
  { type: 'video', category: 'video',    wide: true,  src: 'assets/video2.mp4',  title: 'خروجة المراجيح بالليل',  caption: 'أنا والبت الهبلة دي بنمرجح.. أحلى ذكريات وأحلى ضحك من القلب' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo5.jpg',  title: 'وردتين لعيونك',          caption: 'كل ما أشوف ورد بفتكر ضحكتك وعيونك' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo6.jpg',  title: 'تمشيتنا بالليل',         caption: 'حتى وإحنا واقفين بنصور جزمنا في الشارع، كل تفصيلة معاكي ليها طعم' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo7.jpg',  title: 'وقفتنا سوا',             caption: 'أحلى صحبة وأحلى حبيبة في الدنيا كلها' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo8.jpg',  title: 'خطوتنا واحدة',           caption: 'إن شاء الله نفضل ماشيين سوا في كل طريق طول العمر' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo9.jpg',  title: 'الكاب البينك والفلتر',   caption: 'بصي العسل في الكاب البينك والشنب.. قمر في كل حالاتك والله' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo10.jpg', title: 'ضحكتنا في الكول',        caption: 'لما بنفضل فاتحين كول بالساعات ومبنزهقش من بعض أبداً' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo11.jpg', title: 'نفس النظارة ونفس الهبل', caption: 'لما بنجرب نفس الفلتر ونقعد نضحك على شكلنا' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo12.jpg', title: 'سهرنا ومكالماتنا',       caption: 'أحلى وقت في يومي كله هو الوقت اللي بشوفك وبكلمك فيه' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo13.jpg', title: 'أغرب فلتر في التاريخ',   caption: 'حتى وإحنا مبوظين شكلنا بالفلاتر مفيش أحلى من دمك الخفيف' },
  { type: 'video', category: 'video',    wide: true,  src: 'assets/video3.mp4',  title: 'فيديو الفلاتر والجنون',  caption: 'شغلي الفيديو وشوفي هبلنا وجنوننا في الكول' }
];

const REASONS = [
  { tag: 'أول حاجة',   title: 'ضحكتك اللي بتخطفني',   secret: 'والله أول ما بتضحكي بنسى أي تعب وأي هم في الدنيا، ضحكتك دي هي اللي بترد فيا الروح.' },
  { tag: 'تاني حاجة',  title: 'رقتك ودلعك عليا',       secret: 'عاملة زي هالو كيتي بجد في رقتك وحلاوة روحك اللي مفيش زيها في الدنيا.' },
  { tag: 'تالت حاجة',  title: 'مسكة إيدك في العربية', secret: 'لما بمسك إيدك بحس إني ملكت الدنيا كلها ومش عايز أي حاجة تانية غير إنك تفضلي جمبي.' },
  { tag: 'رابع حاجة',  title: 'هبلنا وجنوننا سوا',     secret: 'من المراجيح بالليل للفلاتر العجيبة في الكول.. معاكي بطلع كل اللي جوايا وبضحك من قلبي.' },
  { tag: 'خامس حاجة',  title: 'عيونك اللي بعشقها',    secret: 'بشوف في عيونك حنية وطيبة بيخلوني أتحسد عليكي وأحبك كل يوم أكتر.' },
  { tag: 'سادس حاجة',  title: 'سهرنا ومكالماتنا',      secret: 'صوتك قبل ما أنام وفي كل تفصيلة في يومي هو أكتر حاجة بتطمن قلبي.' },
  { tag: 'سابع حاجة',  title: 'قلبك الأبيض وعفويتك',  secret: 'مبتعرفيش تمثلي ولا تتصنعي، عفويتك ودمك الخفيف دول عندي بالدنيا وما فيها.' },
  { tag: 'ومن الآخر',  title: 'عشان إنتي روحي وبس',    secret: 'مش محتاج أعد أسباب عشان أحبك.. أنا بحبك عشان إنتي بيتي وراحتي ودنيتي كلها.' }
];

let currentMemoryIdx = 0;

function bindSpringTiltCards() {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    if (card.dataset.tiltBound === '1') return;
    card.dataset.tiltBound = '1';

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / Math.max(1, r.width);
      const py = (e.clientY - r.top) / Math.max(1, r.height);
      const rotY = (px - 0.5) * 9;
      const rotX = (0.5 - py) * 9;
      card.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-3px)`;
      card.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
      card.style.setProperty('--glare-op', '1');
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.setProperty('--glare-op', '0');
    });
  });
}

function renderBentoGallery(filter = 'all') {
  const grid = document.getElementById('memories-bento-grid');
  if (!grid) return;
  grid.innerHTML = '';

  MEMORIES.forEach((item, idx) => {
    if (filter !== 'all' && item.category !== filter) return;
    const num = idx + 1;
    const card = document.createElement('article');
    card.className = `bento-card tilt-card${item.wide && filter === 'all' ? ' featured-wide' : ''}`;

    const mediaHTML = item.type === 'video'
      ? `<video src="${item.src}" autoplay muted loop playsinline preload="metadata"></video>
         <span class="bento-tag video-tag" dir="rtl">فيديو • دوسي عشان تسمعي الصوت</span>`
      : `<img src="${item.src}" alt="${item.title}" loading="lazy" />
         <span class="bento-tag" dir="rtl">ذكرى ${num}</span>`;

    card.innerHTML = `
      <div class="card-glare"></div>
      <div class="bento-media">${mediaHTML}</div>
      <div class="bento-info" dir="rtl">
        <div class="bento-title">${item.title}</div>
        <div class="bento-caption">${item.caption}</div>
      </div>
    `;
    card.addEventListener('click', () => openSpotlight(idx));
    grid.appendChild(card);
  });

  bindSpringTiltCards();
}

function renderReasonsGrid() {
  const box = document.getElementById('reasons-grid');
  if (!box) return;
  box.innerHTML = REASONS.map((r) => `
    <div class="flip-card">
      <div class="flip-inner">
        <div class="flip-front">
          <span class="flip-num">${r.tag}</span>
          <h4>${r.title}</h4>
          <span class="flip-hint">دوسي ع الكارت</span>
        </div>
        <div class="flip-back">
          <p>« ${r.secret} »</p>
        </div>
      </div>
    </div>
  `).join('');

  box.querySelectorAll('.flip-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

function setSculptureMode(mode) {
  if (mode !== activeSculpture) {
    fromSculpture = activeSculpture;
    activeSculpture = mode;
    morphProgress = 0.0;
  }
  userYawOffset = 0;
  userPitchOffset = 0;
  if (animTime < DRAW_END_T) {
    animTime = DRAW_END_T + 0.5;
  }

  const btnMap = {
    heart:  'mode-heart-btn',
    kitty:  'mode-kitty-btn',
    spidey: 'mode-spidey-btn',
    rose:   'mode-rose-btn'
  };

  Object.keys(btnMap).forEach((k) => {
    const el = document.getElementById(btnMap[k]);
    if (el) el.classList.toggle('active', k === mode);
  });

  // Only show center "بحبك" inside the hollow center of the 3D Open Heart;
  // hide it on filled 3D sculptures (Kitty, Spidey, Rose) so text NEVER overlaps the ASCII art!
  const coreOverlay = document.getElementById('ring-core-overlay');
  if (mode === 'heart') {
    coreOverlay.classList.remove('hidden-for-sculpture');
  } else {
    coreOverlay.classList.add('hidden-for-sculpture');
  }

  const subText = document.getElementById('core-sub-text');
  const captions = {
    heart:  'أحلى حاجة حصلتلي في حياتي — دوسي وجربي تغيري الشكل',
    kitty:  'هالو كيتي بتاعتك مرسومة مخصوص عشانك',
    spidey: 'سبايدر مان بتاعك دايماً جمبك وفي ضهرك',
    rose:   'وردة لعيونك الحلوين اللي مفيش زيهم'
  };
  if (subText) subText.textContent = captions[mode] || captions.heart;
}

function openSpotlight(index) {
  currentMemoryIdx = (index + MEMORIES.length) % MEMORIES.length;
  const item = MEMORIES[currentMemoryIdx];
  const modal = document.getElementById('spotlight-modal');
  const box = document.getElementById('spotlight-media-box');
  const cap = document.getElementById('spotlight-caption');
  const idxLabel = document.getElementById('viewer-index-label');

  box.innerHTML = '';
  cap.textContent = `${item.title} — ${item.caption}`;
  if (idxLabel) {
    idxLabel.textContent = `ذكرى ${currentMemoryIdx + 1} من ${MEMORIES.length}`;
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

  if (currentSceneIdx === 0) {
    renderScene(animTime, dt);
  } else if (currentSceneIdx === 1 && elasticString) {
    elasticString.step(animTime);
  }
  requestAnimationFrame(tickFrame);
}

window.addEventListener('DOMContentLoaded', () => {
  elasticString = new ElasticWebString();
  renderBentoGallery('all');
  renderReasonsGrid();
  bindSpringTiltCards();

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

    setTimeout(() => {
      introOverlay.classList.add('hidden');
      animTime = 0.0;
      isRunning = true;
      resizeCanvas();
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

  // Multi-Scene Next / Prev / Tab / Dot Navigation
  document.getElementById('prev-scene-btn').addEventListener('click', () => {
    goToScene(currentSceneIdx - 1);
  });
  document.getElementById('next-scene-btn').addEventListener('click', () => {
    goToScene(currentSceneIdx + 1);
  });

  document.querySelectorAll('.scene-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.getAttribute('data-scene') || '0', 10);
      goToScene(idx);
    });
  });

  document.querySelectorAll('.s-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-scene') || '0', 10);
      goToScene(idx);
    });
  });

  // 3D Morphing Sculpture Buttons
  document.getElementById('mode-heart-btn').addEventListener('click', () => setSculptureMode('heart'));
  document.getElementById('mode-kitty-btn').addEventListener('click', () => setSculptureMode('kitty'));
  document.getElementById('mode-spidey-btn').addEventListener('click', () => setSculptureMode('spidey'));
  document.getElementById('mode-rose-btn').addEventListener('click', () => setSculptureMode('rose'));

  // Pluck Elastic Spider-Web String Button
  const shootWebBtn = document.getElementById('shoot-web-btn');
  const webBondMsg = document.getElementById('web-bond-msg');
  if (shootWebBtn && webBondMsg) {
    shootWebBtn.addEventListener('click', () => {
      if (elasticString) elasticString.pluck(38);
      webBondMsg.classList.add('visible');
      shootWebBtn.textContent = 'قلوبنا مربوطة ببعض طول العمر';
    });
  }

  // Gallery Filter Tabs
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderBentoGallery(btn.getAttribute('data-filter') || 'all');
    });
  });

  // Audio Toggle Button
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      loveSong.toggle();
    });
  }

  // Replay Love Letter Button in Scene 5
  const replayLetterBtn = document.getElementById('replay-letter-btn');
  if (replayLetterBtn) {
    replayLetterBtn.addEventListener('click', startLoveLetterTypewriter);
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
