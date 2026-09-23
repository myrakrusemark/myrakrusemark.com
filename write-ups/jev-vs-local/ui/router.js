// Router: the one place a sentence turns into something happening on the page.
// It knows where the reader is (station + section, by what is most on screen),
// masks the judge to the actions that make sense there, and runs the handler
// the band allows. Typed, chip and spoken input all come in through route().

import { parseNumber, bandFor, strictBandFor, SECTIONS } from "../engine/judge.js?v=e59fd3176d3189aa58c0";

// the head's twelve kitchen labels: always allowed, always land on the map
// when the active station cannot take them (override with opts.kitchen)
const KITCHEN = ["close_window", "launch_terminal", "launch_browser", "switch_workspace", "volume_up", "volume_down",
  "mute", "play_pause", "next_track", "screenshot", "lock_screen", "brightness_up", "set_time"];
// actions the page itself answers, whatever is on screen
const PAGE = ["scroll_down", "scroll_up", "go_top", "go_bottom", "go_section", "highlight_model", "start_listening", "stop_listening", "reset_station", "press", "show_commands", "show_examples", "change_model"];
// hyprvoice's policy, mirrored here for the no-askMasked fallback
const POLICY = { actAddressed: 0.75, actConf: 0.35, askAddressed: 0.5, askConfLo: 0.15 };

const MODELS = { jev: ["jev"], laya: ["laya"], decider: ["decider", "decider-2b"], raw_head:["raw head","raw text head"], head: ["head", "my head", "the head"], layers:["lower layers"], nli: ["nli"], llm: ["llm", "qwen", "small model"] };
const SECTION_WORDS = SECTIONS;

export function navigationFor(text) {
  const said=String(text).toLowerCase().replace(/[.!?]+$/, '').trim();
  if (/^(?:(?:go |back |scroll )(?:back )?to (?:the )?|back to )(?:top|start)$/.test(said)) return {action:'go_top'};
  if (/^(?:go|scroll) to (?:the )?bottom$/.test(said)) return {action:'go_bottom'};
  const match=said.match(/^(?:please )?(?:go to|jump to|show me|take me to|scroll to|open)\s+(.+)$/);
  if(!match)return null;
  const target=match[1].replace(/^the /,'');
  for(const [id,names] of Object.entries(SECTIONS))if(names.some(name=>name.replace(/^the /,'').toLowerCase()===target))return {action:'go_section',slots:{section:id}};
  return null;
}

// "instant", not "auto": subpage.css sets html { scroll-behavior: smooth }, and auto would follow it
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// slots without the judge: digits or number words, a direction, a model name,
// a section by its aliases. Used for the direct path and to fill judge gaps.
export function slotsOf(text) {
  const t = String(text).toLowerCase();
  const slots = {};
  const number = parseNumber(t);
  if (number !== undefined) slots.number = number;
  if (/\b(up|higher|raise|louder|more)\b/.test(t)) slots.direction = "up";
  else if (/\b(down|lower|quieter|less)\b/.test(t)) slots.direction = "down";
  for (const [key, names] of Object.entries(MODELS)) if (names.some(n => new RegExp(`\\b${n}\\b`).test(t))) { slots.model = key; break; }
  for (const [id, names] of Object.entries(SECTION_WORDS)) if (names.some(n => t.includes(n))) { slots.section = id; break; }
  return slots;
}

export function createRouter({ judge, stations = {}, sections = null, toast = () => {}, bar = null, kitchen = KITCHEN, speech = null, onChangeModel = null } = {}) {
  const context = { station: null, section: null };
  const listeners = { context: new Set(), decision: new Set() };
  const shares = new Map();   // element → share of the viewport it covers
  let barRef = bar;

  const stationEl = name => stations[name]?.el || document.getElementById(`st-${name}`);
  const sectionEls = () => (sections ? [...sections].map(s => (typeof s === "string" ? document.getElementById(s) : s)).filter(Boolean)
    : [...document.querySelectorAll("[data-section]")]);
  const commandsOf = name => (name && (stations[name]?.commands || {})) || {};

  // ---- where the reader is --------------------------------------------------------
  // an element's share is how much of the viewport it fills; the biggest visible
  // station and the biggest visible section win. Sections are tall, stations
  // short, so each group is compared only with itself. The observer says when
  // to look; the shares come from the rects, so a route() right after a
  // programmatic scroll sees where the page is now, not where it was.
  const io = new IntersectionObserver(() => recompute(), { threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
  const share = el => {
    const r = el.getBoundingClientRect();
    const h = Math.min(r.bottom, innerHeight - (barRef?.el?.offsetHeight || 0)) - Math.max(r.top, 0), w = Math.min(r.right, innerWidth) - Math.max(r.left, 0);
    return h > 0 && w > 0 ? (h * w) / (innerWidth * innerHeight) : 0;
  };
  const best = (els, key) => {
    let top = null, val = 0;
    for (const el of els) { const s = share(el); shares.set(el, s); if (s > val) { val = s; top = el.dataset[key] || el.id; } }
    return top;
  };
  function recompute() {
    const st = best(Object.keys(stations).map(stationEl).filter(Boolean), "station");
    const sec = best(sectionEls(), "section");
    const signature = scopedStations().map(([name])=>name).join(",");
    if (st === context.station && sec === context.section && signature === context.scope) return;
    context.scope = signature;
    if (st !== context.station) { stations[context.station]?.onLeave?.(); stations[st]?.onEnter?.(); }
    context.station = st; context.section = sec;
    for (const cb of listeners.context) cb({ ...context, allowed: allowed() });
  }
  function watch(el) { if (el && !shares.has(el)) { shares.set(el, 0); io.observe(el); } }
  addEventListener("scroll", recompute, {passive:true});
  addEventListener("resize", recompute);
  for (const el of sectionEls()) watch(el);
  for (const name of Object.keys(stations)) watch(stationEl(name));

  // a station mounted after the router was made
  function register(name, station) { stations[name] = station; watch(stationEl(name)); if(station.commandElement) watch(station.commandElement); recompute(); }

  // ---- what may run here -----------------------------------------------------------
  // strict: the page's own actions, plus whatever the station on screen answers.
  // Kitchen commands exist only while the map (or the lineup) is in view — the
  // state narrows the question before the head answers it, as hyprvoice's window
  // list does; off screen, "set time 5:45" cannot be a command at all
  function availableStation(st) { return st && share(st.commandElement || st.el) > 0; }
  function scopedStations() { return Object.entries(stations).filter(([,st])=>st.visibilityScoped && availableStation(st)); }
  function commandExamples() {
    const current = stations[context.station];
    return [
      ...(!current?.visibilityScoped && availableStation(current) ? current.examples || [] : []),
      ...scopedStations().flatMap(([,st])=>st.examples || []),
    ];
  }
  function allowed() {
    const set = new Set([...PAGE, "none"]);
    if (!visibleControls().length) set.delete("press");
    if (!stations[context.station]?.visibilityScoped || availableStation(stations[context.station]))
      for (const a of Object.keys(commandsOf(context.station))) set.add(a);
    for (const [,st] of scopedStations()) for (const a of Object.keys(st.commands)) set.add(a);
    return set;
  }

  // ---- scrolling -------------------------------------------------------------------
  function scrollTo(id) {
    const el = document.getElementById(id) || document.getElementById(`st-${id}`) || document.querySelector(`[data-section="${id}"]`);
    if (!el) return false;
    el.scrollIntoView({ behavior: reduced() ? "instant" : "smooth", block: "start" });
    return true;
  }
  const scrollBy = dy => window.scrollBy({ top: dy, behavior: reduced() ? "instant" : "smooth" });
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

  // flash a model's column in the results table and anything a station tagged
  // data-model="<key>"; stations with their own highlight_model run too
  function highlightModel(slots) {
    const key = slots?.model;
    if (!key) { toast("Which model? Jev, Laya, Decider, embeddings + head, Qwen or NLI.", "warn"); return; }
    const hits = [...document.querySelectorAll(`[data-model="${key}"]`)];
    for (const table of document.querySelectorAll("table.compare")) {
      const heads = [...table.querySelectorAll("thead th")];
      const col = heads.findIndex(th => MODELS[key].some(n => th.textContent.trim().toLowerCase() === n || th.textContent.trim().toLowerCase().startsWith(n)));
      if (col < 0) continue;
      for (const tr of table.querySelectorAll("tr")) { const c = tr.children[col]; if (c) hits.push(c); }
    }
    if (!hits.length) { toast(`no column for ${key} on screen`, "warn"); return; }
    if (!hits.some(inView)) hits[0].scrollIntoView({ behavior: reduced() ? "instant" : "smooth", block: "center" });
    for (const el of hits) { el.classList.remove("highlight-flash"); void el.offsetWidth; el.classList.add("highlight-flash"); }
    commandsOf(context.station).highlight_model?.(slots, "");
  }

  // ---- press: links, buttons, tabs and fold-outs that are on screen ----------------
  // The options change with every scroll, so this is the "options change per call"
  // case from the article: the head only learns "press"; WHICH control is a slot,
  // resolved here by name, by ordinal ("the second link"), or by embedding
  // similarity between what was said and each control's label. Ties → a chip each.
  const CONTROL_SEL = "a[href], button, summary, [role=tab], label:has(input[type=radio])";
  const VERBS = /\b(click|press|hit|tap|open|follow|select|choose|pick|switch to|switch|expand|collapse|toggle|the|on|a|link|button|tab|section|fold-?out|please)\b/g;
  const ORD = { first: 0, "1st": 0, second: 1, "2nd": 1, third: 2, "3rd": 2, fourth: 3, "4th": 3, last: -1 };
  const labelOf = el => (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").replace(/\s+/g, " ").trim();
  const kindOfControl = el => el.matches("a[href]") ? "link" : el.matches("summary") ? "fold-out" : el.matches("[role=tab], label") ? "tab" : "button";
  function visibleControls() {
    const out = [], seen = new Set();
    for (const el of document.querySelectorAll(CONTROL_SEL)) {
      // the bar's own buttons count; its chips and answer-chips are sentences, not controls
      if (el.closest("dialog") || el.closest("#command-bar .chip, #command-bar [data-teach], #command-bar [data-choice], #command-bar .cb-avail-list") || el.disabled || el.hidden) continue;
      if (el.classList.contains("chip")) continue;   // a chip is a sentence to say, not a control to name
      if (Object.values(stations).some(st => st.visibilityScoped && st.el.contains(el) && !availableStation(st))) continue;
      const inBar = !!el.closest("#command-bar");
      const card = el.closest("#autoload");
      if (card && (card.hidden || card.classList.contains("off"))) continue;   // the card is faded out: nothing to press
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight - (inBar ? 0 : barRef?.el?.offsetHeight || 0)) continue;
      // a model rung's button holds a paragraph; its name is the <b>. The pill is "change the model".
      let label = el.matches("[data-al-pick]") ? (el.querySelector("b")?.textContent || "").trim() : el.matches("[data-al-pill]") ? "Change the model" : labelOf(el);
      label = label.replace(/^←\s*/, "").replace(/\s*↗$/, "");
      if (!label) continue;
      const kind = kindOfControl(el), key = `${kind}:${label.toLowerCase()}`;
      if (seen.has(key)) continue; seen.add(key);
      const href = el.matches("a[href]") ? el.href : null;
      // other names a control answers to: a mailto link is "the email address",
      // an external link also goes by its site ("github"); shown under the first alias
      const aliases = [];
      let display = label;
      if (href?.startsWith("mailto:")) { aliases.push("the email address", "email address", "the email", "email", "e-mail", "mail", "contact"); display = "the email address"; }
      else if (href?.startsWith("tel:")) { aliases.push("the phone number", "phone number", "phone", "call"); display = "the phone number"; }
      else if (href) { try { const h = new URL(href, location.href).hostname.replace(/^www\./, ""); if (h && h !== location.hostname) aliases.push(h, h.split(".")[0]); } catch { /* not a url */ } }
      // "Second model: minilm" answers to "second model" and to "minilm"; "Email: …" to "email"
      const colon = label.indexOf(":");
      if (colon > 0) { aliases.push(label.slice(0, colon).trim(), label.slice(colon + 1).trim()); }
      // "Commands: 15" / "Thresholds: 0.15 · 0.60": the number is state, not a name
      if (el.matches("[data-al-pick]")) aliases.push(`use ${label.slice(colon + 1).trim()}`, `switch to ${label.slice(colon + 1).trim()}`);
      out.push({ el, label, display, aliases, kind, href, external: !!href && !href.startsWith("mailto:") && !href.startsWith("tel:") && new URL(href, location.href).origin !== location.origin, mailto: !!href?.startsWith("mailto:") });
    }
    return out;
  }
  const labelVecs = new Map();
  const cos = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i]; return d; };
  async function resolvePress(text, slots) {
    const controls = visibleControls();
    if (!controls.length) return { none: "nothing to click on screen" };
    const said = String(text).toLowerCase();
    const object = said.replace(VERBS, " ").replace(/\s+/g, " ").trim();
    // ordinal: "the second link", "the first button", "the last tab"
    const om = said.match(/\b(first|1st|second|2nd|third|3rd|fourth|4th|last)\b(?:\s+(link|button|tab|fold-?out))?/);
    if (om && (om[2] || object.replace(/\b(first|1st|second|2nd|third|3rd|fourth|4th|last|one)\b/g, "").trim() === "")) {
      const pool = om[2] ? controls.filter(c => c.kind === om[2].replace("foldout", "fold-out")) : controls;
      const i = ORD[om[1]] < 0 ? pool.length - 1 : ORD[om[1]];
      if (pool[i]) return { control: pool[i] };
    }
    // by name: the control's label inside what was said, or the object inside the label
    const names = c => [c.label, ...(c.aliases || [])].map(x => x.toLowerCase());
    // said verbatim beats said-inside: "email" is the whole of "Email: …", not part of it
    const exact = controls.filter(c => names(c).some(l => l === object || l === said));
    if (exact.length === 1) return { control: exact[0] };
    if (exact.length > 1) return { choices: exact.slice(0, 6) };
    const named = controls.filter(c => names(c).some(l => (l.length >= 3 && said.includes(l)) || (object.length >= 3 && l.includes(object))));
    if (named.length === 1) return { control: named[0] };
    if (named.length > 1) return { choices: named.slice(0, 6) };
    // by meaning: embed the object and every label (labels are cached), cosine
    if (!object || typeof judge.embed !== "function") return { choices: controls.slice(0, 6) };
    try {
      const q = await judge.embed(object);
      const scored = [];
      for (const c of controls) {
        let v = labelVecs.get(c.label); if (!v) { v = await judge.embed(c.label); labelVecs.set(c.label, v); }
        scored.push([cos(q, v), c]);
      }
      scored.sort((a, b) => b[0] - a[0]);
      const [s1, best] = scored[0], s2 = scored[1]?.[0] ?? 0;
      if (s1 >= 0.55 && s1 - s2 >= 0.06) return { control: best, sim: s1 };
      return { choices: scored.slice(0, 6).map(([, c]) => c) };
    } catch { return { choices: controls.slice(0, 6) }; }
  }
  // do the thing: links open in a new tab (a spoken command has no click behind it,
  // so the browser may refuse the popup — then the bar offers the link to click)
  let pendingChoices = null;
  function press(control) {
    const { el, label, kind, href } = control;
    el.classList.remove("highlight-flash"); void el.offsetWidth; el.classList.add("highlight-flash");
    if (control.mailto) { location.href = href; return `opening your mail app for ${label}`; }
    // an external link opens in a new tab; a link into this site just navigates
    if (kind === "link" && control.external) {
      const w = window.open(href, "_blank", "noopener");
      if (!w) { barRef?.showChoices?.([{ label: `open ${label} ↗`, href }], "the browser blocked a popup that wasn't a click — open it here:"); return `${label}: popup blocked, offered as a link`; }
      return `opened ${label} in a new tab`;
    }
    el.click();
    return `${kind}: ${label}`;
  }
  function pick(i) {
    const c = pendingChoices?.[i]; if (!c) return null;
    pendingChoices = null;
    const said = press(c);
    barRef?.note?.(said);
    return said;
  }

  const page = {
    // "scroll down 50%" → half a screen; no number → most of one
    scroll_down: s => scrollBy(((s?.number ?? 80) / 100) * innerHeight),
    scroll_up: s => scrollBy(-((s?.number ?? 80) / 100) * innerHeight),
    go_top: () => window.scrollTo({ top: 0, behavior: reduced() ? "instant" : "smooth" }),
    go_bottom: () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: reduced() ? "instant" : "smooth" }),
    go_section: slots => { if (!slots?.section || !scrollTo(slots.section)) {toast("Which section? Try the results, the map, or the conclusion.", "warn");return false;} return true; },
    highlight_model: highlightModel,
    // the bar's own controls and the model card, so every button on the page has a name
    show_commands: (s, utt) => barRef?.toggleAvail?.(!/\b(hide|close)\b/i.test(utt || "")),
    show_examples: (s, utt) => barRef?.toggleChips?.(!/\b(hide|close)\b/i.test(utt || "")),
    change_model: (slots, utt) => (onChangeModel ? onChangeModel(utt || "") : toast("no model card on this page", "warn")),
    press: (slots, utt) => {
      if (slots?.control) { toast(press(slots.control)); return; }
      resolvePress(utt || "", slots).then(r => {
        if (r.control) toast(press(r.control));
        else if (r.choices) { pendingChoices = r.choices; barRef?.showChoices?.(r.choices.map((c, i) => ({ label: c.label, kind: c.kind, index: i })), "Which one?"); }
        else toast(r.none || "nothing to click here", "warn");
      });
    },
    start_listening: () => (speech?.start ? speech.start() : barRef?.startListening?.()),
    stop_listening: () => (speech?.stop ? speech.stop() : barRef?.stopListening?.()),
    reset_station: (slots, utt) => { const h = commandsOf(context.station).reset_station; if (h) h(slots, utt); else toast("nothing to reset here"); },
  };

  // ---- running a handler ------------------------------------------------------------
  // direct: the action is known (a chip, an ask-band pick, the model not loaded).
  // The page answers its own; the active station its own; a kitchen action goes
  // to the map when the active station cannot take it; any other station action
  // scrolls to the station that owns it and runs there.
  function run(action, slots = {}, utterance = "") {
    if (!action || action === "none") return false;
    recompute();
    const scopedOwner = Object.values(stations).find(st=>st.visibilityScoped && st.commands?.[action]);
    if (scopedOwner) {
      if (!availableStation(scopedOwner)) { toast('That command is available only while its scene is visible', 'warn'); return false; }
      scopedOwner.commands[action](slots, utterance); return true;
    }
    slots = { ...slotsOf(utterance), ...slots };
    if (page[action]) return page[action](slots, utterance)!==false;
    // a kitchen command always reaches the office screen beside the map (its state is
    // the feedback), even when the lineup is the station that shows it
    const onScreen = kitchen.includes(action) && context.station === "lineup" ? stations.map?.applyScreen?.(action, slots) : null;
    const here = commandsOf(context.station);
    if (here[action]) { here[action](slots, utterance); if (onScreen) toast(`screen: ${onScreen}`); return true; }
    if (kitchen.includes(action)) {
      const map = commandsOf("map");
      if (!map[action]) { toast("the map is not on this page", "warn"); return false; }
      scrollTo("st-map");
      map[action](slots, utterance);
      return true;
    }
    for (const [name, st] of Object.entries(stations)) {
      if (st?.commands?.[action]) { scrollTo(`st-${name}`); st.commands[action](slots, utterance); return true; }
    }
    toast(`no handler for ${action}`, "warn");
    return false;
  }
  // nobody awaits route(), so a handler that throws would be an unhandled
  // rejection and a bar stuck on "judging…": the failure becomes a note instead
  function tryRun(action, slots, utterance) {
    try { return { ran: run(action, slots, utterance) }; }
    catch (err) {
      console.error(`${action} handler:`, err);
      toast(`${action} failed: ${err.message}`, "warn");
      return { ran: false, failed: `${action} failed: ${err.message}` };
    }
  }

  // ---- the band ---------------------------------------------------------------------
  // zero what is not allowed here, renormalize, re-band: the fallback when the
  // judge has no askMasked of its own
  function maskLocally(res, set) {
    const probs = { ...res.action.probs };
    const all = Object.entries(probs).sort((a, b) => b[1] - a[1]);
    const best = all.find(([l]) => set.has(l) || l === "none") || all[0];
    const rival = all.find(([l]) => l !== best[0]);
    const confidence = Math.max(0, best[1] - (rival ? rival[1] : 0));
    const action = { ...res.action, choice: best[0], probs, confidence, offScreen: best !== all[0] ? all[0][0] : null };
    const kind = judge.kindOf?.(action.choice) || res.kind || "none";
    const band = bandFor(res.addressed, confidence, kind);
    return { ...res, action, band, strictBand: strictBandFor(res.addressed, confidence), kind, masked: true };
  }

  async function judged(text, set) {
    if (typeof judge.askMasked === "function") return judge.askMasked(text, set);
    return maskLocally(await judge.ask(text), set);
  }

  function emit(decision) { for (const cb of listeners.decision) { try { cb(decision); } catch { /* a listener's problem */ } } }
  // ready() may throw before it returns a promise (no judge at all): one shape either way
  const whenReady = () => { try { return Promise.resolve(judge?.ready?.()); } catch (err) { return Promise.reject(err); } };

  // the single entry. hint = {action, slots} from a chip: used only while the
  // model is not ready, so the page still moves before it can judge
  async function route(text, hint = null) {
    text = String(text || "").trim();
    if (!text) return null;
    recompute();   // the reader may have just been scrolled somewhere
    const set = allowed();
    barRef?.showPending?.(text, { ...context, allowed: set });
    const directNavigation=navigationFor(text);
    if(directNavigation){
      const result=tryRun(directNavigation.action,directNavigation.slots||{},text);
      const d={text,direct:true,...directNavigation,...result,context:{...context}};
      barRef?.showDirect?.(d);emit(d);return d;
    }
    const supportQuestion=text.match(/^(?:please )?ask (?:the )?(?:support desk|customer service|support)(?:\s*[:,]\s*|\s+)(.+)$/i);
    if(supportQuestion&&stations.support?.ask){
      scrollTo('st-support');
      try{
        const result=await stations.support.ask(supportQuestion[1]);
        const d={text,direct:true,action:'support_ask',ran:result===true,
          note:result===true?'':'Support did not finish this request. Check the support panel above.',context:{...context}};
        barRef?.showDirect?.(d);emit(d);return d;
      }catch(error){
        const message=error.message||'The support request could not finish.';
        const d={text,direct:true,action:'support_ask',ran:false,error:message,note:message,context:{...context}};
        toast(message,'warn');barRef?.showDirect?.(d);emit(d);return d;
      }
    }
    const spokenControl=text.toLowerCase().replace(/[.!?]+$/, '').trim();
    let controlAction=null;
    if(/^(?:stop listening|turn off (?:the )?(?:mic|microphone))$/.test(spokenControl))controlAction=()=>barRef?.stopListening?.();
    else if(/^(?:collapse|close|hide) (?:the )?(?:command )?bar$/.test(spokenControl))controlAction=()=>barRef?.collapse?.(true);
    else if(/^(?:expand|open|show) (?:the )?(?:command )?bar$/.test(spokenControl))controlAction=()=>barRef?.collapse?.(false);
    else if(/^(?:show|open|expand) (?:the )?thresholds$/.test(spokenControl))controlAction=()=>barRef?.togglePolicy?.(true);
    else if(/^(?:hide|close|collapse) (?:the )?thresholds$/.test(spokenControl))controlAction=()=>barRef?.togglePolicy?.(false);
    else if(/^(?:show|open|expand) (?:the )?(?:(?:available|voice) )?commands$/.test(spokenControl))controlAction=()=>barRef?.toggleAvail?.(true);
    else if(/^(?:hide|close|collapse) (?:the )?(?:(?:available|voice) )?commands$/.test(spokenControl))controlAction=()=>barRef?.toggleAvail?.(false);
    const threshold=spokenControl.match(/^set (?:the )?(lead|lead threshold|command score|command threshold) to (.+)$/);
    if(threshold&&judge.setPolicy){
      const amount=parseNumber(threshold[2]);
      if(amount!==undefined)controlAction=()=>{judge.setPolicy({[threshold[1].startsWith('lead')?'actConf':'actAddressed']:amount/100});barRef?.togglePolicy?.(true);};
    }
    if(controlAction){await controlAction();const d={text,direct:true,action:'press',ran:true,context:{...context}};barRef?.showDirect?.(d);emit(d);return d;}
    for (const [name, station] of scopedStations()) {
      const command = station.parseCommand?.(text);
      if (!command) continue;
      const failed = command.error || tryRun(command.action, command.slots || {}, text).failed;
      const d = {text, direct:true, station:name, action:failed ? null : command.action, note:failed || '', context:{...context}};
      barRef?.showDirect?.(d);
      emit(d);
      return d;
    }
    // Exact labels on opted-in controls work before model loading and use the
    // same viewport/command-bar visibility filter as learned press commands.
    const spoken = text.toLowerCase().replace(/[.!?]+$/, '').trim();
    const target = spoken.replace(/^(?:please )?(?:click|press|select|choose|open|close|expand|collapse|toggle|switch to)\s+/, '');
    const matches = visibleControls().filter(c => c.el.hasAttribute('data-voice-exact') && c.label.toLowerCase().replace(/[.!?]+$/, '').trim() === target);
    if (matches.length === 1) {
      const c = matches[0];
      const details = c.kind === 'fold-out' ? c.el.parentElement : null;
      if (details && /^(?:please )?(?:open|expand)\s/.test(spoken)) details.open = true;
      else if (details && /^(?:please )?(?:close|collapse)\s/.test(spoken)) details.open = false;
      else press(c);
      const d = { text, direct: true, action: 'press', note: c.label, context: { ...context } };
      barRef?.showDirect?.(d); emit(d); return d;
    }
    const status = judge?.status;
    if (status !== "ready") {
      // no model yet: the app's ready() starts one (asking first when the
      // download is not the arrival one). A chip runs now on its own action;
      // a plain sentence waits and is judged once the model is in
      const note = status === 'cancelled' ? 'models stopped; refresh the page to load them again' : status === "error" ? "the model could not load" : status === "loading" ? "model still loading" : "no model loaded";
      if (hint?.action) {
        if (!['error','cancelled'].includes(status)) whenReady().catch(() => {});
        const { failed } = tryRun(hint.action, hint.slots || slotsOf(text), text);
        const d = { text, direct: true, action: hint.action, note: failed || `${note}; ran it directly`, context: { ...context } };
        barRef?.showDirect?.(d);
        emit(d);
        return d;
      }
      const later = !['error','cancelled'].includes(status);
      if (later) whenReady().then(() => route(text)).catch(() => { /* declined or failed: the card says so */ });
      barRef?.showDirect?.({ text, direct: true, action: null, note: `${note}; ${later ? "it runs once the model is in" : "nothing ran"}`, context: { ...context } });
      toast(note, "warn");
      return null;
    }
    let res, rescued = null, chipSaidSo = false, elsewhere = null;
    try {
      res = await judged(text, set);
      const destination = slotsOf(text).section;
      if (destination && /^(?:go to|jump to|show me|take me to)\b/i.test(text)) {
        res = {...res, action:{...res.action, choice:'go_section', offScreen:null}, slots:{...res.slots,section:destination}, band:'act',kind:'page'};
      }
      for (const [name, station] of scopedStations()) {
        const local = await station.interpret?.(text, res);
        if (local) { res = {...res, ...local, station:name}; break; }
      }
      // a press verb plus the name of a control that is on screen is a lookup, not
      // a judgment: the head never saw "write-ups" or "triage", but the label is
      // right there. Only when the control's label appears in what was said.
      const PRESS_VERB = /^\s*(click|press|tap|hit|open|follow|select|choose|pick|use|load|switch to|expand|collapse|toggle|close|cancel|dismiss)\b/i;
      if (!res.station && set.has("press")) {
        const lower = text.toLowerCase().replace(/[^a-z0-9:@.' -]+/g, " ").replace(/\s+/g, " ").trim();
        const object = lower.replace(VERBS, " ").replace(/\s+/g, " ").trim();
        const names = c => [c.label, ...(c.aliases || [])].map(x => x.toLowerCase());
        const controls = visibleControls();
        // said verbatim — "increase threshold", "email", "second model" — with or without a verb
        let named = controls.find(c => names(c).some(l => l === lower || l === object));
        const hasVerb = PRESS_VERB.test(text);
        if (!named && hasVerb) named = controls.find(c => names(c).some(l => (l.length >= 3 && lower.includes(l)) || (object.length >= 4 && l.includes(object))));
        // an ordinal counts only for a control kind ("the second link") or bare ("the first one");
        // "the first model" is a NAME — if it isn't on screen, it isn't a press
        const bareOrd = object.replace(/\b(first|1st|second|2nd|third|3rd|fourth|4th|last|one)\b/g, "").trim() === "";
        const ordinal = hasVerb && /\b(first|1st|second|2nd|third|3rd|fourth|4th|last)\b/.test(lower) && (/\b(link|button|tab|fold-?out)\b/.test(lower) || bareOrd);
        if ((named || ordinal) && (res.action?.choice !== "press" || res.band !== "act"))
          res = { ...res, action: { ...res.action, choice: "press", confidence: Math.max(res.action.confidence, 0.5), offScreen: null }, band: "act", kind: "page", byName: named?.label || (ordinal ? "an ordinal" : null) };
      }
      // the head unmasked, for the hint only (the embedding is cached: ~10 ms):
      // when it would have picked a command that lives on a station that is not
      // on screen, say so and name the way there — nothing runs off screen
      const full = !res.station && typeof judge.ask === "function" ? await judge.ask(text) : null;
      const off = res.action?.offScreen || full?.action?.choice;
      if (off && off !== "none" && !set.has(off) && (full?.band ?? "ask") !== "ignore") {
        const owner = Object.entries(stations).find(([name, st]) => name !== context.station && st?.commands?.[off]);
        if (owner) elsewhere = { action: off, station: owner[0] };
      }
      // a chip is the reader saying exactly this: when the head's pick is the
      // chip's own action, an "ask" is already answered
      if (res.band === "ask" && hint?.action && hint.action === res.action?.choice) { res = { ...res, band: "act" }; chipSaidSo = true; }
    } catch (err) {
      toast(`the judge failed: ${err.message}`, "warn");
      barRef?.showDirect?.({ text, direct: true, action: null, note: `the judge failed: ${err.message}`, context: { ...context } });
      return null;
    }
    const slots = { ...slotsOf(text), ...(res.slots || {}) };
    const decision = { ...res, text, slots, allowed: set, context: { ...context }, ran: false, rescued, elsewhere };
    let failed = null;
    if (res.band === "act" && res.action.choice === "press") {
      const r = await resolvePress(text, slots);
      if (r.control) slots.control = r.control;
      else if (r.choices) { pendingChoices = r.choices; decision.choices = r.choices.map((c, i) => ({ label: c.label, kind: c.kind, index: i })); decision.band = res.band = "ask"; }
      else failed = r.none;
    }
    if (res.band === "act") ({ ran: decision.ran, failed = null } = tryRun(res.action.choice, slots, text));
    decision.hint = [
      elsewhere ? `${elsewhere.action} lives on the ${elsewhere.station}, which is not on screen — say “go to the ${elsewhere.station}” first` : "",
      res.byName ? `“${res.byName}” is on screen — matched by name, no judgment needed` : "",
      chipSaidSo ? "the head was unsure; the chip settled it" : "",
      res.kind === "kitchen" && res.band === "act" && res.strictBand !== "act" ? `hyprvoice's stricter line would ${res.strictBand} (margin ${res.action.confidence.toFixed(2)} < 0.35): here it only moves a drawing` : "",
      res.remembered ? `memory: you taught “${res.remembered.text}” → ${res.remembered.label} (${Math.round(res.remembered.sim * 100)}% alike)` : "",
      hint?.action && !set.has(hint.action) && !rescued ? `${hint.action} is not available here` : "",
      failed || "",
    ].filter(Boolean).join(" · ") || null;
    if (res.station && !availableStation(stations[res.station])) {
      decision.band='ignore'; decision.hint='The submarine is no longer visible; no command ran.';
    } else stations[res.station]?.onDecision?.(decision);
    barRef?.showDecision?.(decision);
    emit(decision);
    return decision;
  }

  // the unmasked verdict stands in when it names another station's command and
  // its band is no worse: an act runs there, an ask offers the real top two
  // (the masked top two would be "none" and a stray)
  const RANK = { act: 2, ask: 1, ignore: 0 };
  function rescue(set, masked, full) {
    const owners = Object.entries(stations).filter(([name, st]) => name !== context.station && st?.commands);
    const choice = full?.action?.choice;
    if (!owners.length || !choice || set.has(choice) || (RANK[full.band] ?? 0) < (RANK[masked.band] ?? 0)) return null;
    const owner = owners.find(([, st]) => st.commands[choice]);
    return owner ? { res: full, station: owner[0] } : null;
  }

  // the reader picked a "Did you mean…?" chip: run it and remember the pairing
  function confirm(text, label) {
    recompute();
    if (!allowed().has(label)) { barRef?.note?.('That command is no longer available here.'); return false; }
    const stationLabel = Object.values(stations).some(st=>st.visibilityScoped && st.commands?.[label]);
    if (!stationLabel) { try { judge.teach?.(text, label); } catch { /* memory is optional */ } }
    const { ran: ok, failed } = tryRun(label, slotsOf(text), text);
    barRef?.showTaught?.({ text, label, ran: ok, failed, taught: !stationLabel });
    emit({ text, action: label, taught: true, ran: ok, context: { ...context } });
    return ok;
  }

  return {
    get context() { return { ...context }; },
    allowed, commandExamples, route, run, confirm, scrollTo, register, slotsOf, pick, visibleControls, stationCommands: commandsOf,
    kitchen: [...kitchen], page: [...PAGE],
    onContext(cb) { listeners.context.add(cb); return () => listeners.context.delete(cb); },
    onDecision(cb) { listeners.decision.add(cb); return () => listeners.decision.delete(cb); },
    setBar(b) { barRef = b; },
    refresh: recompute,
  };
}
