// Button physics — the singularity-ui feel without the glass. Same
// model and sign conventions as the engine's HoverTilt + PressIndent:
// hover tilts in the cursor's direction of travel and settles slowly
// when it stops; press rocks toward the press point and sinks; release
// springs back. Pure CSS transforms, no engine.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // deg per px/frame of cursor velocity, clamps, press pose, sink scale
  const TUNE = {
    chip: { strength: 0.55, maxTilt: 8, pressTilt: 6, pressScale: 0.965 },
    card: { strength: 0.22, maxTilt: 3.2, pressTilt: 2.4, pressScale: 0.988 },
    // Engine parity: HoverTilt strength 0.02 rad/px = 1.146°, clamp
    // 0.22 rad = 12.6°; PressIndent maxTilt 0.4 rad = 22.9°, scale 0.94.
    thumb: { strength: 1.146, maxTilt: 12.6, pressTilt: 22.9, pressScale: 0.94 },
  };
  // ATTACK/SETTLE mirror HoverTilt; PRESS_EASE/RELEASE mirror PressIndent
  const ATTACK = 0.18, SETTLE = 0.045, PRESS_EASE = 0.5, RELEASE = 0.12;
  const clamp = (v, m) => v < -m ? -m : v > m ? m : v;

  const states = new Map();
  for (const el of document.querySelectorAll('.g-cta, .g-chip, .g-card, .ribbon figure, .topoco-gallery a')) {
    const t = el.classList.contains('g-card') ? TUNE.card
      : el.matches('.ribbon figure, .topoco-gallery a') ? TUNE.thumb
      : TUNE.chip;
    const s = { t, rx: 0, ry: 0, sc: 1, pressed: false };
    el.addEventListener('pointerdown', () => { s.pressed = true; });
    states.set(el, s);
  }
  // Elements that graduate to real engine glass hand their motion over
  window.__physicsDrop = (el) => {
    el.style.transform = '';
    el.style.removeProperty('--shi');
    el.style.removeProperty('--shx');
    states.delete(el);
  };
  addEventListener('pointerup', () => { for (const s of states.values()) s.pressed = false; });
  addEventListener('pointercancel', () => { for (const s of states.values()) s.pressed = false; });

  // Links native-drag a ghost of themselves on press-and-move, stealing
  // the gesture from the physics. Kill it for buttons, cards, and their
  // glass clones (which carry the same classes).
  document.addEventListener('dragstart', (e) => {
    if (e.target.closest && e.target.closest('.g, .g-card, .g-chip, .g-cta, .ribbon figure, .topoco-gallery a')) e.preventDefault();
  }, true);

  // Smoothed cursor velocity, engine-style
  let px = -1, py = -1, lx = -1, ly = -1, vx = 0, vy = 0;
  addEventListener('pointermove', (e) => {
    if (lx >= 0) {
      vx += (e.clientX - lx - vx) * 0.15;
      vy += (e.clientY - ly - vy) * 0.15;
    }
    px = lx = e.clientX;
    py = ly = e.clientY;
  }, { passive: true });

  // Debug window into the closure (harmless in production)
  window.__phys = { states, cursor: () => ({ px, py, vx, vy }) };
  function frame() {
    // Same velocity decay as the engine's PointerTracker
    vx *= 0.92;
    vy *= 0.92;
    for (const [el, s] of states) try {
      const r = el.getBoundingClientRect();
      const inside = px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
      // CSS axes: rotateY(+) dips the right edge away; rotateX(−) dips
      // the bottom edge away (y points down). Leading edge dips.
      let tx = 0, ty = 0, tsc = 1, ease = SETTLE;
      if (s.pressed) {
        const dxn = clamp((px - (r.left + r.width / 2)) / (r.width / 2), 1);
        const dyn = clamp((py - (r.top + r.height / 2)) / (r.height / 2), 1);
        ty = dxn * s.t.pressTilt;
        tx = -dyn * s.t.pressTilt;
        tsc = s.t.pressScale;
        ease = PRESS_EASE;
      } else if (Math.abs(s.sc - 1) > 0.003) {
        // Recovering from a press: PressIndent springs back at its own
        // release rate, faster than the hover settle
        ease = RELEASE;
      } else if (inside) {
        ty = clamp(vx * s.t.strength, s.t.maxTilt);
        tx = clamp(-vy * s.t.strength, s.t.maxTilt);
        if (Math.abs(vx) + Math.abs(vy) > 0.5) ease = ATTACK;
      }
      s.rx += (tx - s.rx) * ease;
      s.ry += (ty - s.ry) * ease;
      s.sc += (tsc - s.sc) * ease;
      if (Math.abs(s.rx) < 0.005 && Math.abs(s.ry) < 0.005 && Math.abs(s.sc - 1) < 0.0005) {
        if (el.style.transform) {
          el.style.transform = '';
          el.style.removeProperty('--shi');
          el.style.removeProperty('--shx');
          el.style.removeProperty('--dm');
        }
        continue;
      }
      el.style.transform =
        `perspective(700px) rotateX(${s.rx.toFixed(3)}deg) rotateY(${s.ry.toFixed(3)}deg) scale(${s.sc.toFixed(4)})`;
      // Same shading model as the engine's shade(): facing =
      // −rx·3.2 − ry·2.2 in three.js radians. In CSS degrees (CSS
      // rotateX is the mirror of three.js rotation.x) that's
      // +0.056·rx − 0.038·ry: tip up or toward the window (left) →
      // brighten; down or away → dim.
      const facing = 0.056 * s.rx - 0.038 * s.ry;
      el.style.setProperty('--shi', Math.min(1, Math.max(0, facing)).toFixed(3));
      el.style.setProperty('--dm', Math.min(1, Math.max(0, -facing)).toFixed(3));
      // Engine buttons keep their glint band static; only the cards
      // (never engine glass) slide it
      if (s.t !== TUNE.thumb) el.style.setProperty('--shx', (s.ry * -2.5).toFixed(2) + '%');
    } catch (e) {
      // One bad element must not kill the whole physics loop
      console.error('physics frame:', e);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
