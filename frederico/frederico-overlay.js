// Frederico — page overlay.
// One module. Drop on any page:
//   <script type="module" src="/frederico/frederico-overlay.js"></script>
// Loads the WASM, splits visible text into letter-spans, makes each letter food,
// renders Frederico in an SVG overlay, persists state in localStorage.

const TRANSIT_SECONDS = 80;
const ENERGY_PER_PELLET = 22;
const StepSize = 0.005;
// Note: the 3rd worm (index 2) is deliberately "Worm 3" — a little joke; the
// ones on either side have proper names.
const WORM_NAMES = ['Frederico', 'Arnandez', 'Worm 3', 'Herbesto', 'Pedrico', 'Gustavo', 'Lorenzo'];
function nameForIndex(i) { return WORM_NAMES[i] ?? `Worm ${i + 1}`; }

// Each worm gets a unique, evenly-spread hue (golden-angle), Frederico amber.
function hueForIndex(i) { return (32 + i * 137.508) % 360; }
function wormColor(i) { return `hsl(${hueForIndex(i).toFixed(1)}, 68%, 58%)`; }
function assignIdentity(w, i) { w.name = nameForIndex(i); w.hue = hueForIndex(i); }

// World scale. 1 mm of worm body = SCALE pixels on screen. Body length ~1 mm.
const SCALE = 90;     // ~90 px body
const EATING_R = 14;  // px — generous so eating feels good
const DETECT_R = 220; // px

// ─── per-worm pet state ───────────────────────────────────────────────
// Each worm owns its own pet record. Persistence is dropped to keep the
// multi-worm state simple — every reload starts a fresh household.
function defaultPet() {
  return {
    bornAt: Date.now(), ageSeconds: 0,
    energy: 100, happiness: 100, alive: true,
    gutPellets: [], lastFed: null, lastPoked: null,
  };
}

// ─── load wasm ────────────────────────────────────────────────────────
const fredericoModURL = new URL('./frederico.js', import.meta.url);
const FredericoModule = (await import(fredericoModURL)).default;
let N = 0; // rod count — same for every instance, set after first createWorm

// ─── runtime state ────────────────────────────────────────────────────
let foods = [];     // {id, x, y, el?: HTMLElement}  (x,y in viewport px)
let poops = [];     // {id, x, y, born}
let nextFoodId = 1, nextPoopId = 1, nextPelletId = 1;

// Bottle: sliced 1–3 char chunks waiting to be sprinkled onto the page.
const bottle = [];
let feedMode = false;  // starts muted; click the shaker to wake it, then drag to sprinkle
// Real words harvested from the page, used to refill the shaker on demand so
// it never runs dry mid-pour.
const pageWordBank = [];
// Continuous "salt shaker" pour state.
let pouring = false;
let pourPos = { x: 0, y: 0 };
let liveGrains = 0;               // sprinkled, not-yet-eaten grains on the page
const MAX_LIVE_GRAINS = 160;     // shaker "runs out" past this so the page can't choke
const POUR_INTERVAL = 55;        // ms between grains while holding
const PILE_MAX = 26;             // fallback jar capacity before the glyph is measured
let pileCap = PILE_MAX;          // real capacity = how many grains fit the shaker glyph

// All currently-living worms. Each owns its own pet stats (energy, happiness,
// gut, age, alive). foods/poops/bottle stay shared across the household.
const worms = [];
let activeWormIdx = 0; // which worm's pill is expanded
let panelOpen = false; // control panels start collapsed; click a pill to expand

// Drag interaction: which worm is being yanked, and where the cursor is now.
// dragTarget is in viewport pixels.
let draggingWorm = null;
let dragTarget = { x: 0, y: 0 };

// Slime trail. The worm leaves translucent mucus that composites *optically*
// onto whatever is beneath it — via a CSS blend mode on the trail canvas — so
// it never has to guess the page background and looks right over any color.
//
// The drying arc mirrors the original: fresh slime is a dark, cool wet sheen;
// as it dries we recolor those same pixels toward a pale matte tone. Under the
// `soft-light` blend that means a streak starts by *darkening* the page (wet)
// and ends by faintly *lightening* it (a dried crust) — bg-agnostic. Two phases:
//   1. Each render frame: stamp a fresh wet silhouette (WET_SLIME).
//   2. Each second: nudge existing trail pixels toward CRUST_SLIME.
const TRAIL_BLEND_MODE = 'soft-light'; // how the canvas composites onto the page
let TRAIL_ALPHA  = 0.55;               // wet stroke opacity
let CRUST_RATE   = 0.05;               // per second; how fast wet dries to crust
const WET_SLIME   = [16, 26, 22];      // dark cool tone → darkens the page (wet)
const CRUST_SLIME = [234, 238, 230];   // pale tone → lightens the page (dried)

function trailColorString(rgb = WET_SLIME, alpha = TRAIL_ALPHA) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

// ─── overlay DOM ─────────────────────────────────────────────────────
// Idempotency: if a previous instance is somehow still in the DOM (HMR, a
// double script-inject, StrictMode), tear it down so we never render twice.
document.querySelectorAll('#frederico-overlay, #frederico-trail, [data-frederico-ui]')
  .forEach(el => el.remove());

// Document-sized trail canvas (lives behind page content, paints permanent
// marks at every body segment's position in document coordinates).
const trailCanvas = document.createElement('canvas');
trailCanvas.id = 'frederico-trail';
// Above page content (so the blend mode can composite onto text, images and
// any background), but below the worm and UI. Transparent everywhere except
// where slime is painted, so it never tints the rest of the page.
trailCanvas.style.cssText = `
  position: absolute; top: 0; left: 0; pointer-events: none;
  z-index: 999990; mix-blend-mode: ${TRAIL_BLEND_MODE};
`;
document.body.appendChild(trailCanvas);
const trailCtx = trailCanvas.getContext('2d');

function sizeTrailCanvas() {
  // Measure with the canvas OUT of the layout, and against clientWidth/Height
  // (which exclude the scrollbar gutter) rather than innerWidth/innerHeight
  // (which include it). Otherwise the canvas sizes to viewport+scrollbar, spawns
  // a scrollbar, which shrinks the client area, which grows the canvas next tick
  // — a ratchet that leaves permanent phantom scrollbars on both axes.
  const de = document.documentElement;
  const prevDisplay = trailCanvas.style.display;
  trailCanvas.style.display = 'none';
  const w = Math.max(de.scrollWidth, de.clientWidth);
  const h = Math.max(de.scrollHeight, de.clientHeight);
  trailCanvas.style.display = prevDisplay;
  if (trailCanvas.width === w && trailCanvas.height === h) return;
  // Preserve existing trail when resizing.
  let snap = null;
  if (trailCanvas.width > 0 && trailCanvas.height > 0) {
    try { snap = trailCtx.getImageData(0, 0, trailCanvas.width, trailCanvas.height); }
    catch { snap = null; }
  }
  trailCanvas.width = w;
  trailCanvas.height = h;
  trailCanvas.style.width = w + 'px';
  trailCanvas.style.height = h + 'px';
  if (snap) trailCtx.putImageData(snap, 0, 0);
}
sizeTrailCanvas();
window.addEventListener('resize', sizeTrailCanvas);
setInterval(sizeTrailCanvas, 1000); // catch dynamic content height changes

const overlay = document.createElement('div');
overlay.id = 'frederico-overlay';
overlay.style.cssText = `
  position: fixed; inset: 0; pointer-events: none;
  z-index: 999998; overflow: visible;
  transform: translateZ(0);   /* own compositing layer: no scroll ghosting */
`;
document.body.appendChild(overlay);

const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('width', '100%');
svg.setAttribute('height', '100%');
svg.style.cssText = 'position:absolute;inset:0;overflow:visible;';
overlay.appendChild(svg);


// Build a fresh worm: its own WASM instance, body buffer, and SVG group with
// body-segments + head dot + poke flash ring. Returned object owns everything
// that's per-worm; foods/poops/pet stay shared across all worms.
async function createWorm({ x, y } = {}) {
  const F = await FredericoModule();
  F.initWorm();
  if (!N) N = F.getNumRods();
  const body = new Float32Array(F.HEAPF32.buffer, F.getBodyBufferPtr(), F.getBodyBufferLen());

  const bodyGroup = document.createElementNS(svgNS, 'g');
  svg.appendChild(bodyGroup);
  const bodySegs = [];
  for (let i = 0; i < N - 1; i++) {
    const seg = document.createElementNS(svgNS, 'line');
    const t01 = i / (N - 1);
    const thickness = Math.max(2, 9 * Math.sin(Math.PI * (0.15 + t01 * 0.85)));
    seg.setAttribute('stroke-width', thickness);
    seg.setAttribute('stroke-linecap', 'round');
    seg.style.pointerEvents = 'auto';   // body is clickable / grabbable
    seg.style.cursor = 'grab';
    bodyGroup.appendChild(seg);
    bodySegs.push(seg);
  }
  const headDot = document.createElementNS(svgNS, 'circle');
  headDot.setAttribute('r', '1.8');
  headDot.setAttribute('fill', '#0d1f26');
  bodyGroup.appendChild(headDot);
  const flashRing = document.createElementNS(svgNS, 'circle');
  flashRing.setAttribute('fill', 'none');
  flashRing.setAttribute('stroke', 'rgba(255,80,60,0)');
  flashRing.setAttribute('stroke-width', '2');
  bodyGroup.appendChild(flashRing);

  const w = {
    F, body, bodyGroup, bodySegs, headDot, flashRing,
    name: '', hue: 32, // set by assignIdentity after push (reflects array index)
    pet: defaultPet(),
    simAcc: 0, currentGait: 'forward', flashAt: 0,
    pirouette: { lastPirouette: 0, suppressUntil: 0 },
    lastCxCy: { cx: 0, cy: 0 }, initialized: false,
    worldOffset: {
      x: x ?? window.innerWidth * (0.25 + Math.random() * 0.5),
      y: y ?? window.innerHeight * (0.25 + Math.random() * 0.5),
    },
    lastBodyVp: null, lastTailVp: null,
  };
  setForwardGait(w);
  return w;
}

// Frederico control panel — a list of worm pills that sits above the sprinkler
// (bottom-right). Each pill expands to that worm's stats + actions. It's appended
// into the sprinkler column in buildBottleUI so it flows above the shaker.
const card = document.createElement('div');
card.dataset.fredericoUi = 'box';
card.style.cssText = `
  pointer-events: auto; color: #f0e9d9; width: 200px;
  font-family: system-ui, sans-serif; font-size: 12px;
  margin-bottom: 10px;
`;

// ─── letters as food ──────────────────────────────────────────────────
// Walk every text node (not inside our overlay), wrap each non-space char
// in a span. Track viewport bbox so we can spawn food at each.
const LETTER_CLASS = 'frederico-letter';
const letterStyle = document.createElement('style');
letterStyle.textContent = `
  .${LETTER_CLASS} { transition: opacity 250ms; }
  .${LETTER_CLASS}.eaten { opacity: 0 !important; }
  @keyframes frederico-sprinkle-in {
    0%   { opacity: 0; transform: translate(-50%,-50%) translateY(-18px) rotate(var(--r0,0deg)) scale(.55); }
    55%  { opacity: 1; transform: translate(-50%,-50%) translateY(4px)   rotate(var(--r1,0deg)) scale(1.12); }
    100% { opacity: 1; transform: translate(-50%,-50%) translateY(0)     rotate(var(--r1,0deg)) scale(1); }
  }
  .frederico-sprinkle { animation: frederico-sprinkle-in 430ms cubic-bezier(.34,1.56,.64,1) both; }
`;
document.head.appendChild(letterStyle);

const letterEntries = []; // {span, food}

function wrapLetters() {
  const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CODE', 'PRE']);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !/\S/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      let p = node.parentElement;
      while (p) {
        if (p === overlay) return NodeFilter.FILTER_REJECT;
        if (skipTags.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.classList?.contains(LETTER_CLASS)) return NodeFilter.FILTER_REJECT;
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const targets = [];
  let node;
  while ((node = walker.nextNode())) targets.push(node);
  for (const t of targets) {
    const txt = t.nodeValue;
    // Stash real page words so the shaker can refill itself from the page.
    if (pageWordBank.length < 6000) {
      for (const word of txt.split(/\s+/)) {
        const clean = word.replace(/[^\p{L}\p{N}]/gu, '');
        if (clean.length >= 2) pageWordBank.push(clean);
      }
    }
    const frag = document.createDocumentFragment();
    for (const ch of txt) {
      if (/\s/.test(ch)) {
        frag.appendChild(document.createTextNode(ch));
      } else {
        const span = document.createElement('span');
        span.className = LETTER_CLASS;
        span.textContent = ch;
        frag.appendChild(span);
      }
    }
    t.parentNode.replaceChild(frag, t);
  }
}

function refreshLetterFoods() {
  // Re-scan all letter-spans on the page; build food entries from visible ones.
  letterEntries.length = 0;
  const spans = document.querySelectorAll('.' + LETTER_CLASS);
  for (const span of spans) {
    if (span.classList.contains('eaten')) continue;
    const r = span.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const food = {
      id: nextFoodId++,
      x: r.left + r.width/2,
      y: r.top + r.height/2,
      span,
    };
    letterEntries.push({ span, food });
    foods.push(food);
  }
}

// ─── gait helpers (per-worm) ─────────────────────────────────────────
function setForwardGait(w, drive = 1.0) {
  w.F.setAVA(0); w.F.setAVB(drive); w.F.setSRA(0); w.F.setSRB(-1);
  w.currentGait = 'forward';
}
function setBackwardGait(w, drive = 1.0) {
  w.F.setAVA(drive); w.F.setAVB(0); w.F.setSRA(168); w.F.setSRB(0);
  w.currentGait = 'backward';
}
function applyMoodToSim(w) {
  if (!w.pet.alive) { w.F.setAVA(0); w.F.setAVB(0); return; }
  const hungry = w.pet.energy < 40, starving = w.pet.energy < 15;
  setForwardGait(w, starving ? 0.3 : (hungry ? 1.0 : 0.7));
}

// ─── chemotaxis (per frame) ──────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function chemotaxisTick(w, headVp, refVp, headPhi) {
  const now = Date.now();
  // Dead worms can be moved around but they don't eat.
  if (!w.pet.alive) return;
  // Being carried: the worm is off the page (dangling from the cursor), so it
  // neither steers nor eats. Skip everything below.
  if (w === draggingWorm) { w.F.setTurn(0); return; }
  // Eat anything within mouth radius (in viewport pixels). Every food — page
  // letter or sprinkled letter — is a single letter that fades out via the shared
  // .eaten rule, so a multi-letter sprinkle is eaten one letter at a time.
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    const dx = f.x - headVp.x, dy = f.y - headVp.y;
    if (Math.sqrt(dx*dx + dy*dy) >= EATING_R) continue;
    if (f.span) {
      f.span.classList.add('eaten');    // fade out, same as regular page letters
      if (f.sprinkled) {
        liveGrains = Math.max(0, liveGrains - 1);
        // Remove the grain clump only once all of its letters have been eaten,
        // so the remaining letters keep their place (no re-centering).
        if (f.grain && --f.grain.remaining <= 0) {
          const el = f.grain.el;
          setTimeout(() => el.remove(), 400);
        }
      }
    }
    if (w.pet.gutPellets.length < 6) {
      w.pet.gutPellets.push({ id: nextPelletId++, progress: 0, born: now });
    }
    w.pet.lastFed = now;
    foods.splice(i, 1);
  }
  if (now < w.pirouette.suppressUntil) return;

  // Find nearest food in viewport-px detection radius
  let nearest = null, nd = DETECT_R;
  for (const f of foods) {
    const dx = f.x - headVp.x, dy = f.y - headVp.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d < nd) { nearest = { f, d, dx, dy }; nd = d; }
  }

  if (nearest) {
    const hxR = headVp.x - refVp.x, hyR = headVp.y - refVp.y;
    const hMag = Math.sqrt(hxR*hxR + hyR*hyR) || 1;
    const hx = hxR/hMag, hy = hyR/hMag;
    const dxD = Math.cos(headPhi), dyD = Math.sin(headPhi);
    const fMag = nearest.d || 1;
    const fx = nearest.dx/fMag, fy = nearest.dy/fMag;
    const forwardAlign = fx*hx + fy*hy;
    const dorsalAlign = fx*dxD + fy*dyD;

    // Wider steering arc: try to omega-turn whenever food isn't directly
    // behind us. Only fall back to pirouette for the truly-behind case.
    if (forwardAlign > -0.6) {
      const nextX = w.body[1 + 3*1], nextY = w.body[2 + 3*1];
      const headWX = w.body[1], headWY = w.body[2];
      const headCurv = (nextX - headWX)*dxD + (nextY - headWY)*dyD;
      const desiredSign = Math.sign(dorsalAlign);
      const phaseAligned = Math.sign(headCurv) === desiredSign;
      const offAxis = clamp(1 - forwardAlign, 0, 1.6);
      // Cap raised 0.6 → 0.95 so the worm can actually curl back on itself.
      const baseMag = clamp(Math.abs(dorsalAlign) * offAxis * 1.0, 0, 0.95);
      const turn = phaseAligned ? desiredSign * baseMag : 0;
      w.F.setTurn(turn);
      // Slow forward drive during deep curls so the rotation lands instead
      // of getting carried through by ahead-momentum. baseMag > 0.6 ≈ omega.
      const drive = forwardAlign > 0.5 ? 1.2
                  : baseMag > 0.6     ? 0.45
                  :                     0.85;
      setForwardGait(w, drive);
    } else if (now - w.pirouette.lastPirouette > 5000) {
      w.pirouette.lastPirouette = now;
      w.pirouette.suppressUntil = now + 3200;
      w.F.setTurn(0); setBackwardGait(w, 1.5);
      setTimeout(() => { if (w.pet.alive) { setForwardGait(w, 0.9); w.F.setTurn(0); } }, 3000);
    } else {
      w.F.setTurn(0); setForwardGait(w, 0.7);
    }
  } else {
    w.F.setTurn(0); applyMoodToSim(w);
  }
}

// ─── slow tick: per-worm digestion, energy, expulsion ────────────────
setInterval(() => {
  for (const w of worms) {
    if (!w.pet.alive) continue;
    w.pet.energy = Math.max(0, w.pet.energy - 0.05);
    w.pet.happiness = Math.max(0, w.pet.happiness - 0.03);
    const expelled = [];
    for (const p of w.pet.gutPellets) {
      p.progress += 1 / TRANSIT_SECONDS;
      w.pet.energy = Math.min(100, w.pet.energy + ENERGY_PER_PELLET / TRANSIT_SECONDS);
      if (p.progress >= 1.0) expelled.push(p);
    }
    for (const p of expelled) {
      w.pet.gutPellets = w.pet.gutPellets.filter(q => q !== p);
      if (w.lastTailVp) {
        poops.push({
          id: nextPoopId++,
          x: w.lastTailVp.x + (Math.random()-0.5)*8,
          y: w.lastTailVp.y + (Math.random()-0.5)*8,
          born: Date.now(),
        });
        if (poops.length > 30) poops.shift();
      }
    }
    w.pet.ageSeconds = (Date.now() - w.pet.bornAt) / 1000;
    if (w.pet.energy <= 0) w.pet.alive = false;
  }
  refreshPanel();
}, 1000);

// ─── poke (per-worm) ─────────────────────────────────────────────────
function poke(w) {
  if (!w.pet.alive) return;
  w.pet.happiness = Math.max(0, w.pet.happiness - 5);
  w.pet.lastPoked = Date.now();
  w.pirouette.suppressUntil = Date.now() + 3500;
  setBackwardGait(w, 2.2);
  w.F.setTurn(0.9);
  setTimeout(() => w.F.setTurn(-0.9), 130);
  setTimeout(() => w.F.setTurn(0.9),  260);
  setTimeout(() => w.F.setTurn(-0.9), 390);
  setTimeout(() => w.F.setTurn(0.9),  520);
  setTimeout(() => w.F.setTurn(0),    600);
  setTimeout(() => setBackwardGait(w, 1.2), 600);
  setTimeout(() => { if (w.pet.alive) { setForwardGait(w, 0.8); w.F.setTurn(0); } }, 2500);
  w.flashAt = performance.now();
}

// ─── frederico control panel: one pill per worm, each expands to its stats ──
function moodOf(w) {
  if (!w.pet.alive) return { name: 'dead', color: '#5a6d74' };
  if (w.pet.energy < 15) return { name: 'starving', color: '#e05a3c' };
  if (w.pet.energy < 40) return { name: 'hungry', color: '#e8a24e' };
  return { name: 'content', color: '#5ce1c6' };
}

function expandHtml(w) {
  const dead = !w.pet.alive;
  const ageH = (w.pet.ageSeconds / 3600).toFixed(2);
  const mood = moodOf(w).name;
  const cleanDisabled = poops.length === 0 && !worms.some(x => !x.pet.alive);
  return `
    <div class="fexpand">
      <div class="fstats">
        <div>state: ${mood}${dead ? ` (age ${ageH}h)` : ''}</div>
        <div>energy: ${bar(w.pet.energy, '#5ce1c6')}</div>
        <div>happy:&nbsp; ${bar(w.pet.happiness, '#e8a24e')}</div>
        <div>gut:&nbsp;&nbsp;&nbsp; ${gutTubeHtml(w.pet.gutPellets)} ${w.pet.gutPellets.length}</div>
        <div>poops:&nbsp; ${poops.length}</div>
        <div>age:&nbsp;&nbsp;&nbsp; ${ageH}h</div>
      </div>
      <div class="frow">
        <button data-act="pet"   ${dead ? 'disabled' : ''} class="fbtn">pet</button>
        <button data-act="poke"  ${dead ? 'disabled' : ''} class="fbtn">poke</button>
        <button data-act="clean" ${cleanDisabled ? 'disabled' : ''} class="fbtn">clean</button>
      </div>
    </div>`;
}

function refreshPanel() {
  if (!worms.length) {
    card.innerHTML = `
      <div class="fworms"><button data-act="spawn" class="fpill fplus">+ spawn a worm</button></div>
      <style>${PANEL_CSS}</style>`;
    card.querySelector('[data-act="spawn"]').onclick = () => { spawnWorm(); };
    return;
  }
  if (activeWormIdx >= worms.length) activeWormIdx = 0;

  const rows = worms.map((wm, i) => {
    const open = (i === activeWormIdx && panelOpen);
    const pillStyle = `background:${wormColor(i)}${wm.pet.alive ? '' : ';opacity:.5'}`;
    const pill = `
      <button data-pill="${i}" class="fpill${open ? ' open' : ''}${wm.pet.alive ? '' : ' dead'}" style="${pillStyle}">
        <span class="fname">${wm.name}</span>
        <span class="fchev">${open ? '▾' : '▸'}</span>
      </button>`;
    return `<div class="fworm">${pill}${open ? expandHtml(wm) : ''}</div>`;
  }).join('');

  card.innerHTML = `
    <div class="fworms">${rows}
      <button data-act="spawn" class="fpill fplus" title="spawn another">+ worm</button>
    </div>
    <style>${PANEL_CSS}</style>`;

  card.querySelectorAll('button[data-pill]').forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.pill;
      if (i === activeWormIdx && panelOpen) panelOpen = false;   // collapse
      else { activeWormIdx = i; panelOpen = true; }              // open this one
      refreshPanel();
    };
  });
  card.querySelectorAll('button[data-act]').forEach(b => {
    b.onclick = () => {
      const act = b.dataset.act;
      const aw = worms[activeWormIdx];
      if (act === 'pet' && aw && aw.pet.alive) {
        aw.pet.happiness = Math.min(100, aw.pet.happiness + 15);
      } else if (act === 'poke' && aw) {
        poke(aw);
      } else if (act === 'clean') {
        const c = poops.length; poops = [];
        if (aw && aw.pet.alive && c > 0) aw.pet.happiness = Math.min(100, aw.pet.happiness + Math.min(20, c*3));
        // Sweep dead worms.
        const survivors = [];
        for (const wm of worms) {
          if (wm.pet.alive) { survivors.push(wm); continue; }
          wm.bodyGroup.remove();
          if (draggingWorm === wm) {
            draggingWorm = null;
            document.body.style.cursor = feedMode ? 'copy' : '';
          }
        }
        worms.length = 0;
        worms.push(...survivors);
        worms.forEach((wm, i) => { assignIdentity(wm, i); });
        if (activeWormIdx >= worms.length) activeWormIdx = Math.max(0, worms.length - 1);
      } else if (act === 'spawn') {
        spawnWorm();
      }
      refreshPanel();
    };
  });
}

const PANEL_CSS = `
  .fworms { display:flex; flex-direction:column; gap:5px; align-items:flex-end; }
  .fworm { display:flex; flex-direction:column; align-items:flex-end; }
  /* the pill IS the coloured name chip — no dark container around it */
  .fpill { display:inline-flex; align-items:center; gap:10px; cursor:pointer; border:none;
    border-radius:7px; padding:2px 9px; color:#142a33;
    font-family:'Instrument Serif',serif; font-size:15px; line-height:1.4;
    box-shadow:0 4px 12px -6px rgba(0,0,0,0.55); transition: filter .15s; }
  .fpill:hover { filter: brightness(1.08); }
  .fpill.open { width:100%; border-bottom-left-radius:0; border-bottom-right-radius:0;
    box-shadow:none; }
  .fpill.dead { text-decoration: line-through; }
  .fname { flex:0 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .fchev { margin-left:auto; font-size:10px; opacity:.65; }
  .fpill.fplus { background:rgba(18,38,46,0.96); color:#9fb0b5;
    font-family:ui-monospace,monospace; font-size:11px; padding:5px 12px; }
  .fexpand { width:100%; background:#12262e; border:1px solid #1e3a47; border-top:none;
    border-radius:0 0 8px 8px; padding:9px 11px; margin-top:-1px;
    display:flex; flex-direction:column; gap:9px; }
  .fstats { font-family: ui-monospace, monospace; font-size:11px; line-height:1.7; }
  .frow { display:flex; gap:5px; flex-wrap:wrap; }
  .fbtn { background:#1c3a45; color:#f0e9d9; border:1px solid #1e3a47;
    padding:4px 9px; border-radius:6px; cursor:pointer;
    font-family:ui-monospace,monospace; font-size:11px; }
  .fbtn:disabled { background:#142a33; color:#5a6d74; cursor:not-allowed; }
`;

function bar(v, color) {
  const W = 80;
  const w = clamp(v, 0, 100);
  return `<span style="display:inline-block;width:${W}px;height:6px;background:#0d1f26;border-radius:3px;overflow:hidden;vertical-align:middle"><span style="display:block;width:${w}%;height:100%;background:${color}"></span></span> ${w.toFixed(0)}`;
}
function gutTubeHtml(pellets) {
  const W = 80, H = 8;
  const dots = pellets.map(p => {
    const x = 4 + clamp(p.progress, 0, 1) * (W - 8);
    return `<circle cx="${x}" cy="${H/2}" r="2.5" fill="#a78a64" />`;
  }).join('');
  return `<svg width="${W}" height="${H}" style="vertical-align:middle"><rect width="${W}" height="${H}" rx="${H/2}" fill="#0d1f26"/>${dots}</svg>`;
}

// Mousedown on a worm grabs him (poke + drag-start). Off-body in feed mode
// sprinkles. Drag = grab a body point; the rest of the worm hangs off the
// cursor like a length of rope (see the pick-up physics below).
document.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  if (e.target.closest('button, input, [data-frederico-ui]')) return;
  let minD = Infinity, minWorm = null, minIdx = 0;
  for (const w of worms) {
    if (!w.lastBodyVp) continue;
    for (let i = 0; i < w.lastBodyVp.length; i++) {
      const dx = w.lastBodyVp[i].x - e.clientX, dy = w.lastBodyVp[i].y - e.clientY;
      const d = dx*dx + dy*dy;
      if (d < minD) { minD = d; minWorm = w; minIdx = i; }
    }
  }
  if (minD < 28*28 && minWorm) {
    draggingWorm = minWorm;
    dragTarget = { x: e.clientX, y: e.clientY };
    startRope(minWorm, minIdx, e.clientX, e.clientY);  // grab a point; the body dangles from it
    activeWormIdx = worms.indexOf(minWorm);
    panelOpen = true;   // grabbing a worm expands his pill
    refreshPanel();
    poke(minWorm); // startle reflex when grabbed (no-op if dead)
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  } else if (feedMode || e.shiftKey) {
    // Begin a continuous pour. Immediate burst so a tap still feeds; the pour
    // interval keeps the stream going while the button stays down.
    pouring = true;
    pourPos = { x: e.clientX, y: e.clientY };
    sprinkleBurst(e.clientX, e.clientY, 3);
    e.preventDefault();
  }
});

window.addEventListener('mousemove', (e) => {
  if (draggingWorm) dragTarget = { x: e.clientX, y: e.clientY };
  if (pouring) pourPos = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => {
  if (draggingWorm) {
    releaseRope(draggingWorm);   // resume swimming from where the rope left off
    draggingWorm = null;
    document.body.style.cursor = feedMode ? 'copy' : '';
  }
  if (pouring) { pouring = false; refreshBottleUI(); }
});

// ─── pick-up physics ────────────────────────────────────────────────────────
// While a worm is held it stops swimming and drapes over the cursor as an ARCH,
// hanging off the clicked point. The arch is a SPRING ATTRACTOR, not a fixed
// position: each body point is a mass pulled toward its spot on an ideal arch
// (apex at the cursor, curving down to dangling ends), while gravity and its own
// momentum make it swing. Damping bleeds the swing away. So it holds an arch but
// swings like a real pendulum when you carry it, instead of snapping rigidly.
const ROPE_GRAV = 0.30;     // downward pull (px/frame^2) — gives it weight & swing
const ROPE_DAMP = 0.84;     // velocity kept each frame (lower = swing decays faster)
const ARCH_SPRING = 0.05;   // pull toward the arch shape (higher = stiffer/faster arch, less swing)
const ROPE_ITERS = 60;      // distance-constraint passes per frame (higher = less stretch)
const ARCH_CURVE = 0.32;    // fraction of each arm spent curving from horizontal (apex) to vertical; the rest dangles straight down. Smaller = tighter hump + more dangle.
const SETTLE_MS = 480;      // set-down: how long the arch morphs back into the swimming pose

function startRope(w, grabIdx, tx, ty) {
  const src = w.lastBodyVp;
  if (!src || !src.length) { w.rope = null; return; }
  const n = src.length;
  const pts = new Array(n), prev = new Array(n), len = new Array(n - 1);
  for (let i = 0; i < n; i++) {
    pts[i] = { x: src[i].x, y: src[i].y };
    prev[i] = { x: src[i].x, y: src[i].y };
  }
  for (let i = 0; i < n - 1; i++) {
    len[i] = Math.hypot(src[i+1].x - src[i].x, src[i+1].y - src[i].y) || 1;
  }
  // Pin the point the user actually clicked to the cursor; each arm then drapes
  // into the arch curve from there (the two arms can be different lengths).
  w.grabIdx = Math.min(Math.max(grabIdx | 0, 0), n - 1);
  w.rope = { pts, prev, len };
  w.settle = null;                             // re-grabbing cancels any in-progress set-down
  pts[w.grabIdx].x = prev[w.grabIdx].x = tx;   // pin the clicked point to the cursor
  pts[w.grabIdx].y = prev[w.grabIdx].y = ty;
}

function updateRope(w, tx, ty) {
  const r = w.rope; if (!r) return null;
  const { pts, prev, len } = r, g = w.grabIdx, n = pts.length;

  // Where each point "wants" to be: an ideal arch anchored at the cursor.
  const tgt = r.tgt || (r.tgt = Array.from({ length: n }, () => ({ x: 0, y: 0 })));
  buildArchTargets(tgt, len, g, n, tx, ty);

  // Damped-spring Verlet: velocity carries momentum (→ swing), a spring pulls each
  // point toward its arch spot (→ holds the arch), gravity gives it weight. Because
  // the arch is a spring force rather than a hard position, the body overshoots and
  // oscillates around it — a real pendulum swing — then damping settles it.
  for (let i = 0; i < n; i++) {
    if (i === g) continue;
    const p = pts[i], pr = prev[i], t = tgt[i];
    const vx = (p.x - pr.x) * ROPE_DAMP, vy = (p.y - pr.y) * ROPE_DAMP;
    pr.x = p.x; pr.y = p.y;
    p.x += vx + (t.x - p.x) * ARCH_SPRING;
    p.y += vy + (t.y - p.y) * ARCH_SPRING + ROPE_GRAV;
  }
  pts[g].x = tx; pts[g].y = ty; prev[g].x = tx; prev[g].y = ty;

  // Distance constraints — keep every segment at its rest length (no stretch).
  for (let it = 0; it < ROPE_ITERS; it++) {
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i], b = pts[i+1];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-6;
      const diff = (d - len[i]) / d;
      const invA = i === g ? 0 : 1, invB = i + 1 === g ? 0 : 1;
      const sum = invA + invB; if (!sum) continue;
      const scA = invA / sum, scB = invB / sum;
      a.x += dx * diff * scA; a.y += dy * diff * scA;
      b.x -= dx * diff * scB; b.y -= dy * diff * scB;
    }
  }
  return pts;
}

// Fill tgt[] with the ideal arch anchored at the cursor: apex at the pinned point,
// each arm curving from horizontal down to straight-down (dangling) — the shape the
// spring pulls the body toward.
function buildArchTargets(tgt, len, g, n, ax, ay) {
  tgt[g].x = ax; tgt[g].y = ay;
  fillArchArm(tgt, len, g, +1, n, ax, ay);   // apex -> tail
  fillArchArm(tgt, len, g, -1, n, ax, ay);   // apex -> head
}

// One arm of the arch target. Walking outward from the apex, each segment's angle
// ramps from horizontal to straight-down over the first ARCH_CURVE fraction of the
// arm, then STAYS vertical so the rest dangles. Capping at 90° keeps the tips from
// curling back up and inward into a circle.
function fillArchArm(tgt, len, g, step, n, ax, ay) {
  const last = step > 0 ? n - 1 : 0;
  if (g === last) return;
  const arm = step > 0 ? (n - 1 - g) : g;   // segment count in this arm
  let px = ax, py = ay, k = 0;
  for (let i = g; i !== last; i += step) {
    const j = i + step;
    const li = step > 0 ? i : i - 1;          // rest length of segment (i, j)
    k++;
    const ang = Math.min(1, (k / arm) / ARCH_CURVE) * (Math.PI / 2);
    px += (step > 0 ? 1 : -1) * Math.cos(ang) * len[li];
    py += Math.sin(ang) * len[li];            // +y is downward on screen
    tgt[j].x = px; tgt[j].y = py;
  }
}

// On release, anchor worldOffset so the worm keeps rendering exactly where the
// rope left it (no lurch), then hand control back to his own locomotion.
function releaseRope(w) {
  if (w.rope && w.lastBodyVp) {
    const S = SCALE * 1000;
    let xMin=Infinity,xMax=-Infinity,yMin=Infinity,yMax=-Infinity;
    for (let i = 0; i < N; i++) {
      const x = w.body[1+3*i], y = w.body[2+3*i];
      if (x<xMin) xMin=x; if (x>xMax) xMax=x; if (y<yMin) yMin=y; if (y>yMax) yMax=y;
    }
    const cx = (xMin+xMax)/2, cy = (yMin+yMax)/2;
    const head = w.lastBodyVp[0];
    w.worldOffset.x = head.x - (w.body[1] - cx) * S;
    w.worldOffset.y = head.y - (w.body[2] - cy) * S;
    w.lastCxCy = { cx, cy };
    // Freeze the arch shape and morph it back into the swimming pose over
    // SETTLE_MS, so setting him down eases out the same way picking him up eases in.
    w.settle = { from: w.lastBodyVp.map(p => ({ x: p.x, y: p.y })), start: performance.now() };
  }
  w.rope = null;
}

// ─── render loop ──────────────────────────────────────────────────────
let lastWall = performance.now(), lastChemo = 0, lastEvap = 0;

// Tick speed: how many seconds of sim per second of wall clock.
// Mobile defaults lower so phones don't roast.
const isMobile = window.matchMedia?.('(pointer: coarse)').matches
  || /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
const TICK_SPEED = isMobile ? 1.6 : 2.4;
const MAX_STEPS_PER_FRAME = isMobile ? 10 : 24;

function loop() {
  const now = performance.now();
  const dt = Math.min(0.1, (now - lastWall) / 1000);
  lastWall = now;
  const physicsActive = !document.hidden;

  // Step physics for every worm independently. Each worm respects its own
  // alive state — dead worms freeze where they were last positioned.
  for (const w of worms) {
    if (physicsActive && w.pet.alive) {
      w.simAcc += dt * TICK_SPEED;
      let stepsThisFrame = 0;
      while (w.simAcc >= StepSize && stepsThisFrame < MAX_STEPS_PER_FRAME) {
        w.F.stepWorm();
        w.simAcc -= StepSize;
        stepsThisFrame++;
      }
    } else {
      w.simAcc = 0;
    }
  }

  // (Drag is handled inline in the per-worm render branch below.)

  // Trail evaporation (shared canvas, ticks once per second).
  if (now - lastEvap > 1000) {
    lastEvap = now;
    trailCtx.save();
    trailCtx.globalCompositeOperation = 'source-atop';
    trailCtx.fillStyle = trailColorString(CRUST_SLIME, CRUST_RATE);
    trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height);
    trailCtx.restore();
  }

  trailCtx.globalCompositeOperation = 'source-over';
  trailCtx.strokeStyle = trailColorString();
  trailCtx.lineWidth = 3;
  trailCtx.lineCap = 'round'; trailCtx.lineJoin = 'round';

  const sy = window.scrollY;
  const doChemo = now - lastChemo > 33;
  if (doChemo) lastChemo = now;
  const margin = 80;

  for (const w of worms) {
    // Centroid in worm-meters.
    let xMin=Infinity, xMax=-Infinity, yMin=Infinity, yMax=-Infinity;
    for (let i = 0; i < N; i++) {
      const x = w.body[1+3*i], y = w.body[2+3*i];
      if (x<xMin) xMin=x; if (x>xMax) xMax=x;
      if (y<yMin) yMin=y; if (y>yMax) yMax=y;
    }
    const cx = (xMin+xMax)/2, cy = (yMin+yMax)/2;
    if (!w.initialized) { w.lastCxCy = { cx, cy }; w.initialized = true; }

    let vp;
    if (w === draggingWorm && w.rope) {
      // Picked up: he stops swimming and hangs off the cursor like a rope. The
      // Verlet chain drives every body point directly (viewport pixels).
      const rp = updateRope(w, dragTarget.x, dragTarget.y);
      vp = rp.map(p => ({ x: p.x, y: p.y }));
      w.lastCxCy = { cx, cy };
    } else {
      // Normal: worldOffset follows the worm's centroid drift so swimming
      // visibly translates him across the page.
      const dxc = cx - w.lastCxCy.cx, dyc = cy - w.lastCxCy.cy;
      w.worldOffset.x += dxc * SCALE * 1000;
      w.worldOffset.y += dyc * SCALE * 1000;
      // Wrap around the viewport so he doesn't disappear.
      if (w.worldOffset.x < -margin) w.worldOffset.x = window.innerWidth + margin;
      if (w.worldOffset.x > window.innerWidth + margin) w.worldOffset.x = -margin;
      if (w.worldOffset.y < -margin) w.worldOffset.y = window.innerHeight + margin;
      if (w.worldOffset.y > window.innerHeight + margin) w.worldOffset.y = -margin;
      w.lastCxCy = { cx, cy };
      vp = [];
      for (let i = 0; i < N; i++) {
        vp.push({
          x: (w.body[1+3*i] - cx) * SCALE * 1000 + w.worldOffset.x,
          y: (w.body[2+3*i] - cy) * SCALE * 1000 + w.worldOffset.y,
        });
      }
      // Just set down: blend from the frozen arch shape into the live swimming
      // pose so the worm relaxes out of the arch instead of snapping wormy.
      if (w.settle) {
        const e = Math.min(1, (now - w.settle.start) / SETTLE_MS);
        const s = e * e * (3 - 2 * e);   // smoothstep
        const from = w.settle.from;
        for (let i = 0; i < N; i++) {
          vp[i].x = from[i].x + (vp[i].x - from[i].x) * s;
          vp[i].y = from[i].y + (vp[i].y - from[i].y) * s;
        }
        if (e >= 1) w.settle = null;
      }
    }
    w.lastBodyVp = vp;
    w.lastTailVp = vp[N-1];

    if (doChemo) {
      chemotaxisTick(w, vp[0], vp[Math.min(5, N-1)], w.body[3]);
    }

    // Each worm keeps its own identity hue; mood only drains the saturation
    // (grey when dead / starving), so colours stay distinct between worms.
    const dead = !w.pet.alive;
    const baseHue = w.hue;
    const baseSat = dead ? 0 : w.pet.energy<15?42:w.pet.energy<40?60:72;
    for (let i = 0; i < w.bodySegs.length; i++) {
      const t01 = i/(N-1);
      const light = 58 - t01*14;
      w.bodySegs[i].setAttribute('stroke', `hsl(${baseHue + t01*12}, ${baseSat}%, ${light}%)`);
      w.bodySegs[i].setAttribute('x1', vp[i].x);
      w.bodySegs[i].setAttribute('y1', vp[i].y);
      w.bodySegs[i].setAttribute('x2', vp[i+1].x);
      w.bodySegs[i].setAttribute('y2', vp[i+1].y);
    }
    w.headDot.setAttribute('cx', vp[0].x);
    w.headDot.setAttribute('cy', vp[0].y);

    // Trail — every worm leaves slime, except one you're holding (it's off the
    // ground, dangling from the cursor, so it shouldn't smear the page).
    if (w !== draggingWorm) {
      trailCtx.beginPath();
      trailCtx.moveTo(vp[0].x, vp[0].y + sy);
      for (let i = 1; i < vp.length; i++) {
        trailCtx.lineTo(vp[i].x, vp[i].y + sy);
      }
      trailCtx.stroke();
    }

    // Flash on poke (per worm).
    const flashAge = now - w.flashAt;
    if (flashAge < 600 && w.flashAt > 0) {
      const a = 1 - flashAge/600;
      w.flashRing.setAttribute('cx', vp[0].x);
      w.flashRing.setAttribute('cy', vp[0].y);
      w.flashRing.setAttribute('r', 8 + flashAge*0.08);
      w.flashRing.setAttribute('stroke', `rgba(255,80,60,${a*0.7})`);
      w.flashRing.setAttribute('stroke-width', 2*a + 1);
    } else {
      w.flashRing.setAttribute('stroke', 'rgba(0,0,0,0)');
    }
  }

  // Poops (shared, all worms contribute via digestion).
  if (poopsGroup.parentNode) svg.removeChild(poopsGroup);
  poopsGroup.innerHTML = '';
  for (const p of poops) {
    const c = document.createElementNS(svgNS, 'ellipse');
    c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
    c.setAttribute('rx', 3.2); c.setAttribute('ry', 2.2);
    c.setAttribute('fill', '#5a4632');
    c.setAttribute('stroke', '#3d2f22');
    c.setAttribute('stroke-width', 0.6);
    c.setAttribute('transform', `rotate(${p.id*40} ${p.x} ${p.y})`);
    poopsGroup.appendChild(c);
  }
  svg.appendChild(poopsGroup);

  requestAnimationFrame(loop);
}

const poopsGroup = document.createElementNS(svgNS, 'g');
svg.appendChild(poopsGroup);

// Anchor Frederico to the document (not the viewport). When the user scrolls,
// shift his world offset, manual food, and poop positions by -dy so they
// stay pinned to their place on the page. Letter foods get their viewport
// position re-read because their DOM elements scroll with the page.
let lastScrollY = window.scrollY;
let scrollSyncPending = false;
function onScroll() {
  const dy = window.scrollY - lastScrollY;
  if (dy === 0) return;
  for (const w of worms) {
    w.worldOffset.y -= dy;
    if (w.lastTailVp) w.lastTailVp = { x: w.lastTailVp.x, y: w.lastTailVp.y - dy };
  }
  for (const f of foods) {
    if (!f.span) f.y -= dy;
  }
  for (const p of poops) p.y -= dy;
  lastScrollY = window.scrollY;
  if (!scrollSyncPending) {
    scrollSyncPending = true;
    requestAnimationFrame(() => {
      scrollSyncPending = false;
      for (const f of foods) {
        if (f.span) {
          const r = f.span.getBoundingClientRect();
          f.x = r.left + r.width/2;
          f.y = r.top + r.height/2;
        }
      }
    });
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  // Content reflowed — recompute letter food positions from scratch.
  foods = foods.filter(f => !f.span);
  refreshLetterFoods();
  lastScrollY = window.scrollY;
});


// ─── bottle: paste clipboard, sprinkle 1-3 char chunks onto the page ──
function sliceForBottle(text) {
  const chunks = [];
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    let i = 0;
    while (i < word.length) {
      const remaining = word.length - i;
      const size = Math.min(remaining, 1 + Math.floor(Math.random() * 3));
      chunks.push(word.slice(i, i + size));
      i += size;
    }
  }
  return chunks;
}

// Refill the shaker from real page words (falls back to random letters on a
// page with almost no text). Tops the bottle up to `target` chunks.
function refillBottleFromPage(target = pileCap) {
  if (bottle.length >= target) return;
  if (pageWordBank.length) {
    let guard = 0;
    while (bottle.length < target && guard++ < target * 4) {
      const w = pageWordBank[Math.floor(Math.random() * pageWordBank.length)];
      bottle.push(...sliceForBottle(w));
    }
  } else {
    const az = 'abcdefghijklmnopqrstuvwxyz';
    while (bottle.length < target) bottle.push(az[Math.floor(Math.random() * 26)]);
  }
}

// Each sprinkled grain gets a random look — like real candy sprinkles. Colours
// are mid-tone and saturated so they read on both light and dark pages (no
// near-white/near-black that would vanish on one of them).
const GRAIN_FONTS = [
  'Georgia, serif',
  '"Times New Roman", Times, serif',
  'Palatino, "Palatino Linotype", "Book Antiqua", serif',
  'Helvetica, Arial, sans-serif',
  'Verdana, Geneva, sans-serif',
  'Tahoma, sans-serif',
  '"Trebuchet MS", sans-serif',
  '"Courier New", Courier, monospace',
  '"Comic Sans MS", "Comic Sans", cursive',
  '"Brush Script MT", "Segoe Script", cursive',
  'Impact, Haettenschweiler, sans-serif',
];
const GRAIN_COLORS = [
  '#e8a24e', // amber
  '#f2c14e', // gold
  '#ff8c42', // orange
  '#e5544b', // red
  '#e86ca4', // pink
  '#c77dff', // violet
  '#5aa9e6', // sky
  '#3ec9a7', // teal
  '#7ec850', // green
  '#ff6f91', // coral
];
const pickGrain = (arr) => arr[(Math.random() * arr.length) | 0];

// Spawn ONE grain: pop a chunk and drop it below the cursor as a little clump of
// letters. The clump is one absolutely-positioned element so it tumbles in as a
// unit, but each LETTER inside is its own <span class="frederico-letter"> — exactly
// like the letters already on the page. So the worm eats them one at a time, each
// fades out via the shared .eaten rule, and nothing re-centers. Returns false when
// there's nothing to pour or the page is already saturated with letters.
function spawnGrain(clientX, clientY) {
  if (liveGrains >= MAX_LIVE_GRAINS) return false;
  if (!bottle.length) return false;
  const chunk = bottle.shift();
  const docX = clientX + window.scrollX;
  const docY = clientY + window.scrollY;
  const dx = (Math.random() - 0.5) * 140;    // wide horizontal scatter
  const dy = 6 + Math.random() * 80;         // grains fall below the shaker
  const r0 = (Math.random() - 0.5) * 90;     // initial tumble
  const r1 = (Math.random() - 0.5) * 26;     // resting tilt
  const font = pickGrain(GRAIN_FONTS);       // every grain a different sprinkle
  const color = pickGrain(GRAIN_COLORS);
  const italic = Math.random() < 0.35 ? 'italic' : 'normal';
  const weight = Math.random() < 0.45 ? '700' : '400';
  const size = 13 + Math.random() * 12;

  const clump = document.createElement('span');
  clump.className = 'frederico-sprinkle';
  clump.style.cssText = `
    position: absolute;
    left: ${docX + dx}px;
    top: ${docY + dy}px;
    font-family: ${font};
    font-size: ${size}px;
    font-style: ${italic};
    font-weight: ${weight};
    color: ${color};
    text-shadow: 0 1px 1px rgba(0,0,0,0.28);
    pointer-events: none;
    z-index: 999997;
    white-space: nowrap;
  `;
  clump.style.setProperty('--r0', r0 + 'deg');
  clump.style.setProperty('--r1', r1 + 'deg');
  const letterEls = [];
  for (const ch of chunk) {
    const ls = document.createElement('span');
    ls.className = LETTER_CLASS;
    ls.textContent = ch;
    clump.appendChild(ls);
    letterEls.push(ls);
  }
  document.body.appendChild(clump);

  // Register each letter as its own food at its resting viewport centre. offset*
  // are layout metrics unaffected by the tumble transform, and the clump's visual
  // centre is (clientX+dx, clientY+dy) via the animation's translate(-50%,-50%).
  const cw = clump.offsetWidth, ch2 = clump.offsetHeight;
  const cxv = clientX + dx, cyv = clientY + dy;
  const grain = { el: clump, remaining: letterEls.length };
  for (const ls of letterEls) {
    foods.push({
      id: nextFoodId++,
      x: cxv - cw / 2 + ls.offsetLeft + ls.offsetWidth / 2,
      y: cyv - ch2 / 2 + ls.offsetTop + ls.offsetHeight / 2,
      span: ls,
      sprinkled: true,
      grain,
    });
  }
  liveGrains += letterEls.length;
  return true;
}

// A quick tap drops a little burst; holding pours continuously (see the pour
// interval below).
function sprinkleBurst(clientX, clientY, n = 3) {
  for (let i = 0; i < n; i++) if (!spawnGrain(clientX, clientY)) break;
  refreshBottleUI();
}

// Pour engine: while the button is held in pour mode, emit grains from the
// current cursor position until the shaker runs dry.
setInterval(() => {
  if (!pouring) return;
  if (spawnGrain(pourPos.x, pourPos.y)) refreshBottleUI();
}, POUR_INTERVAL);

// ─── corner sprinkler: the letters pile up INSIDE the real silhouette of the
// 🧂 glyph. We rasterize the emoji, read its alpha edges, and use that shape
// both as a CSS mask (grains are clipped to the glyph) and as a set of settle
// points (each letter lands on a real inside-the-glyph spot, filling bottom-up
// and draining from the top as you pour) ─────────────────────────────────────
const SHAKER_EMOJI = '🧂';

// Rasterize the emoji and carve it into layers: the shaker glyph sits BEHIND
// the letters, and the top LID_FRAC is the lid (no letters intrude there), so
// the letters read as piled inside the shaker's body.
// Returns:
//   glyphURL   – the full color emoji, drawn behind the letters (the container).
//   bodyMaskURL– the glyph alpha with the lid erased; masks the letters to the
//                body only, so the lid stays clear.
//   points     – bottom→top settle spots inside the body.
// `ok:false` if the platform drew no glyph (no emoji font) → plain-jar fallback.
const LID_FRAC = 0.30;   // top share of the glyph treated as the lid
function computeShakerShape(size = 116) {
  const S = 160;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.font = `${Math.floor(S * 0.86)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif`;
  cx.fillText(SHAKER_EMOJI, S / 2, S / 2 + S * 0.03);
  const data = cx.getImageData(0, 0, S, S).data;

  // Vertical extent of the opaque glyph → where the lid ends and body begins.
  let miny = S, maxy = 0;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (data[(y * S + x) * 4 + 3] > 140) { if (y < miny) miny = y; maxy = y; break; }
    }
  }
  const lidCut = miny + (maxy - miny) * LID_FRAC;

  // Settle points: interior of the BODY only (below the lid).
  const scale = size / S;
  const STEP = 13;
  const pts = [];
  for (let y = STEP / 2; y < S; y += STEP) {
    if (y < lidCut) continue;
    for (let x = STEP / 2; x < S; x += STEP) {
      if (data[((y | 0) * S + (x | 0)) * 4 + 3] > 140) pts.push({ x: x * scale, y: y * scale, cy: y });
    }
  }
  pts.sort((a, b) => b.cy - a.cy);   // bottom first → fill upward, drain top

  const glyphURL = cv.toDataURL('image/png');

  // Body mask = glyph alpha with the lid region cleared (letters stay in body).
  const bm = document.createElement('canvas');
  bm.width = bm.height = S;
  const bctx = bm.getContext('2d');
  bctx.drawImage(cv, 0, 0);
  bctx.clearRect(0, 0, S, Math.ceil(lidCut));
  const bodyMaskURL = bm.toDataURL('image/png');

  return { ok: pts.length >= 6, points: pts, size, glyphURL, bodyMaskURL };
}

// Fallback settle points (a rounded jar) when no emoji glyph is available.
function jarPoints(size, n = PILE_MAX) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const spread = (size * 0.34) * (1 - t * 0.55);
    pts.push({
      x: size / 2 + (Math.random() - 0.5) * 2 * spread,
      y: size - 10 - t * (size * 0.72),
      cy: -i,
    });
  }
  return pts;
}

let bottleUIRefs = null;
function buildBottleUI() {
  const shape = computeShakerShape(116);
  const points = shape.ok ? shape.points : jarPoints(shape.size);
  pileCap = points.length;

  const wrap = document.createElement('div');
  wrap.dataset.fredericoUi = 'bottle';
  wrap.style.cssText = `
    position: fixed; bottom: 16px; right: 16px; z-index: 1000000;
    pointer-events: auto; color: #f0e9d9;
    font-family: ui-monospace, monospace; font-size: 11px;
    display: flex; flex-direction: row-reverse; align-items: flex-end; gap: 10px;
    transform: translateZ(0);   /* own compositing layer: no scroll ghosting */
  `;
  wrap.innerHTML = `
    <div class="fs-col">
      <div class="fs-jar muted ${shape.ok ? '' : 'fs-fallback'}" data-fs-jar
           title="click to wake the sprinkler, then drag on the page to sprinkle">
        <div class="fs-glyph" data-fs-glyph></div>
        <div class="fs-grains" data-fs-grains></div>
        <div class="fs-empty" data-fs-empty>empty</div>
      </div>
      <div class="fs-tag" data-fs-tag>Feed me!</div>
      <button class="fs-refill" data-fs-refill hidden>Refill</button>
    </div>

    <style>
      [data-frederico-ui="bottle"] * { box-sizing: border-box; }
      .fs-col { display:flex; flex-direction:column-reverse; align-items:center; gap:8px; }
      .fs-jar { position:relative; align-self:center; cursor:pointer;
        transition: transform .15s, filter .2s;
        filter: drop-shadow(0 6px 10px rgba(0,0,0,0.4)); }
      .fs-jar:hover { transform: translateY(-1px) scale(1.03); }
      /* muted (asleep) until clicked */
      .fs-jar.muted { filter: grayscale(1) opacity(0.45); }
      .fs-jar.muted:hover { filter: grayscale(0.5) opacity(0.7); }
      [data-frederico-ui="bottle"].pouring .fs-jar { animation: fs-shake .34s ease-in-out infinite; }
      @keyframes fs-shake { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(6deg); } }
      /* the shaker glyph, sitting BEHIND the letters — the container itself */
      .fs-glyph { position:absolute; inset:0; background-repeat:no-repeat;
        background-position:center; background-size:contain; pointer-events:none; }
      /* letters, on top of the glyph, clipped to the BODY (below the lid) */
      .fs-grains { position:absolute; inset:0; pointer-events:none;
        -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat;
        -webkit-mask-position:center; mask-position:center;
        -webkit-mask-size:contain; mask-size:contain; }
      .fs-jar.fs-fallback { border-radius:8px 8px 16px 16px; overflow:hidden;
        border:1px solid #24424d; background:linear-gradient(rgba(92,225,198,.05), rgba(15,31,36,.55)); }
      .fs-jar.fs-fallback .fs-grains { -webkit-mask-image:none; mask-image:none; }
      .fs-grain { position:absolute; background:#e8a24e; color:#142a33; font-weight:700;
        font-size:10px; line-height:1; padding:1px 3px; border-radius:2px; white-space:nowrap;
        box-shadow:0 1px 1px rgba(0,0,0,0.3);
        transition: transform .3s cubic-bezier(.34,1.4,.64,1), opacity .3s;
        will-change: transform, opacity; }
      .fs-grain.leaving { opacity:0; }
      .fs-empty { position:absolute; inset:0; display:grid; place-items:center; color:#5a6d74;
        font-style:italic; font-size:10px; pointer-events:none; transition:opacity .2s; }

      .fs-refill { align-self:center; background:#1c3a45; color:#f0e9d9; border:1px solid #1e3a47;
        border-radius:8px; padding:5px 16px; font-family:ui-monospace,monospace; font-size:11px;
        cursor:pointer; box-shadow:0 6px 18px -10px rgba(0,0,0,0.6);
        transition: border-color .15s, color .15s; }
      .fs-refill:hover { border-color:#5ce1c6; color:#5ce1c6; }
      .fs-refill[hidden] { display:none; }
      /* "Feed me!" callout shown while the shaker is asleep */
      .fs-tag { align-self:center; position:relative; background:#e8a24e; color:#142a33;
        font-family:ui-monospace,monospace; font-weight:700; font-size:11px;
        padding:4px 11px; border-radius:999px; box-shadow:0 6px 16px -8px rgba(0,0,0,0.6);
        animation: fs-bob 1.4s ease-in-out infinite; }
      .fs-tag::before { content:""; position:absolute; bottom:-4px; left:50%; margin-left:-4px;
        border-left:4px solid transparent; border-right:4px solid transparent;
        border-top:5px solid #e8a24e; }
      .fs-tag[hidden] { display:none; }
      @keyframes fs-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-3px); } }
    </style>
  `;
  document.body.appendChild(wrap);
  wrap.appendChild(card);   // column-reverse: pills stack ABOVE the sprinkler, growing upward

  const jar      = wrap.querySelector('[data-fs-jar]');
  const glyph    = wrap.querySelector('[data-fs-glyph]');
  const grainsEl = wrap.querySelector('[data-fs-grains]');
  const emptyEl  = wrap.querySelector('[data-fs-empty]');

  const tag = wrap.querySelector('[data-fs-tag]');
  const refillBtn = wrap.querySelector('[data-fs-refill]');

  jar.style.width = shape.size + 'px';
  jar.style.height = shape.size + 'px';
  if (shape.ok) {
    glyph.style.backgroundImage = `url(${shape.glyphURL})`;
    grainsEl.style.webkitMaskImage = `url(${shape.bodyMaskURL})`;
    grainsEl.style.maskImage = `url(${shape.bodyMaskURL})`;
  }

  // Asleep by default (muted, "Feed me!" tag). Click the shaker to wake it:
  // it un-mutes, the Refill button appears, and dragging the page pours.
  const setAwake = (on) => {
    feedMode = on;
    jar.classList.toggle('muted', !on);
    tag.hidden = on;
    refillBtn.hidden = !on;
    document.body.style.cursor = on ? 'copy' : '';
  };
  jar.addEventListener('click', () => setAwake(!feedMode));
  refillBtn.addEventListener('click', () => { refillBottleFromPage(); refreshBottleUI(); });

  bottleUIRefs = { wrap, grainsEl, emptyEl, points, tiles: [] };
  refreshBottleUI();
}

// Sync the visible grains to bottle.length. Grains settle onto the glyph's
// interior points bottom-up; pouring pops them off the top with a little fade.
function refreshBottleUI() {
  if (!bottleUIRefs) return;
  const { wrap, grainsEl, emptyEl, points, tiles } = bottleUIRefs;
  const target = Math.min(bottle.length, points.length);

  let poured = 0;   // how many grains this call is adding, for the cascade stagger
  while (tiles.length < target) {
    const i = tiles.length;
    const p = points[i];
    const rot = ((i * 73) % 40) - 20;
    const g = document.createElement('span');
    g.className = 'fs-grain';
    g.textContent = bottle[i] ? bottle[i] : '·';
    g.style.left = p.x + 'px';
    g.style.top = p.y + 'px';
    const rest = `translate(-50%,-50%) rotate(${rot}deg)`;
    // Enter from above its settle point, small and invisible, then drop in and
    // bounce home — grains rain down through the lid and pile up bottom-first.
    g.style.opacity = '0';
    g.style.transform = `translate(-50%,-230%) rotate(${rot * 1.7}deg) scale(.5)`;
    const delay = Math.min(poured, 22) * 24;   // cap the cascade on a big refill
    g.style.transitionDelay = delay + 'ms';
    grainsEl.appendChild(g);
    tiles.push(g);
    // Next paint: release to the resting spot so the transition animates the drop.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      g.style.opacity = '1';
      g.style.transform = rest;
    }));
    // Once it's settled, drop the stagger so pouring back out stays snappy.
    setTimeout(() => { g.style.transitionDelay = ''; }, delay + 340);
    poured++;
  }
  while (tiles.length > target) {
    const g = tiles.pop();
    g.classList.add('leaving');
    g.style.transitionDelay = '';   // pour out immediately, no leftover cascade delay
    g.style.transform = g.style.transform.replace(/rotate\([^)]*\)/, 'rotate(0deg)') + ' scale(.2)';
    setTimeout(() => g.remove(), 300);
  }

  emptyEl.style.opacity = bottle.length === 0 ? '1' : '0';
  wrap.classList.toggle('pouring', pouring);
}

async function spawnWorm() {
  const w = await createWorm();
  worms.push(w);
  assignIdentity(w, worms.indexOf(w));
  // If the new worm is the only living one, focus the panel on him.
  if (worms.filter(x => x.pet.alive).length === 1) activeWormIdx = worms.indexOf(w);
  refreshPanel();
}

// Boot
const firstWorm = await createWorm({
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.45,
});
worms.push(firstWorm);
assignIdentity(firstWorm, 0);
wrapLetters();
refreshLetterFoods();
buildBottleUI();
refillBottleFromPage();   // start with a jar full of this page's own words
refreshBottleUI();
refreshPanel();
requestAnimationFrame(loop);

// Expose a spawn hook so a second click of the bookmarklet (or the landing-page
// button) adds another worm instead of doing nothing.
window.__fredericoAddWorm = spawnWorm;

console.log('Frederico is alive. Tap him.');
