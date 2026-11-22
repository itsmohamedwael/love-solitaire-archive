/**
 * app.js — Minimalist 3D ASCII Diamond Ring & Editorial Archive
 */

const PI = Math.PI;
const TAU = 2.0 * PI;

const BAND = 0;
const PRONG = 1;
const GEM = 2;

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
// 1. 3D RING GEOMETRY & POINT-CLOUD BUILDER (Pure @jin_22ee Mathematics)
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
const WING_DATA = buildButterflyWings();
const DUST_DATA = buildAmbientDust();

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
// 3. MONOCHROME 3D ASCII DIAMOND RING RENDERER (No Emojis, Pure Code Art)
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

// Pure Latin monospace ASCII characters for crisp geometric alignment
const RING_PHRASE = 'WILLYOUMARRYME';
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
  if (e.target.closest('.memory-rail') || e.target.closest('.editorial-footer')) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  // Subtle light parallax responding to cursor position
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

  // B. Monochrome Caustic Dispersion Wings
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
        ctx.fillStyle = `rgba(205, 208, 218, ${Math.min(0.58, alpha).toFixed(3)})`;
        ctx.fillText(wingChars[i % wingChars.length], sx, sy);
      }
    }
  }

  // C. Z-Buffer Grid for the 3D Ring Point Cloud
  const gridSize = cols * rows;
  const zBuf = new Float32Array(gridSize);
  const lumBuf = new Float32Array(gridSize);
  const specBuf = new Float32Array(gridSize);
  const tagBuf = new Int8Array(gridSize);
  zBuf.fill(-9999);

  const { P, N, F, ORDER } = RING_DATA;
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

  // D. Render Floor Reflection & Monochrome Silver-Platinum Ring Cells
  const phraseLen = RING_PHRASE.length;
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
        ch = RING_PHRASE[(gx * 3 + gy * 7) % phraseLen];
      } else {
        const sIdx = Math.min(SHADE_CHARS.length - 1, Math.max(1, Math.floor(lum * SHADE_CHARS.length)));
        ch = SHADE_CHARS[sIdx];
      }

      const b = Math.floor(68 + lum * 187);
      const r = tag === GEM ? Math.min(255, b + Math.floor(spec * 20)) : b;
      const g = tag === GEM ? Math.min(255, b + Math.floor(spec * 20)) : b;
      const bl = Math.min(255, b + 8);

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

  // E. Crosshair Alignment Rays & Crown Table Vertical Light Burst
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
// 4. ANIMATION LOOP & EDITORIAL ARCHIVE / NOTE INTERACTIONS
// ============================================================================
function tickFrame(now) {
  const dt = Math.min(0.1, (now - lastFrameTs) / 1000);
  lastFrameTs = now;

  if (isRunning) {
    animTime += dt;
  }

  renderScene(animTime);
  requestAnimationFrame(tickFrame);
}

const MEMORIES = [
  { type: 'image', src: 'assets/photo1.jpg', caption: 'من البداية وإلى الأبد' },
  { type: 'video', src: 'assets/video1.mp4', caption: 'معاً في كل لحظة' },
  { type: 'image', src: 'assets/photo2.jpg', caption: 'لكِ وحدكِ' },
  { type: 'video', src: 'assets/video2.mp4', caption: 'ذكريات لا تُنسى' }
];
let currentMemoryIdx = 0;

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
    idxLabel.textContent = `ARCHIVE // 0${currentMemoryIdx + 1} OF 04`;
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

window.addEventListener('DOMContentLoaded', () => {
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

    // Start the MP3 song synchronously inside the user gesture
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

  // Archive Rail Items
  document.querySelectorAll('.rail-item').forEach((item) => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index') || '0', 10);
      openSpotlight(idx);
    });
  });

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
