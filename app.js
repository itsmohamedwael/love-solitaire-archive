/**
 * app.js — Hello Kitty × Spider-Man 3D Interactive Love Experience
 * Features 4 3D Code-Art Sculptures (Spider-Kitty Dual Heart, 3D Hello Kitty,
 * 3D Spider-Man Mask, 3D Blooming Rose), Silk Web Cursor Trail, 16-Memory Bento Gallery,
 * 8 Interactive 3D Flip Cards, and Full-Length Song ("مين يعيشك — محمد رحمه") with 5.5s Fade-In.
 */

const PI = Math.PI;
const TAU = 2.0 * PI;

// Color / material tags for the 3D point-cloud renderer
const TAG_IVORY = 0;    // Hello Kitty ivory-white
const TAG_PINK = 1;     // Hello Kitty blush-pink bow & right heart half
const TAG_CRIMSON = 2;  // Spider-Man crimson-red mask, left heart half & rose petals
const TAG_GOLD = 3;     // Hello Kitty nose & starlight accents

const DRAW_END_T = 7.5;

function norm3(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1.0;
  return [v[0] / len, v[1] / len, v[2] / len];
}

// ============================================================================
// 1A. 3D SPIDER-KITTY DUAL HEART SCULPTURE (Replaces the Wedding Ring!)
// ============================================================================
function buildHeartGeometry() {
  const P = [];
  const N = [];
  const F = [];
  const ORDER = [];

  function addPt(pt, n, tag) {
    const nn = norm3(n);
    P.push(pt);
    N.push(nn);
    F.push(tag);
    // Draw from bottom tip (-1.1) up to top lobes (+1.3)
    const ord = Math.max(0, Math.min(1.7, ((pt[1] + 1.15) / 2.45) * 1.7));
    ORDER.push(ord);
  }

  // 1. 3D Parametric Volumetric Heart Shell
  // x = 16 sin^3(v) cos(u), y = 13 cos(v) - 5 cos(2v) - 2 cos(3v) - cos(4v), z = 10 sin^3(v) sin(u)
  const uSteps = 160;
  const vSteps = 84;
  for (let i = 0; i < uSteps; i++) {
    const u = (TAU * i) / uSteps;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);

    for (let j = 1; j < vSteps; j++) {
      const v = (PI * j) / vSteps;
      const sinV = Math.sin(v);
      const sinV3 = sinV * sinV * sinV;

      const rawX = 16 * sinV3 * cosU;
      const rawY = 13 * Math.cos(v) - 5 * Math.cos(2 * v) - 2 * Math.cos(3 * v) - Math.cos(4 * v);
      const rawZ = 9.5 * sinV3 * sinU;

      const px = rawX * 0.072;
      const py = rawY * 0.072 + 0.18;
      const pz = rawZ * 0.072;

      const nx = px;
      const ny = py - 0.18;
      const nz = pz * 1.3;

      // Duality: Left half (px < 0) is Spider-Man Crimson with Web Lattice;
      // Right half (px >= 0) is Hello Kitty Blush Pink & Ivory!
      let tag = TAG_PINK;
      if (px < -0.02) {
        // Spider-web radial & concentric lines on the left side
        const webLine = (i % 10 === 0) || (j % 9 === 0);
        tag = webLine ? TAG_IVORY : TAG_CRIMSON;
      } else {
        tag = (i + j) % 5 === 0 ? TAG_IVORY : TAG_PINK;
      }

      addPt([px, py, pz], [nx, ny, nz], tag);
    }
  }

  // 2. Signature 3D Hello Kitty Bow Perched on the Upper-Right Lobe of the Heart
  const bowCx = 0.62;
  const bowCy = 0.88;
  const bowCz = 0.42;
  const tilt = -0.28;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  function addBowPt(lx, ly, lz, nx, ny, nz, tag = TAG_PINK) {
    const rx2 = lx * cosT - ly * sinT;
    const ry2 = lx * sinT + ly * cosT;
    addPt([bowCx + rx2, bowCy + ry2, bowCz + lz], [nx, ny, nz], tag);
  }

  // Center knot of the bow
  for (let i = 0; i < 32; i++) {
    const u = (TAU * i) / 32;
    for (let j = 1; j < 16; j++) {
      const v = (PI * j) / 16;
      const rK = 0.13;
      addBowPt(
        rK * Math.sin(v) * Math.cos(u),
        rK * Math.cos(v),
        rK * Math.sin(v) * Math.sin(u),
        Math.sin(v) * Math.cos(u),
        Math.cos(v),
        Math.sin(v) * Math.sin(u),
        TAG_CRIMSON
      );
    }
  }

  // Left & right ribbon loops of the bow
  for (const bSide of [-1, 1]) {
    for (let uIdx = 0; uIdx <= 32; uIdx++) {
      const s = uIdx / 32;
      const loopX = bSide * (0.09 + s * 0.34);
      const loopH = 0.08 + Math.sin(s * PI * 0.84) * 0.21;
      const loopD = 0.09 * Math.sin(s * PI);
      for (let vIdx = 0; vIdx < 28; vIdx++) {
        const a = (TAU * vIdx) / 28;
        addBowPt(
          loopX,
          loopH * Math.sin(a),
          loopD * Math.cos(a),
          bSide * 0.3,
          Math.sin(a),
          Math.cos(a) + 0.5,
          TAG_PINK
        );
      }
    }
  }

  return { P, N, F, ORDER };
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

  // Ears
  for (const side of [-1, 1]) {
    const earBaseX = side * 0.68;
    const earBaseY = 0.78;
    const earTipX = side * 0.92;
    const earTipY = 1.36;

    for (let h = 0; h <= 34; h++) {
      const s = h / 34;
      const cx = earBaseX + s * (earTipX - earBaseX);
      const cy = earBaseY + s * (earTipY - earBaseY);
      const radius = (1.0 - Math.pow(s, 1.35)) * 0.42;
      const ringPts = Math.max(8, Math.floor(44 * (1.0 - s * 0.7)));
      for (let k = 0; k < ringPts; k++) {
        const a = (TAU * k) / ringPts;
        const px = cx + radius * Math.cos(a) * 0.95;
        const py = cy + radius * 0.25 * Math.cos(a) * (-side);
        const pz = radius * Math.sin(a) * 0.78;
        addPt([px, py, pz], [Math.cos(a) + side * 0.3, 0.45, Math.sin(a)], TAG_IVORY);
      }
    }
  }

  // 3D Ribbon Bow on Her Ear
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

  for (let i = 0; i < 34; i++) {
    const u = (TAU * i) / 34;
    for (let j = 1; j < 18; j++) {
      const v = (PI * j) / 18;
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
    for (let uIdx = 0; uIdx <= 34; uIdx++) {
      const s = uIdx / 34;
      const loopX = bSide * (0.10 + s * 0.36);
      const loopHalfH = 0.08 + Math.sin(s * PI * 0.82) * 0.22;
      const loopDepth = 0.09 * Math.sin(s * PI);
      for (let vIdx = 0; vIdx < 30; vIdx++) {
        const a = (TAU * vIdx) / 30;
        addBowPt(loopX, loopHalfH * Math.sin(a), loopDepth * Math.cos(a), bSide * 0.35, Math.sin(a), Math.cos(a) + 0.5, TAG_PINK);
      }
    }
  }

  // Golden Button Nose
  for (let i = 0; i < 26; i++) {
    const u = (TAU * i) / 26;
    for (let j = 1; j < 14; j++) {
      const v = (PI * j) / 14;
      addPt([0.10 * Math.sin(v) * Math.cos(u), -0.04 + 0.07 * Math.cos(v), 0.77 + 0.05 * Math.sin(v) * Math.sin(u)], [0, 0.2, 1], TAG_GOLD);
    }
  }

  // 6 Whiskers
  const whiskerAngles = [0.16, 0.0, -0.16];
  for (const side of [-1, 1]) {
    for (let w = 0; w < 3; w++) {
      const wa = whiskerAngles[w];
      const startX = side * 0.92;
      const startY = 0.12 + (1 - w) * 0.17;
      const startZ = 0.36;
      for (let step = 0; step <= 24; step++) {
        const s = step / 24;
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

  return { P, N, F, ORDER };
}

// ============================================================================
// 1C. 3D SPIDER-MAN × HELLO KITTY MASK SCULPTURE
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

  // Sculpted Spider-Man Mask Head (tapered chin, athletic brow)
  const uSteps = 160;
  const vSteps = 84;
  for (let i = 0; i < uSteps; i++) {
    const u = (TAU * i) / uSteps;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);

    for (let j = 1; j < vSteps; j++) {
      const v = (PI * j) / vSteps;
      const sinV = Math.sin(v);
      const cosV = Math.cos(v);

      // Taper the lower jaw/chin (cosV < 0)
      const jawTaper = cosV < 0 ? 1.0 - 0.28 * Math.pow(-cosV, 1.4) : 1.0;
      const px = 0.88 * jawTaper * sinV * cosU;
      const py = 0.18 + 1.08 * cosV;
      const pz = 0.86 * jawTaper * sinV * sinU;

      // Iconic Spider-Man Angular Eyes on Front (+z)
      if (pz > 0.35) {
        const ax = Math.abs(px);
        // Eye lens region: tilted upward outward
        const eyeCenterY = 0.22 + (ax - 0.34) * 0.45;
        const dy = py - eyeCenterY;
        const inEyeLens = ax > 0.14 && ax < 0.62 && dy > -0.16 * (1 - Math.abs(ax - 0.38) * 1.8) && dy < 0.18 * (1 - Math.abs(ax - 0.38) * 1.6);

        if (inEyeLens) {
          // Thick black rim vs bright white inner eye lens
          const inInnerWhite = ax > 0.18 && ax < 0.57 && dy > -0.11 && dy < 0.13;
          if (!inInnerWhite) continue; // Dark gap creates the bold black Spider-Eye border!
          addPt([px * 1.03, py, pz * 1.04], [px, py - 0.18, pz + 0.5], TAG_IVORY);
          continue;
        }
      }

      // Web grid lines radiating from the nose bridge
      const isWebMeridian = (i % 10 === 0);
      const isWebRing = (j % 8 === 0);
      const tag = (isWebMeridian || isWebRing) ? TAG_PINK : TAG_CRIMSON;

      addPt([px, py, pz], [px, py - 0.18, pz], tag);
    }
  }

  return { P, N, F, ORDER };
}

// ============================================================================
// 1D. 3D BLOOMING ROSE SCULPTURE ("وردة حبنا 3D")
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

  // Layered 3D Spiral Rose Petals
  const numPetals = 22;
  const goldenAngle = PI * (3 - Math.sqrt(5));

  for (let p = 0; p < numPetals; p++) {
    const layer = p / numPetals; // 0 (inner bud) -> 1 (outer open petals)
    const baseAngle = p * goldenAngle;
    const petalRadius = 0.22 + layer * 0.78;
    const petalHeight = 0.65 - layer * 0.38;
    const flare = 0.25 + layer * 0.85;
    const tag = p % 3 === 0 ? TAG_PINK : TAG_CRIMSON;

    for (let uIdx = 0; uIdx <= 28; uIdx++) {
      const u = (uIdx / 28 - 0.5) * 1.35; // angular width of each petal
      for (let vIdx = 0; vIdx <= 24; vIdx++) {
        const v = vIdx / 24; // 0 (base) -> 1 (top curled lip of petal)
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

  // Sculpted Stem & Two Leaves below the Rose
  for (let s = 0; s <= 70; s++) {
    const t = s / 70;
    const y = 0.22 - t * 1.25;
    const stemCurveX = 0.05 * Math.sin(t * PI);
    for (let k = 0; k < 10; k++) {
      const a = (TAU * k) / 10;
      addPt([stemCurveX + 0.04 * Math.cos(a), y, 0.04 * Math.sin(a)], [Math.cos(a), 0, Math.sin(a)], TAG_IVORY);
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

    const distFromCenter = Math.hypot(wx, wy);
    if (distFromCenter < 0.90) continue;

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

const SCULPTURES = {
  heart:  buildHeartGeometry(),
  kitty:  buildKittyGeometry(),
  spidey: buildSpideyGeometry(),
  rose:   buildRoseGeometry()
};
const WING_DATA = buildButterflyWings();
const DUST_DATA = buildAmbientDust();

let activeSculpture = 'heart'; // Default: 3D Spider-Kitty Dual Heart!

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
// 3. 3D CODE-ART RENDERER + SILK SPIDER-WEB CURSOR TRAIL
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

// Silk Web & Blush Ribbon Cursor Trail Points
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const visualPane = document.getElementById('visual-pane');
visualPane.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.sculpture-switcher') || e.target.closest('.scroll-down-hint')) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

visualPane.addEventListener('pointermove', (e) => {
  const rect = visualPane.getBoundingClientRect();
  const lx = e.clientX - rect.left;
  const ly = e.clientY - rect.top;

  pointerLightX = (lx / Math.max(1, rect.width) - 0.5) * 0.48;
  pointerLightY = (ly / Math.max(1, rect.height) - 0.5) * 0.38;

  // Add silk spider-web trail node
  WEB_TRAIL.push({ x: lx, y: ly, life: 1.0 });
  if (WEB_TRAIL.length > 28) WEB_TRAIL.shift();

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
  return (TAU * Math.max(t - DRAW_END_T - 0.5, 0)) / 28.0;
}

function lightsAt(t) {
  const a = t * 0.25;
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
  const H = rect.height;

  ctx.fillStyle = '#060508';
  ctx.fillRect(0, 0, W, H);

  const audioBoost = loveSong.getAudioEnergy();

  const cellW = 6.0;
  const cellH = 8.4;
  const cols = Math.floor(W / cellW);
  const rows = Math.floor(H / cellH);

  // Subtle heartbeat scale when showing the 3D Spider-Kitty Heart
  const beatScale = activeSculpture === 'heart'
    ? 1.0 + 0.032 * Math.sin(t * 3.4) + audioBoost * 0.04
    : 1.0;

  const baseRadiusPx = Math.min(W, H) * 0.275 * beatScale;
  const cx = W * 0.5;
  const cy = H * 0.50;

  const drawProg = Math.min(1.75, (t / DRAW_END_T) * 1.70);

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

  // A. Starlight Dust Field
  for (let i = 0; i < DUST_DATA.length; i++) {
    const d = DUST_DATA[i];
    const twinkle = 0.5 + 0.5 * Math.sin(t * d.speed * 1.5 + d.phase);
    const alpha = twinkle * (0.18 + 0.22 * audioBoost);

    if (alpha > 0.10) {
      const sx = cx + d.x * baseRadiusPx;
      const sy = cy - (d.y - 0.18) * baseRadiusPx;
      if (sx > 10 && sx < W - 10 && sy > 10 && sy < H - 15) {
        ctx.fillStyle = i % 2 === 0
          ? `rgba(244, 114, 182, ${Math.min(0.65, alpha).toFixed(3)})`
          : `rgba(225, 29, 72, ${Math.min(0.65, alpha).toFixed(3)})`;
        ctx.fillText(d.char, sx, sy);
      }
    }
  }

  // B. Hello Kitty Bow / Butterfly Caustic Wings Behind the 3D Sculpture
  const wingFade = Math.max(0, Math.min(1, (t - 2.5) / 3.5));
  if (wingFade > 0.01) {
    const wingChars = ['.', ':', '+', '*', '·'];
    for (let i = 0; i < WING_DATA.length; i++) {
      const wp = WING_DATA[i];
      const shimmer = 0.45 + 0.55 * Math.sin(t * 1.5 - wp.u * 8.0 + wp.phase);
      const alpha = wingFade * shimmer * (0.30 + 0.24 * audioBoost);
      if (alpha > 0.08) {
        const sx = cx + wp.x * baseRadiusPx;
        const sy = cy - (wp.y - 0.18) * baseRadiusPx;
        // Left wing crimson-tinted, right wing Hello Kitty pink-tinted
        ctx.fillStyle = wp.x < 0
          ? `rgba(235, 110, 140, ${Math.min(0.62, alpha).toFixed(3)})`
          : `rgba(248, 175, 210, ${Math.min(0.62, alpha).toFixed(3)})`;
        ctx.fillText(wingChars[i % wingChars.length], sx, sy);
      }
    }
  }

  // C. Z-Buffer Grid for the Active 3D Sculpture
  const gridSize = cols * rows;
  const zBuf = new Float32Array(gridSize);
  const lumBuf = new Float32Array(gridSize);
  const specBuf = new Float32Array(gridSize);
  const tagBuf = new Int8Array(gridSize);
  zBuf.fill(-9999);

  const activeData = SCULPTURES[activeSculpture] || SCULPTURES.heart;
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
      const spec = Math.pow(specDot, 12);

      const edgeDist = drawProg - ord;
      const edgeFlash = (t < DRAW_END_T + 0.5 && edgeDist >= 0 && edgeDist < 0.10)
        ? (1.0 - edgeDist / 0.10) * 0.65
        : 0.0;

      const lum = Math.min(1.0, 0.18 + 0.66 * diff + 0.32 * rimDot + 0.90 * spec + edgeFlash + audioBoost * 0.16);
      lumBuf[cellIdx] = lum;
      specBuf[cellIdx] = spec + edgeFlash;
    }
  }

  // D. Render 3D ASCII Cells with Hello Kitty × Spider-Man Palette
  const phrase = PHRASE_MAP[activeSculpture] || PHRASE_MAP.heart;
  const phraseLen = phrase.length;
  const floorY = cy + 1.24 * baseRadiusPx;

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
      } else if (lum > 0.50) {
        ch = phrase[(gx * 3 + gy * 7) % phraseLen];
      } else {
        const sIdx = Math.min(SHADE_CHARS.length - 1, Math.max(1, Math.floor(lum * SHADE_CHARS.length)));
        ch = SHADE_CHARS[sIdx];
      }

      const b = Math.floor(75 + lum * 180);
      let r = b;
      let g = b;
      let bl = Math.min(255, b + 10);

      if (tag === TAG_PINK) {
        // Hello Kitty Sakura Blush Pink
        r = Math.min(255, Math.floor(b * 1.08 + 28));
        g = Math.min(255, Math.floor(b * 0.72));
        bl = Math.min(255, Math.floor(b * 0.92 + 18));
      } else if (tag === TAG_CRIMSON) {
        // Spider-Man Crimson Red
        r = Math.min(255, Math.floor(b * 1.12 + 35));
        g = Math.min(255, Math.floor(b * 0.36));
        bl = Math.min(255, Math.floor(b * 0.52));
      } else if (tag === TAG_GOLD) {
        // Hello Kitty Golden Button Nose
        r = Math.min(255, Math.floor(b * 1.1 + 30));
        g = Math.min(255, Math.floor(b * 0.92 + 10));
        bl = Math.min(255, Math.floor(b * 0.45));
      }

      ctx.fillStyle = `rgb(${r}, ${g}, ${bl})`;
      ctx.fillText(ch, sx, sy);

      // Subtle Floor Reflection
      const distBelowCenter = sy - cy;
      if (distBelowCenter > baseRadiusPx * 0.25) {
        const reflY = floorY + (floorY - sy) * 0.32;
        if (reflY > floorY - 10 && reflY < H - 14) {
          const reflAlpha = Math.max(0.02, Math.min(0.15, lum * 0.16 * (1.0 - (reflY - floorY) / (baseRadiusPx * 0.6))));
          ctx.fillStyle = `rgba(225, 180, 205, ${reflAlpha.toFixed(3)})`;
          ctx.fillText('.', sx, reflY);
        }
      }
    }
  }

  // E. Render Silk Spider-Web Cursor Trail
  if (WEB_TRAIL.length > 1) {
    ctx.beginPath();
    for (let i = 0; i < WEB_TRAIL.length; i++) {
      const pt = WEB_TRAIL[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
      pt.life -= 0.035;
    }
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.28)';
    ctx.lineWidth = 1.2;
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
// 4. ALL 16 MEMORIES BENTO GALLERY + 8 INTERACTIVE 3D FLIP CARDS
// ============================================================================
const MEMORIES = [
  { type: 'image', category: 'together', wide: true,  src: 'assets/photo3.jpg',  title: 'إيدك في إيدي',    caption: 'أجمل لحظة وأنا ماسك إيدك في العربية — وعدنا للأبد' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo1.jpg',  title: 'من البداية',       caption: 'أحلى وألطف صورة لينا سوا' },
  { type: 'video', category: 'video',    wide: false, src: 'assets/video1.mp4',  title: 'ضحكنا في العربية', caption: 'فيديو إيدك في إيدي وإحنا بنضحك من قلبنا (اضغطي للصوت)' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo2.jpg',  title: 'أحلى وردة ليكِ',   caption: 'الوردة دي علشانك بس إنتي أحلى من كل الورد' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo4.jpg',  title: 'الأمان كله',       caption: 'في قربك بحس إن الدنيا كلها ضحكتلي' },
  { type: 'video', category: 'video',    wide: true,  src: 'assets/video2.mp4',  title: 'خروجة المراجيح',   caption: 'فيديو المراجيح بالليل — وذكريات حلوة مابتتنسيش أبداً (اضغطي للصوت)' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo5.jpg',  title: 'وردتين لعيونك',    caption: 'كل وردة بتفكرني بجمال روحك' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo6.jpg',  title: 'خطواتنا بالليل',   caption: 'كل مشوار وكل خطوة معاكِ هي حياة' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo7.jpg',  title: 'فرحة قلبي',       caption: 'وجودك جنبي بيخلي كل حاجة ليها طعم تاني' },
  { type: 'image', category: 'together', wide: false, src: 'assets/photo8.jpg',  title: 'معاكِ في كل مكان', caption: 'خطوتي دايماً ماشية مع خطوتك' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo9.jpg',  title: 'الكاب البينك',     caption: 'أحلى هالو كيتي في الكاب البينك والفلتر العسل' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo10.jpg', title: 'أجمل ابتسامة',     caption: 'ضحكتك في المكالمة بتنور يومي كله' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo11.jpg', title: 'نفس النظارة',      caption: 'لما بنطقم بنفس الفلتر سوا' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo12.jpg', title: 'مكالماتنا بالساعات', caption: 'أحلى وقت في يومي هو الوقت اللي بكلمك فيه' },
  { type: 'image', category: 'calls',    wide: false, src: 'assets/photo13.jpg', title: 'هزارنا اللي مفيش زيه', caption: 'حتى وإحنا بنهزر بأغرب الفلاتر قمر في عيني' },
  { type: 'video', category: 'video',    wide: true,  src: 'assets/video3.mp4',  title: 'جنوننا في المكالمات', caption: 'فيديو الفلاتر والضحك اللي من القلب (اضغطي للصوت)' }
];

const REASONS = [
  { num: '01', title: 'ضحكتك اللي بتخطفني', secret: 'أول ما بتضحكي بنسى أي تعب وأي هم في الدنيا، ضحكتك هي سبب سعادتي.' },
  { num: '02', title: 'رقتك ودلعك (My Kitty)', secret: 'زيك زي هالو كيتي في رقتك وحلاوة روحك اللي مفيش زيها في الكون كله.' },
  { num: '03', title: 'إيدك لما بتمسك إيدي', secret: 'لما بمسك إيدك في العربية بحس إني ملكت الدنيا كلها ومش عايز حاجة تانية.' },
  { num: '04', title: 'جنوننا وهزارنا سوا', secret: 'من المراجيح بالليل للفلاتر المجنونة في المكالمات.. معاكِ بعيش أحلى أيام عمري.' },
  { num: '05', title: 'عيونك اللي بحبها', secret: 'بشوف في عيونك حنيتك وطيبتك اللي خلوني أتعلق بيكِ كل يوم أكتر.' },
  { num: '06', title: 'مكالماتنا اللي مبتخلصش', secret: 'صوتك قبل ما أنام وفي كل وقت في يومي هو أكتر حاجة بتطمن قلبي.' },
  { num: '07', title: 'عفويتك وطيبة قلبك', secret: 'قلبك أبيض وحنين، وبتخليني دايماً عايز أكون أحسن علشانك.' },
  { num: '08', title: 'لأنك إنتي وبس', secret: 'مش محتاج سبب علشان أحبك.. أنا بحبك علشان إنتي روحي ودنيتي كلها.' }
];

let currentMemoryIdx = 0;

function renderBentoGallery(filter = 'all') {
  const grid = document.getElementById('memories-bento-grid');
  if (!grid) return;
  grid.innerHTML = '';

  MEMORIES.forEach((item, idx) => {
    if (filter !== 'all' && item.category !== filter) return;
    const numStr = String(idx + 1).padStart(2, '0');
    const card = document.createElement('article');
    card.className = `bento-card${item.wide && filter === 'all' ? ' featured-wide' : ''}`;

    const mediaHTML = item.type === 'video'
      ? `<video src="${item.src}" autoplay muted loop playsinline preload="metadata"></video>
         <span class="bento-tag video-tag" dir="rtl">فيديو ${numStr} • اضغطي للصوت</span>`
      : `<img src="${item.src}" alt="${item.title}" loading="lazy" />
         <span class="bento-tag" dir="ltr">PHOTO // ${numStr}</span>`;

    card.innerHTML = `
      <div class="bento-media">${mediaHTML}</div>
      <div class="bento-info" dir="rtl">
        <div class="bento-title">${item.title}</div>
        <div class="bento-caption">${item.caption}</div>
      </div>
    `;
    card.addEventListener('click', () => openSpotlight(idx));
    grid.appendChild(card);
  });
}

function renderReasonsGrid() {
  const box = document.getElementById('reasons-grid');
  if (!box) return;
  box.innerHTML = REASONS.map((r) => `
    <div class="flip-card">
      <div class="flip-inner">
        <div class="flip-front">
          <span class="flip-num" dir="ltr">REASON // ${r.num}</span>
          <h4>${r.title}</h4>
          <span class="flip-hint">اضغطي لكشف السر</span>
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
  activeSculpture = mode;
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

  const coreOverlay = document.getElementById('ring-core-overlay');
  const subText = document.getElementById('core-sub-text');
  if (mode === 'kitty' || mode === 'spidey') {
    coreOverlay.classList.add('lowered');
  } else {
    coreOverlay.classList.remove('lowered');
  }

  const captions = {
    heart:  'قلب واحد بيجمع هالو كيتي وسبايدر مان',
    kitty:  'لأحلى وأرق هالو كيتي في دنيتي',
    spidey: 'سبايدر مان دايماً جمب هالو كيتي',
    rose:   'أجمل وردة لأغلى إنسانة في قلبي'
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
    const numStr = String(currentMemoryIdx + 1).padStart(2, '0');
    idxLabel.textContent = `MEMORY // ${numStr} OF ${MEMORIES.length}`;
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
  renderBentoGallery('all');
  renderReasonsGrid();

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

    document.querySelectorAll('.bento-media video').forEach((v) => {
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

  // 3D Sculpture Switcher Buttons
  document.getElementById('mode-heart-btn').addEventListener('click', () => setSculptureMode('heart'));
  document.getElementById('mode-kitty-btn').addEventListener('click', () => setSculptureMode('kitty'));
  document.getElementById('mode-spidey-btn').addEventListener('click', () => setSculptureMode('spidey'));
  document.getElementById('mode-rose-btn').addEventListener('click', () => setSculptureMode('rose'));

  // Interactive Spider-Web Heart Bond Button in Chapter 2
  const shootWebBtn = document.getElementById('shoot-web-btn');
  const webBondMsg = document.getElementById('web-bond-msg');
  if (shootWebBtn && webBondMsg) {
    shootWebBtn.addEventListener('click', () => {
      webBondMsg.classList.add('visible');
      shootWebBtn.textContent = 'قلوبنا مربوطة ببعض للأبد';
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

  // Love Letter Modal
  const LOVE_LETTER_TEXT =
    'حبيبتي وأجمل هالو كيتي في دنيتي.. ' +
    'حبيت أعملك حاجة مختلفة تشبهنا إحنا الاتنين وتشبه كل تفصيلة حلوة ما بينا. ' +
    'من أول ضحكتنا في العربية، وخروجتنا على المراجيح بالليل، والورد، لحد مكالماتنا بالساعات والفلاتر اللي بنضحك بيها من قلبنا. ' +
    'إنتي أحلى حاجة حصلتلي، وهفضل دايماً جمبك وسندك، وبحبك النهارده وبكرة وطول العمر.';
  let typewriterTimer = null;

  const letterModal = document.getElementById('letter-modal');
  const openLetterBtn = document.getElementById('open-letter-btn');
  const navLetterBtn = document.getElementById('nav-letter-btn');
  const closeLetterBtn = document.getElementById('close-letter-btn');
  const typewriterEl = document.getElementById('typewriter-text');

  function openLoveLetter() {
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
    }, 30);
  }

  if (openLetterBtn) openLetterBtn.addEventListener('click', openLoveLetter);
  if (navLetterBtn) navLetterBtn.addEventListener('click', openLoveLetter);

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
