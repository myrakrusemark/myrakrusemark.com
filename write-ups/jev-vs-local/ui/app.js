// Boot: registry, hardware probe, a judge and independent speech worker, the
// router and the bar, then every station in its own try/catch. The model
// loads on arrival from a card that shrinks to a pill, the way /watermark/
// does it; nothing a station does waits on the model.

// errors are collected from the first line so the autotest can report them
const consoleErrors = [];
{
  const orig = console.error.bind(console);
  console.error = (...a) => { consoleErrors.push(a.map(x => (x instanceof Error ? x.message : String(x))).join(" ")); orig(...a); };
  addEventListener("error", e => consoleErrors.push(e.message || String(e.error)));
  addEventListener("unhandledrejection", e => consoleErrors.push(`unhandled: ${e.reason?.message || e.reason}`));
}

import { loadRegistry } from "../engine/models.js?v=e59fd3176d3189aa58c0";
import { probe } from "../engine/probe.js?v=e59fd3176d3189aa58c0";
import { createJudge } from "../engine/judge.js?v=e59fd3176d3189aa58c0";
import { createSpeech } from "../engine/speech.js?v=e59fd3176d3189aa58c0";
import { ModelPicker, MB } from "./models.js?v=e59fd3176d3189aa58c0";
import { createRouter } from "./router.js?v=e59fd3176d3189aa58c0";
import { createBar } from "./bar.js?v=e59fd3176d3189aa58c0";
import { createSupportEngine } from "../engine/support.js?v=e59fd3176d3189aa58c0";
import { jevEndpoint } from '../engine/runtime-config.js?v=e59fd3176d3189aa58c0';
import { modelRows, modelStatusText, modelProgress, allModelsReady, voiceModelsReady } from './model-load-state.js?v=e59fd3176d3189aa58c0';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const PARAMS = new URLSearchParams(location.search);
const AUTOTEST = PARAMS.get("autotest") === "1", WAIT = PARAMS.get("wait") === "1";

// a headless run under --virtual-time-budget fast-forwards timers and dumps
// the DOM the moment the main thread idles on anything that is not a timer or
// a fetch (the Cache API, the worker): from the first line until the test is
// over, a cheap tick keeps real time passing
// (heavy enough that virtual time never outruns real time, so a 180 s budget
// covers a slow model download: ~60 ms real per 50 ms virtual)
const tick = AUTOTEST || WAIT ? setInterval(() => { let n = 0; while (n < 5e7) n++; }, 50) : null;
const release = () => clearInterval(tick);
const STATIONS = ["comparison", "map", "submarine", "support"];

// ---- toast: one line above the bar, gone on its own ---------------------------
const toastEl = Object.assign(document.createElement("div"), { className: "toast" });
toastEl.setAttribute("role", "status");
document.body.appendChild(toastEl);
let toastTimer = null;
function toast(text, kind = "") {
  clearTimeout(toastTimer);
  toastEl.textContent = text;
  toastEl.className = `toast on ${kind}`;
  toastTimer = setTimeout(() => toastEl.classList.remove("on"), 3200);
}

// ---- engine -------------------------------------------------------------------
const registry = await loadRegistry();
const hw = await probe(registry);
const canRun = hw.wasm && hw.rungs.some(r => r.ok);
const picker = new ModelPicker({ registry, probe: hw });
const judge = createJudge({ registry });
// The constructor reports idle before the bar and loading panel exist.
let bar = null, router = null, card = null;
const speech = createSpeech({
  onText: t => { bar?.heard?.(t); router.route(t); },
  onInterim: t => bar?.setInterim?.(t),
  onState: (s, d) => { bar?.setSpeechState(s, d); card?.speechState(s, d); },
  onLoadState: (model, state, detail) => card?.speechLoadState(model, state, detail),
  onModeChange: mode => { if (mode === 'whisper') card?.loadSpeech(true); },
  rung: registry.speech, consent: r => picker.consent(r),
  // Speech owns its worker: downloading or transcribing must not queue behind
  // the page's embedding warmup, nor block a ready page command.
});
const support = createSupportEngine({judge, registry, jevUrl: jevEndpoint()});

// ---- what a station gets ----------------------------------------------------------
const dataCache = new Map();
const ctx = {
  data(name) {
    if (!dataCache.has(name)) dataCache.set(name, fetch(new URL(`../data/${name}.json?v=e59fd3176d3189aa58c0`, import.meta.url))
      .then(r => { if (!r.ok) throw new Error(`data/${name}.json: HTTP ${r.status}`); return r.json(); })
      .catch(err => { dataCache.delete(name); throw err; }));
    return dataCache.get(name);
  },
  judge, toast, support,
  route: text => router.route(text),
  onDecision: callback => router.onDecision(callback),
  scrollTo: id => router.scrollTo(id),
  prefersReducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
};

// ---- router and bar: the router first with no bar; createBar hands itself back ----
const stations = {};
router = createRouter({ judge, stations, toast, speech, onChangeModel: utt => card?.change?.(utt) });
bar = createBar($("#command-bar"), { router, speech, judge, toast });

// ---- stations: each alone, so a broken one is a line of text, not a blank page ----
const mounts = {};
await Promise.all(STATIONS.map(async name => {
  const el = document.getElementById(`st-${name}`);
  if (!el) { mounts[name] = "missing"; return; }
  try {
    const mod = await import(`./stations/${name}.js?v=e59fd3176d3189aa58c0`);
    const st = await mod.mount(el, ctx);
    router.register(name, { el, ...st });
    mounts[name] = "ok";
  } catch (err) {
    mounts[name] = `error: ${err.message}`;
    console.error(`station ${name}:`, err);
    el.innerHTML = `<div class="st-head">${esc(el.dataset.title || name)}</div><p class="st-caption">This station didn't load: ${esc(err.message)}</p>`;
  }
}));

// ---- mode ---------------------------------------------------------------------------
if (!canRun) {
  const why = !hw.wasm ? "This browser has no WebAssembly, so the model cannot run here; the stations show what was precomputed."
    : `No model in the ladder fits this browser (${hw.rungs[0]?.reasons[0] ?? "unknown reason"}).`;
  for (const p of document.querySelectorAll("[data-live-only], [data-map-note]")) p.hidden = true;
  for (const note of document.querySelectorAll("[data-mode-note]")) { note.textContent = why; note.hidden = false; }
  bar.note("The local model cannot run in this browser.");
} else {
  await picker.scanCache();
  card = setupModelCard();
}

// ---- models that load on arrival ---------------------------------------------------
// Local speech joins the page models when a working browser speech service
// isn't known. Warming speech never requests microphone access.
function setupModelCard() {
 const el=$('#autoload');if(!el)return null;
 const q=s=>el.querySelector(s);
 let job=null,readyTimer=null,hideTimer=null,dismissed=false,readyHeld=false;
 let cancelled=false;
 const cancelledError=()=>new Error('Model loading was cancelled. Refresh the page to load models again.');
 let previousErrors=new Set();
 let browser={state:'waiting'},localSpeech=speech.mode==='whisper',speechJob=null;
 const speechStates={silero:{state:'waiting'},whisper:{state:'waiting'}};
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 q('[data-al-title]').textContent='Models on your device';
 q('[data-al-msg]').textContent='Models download and start in parallel.';
 const retry=document.createElement('button');
 retry.type='button';retry.className='model-retry';retry.textContent='Retry failed models';retry.hidden=true;
 q('.al-body').appendChild(retry);
 const rows=()=>modelRows({browser,support:support.snapshot().models,localSpeech,speech:speechStates,cancelled});
 const modelNodes=new Map();
 function renderRows(current){
  for(const row of current){
   let nodes=modelNodes.get(row.id);
   if(!nodes){
    const li=document.createElement('li');
    li.className='model-status-row';li.dataset.model=row.id;
    li.innerHTML=`<b>${esc(row.name)}</b><span class="model-state"><i aria-hidden="true"></i><span></span></span><div class="model-progress" role="progressbar" aria-label="${esc(row.name)}" aria-valuemin="0" aria-valuemax="100"><span></span></div>`;
    const status=li.querySelector('.model-state'),track=li.querySelector('.model-progress');
    nodes={li,status,icon:status.querySelector('i'),label:status.querySelector('span'),track,fill:track.firstElementChild};
    modelNodes.set(row.id,nodes);q('[data-al-list]').appendChild(li);
   }
   const progress=modelProgress(row),status=modelStatusText(row);
   nodes.status.className=`model-state is-${progress.kind}`;
   nodes.icon.textContent=row.state==='ready'?'✓':row.state==='error'?'!':'';
   nodes.label.textContent=status;
   nodes.track.className=`model-progress is-${progress.kind}`;
   nodes.track.setAttribute('aria-valuetext',status);
   if(progress.value===null){nodes.track.removeAttribute('aria-valuenow');nodes.fill.style.removeProperty('width');}
   else{nodes.track.setAttribute('aria-valuenow',Math.round(progress.value));nodes.fill.style.width=`${progress.value}%`;}
  }
  for(const [id,nodes] of modelNodes)if(!current.some(row=>row.id===id)){nodes.li.remove();modelNodes.delete(id);}
 }
 function show(){
  bar.hideVoiceInvitation();clearTimeout(hideTimer);dismissed=false;
  el.hidden=false;el.classList.remove('mini');el.classList.add('off');q('[data-al-pill]').hidden=true;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!dismissed)el.classList.remove('off');}));
 }
 function shrink(){
  dismissed=true;el.classList.add('off');clearTimeout(hideTimer);
  hideTimer=setTimeout(()=>{if(dismissed){el.hidden=true;if(voiceModelsReady(rows()))bar.showVoiceInvitation();}},reducedMotion.matches?0:360);
 }
 function render(){
  const current=rows();
  q('[data-al-stop]').hidden=cancelled||allModelsReady(current);
  q('[data-al-cancel-note]').hidden=!cancelled;
  const errors=new Set(current.filter(row=>row.state==='error').map(row=>row.id));
  if((dismissed||el.hidden)&&[...errors].some(id=>!previousErrors.has(id)))show();
  previousErrors=errors;
  renderRows(current);
  retry.hidden=cancelled||!current.some(row=>row.state==='error');
  if(cancelled){
   clearTimeout(readyTimer);readyTimer=null;readyHeld=false;
   q('[data-al-msg]').textContent='Local models are stopped. You can keep reading and use the page controls.';
   return;
  }
  if(allModelsReady(current)){
   q('[data-al-msg]').textContent='All models are ready on your device.';
   if(!readyTimer&&!readyHeld)readyTimer=setTimeout(()=>{readyTimer=null;readyHeld=true;if(!dismissed)shrink();else if(el.hidden)bar.showVoiceInvitation();},1000);
  }else{
   clearTimeout(readyTimer);readyTimer=null;readyHeld=false;
   q('[data-al-msg]').textContent=retry.hidden?'Models download and start in parallel.':voiceModelsReady(current)?'Voice navigation is ready. A support model needs another try.':'A model needs another try. You can still use the page controls.';
   if(dismissed&&el.hidden&&voiceModelsReady(current))bar.showVoiceInvitation();
  }
 }
 function start(){
  if(cancelled)return Promise.reject(cancelledError());
  if(judge.status==='ready'){browser={state:'ready'};render();return Promise.resolve();}
  if(job)return job;
  const rung=registry.rungs.find(r=>r.id==='bge-small');
  picker.choose(rung.id);picker.granted.add(rung.id);browser={state:'loading'};render();
  job=judge.load(rung,{onProgress:p=>{if(cancelled)return;browser={state:'loading',detail:p};render();}})
   .then(result=>{if(cancelled||result?.cancelled)throw cancelledError();browser={state:'ready'};render();})
   .catch(e=>{if(!cancelled){browser={state:'error',detail:{message:e.message}};render();}throw e;})
   .finally(()=>{job=null;});
  return job;
 }
 judge.ready=start;
 function speechLoadState(model,state,detail){
  if(cancelled)return;
  if(!(model in speechStates))return;
  speechStates[model]={state,detail};render();
 }
 function loadSpeech(reveal=false){
  if(cancelled)return Promise.resolve(false);
  localSpeech=true;picker.granted.add(registry.speech.id);
  if(reveal)show();render();
  if(speechJob)return speechJob;
  speechJob=Promise.resolve().then(()=>cancelled?false:speech.preload())
   .then(ok=>{if(!cancelled&&ok&&speech.state==='error')bar.setSpeechState('idle');return ok;})
   .catch(()=>false).finally(()=>{speechJob=null;});
  return speechJob;
 }
 function loadSupport(){if(cancelled)return Promise.resolve();return Promise.resolve().then(()=>cancelled?null:support.preload()).catch(()=>{render();});}
 function cancelLoading(){
  if(cancelled)return;
  cancelled=true;clearTimeout(readyTimer);readyTimer=null;clearTimeout(hideTimer);
  bar.hideVoiceInvitation();
  speech.cancel();support.dispose();judge.dispose();
  browser={state:'cancelled'};
  show();render();
  // The clicked button is now hidden; keep keyboard focus in the open panel.
  q('[data-al-cancel]').focus();
 }
 retry.addEventListener('click',()=>{if(cancelled)return;show();start().catch(()=>{});loadSupport();if(localSpeech)loadSpeech();});
 q('[data-al-stop]').addEventListener('click',cancelLoading);
 q('[data-al-cancel]').addEventListener('click',shrink);q('[data-al-pill]').addEventListener('click',show);
 support.subscribe(render);
 show();render();start().catch(()=>{});loadSupport();
 if(localSpeech)loadSpeech();
 return {start,stop:shrink,show,shrink,cancel:cancelLoading,loadSpeech,speechLoadState,speechState:()=>{},change:show};
}

// ---- debug + autotest -----------------------------------------------------------------
// a link to a station (#st-support) arrives before the station has rendered, so the
// browser's own hash jump lands on an empty div; redo it once everything is mounted
if (/^#st-/.test(location.hash)) { const t = document.querySelector(location.hash); if (t) requestAnimationFrame(() => t.scrollIntoView({ block: "start" })); }
window.__jev = { judge, router, stations, route: t => router.route(t), picker, speech, support, bar, registry, hw, mounts, consoleErrors };

const AUTOTEST_TEXTS = ["scroll down", "there's banana bread for you", "go to the map", "close the window", "turn it up to 50", "set the time to 3:45 pm",
  "can you close the window, it's cold in here", "go to the lineup", "go to the results",
  "go to the submarine", "Dive", "go to the methods", "go to the results", "Language classification", "go to support", "Ask support where is order 123"];
if (AUTOTEST) runAutotest().finally(release);
// ?wait=1: hold a headless screenshot until the model is in and the card has
// shrunk; &scroll=<id> then lands on a section or station for a close look
else if (WAIT) judge.ready().catch(() => {})
  .then(() => new Promise(r => setTimeout(r, 3000)))
  .then(async () => {   // &say=<text> routes a sentence, &chips=1 opens the chip groups: the bar's panels on camera
    if (PARAMS.get("say")) await router.route(PARAMS.get("say"));
    if (PARAMS.get("chips") === "1") bar.toggleChips(true);
    if (PARAMS.get("avail") === "1") bar.toggleAvail?.(true);
  })
  .then(() => { const to = PARAMS.get("scroll"); if (to === "bottom") window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }); else if (to) router.scrollTo(to); return new Promise(r => setTimeout(r, 1000)); })
  .then(() => {   // &measure=1: where the footer and the bar ended up, for a dump-dom check
    if (PARAMS.get("measure") !== "1") return;
    const f = document.querySelector("footer").getBoundingClientRect(), b = document.getElementById("command-bar").getBoundingClientRect();
    const pre = document.createElement("pre"); pre.id = "measure";
    pre.textContent = JSON.stringify({ innerWidth, innerHeight, scrollY: Math.round(scrollY), footerBottom: Math.round(f.bottom), barTop: Math.round(b.top), barHeight: Math.round(b.height), cbH: getComputedStyle(document.documentElement).getPropertyValue("--cb-h").trim(), clears: f.bottom <= b.top + 1 });
    document.body.appendChild(pre);
  })
  .finally(release);
async function runAutotest() {
  const pre = document.createElement("pre");
  pre.id = "autotest-report";
  pre.textContent = "running…";
  document.body.appendChild(pre);
  const r3 = v => (typeof v === "number" ? Math.round(v * 1000) / 1000 : null);
  const report = { rung: null, speechMode: speech.mode, canRun, mounts, routes: [], consoleErrors };
  try { await judge.ready(); report.rung = judge.rung?.id ?? null; } catch (err) { report.loadError = err.message; }
  // ?texts=a|b|c swaps in another list, for poking at phrasings
  const texts = PARAMS.get("texts")?.split("|").filter(Boolean) || AUTOTEST_TEXTS;
  // between sentences: a real beat for smooth scrolling and the observer, then
  // recompute the context, so "go to the map" changes what the next one may do
  const settle = () => new Promise(r => setTimeout(r, 1200)).then(() => router.refresh?.());
  for (const text of texts) {
    await settle();
    const rec = { text };
    try {
      const d = await router.route(text);
      rec.action = d?.action?.choice ?? (typeof d?.action === "string" ? d.action : null);
      rec.confidence = r3(d?.action?.confidence);
      rec.addressed = r3(d?.addressed);
      rec.band = d?.band ?? (d?.direct ? "direct" : null);
      rec.context = d?.context ?? null;
      if (d?.action?.top) rec.top = d.action.top.map(([l, p]) => `${l} ${Math.round(p * 100)}%`);
      if (d?.rescued) rec.rescued = d.rescued;
      rec.handled = !!d && (d.ran === true || d.band === "ignore" || d.band === "ask");   // ran, nothing was meant to, or the chips are up (the policy's answer to an ask)
    } catch (err) { rec.handled = false; rec.error = err.message; }
    report.routes.push(rec);
    await new Promise(r => setTimeout(r, 200));   // let a scroll land so the next context is honest
  }
  report.handled = report.routes.filter(r => r.handled).length;
  report.asked = report.routes.filter(r => r.band === "ask").length;
  pre.textContent = JSON.stringify(report, null, 1);
  console.log("AUTOTEST " + JSON.stringify(report));
}
