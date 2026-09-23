// Station: the map. Every kitchen sentence the head learned from, flattened from
// 384 dimensions to two (map.json, precomputed), and a drop zone. A dropped
// sentence is NEVER projected live: the flattening isn't faithful, so it lands
// on its nearest real example in the full space (judge.nearest), with a jitter.
import { createScreen } from "../screen.js?v=e59fd3176d3189aa58c0";

const VW = 800, VH = 500, VH_NARROW = 720, PAD = { x: 26, y: 34 };   // ~16:10 in SVG units; nearly square on a phone so the names fit
const GLIDE = 600;                                                   // ms; the article says "glides"
const NS = "http://www.w3.org/2000/svg";
// one hue per kitchen label, fixed order, stable per label. Neighbours in this
// order pass the CVD and normal-vision gates on the paper surface; the three
// pale ones (amber, pink, teal) sit under 3:1 and lean on the centroid names,
// the legend and the card for identity.
const LABELS = ["close_window", "launch_terminal", "launch_browser", "switch_workspace", "play_pause", "next_track", "mute", "volume_up", "volume_down", "screenshot", "lock_screen", "brightness_up", "set_time"];
const HUES = ["#d4573c", "#2a78d6", "#c98500", "#8c3ab0", "#1f8f4e", "#e07a9a", "#3a4a9f", "#a0522d", "#1f9e9e", "#b8336a", "#7a8a1a", "#6d5bbf", "#2f6f6f"];
const CHATTER = "#a9a59a";
const EXAMPLES = [
 ['close_window','Close the window'],['launch_terminal','Launch the terminal'],['launch_browser','Launch the browser'],['switch_workspace','Switch to workspace two'],['play_pause','Pause'],['next_track','Next song'],['mute','Mute'],['volume_up','Volume up'],['volume_down','Volume down'],['screenshot','Take a screenshot'],['lock_screen','Lock the screen'],['brightness_up','Make the screen brighter'],['set_time','Set the time to 3:45'],['none',"There’s banana bread for you"]
];

const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace(/"/g, "&quot;");
const hue = label => { const i = LABELS.indexOf(label); return i < 0 ? CHATTER : HUES[i]; };
const pct = v => `${Math.round((v ?? 0) * 100)}%`;
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const fold = s => s.trim().toLowerCase().replace(/[’']/g, "'");
// a stable jitter: the same sentence lands in the same spot every time
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const svg = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };

export async function mount(el, ctx) {
  const data = await ctx.data("map");
  const pts = data.points;
  const traps = data.traps || [];
  const judge = ctx.judge || null;
  const live = () => judge?.status === "ready";
  const reduced = () => ctx.prefersReducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches;

  // data → SVG units. The axes are arbitrary (a linear flattening), so each is
  // scaled to fill its side; y is flipped so "up" is up. vh changes on a phone.
  let vh = VH;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const sx = x => PAD.x + ((x - x0) / (x1 - x0)) * (VW - 2 * PAD.x);
  const sy = y => vh - PAD.y - ((y - y0) / (y1 - y0)) * (vh - 2 * PAD.y);
  const byText = new Map(pts.map(p => [fold(p.text), p]));
  const nKitchen = pts.filter(p => p.label !== "none").length;

  el.innerHTML = `
    <div class="st-head">${esc(el.dataset.title || "the map")} <span class="st-note">${nKitchen} commands · ${pts.length - nKitchen} chatter</span></div>
    <p class="st-intro">Live on your device · Similar words can ask for different things. Choose an example below, or use the bottom bar to say or type “close the window,” then “do not close the window.”</p>
    <div class="map-plot">
      <div class="map-row">
      <svg class="map-svg" viewBox="0 0 ${VW} ${VH}" width="100%" role="img" aria-label="Scatter of the training sentences, coloured by label, with a name at each cluster's centre.">
        <rect class="map-bg" x="0" y="0" width="${VW}" height="${VH}" rx="8"/>
        <g class="pts"></g>
        <g class="leads"></g>
        <g class="cents"></g>
        <g class="drops"></g>
      </svg>
      <div class="map-screen-wrap" aria-live="polite">
        <svg class="map-screen" viewBox="0 0 150 124" role="img" aria-label="An office screen showing what the last kitchen command did."><g data-screen transform="translate(9 8)"></g></svg>
        <div class="map-screen-said"><b>the office screen</b><span data-screen-said>what the command did</span></div>
      </div>
      </div>
      <div class="map-legend map-chips" aria-label="Command examples and color legend">${EXAMPLES.map(([label,text])=>`<button type="button" class="chip" data-preset="${esc(text)}" data-voice-exact title="${esc(label==='none'?'Not a command':label.replaceAll('_',' '))}"><i aria-hidden="true" style="background:${hue(label)}"></i>${esc(text)}</button>`).join('')}<button type="button" class="chip map-clear" data-clear data-voice-exact hidden>Clear map</button></div>
    </div>
    <p class="st-caption" data-mode-note hidden></p>
    <details class="example-details"><summary data-voice-exact>How this map works</summary><p class="st-caption">This is an illustration of the training examples: two directions chosen to spread the labels apart (LDA scalings), so distances here are only roughly the distances the head uses. A new sentence is placed beside a nearby stored example, not projected into this map. Similarity is not a probability of being correct.</p></details>`;

  const q = s => el.querySelector(s);
  const svgEl = q(".map-svg"), bg = q(".map-bg"), gPts = q(".pts"), gLeads = q(".leads"), gCents = q(".cents"), gDrops = q(".drops");
  const clearBtn = q("[data-clear]");

  // ---- the base layer: every example, its label as the fill, and a native tooltip
  const dots = pts.map(p => {
    const c = svg("circle", { fill: hue(p.label), class: p.label === "none" ? "pt chatter" : "pt" });
    const t = svg("title"); t.textContent = `“${p.text}” — ${p.label === "none" ? "chatter" : p.label}`;
    c.appendChild(t);
    gPts.appendChild(c);
    return { p, c };
  });
  // centroids: a ring and a name. Names are placed by a greedy search so the
  // tight cluster in the middle doesn't pile up; placement runs in screen pixels
  // and is redone on resize (see layout).
  const cents = Object.entries(data.centroids).filter(([l]) => LABELS.includes(l)).map(([label, [x, y]]) => {
    const ring = svg("circle", { class: "cent", stroke: hue(label) });
    const text = svg("text", { class: "cent-lbl" }); text.textContent = label;
    const lead = svg("line", { class: "cent-lead", stroke: hue(label) });
    gCents.append(ring, text); gLeads.appendChild(lead);
    return { label, x, y, ring, text, lead };
  });

  // ---- drops
  const drops = [];
  let latest = null;
  const jitter = text => { const h = hash(text); return { dx: ((h & 0xff) / 255 - 0.5) * 12, dy: (((h >> 8) & 0xff) / 255 - 0.5) * 12 }; };
  // where a drop sits, in SVG units: its landing (data space) plus its jitter, kept inside the box
  const posOf = d => {
    const j = jitter(d.text);
    return { x: Math.min(VW - PAD.x, Math.max(PAD.x, sx(d.land.x) + j.dx)), y: Math.min(vh - PAD.y, Math.max(PAD.y, sy(d.land.y) + j.dy)) };
  };

  // the nearest example that is on the map (the map holds 204 of the 410); if
  // none of the top 3 are drawn, the label's centroid stands in
  async function resolve(text) {
    const [near, ask] = await Promise.all([judge.nearest(text, 3), judge.ask(text).catch(() => null)]);
    const n = near[0];
    const onMap = near.find(m => byText.has(fold(m.text)));
    const p = onMap ? byText.get(fold(onMap.text)) : null;
    const c = data.centroids[n.label];
    const land = p ? { x: p.x, y: p.y } : c ? { x: c[0], y: c[1] } : { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
    return { near: n, land, ask, label: n.label };
  }

  function makeGroup(d) {
    const g = svg("g", { class: "drop" });
    g.append(svg("line", { class: "drop-lead" }), svg("circle", { class: "drop-mark" }), svg("text", { class: "drop-lbl" }));
    const t = svg("title"); t.textContent = d.text; g.appendChild(t);
    g.querySelector("text").textContent = clip(d.text, 28);
    gDrops.appendChild(g);
    return g;
  }
  const setPos = (g, x, y) => { g.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; };

  // the sentence appears at the top of the map and glides down to its landing
  function place(d, land, provisional) {
    d.land = land;
    d.provisional = provisional;
    const g = d.g || (d.g = makeGroup(d));
    g.classList.toggle("provisional", !!provisional);
    g.querySelector(".drop-mark").setAttribute("fill", provisional ? CHATTER : hue(d.label));
    const at = posOf(d);
    styleDrop(d);
    if (!g.dataset.placed) {
      g.dataset.placed = "1";
      if (reduced()) { setPos(g, at.x, at.y); g.classList.add("landed"); return; }
      setPos(g, VW / 2, PAD.y);
      g.getBoundingClientRect();   // commit the start so the move transitions
    } else if (reduced()) { setPos(g, at.x, at.y); return; }
    g.classList.remove("landed");
    setPos(g, at.x, at.y);
    clearTimeout(d.timer);
    d.timer = setTimeout(() => g.classList.add("landed"), GLIDE + 40);
  }
  // no landing known yet: it hangs at the top until the model is in
  function hover(d) {
    const g = d.g || (d.g = makeGroup(d));
    g.classList.add("provisional", "waiting");
    g.querySelector(".drop-mark").setAttribute("fill", CHATTER);
    styleDrop(d);
    setPos(g, VW / 2, PAD.y);
  }

  async function settle(d) {
    if (d.busy || d.resolved || !live()) return;
    d.busy = true;
    try {
      const r = await resolve(d.text);
      d.result = r; d.label = r.label; d.resolved = true;
      d.g?.classList.remove("waiting");
      place(d, r.land, false);
    } catch (err) {
      if (!d.land) { d.g?.remove(); d.g = null; }   // never landed: leave nothing at the origin
      ctx.toast?.(`Couldn't place “${clip(d.text, 30)}”: ${err.message}`, "warn");
    } finally { d.busy = false; }
  }

  async function drop(text) {
    text = (text || "").trim();
    if (!text) return;
    const d = { text, resolved: false };
    drops.push(d); latest = d;
    for (const o of drops) o.g?.classList.toggle("latest", o === d);
    clearBtn.hidden = false;
    if (live()) { d.g = makeGroup(d); d.g.classList.add("latest"); await settle(d); return; }
    // no model yet: the presets have a landing precomputed for the article
    // (map.json traps); anything else waits at the top for the model
    const trap = traps.find(t => fold(t.text) === fold(text));
    if (trap) place(d, { x: trap.x, y: trap.y }, true); else hover(d);
    d.g.classList.add("latest");
    judge?.ready?.().catch(() => {});   // a drop is the page's first interaction: make sure the load has started
  }

  function clearDrops() {
    for (const d of drops) { clearTimeout(d.timer); d.g?.remove(); }
    drops.length = 0; latest = null;
    clearBtn.hidden = true;
  }

  // ---- sizes in screen pixels: the SVG scales with its box, the marks and type should not
  let u = 1;               // SVG units per CSS pixel
  let taken = [];          // the centroid names' boxes, so a drop's sentence avoids them
  const px = n => n * u;
  const overlaps = (b, boxes, pad) => boxes.some(o => !(b.x + b.w + pad < o.x || o.x + o.w + pad < b.x || b.y + b.h + pad < o.y || o.y + o.h + pad < b.y));
  const outside = b => b.x < PAD.x / 2 || b.y < 2 || b.x + b.w > VW - PAD.x / 2 || b.y + b.h > vh - 2;
  // the sentence sits beside its mark, on whichever side is free; the leader runs to it
  function styleDrop(d) {
    const g = d.g; if (!g) return;
    const at = d.land ? posOf(d) : { x: VW / 2, y: PAD.y };
    const w = px(7.2) * clip(d.text, 28).length, h = px(15);
    const cands = [[14, -22], [-w - 14, -22], [14, 8], [-w - 14, 8], [-w / 2, -30], [-w / 2, 16], [22, -40], [-w - 22, -40], [22, 26], [-w - 22, 26], [-w / 2, -50], [-w / 2, 36], [34, -60], [-w - 34, -60], [34, 44], [-w - 34, 44], [-w / 2, -72], [-w / 2, 58]]
      .map(([dx, dy]) => ({ x: at.x + px(dx), y: at.y + px(dy), w, h, dx: px(dx), dy: px(dy) }));
    const b = cands.find(b => !outside(b) && !overlaps(b, taken, px(2))) || cands.find(b => !outside(b)) || cands[0];
    const lead = g.querySelector(".drop-lead"), text = g.querySelector(".drop-lbl");
    g.querySelector(".drop-mark").setAttribute("r", px(6));
    // leader to the nearest corner of the text box
    const lx = b.dx < 0 ? b.dx + b.w : b.dx, ly = b.dy + b.h;
    lead.setAttribute("x2", lx); lead.setAttribute("y2", ly);
    text.setAttribute("x", b.dx); text.setAttribute("y", b.dy + px(11));
  }
  function layout() {
    const w = svgEl.clientWidth || VW;
    u = VW / w;
    vh = w < 560 ? VH_NARROW : VH;
    svgEl.setAttribute("viewBox", `0 0 ${VW} ${vh}`);
    bg.setAttribute("height", vh);
    svgEl.style.setProperty("--u", u);
    for (const { p, c } of dots) { c.setAttribute("cx", sx(p.x).toFixed(1)); c.setAttribute("cy", sy(p.y).toFixed(1)); c.setAttribute("r", px(3.6)); }
    // greedy: each name tries a ring of offsets around its centroid and takes
    // the first that overlaps nothing placed so far and stays inside the map
    const fs = w < 560 ? 10 : 11, H = px(fs + 4);
    svgEl.style.setProperty("--fs", fs);
    taken = [];
    for (const c of [...cents].sort((a, b) => b.y - a.y)) {
      const cx = sx(c.x), cy = sy(c.y);
      c.ring.setAttribute("cx", cx.toFixed(1)); c.ring.setAttribute("cy", cy.toFixed(1)); c.ring.setAttribute("r", px(4));
      const cw = px(fs * 0.63) * c.label.length;
      const cands = [[8, -7], [8, 5], [-cw - 8, -7], [-cw - 8, 5], [-cw / 2, -22], [-cw / 2, 12], [14, -26], [14, 20], [-cw - 14, -26], [-cw - 14, 20], [-cw / 2, -40], [-cw / 2, 30], [26, -7], [-cw - 26, -7], [30, -44], [-cw - 30, -44], [30, 38], [-cw - 30, 38], [-cw / 2, -58], [-cw / 2, 48], [40, -62], [-cw - 40, -62], [40, 56], [-cw - 40, 56], [-cw / 2, -76], [-cw / 2, 66], [50, -80], [-cw - 50, -80], [50, 74], [-cw - 50, 74]]
        .map(([dx, dy]) => ({ x: cx + px(dx), y: cy + px(dy), w: cw, h: H }));
      const b = cands.find(b => !outside(b) && !overlaps(b, taken, px(3))) || cands.find(b => !outside(b)) || cands[0];
      taken.push(b);
      c.text.setAttribute("x", b.x); c.text.setAttribute("y", b.y + px(fs));
      // a leader when the name sits away from its ring
      const mx = Math.max(b.x, Math.min(b.x + b.w, cx)), my = Math.max(b.y, Math.min(b.y + b.h, cy));
      const far = Math.hypot(mx - cx, my - cy) > px(10);
      c.lead.setAttribute("x1", cx); c.lead.setAttribute("y1", cy);
      c.lead.setAttribute("x2", mx); c.lead.setAttribute("y2", my);
      c.lead.style.display = far ? "" : "none";
    }
    for (const d of drops) {
      styleDrop(d);
      if (d.land && d.g?.classList.contains("landed")) { const at = posOf(d); setPos(d.g, at.x, at.y); }
    }
  }
  layout();
  if ("ResizeObserver" in window) new ResizeObserver(() => layout()).observe(svgEl);
  else addEventListener("resize", layout);

  // Resolve any plotted examples that arrived before the model loaded.
  function sync() { if(live()) for(const d of drops) if(!d.resolved)settle(d); }
  sync();judge?.onStatus?.(sync);
  let choosingExample=false;
  el.addEventListener('click',e=>{
    const chip=e.target.closest('[data-preset]');
    if(chip&&!choosingExample){
      choosingExample=true;const chips=el.querySelectorAll('[data-preset]');chips.forEach(b=>b.disabled=true);
      ctx.route(chip.dataset.preset).catch(err=>ctx.toast?.(err.message,'warn')).finally(()=>{choosingExample=false;chips.forEach(b=>b.disabled=false);});
    }
    if(e.target.closest('[data-clear]'))clearDrops();
  });
  // Acted commands land through their handlers; ignored/uncertain commands still
  // appear on the map while the bottom bar owns their decision details.
  ctx.onDecision?.(d=>{
    if(d.context?.station==='map'&&!d.direct&&(d.kind==='kitchen'||d.action?.choice==='none')&&!(d.ran&&LABELS.includes(d.action?.choice)))drop(d.text);
  });

  // ---- the office screen: a kitchen command lands on the map AND does its thing
  const screen = createScreen(q("[data-screen]"));
  const saidEl = q("[data-screen-said]");
  function applyScreen(action, slots) {
    const said = screen.apply(action, slots);
    if (said == null) return null;
    saidEl.textContent = said;
    saidEl.classList.remove("highlight-flash"); void saidEl.offsetWidth; saidEl.classList.add("highlight-flash");
    return said;
  }

  // ---- commands: the twelve kitchen actions drop whatever was said, then act on the screen
  const commands = { reset_station: () => { clearDrops(); screen.reset(); saidEl.textContent = "what the command did"; } };
  for (const l of LABELS) commands[l] = (slots, utterance) => { drop(utterance); applyScreen(l, slots); };

  return { commands, applyScreen, examples:[
    {text:'close the window',action:'close_window',try:true},
    {text:'do not close the window',try:true},
    {text:'make the screen brighter',action:'brightness_up',try:true},
  ] };
}
