// The judge: my 2023 idea, upgraded. An embedding from the worker, a linear
// head from data/head.<rung>.json (W·x + b, softmax) for the action, a second
// row for "addressed", hyprvoice's band policy, a small kNN memory of taught
// corrections, and cheap deterministic slots. The head and the example index
// belong to a rung: switching rungs swaps the head and re-embeds everything.

import { loadRegistry, rungById, defaultRung } from "./models.js?v=8ee67d2c3612bfccb49e";
import { EngineClient } from "../ui/worker-client.js?v=8ee67d2c3612bfccb49e";

export const POLICY = {
  actAddressed: 0.75, actConf: 0.35, askAddressed: 0.5, askConfLo: 0.15,
  // a page action (scroll, go to a section, a station control) is harmless and
  // undoable, so it runs on a smaller margin: with 30 labels the winner's lead
  // is small even when it is clear ("scroll down" wins at 0.37 vs 0.10).
  // Kitchen actions keep hyprvoice's line — those are the ones that cost something.
  page: { actAddressed: 0.6, actConf: 0.15 },
};
// On this page a kitchen command only moves a drawing of a screen, so it runs on
// the page line too; `strictBandFor` is what hyprvoice's line would have said,
// and the bar shows both when they differ — that gap is the article's point.
export function bandFor(addressed, confidence, kind = "none") {
  if (addressed < POLICY.askAddressed) return "ignore";
  const P = kind === "page" || kind === "kitchen" ? { ...POLICY, ...POLICY.page } : POLICY;
  if (addressed >= P.actAddressed && confidence >= P.actConf) return "act";
  if (addressed >= POLICY.askAddressed || (confidence >= POLICY.askConfLo && confidence < P.actConf)) return "ask";
  return "ignore";
}
// the page line, as a knob: what a spoken sentence needs before it runs here.
// hyprvoice's own line (POLICY.actAddressed / actConf) stays fixed for comparison.
const POLICY_KEY = "jev.policy";
export function setPolicy({ actConf, actAddressed } = {}) {
  if (typeof actConf === "number") POLICY.page.actConf = Math.max(0, Math.min(1, actConf));
  if (typeof actAddressed === "number") POLICY.page.actAddressed = Math.max(POLICY.askAddressed, Math.min(1, actAddressed));
  try { localStorage.setItem(POLICY_KEY, JSON.stringify(POLICY.page)); } catch { /* fine */ }
  return { ...POLICY.page };
}
export function getPolicy() { return { ...POLICY.page, strict: { actConf: POLICY.actConf, actAddressed: POLICY.actAddressed } }; }
try { const saved = JSON.parse(localStorage.getItem(POLICY_KEY) || "null"); if (saved) setPolicy(saved); } catch { /* fine */ }

export function strictBandFor(addressed, confidence) {
  if (addressed < POLICY.askAddressed) return "ignore";
  if (addressed >= POLICY.actAddressed && confidence >= POLICY.actConf) return "act";
  if (addressed >= POLICY.askAddressed || (confidence >= POLICY.askConfLo && confidence < POLICY.actConf)) return "ask";
  return "ignore";
}
// a taught example counts only when the sentence is nearly the same one: bge-small
// puts "scroll down" 0.90 from "scroll to the top" and 0.93 from "scroll up", so
// anything looser lets one correction bleed into its neighbours (seen 2026-09-20)
const FAMILY = { volume_up: "volume", volume_down: "volume" };
export const KNN = { sim: 0.95, blend: 0.4 };   // probs = 0.6*probs + 0.4*onehot(taught label)
// the floor for the section slot; a rung's registry entry overrides it (bge-small
// 0.75: it scores unrelated text 0.55–0.67, so the contract's 0.55 would send
// "scroll down" to a section; MiniLM keeps 0.55). Measured 2026-09-20.
export const SECTION_SIM = 0.55;
export const RUNG_KEY = "jev.rung", TAUGHT_KEY = "jev.taught";

// where "go to …" can land: section ids and station mount ids, with the ways
// the article names them. Embedded once per rung, matched by cosine.
export const SECTIONS = {
  "st-submarine": ["the submarine", "submarine", "the expedition", "the game", "reef expedition"],
  "intro": ["intro", "the introduction", "the top of the article", "a model that doesn't write"],
  "how-it-works": ["my solution", "how it works", "how mine works", "the tool picker", "the 2023 tool picker"],
  "lineup-comparison": ["the lineup", "lineup", "competitors", "the models", "the cast", "the speed comparison", "speed", "response times", "timings"],
  "methods": ["the methods", "methods", "methodology", "limitations", "how I tested"],
  "comparison": ["results", "full test results", "compare the methods", "the scoreboard", "scoreboard", "coverage", "the coverage table"],
  "expedition": ["what am I trying to prove", "the command demo", "the office demo"],
  "fit": ["fit the solution", "your project"],
  "conclusion": ["conclusion", "the conclusion", "the end"],
  "st-map": ["the map", "map"],
  "st-support": ["support", "the support desk", "support desk", "customer service", "the customer service router"],
};

// ---- slots: cheap and deterministic ----------------------------------------------
const ONES = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

// first 0–100 in digits or words: "40", "40%", "0.4", ".4" → 40, "forty", "fifty five",
// "point four", "point 4", "a hundred". A fraction of one is a share (0.4 → 40);
// anything else rounds, so "1.5" never leaks a fraction into a slot.
export function parseNumber(text) {
  const w = String(text).toLowerCase().replace(/[^a-z0-9.%\s-]/g, " ").split(/[\s-]+/).filter(Boolean);
  for (let i = 0; i < w.length; i++) {
    const t = w[i], n = w[i + 1];
    const m = t.match(/^(\d*\.\d+|\d+)%?$/);
    if (m) { let v = Number(m[1]); if (t.includes(".") && v <= 1) v *= 100; v = Math.round(v); if (v >= 0 && v <= 100) return v; continue; }
    if (t === "hundred") return 100;
    if (t === "point") { const d = n in ONES ? ONES[n] : /^\d$/.test(n || "") ? Number(n) : -1; if (d >= 0 && d < 10) return d * 10; continue; }
    if (t in ONES && n === "point") continue;            // "zero point four": let "point" carry it
    if (t in TENS) return TENS[t] + (n in ONES && ONES[n] < 10 ? ONES[n] : 0);
    if (t in ONES) return n === "hundred" ? 100 : ONES[t];
  }
  return undefined;
}

// "set the time to 3:45", "quarter past ten", "10 pm", "noon": a clock time, or
// nothing. Hours 1–12 (or 0–23 with no am/pm), minutes 0–59; anything else is
// not a time — the screen says so rather than guessing.
const HOUR_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const MIN_WORDS = { "o'clock": 0, oclock: 0, fifteen: 15, thirty: 30, "forty-five": 45, "forty five": 45 };
export function parseTime(text) {
  const t = String(text).toLowerCase().replace(/[.,!?]/g, " ").replace(/\s+/g, " ").trim();
  if (/\bnoon\b/.test(t)) return { h: 12, m: 0, ampm: "pm", text: "12:00 pm" };
  if (/\bmidnight\b/.test(t)) return { h: 12, m: 0, ampm: "am", text: "12:00 am" };
  const ampmOf = m => (m ? (m[0] === "a" ? "am" : "pm") : null);
  const fmt = (h, m, ampm) => { if (m < 0 || m > 59) return null; if (ampm) { if (h < 1 || h > 12) return null; } else if (h > 23) return null; else if (h > 12) { h -= 12; ampm = "pm"; } else if (h === 0) { h = 12; ampm = "am"; }
    return { h, m, ampm, text: `${h}:${String(m).padStart(2, "0")}${ampm ? " " + ampm : ""}` }; };
  let m;
  if ((m = t.match(/\b(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)?\b/))) return fmt(Number(m[1]), Number(m[2]), ampmOf(m[3]));
  if ((m = t.match(/\b(\d{1,2})\s*(a\.?m\.?|p\.?m\.?)\b/))) return fmt(Number(m[1]), 0, ampmOf(m[2]));
  if ((m = t.match(/\b(quarter|half)\s+(past|after|to|till|before)\s+(\d{1,2}|[a-z]+)\b(?:\s*(am|pm))?/))) {
    const h0 = HOUR_WORDS[m[3]] ?? Number(m[3]); if (!Number.isFinite(h0)) return null;
    const mins = m[1] === "half" ? 30 : 15, back = m[2] === "to" || m[2] === "till" || m[2] === "before";
    return fmt(back ? (h0 === 1 ? 12 : h0 - 1) : h0, back ? 60 - mins : mins, m[4] || null);
  }
  if ((m = t.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b(?:\s+(o'clock|oclock|fifteen|thirty|forty-five|forty five))?(?:\s*(am|pm))?/))) {
    if (!/\b(time|clock|o'clock|oclock|am|pm|past|to)\b/.test(t) && !m[2]) return null;   // "ten" alone is not a time
    return fmt(HOUR_WORDS[m[1]], m[2] ? MIN_WORDS[m[2]] : 0, m[3] || null);
  }
  if (/\b(time|clock)\b/.test(t) && (m = t.match(/\b(\d{1,2})\b/))) return fmt(Number(m[1]), 0, null);
  return null;
}

export function parseDirection(text) {
  const t = String(text).toLowerCase();
  if (/\b(up|upward|upwards|higher|raise|increase)\b/.test(t)) return "up";
  if (/\b(down|downward|downwards|lower|decrease|reduce)\b/.test(t)) return "down";
  return undefined;
}

const MODELS = [
  [/\b(?:my|the) head\b|\bhead\b/, "head"], [/\bjev\b/, "jev"], [/\bvon\b/, "von"], [/\blaya\b/, "laya"],
  [/\bdecider(?:[ -]?2b)?\b/, "decider"], [/\bnli\b/, "nli"], [/\bsmall model\b|\bqwen\S*|\bllm\b/, "llm"],
];
// the first model named, by position in the sentence
export function parseModel(text) {
  const t = String(text).toLowerCase();
  let best = null;
  for (const [re, id] of MODELS) { const m = re.exec(t); if (m && (!best || m.index < best.at)) best = { at: m.index, id }; }
  return best?.id;
}

// ---- vector math on normalized Float32Arrays ---------------------------------------
const dot = (a, b, off = 0) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[off + i]; return s; };
function softmax(z) { const m = Math.max(...z); const e = z.map(v => Math.exp(v - m)); const s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); }
const sigmoid = v => 1 / (1 + Math.exp(-v));

export function createJudge({ registry = null, client = null, rungId = null, base = new URL("../", import.meta.url) } = {}) {
  client = client || new EngineClient();
  const listeners = { status: new Set(), decision: new Set() };
  let status = "idle", progress = null, error = null;
  let reg = registry, rung = null, head = null;           // the ACTIVE rung and its head
  let index = null, examples = [], aliases = [];          // example vectors (n*dim) and section alias vectors
  let loading = null, gen = 0;                            // the load in flight; gen changes on cancel
  let disposed = false, loadController = null;
  const cancelledError = () => new Error('Model loading was cancelled. Refresh the page to load models again.');
  const waiters = [];                                     // ready() callers
  const cache = new Map();                                // text -> vector, for the active rung
  let taught = [], taughtVecs = new Map();
  try { taught = JSON.parse(localStorage.getItem(TAUGHT_KEY) || "[]").filter(t => t && t.text && t.label); } catch { /* none */ }

  const notify = () => { const s = { status, progress, error, rung: rung?.id ?? null }; for (const cb of listeners.status) { try { cb(s); } catch { /* listener's problem */ } } };
  const setStatus = (s, extra = {}) => { status = s; if ("progress" in extra) progress = extra.progress; error = extra.error ?? null; notify(); };

  const registryReady = async () => (reg ||= await loadRegistry(new URL("engine/registry.json?v=8ee67d2c3612bfccb49e", base)));
  const preferred = async () => {
    const r = await registryReady();
    let id = rungId;
    if (!id) { try { id = localStorage.getItem(RUNG_KEY); } catch { /* ignore */ } }
    return (id && r.rungs.find(x => x.id === id)) || defaultRung(r);
  };

  // embed with the worker for a given rung; the cache is only for the active one
  async function embedWith(r, texts) {
    const res = await client.embed(r, texts);
    if (res.cancelled) throw new Error("cancelled");
    return res;
  }
  async function embedMany(texts) {
    if (!rung) throw new Error("judge not ready");
    const out = new Array(texts.length), miss = [];
    texts.forEach((t, i) => { const v = cache.get(t); if (v) out[i] = v; else miss.push(i); });
    if (miss.length) {
      const res = await embedWith(rung, miss.map(i => texts[i]));
      miss.forEach((i, k) => { const v = res.data.subarray(k * res.dim, (k + 1) * res.dim); out[i] = v; cache.set(texts[i], v); });
      while (cache.size > 400) cache.delete(cache.keys().next().value);   // the map station drops a lot of sentences
    }
    return out;
  }

  // load a rung: its head, the model in the worker, then the example index and
  // the section aliases through the model. Cancel kills the worker, so every
  // await afterwards checks it is still the same attempt.
  async function load(target, hooks = {}) {
    if (disposed) throw cancelledError();
    const r0 = await registryReady();
    if (disposed) throw cancelledError();
    const next = typeof target === "string" ? rungById(r0, target) : target;
    if (loading) cancel();
    const my = ++gen;
    const controller = new AbortController();
    loadController = controller;
    const stale = () => my !== gen;
    setStatus("loading", { progress: { phase: "download", loaded: 0, total: next.bytes, pct: 0 } });
    const job = (async () => {
      const res = await fetch(new URL(next.head, base), { signal: controller.signal });
      if (!res.ok) throw new Error(`head: HTTP ${res.status}`);
      const h = await res.json();
      if (stale()) return { cancelled: true };
      const loaded = await client.load(next, { onProgress: p => {
        if (stale()) return;
        progress = { phase: "download", file: p.file, loaded: p.all.loaded, total: p.all.total, pct: p.all.pct };
        notify(); hooks.onProgress?.(progress);
      } });
      if (stale() || loaded?.cancelled) return { cancelled: true };
      // warm: the example index in chunks, then the aliases
      const texts = h.examples.map(e => e.text);
      const vecs = new Float32Array(texts.length * h.dim);
      for (let i = 0; i < texts.length; i += 64) {
        const part = await embedWith(next, texts.slice(i, i + 64));
        if (stale()) return { cancelled: true };
        vecs.set(part.data, i * h.dim);
        progress = { phase: "warm", loaded: Math.min(texts.length, i + 64), total: texts.length, pct: Math.round(100 * Math.min(texts.length, i + 64) / texts.length) };
        notify(); hooks.onProgress?.(progress);
      }
      const names = Object.entries(SECTIONS).flatMap(([id, list]) => list.map(text => ({ id, text })));
      const al = await embedWith(next, names.map(n => n.text));
      if (stale()) return { cancelled: true };
      rung = next; head = h; examples = h.examples; index = vecs;
      aliases = names.map((n, k) => ({ ...n, vec: al.data.subarray(k * al.dim, (k + 1) * al.dim) }));
      cache.clear(); taughtVecs = new Map();
      try { localStorage.setItem(RUNG_KEY, rung.id); } catch { /* ignore */ }
      loading = null;
      setStatus("ready", { progress: null });
      for (const w of waiters.splice(0)) w.resolve();
      return { rung: rung.id, info: loaded };
    })();
    loading = job;
    try { return await job; }
    catch (err) {
      if (stale()) return { cancelled: true };
      loading = null;
      setStatus("error", { error: err.message, progress: null });
      for (const w of waiters.splice(0)) w.reject(err);
      throw err;
    }
  }

  // the worker dies with whatever it had: nothing is loaded afterwards
  function cancel() {
    if (disposed) return;
    gen++;
    loadController?.abort(); loadController = null;
    loading = null;
    client.restart();
    rung = null; head = null; index = null; aliases = []; cache.clear(); taughtVecs = new Map();
    setStatus("idle", { progress: null });
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    gen++;
    loadController?.abort(); loadController = null;
    loading = null;
    client.dispose();
    rung = null; head = null; index = null; aliases = []; cache.clear(); taughtVecs = new Map();
    setStatus('cancelled', { progress: null });
    for (const waiter of waiters.splice(0)) waiter.reject(cancelledError());
  }

  // resolves once a model is in (this load or a later one); starts the
  // preferred rung if nothing is loading. Rejects only when a load fails.
  function ready() {
    if (disposed) return Promise.reject(cancelledError());
    if (status === "ready") return Promise.resolve();
    if (!loading) preferred().then(r => load(r)).catch(() => { /* reported through status */ });
    return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
  }

  async function embed(text) { if (disposed) throw cancelledError(); if (loading) await loading.catch(() => {}); if (disposed) throw cancelledError(); return (await embedMany([String(text)]))[0]; }

  function topK(x, k) {
    const n = examples.length, dim = head.dim, sims = new Float32Array(n);
    for (let i = 0; i < n; i++) sims[i] = dot(x, index, i * dim);
    const order = [...sims.keys()].sort((a, b) => sims[b] - sims[a]).slice(0, k);
    return order.map(i => ({ text: examples[i].text, label: examples[i].label, sim: sims[i] }));
  }

  async function nearest(text, k = 3) { const x = await embed(text); return topK(x, k); }

  // taught vectors are embedded on first use after a teach or a rung change
  async function taughtIndex() {
    const miss = taught.filter(t => !taughtVecs.has(t.text));
    if (miss.length) { const v = await embedMany(miss.map(t => t.text)); miss.forEach((t, i) => taughtVecs.set(t.text, v[i])); }
    return taught.map(t => ({ ...t, vec: taughtVecs.get(t.text) }));
  }

  function slotsFor(text, x) {
    const slots = {};
    const number = parseNumber(text), direction = parseDirection(text), model = parseModel(text);
    if (number !== undefined) slots.number = number;
    const time = parseTime(text); if (time) slots.time = time; else if (/\b(time|clock)\b/.test(text)) slots.time = null;   // null: asked for a time, gave none valid
    if (direction) slots.direction = direction;
    if (model) slots.model = model;
    let best = null;
    for (const a of aliases) { const s = dot(x, a.vec); if (!best || s > best.sim) best = { id: a.id, text: a.text, sim: s }; }
    if (best && best.sim >= (rung.sectionSim ?? SECTION_SIM)) slots.section = best.id;
    slots.sectionSim = best ? Math.round(best.sim * 1000) / 1000 : 0;   // for the parity page and the bar's detail
    return slots;
  }


  // the head, on one vector; allowed = actions the router permits here ("none"
  // is always in play), zeroed and renormalized before the band is read
  async function judge(text, allowed = null) {
    const t0 = performance.now();
    if (loading) await loading.catch(() => {});
    if (status !== "ready") throw new Error("judge not ready");
    const x = await embed(text);
    const { classes, W, b, kind } = head.action;
    let probs = softmax(W.map((row, i) => dot(x, row) + b[i]));
    const mem = await taughtIndex();
    let remembered = null;
    for (const m of mem) { const s = dot(x, m.vec); if (s >= KNN.sim && (!remembered || s > remembered.sim)) remembered = { ...m, sim: s }; }
    if (remembered) probs = probs.map((p, i) => (1 - KNN.blend) * p + (classes[i] === remembered.label ? KNN.blend : 0));
    // a mask removes options from ACTING, not from competing: the winner is the
    // best allowed label, but its margin is measured against every label, so a
    // sentence whose real pick lives off screen comes out as doubt (and the
    // router says where it lives) rather than as the best of what is left
    const order = [...probs.keys()].sort((i, j) => probs[j] - probs[i]);
    const ok = i => !allowed || allowed.has(classes[i]) || classes[i] === "none";
    const best = order.find(ok) ?? order[0];
    const choice = classes[best];
    const slots = slotsFor(text, x);
    const rival = order.find(i => i !== best);
    let confidence = Math.max(0, probs[best] - (rival !== undefined ? probs[rival] : 0));   // 0 when the favourite is off screen
    // "turn it up to 50" / "volume 30 percent": with a number, up and down are the
    // same act (set to N), so the head's split between them is not doubt — judge
    // the family as one option against the rest
    if (slots.number !== undefined && FAMILY[choice]) {
      const fam = FAMILY[choice];
      const famP = classes.reduce((acc, c, i) => acc + (FAMILY[c] === fam ? probs[i] : 0), 0);
      const other = Math.max(0, ...classes.map((c, i) => (FAMILY[c] === fam ? 0 : probs[i])));
      confidence = famP - other;
    }
    const addressed = sigmoid(dot(x, head.addressed.W) + head.addressed.b);
    const result = {
      text, rung: rung.id, addressed,
      action: { choice, probs: Object.fromEntries(classes.map((c, i) => [c, probs[i]])), confidence, top: order.slice(0, 3).map(i => [classes[i], probs[i]]), offScreen: best !== order[0] ? classes[order[0]] : null },
      band: bandFor(addressed, confidence, kind[choice] || "none"), strictBand: strictBandFor(addressed, confidence), kind: kind[choice] || "none",
      slots, nearest: topK(x, 3),
      remembered: remembered ? { text: remembered.text, label: remembered.label, sim: remembered.sim } : null,
      masked: !!allowed, ms: Math.round(performance.now() - t0),
    };
    for (const cb of listeners.decision) { try { cb(result); } catch { /* listener's problem */ } }
    return result;
  }

  const saveTaught = () => { try { localStorage.setItem(TAUGHT_KEY, JSON.stringify(taught)); } catch { /* ignore */ } };

  return {
    client,
    kindOf: label => head?.action?.kind?.[label] || "none",
    get status() { return status; },
    get progress() { return progress; },
    get error() { return error; },
    get rung() { return rung; },
    get head() { return head; },
    get registry() { return reg; },
    get taught() { return taught.slice(); },
    onStatus(cb) { listeners.status.add(cb); return () => listeners.status.delete(cb); },
    onDecision(cb) { listeners.decision.add(cb); return () => listeners.decision.delete(cb); },
    loadRegistry: registryReady, preferred,
    ready, load, cancel, dispose,
    ask: text => judge(String(text)),
    askMasked: (text, allowed) => judge(String(text), allowed instanceof Set ? allowed : new Set(allowed)),
    embed, nearest, setPolicy, getPolicy,
    async embedFresh(texts) {
      if (status !== "ready") throw new Error("Local model is not ready");
      const active = rung, res = await embedWith(active, texts);
      if (rung !== active || status !== "ready") throw new Error("Model changed; try again");
      return texts.map((_, i) => res.data.slice(i * res.dim, (i + 1) * res.dim));
    },
    teach(text, label) {
      text = String(text).trim(); if (!text || !label) return;
      taught = taught.filter(t => t.text !== text); taught.push({ text, label }); saveTaught();
    },
    forget() { taught = []; taughtVecs = new Map(); saveTaught(); },
  };
}
