// The command bar: the page's one microphone and keyboard, fixed at the bottom
// in the site's dark chrome. It shows what was said, what the head made of it
// (top three, addressed, band) and lets the reader correct it. Everything it
// hears goes through router.route(); it never decides anything itself.

import { selectTryCommands } from './try-commands.js?v=8ee67d2c3612bfccb49e';
import { SECTIONS } from '../engine/judge.js?v=8ee67d2c3612bfccb49e';

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pct = p => `${Math.round((p || 0) * 100)}%`;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// what each speech mode means for the reader's audio: said plainly next to the mic
const MODES = {
  web: { name: "Browser speech", privacy: "your browser sends the audio to its vendor to transcribe it" },
  whisper: { name: "Whisper, on this machine", privacy: "Audio is transcribed on your device. A support question may be sent to Jev if the router needs it." },
  none: { name: "Typed only", privacy: "no speech recognition in this browser; type instead" },
};

// "Try saying…": text is what gets judged, action is the direct path while the
// model is still loading (a chip with no action just waits)
export const DEFAULT_CHIPS = [
  { group: "Try", items: [
    { text: "scroll down", action: "scroll_down" },
    { text: "go to the results", action: "go_section", slots: { section: "comparison" } },
    { text: "go to the submarine", action: "go_section", slots: { section: "st-submarine" } },
  ] },
];
const actionNames = {submarine_down:"Dive",submarine_up:"Rise",submarine_left:"Reverse",submarine_right:"Forward",submarine_hold:"Hold position",submarine_collect:"Collect",submarine_reset:"Restart dive",support_ask:"Support reply",change_model:"Model status",show_examples:"Expand bar"};
const words = label => actionNames[label] || (label === "none" ? "Not a command" : String(label || "").replace(/^submarine_/, "").replace(/_/g, " "));

const MIC = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 15a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.9V22h2v-3.1A8 8 0 0 0 20 11z"/></svg>`;
const CHEVRON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 9l6 6 6-6"/></svg>`;

export function createBar(el, { router, speech = null, judge = null, chips = DEFAULT_CHIPS, beforeListen = null, toast = null } = {}) {
  el.classList.add("cb");
  el.innerHTML = `
  <div class="cb-inner">
    <div class="cb-header">
    <div class="cb-row">
      <button type="button" class="cb-mic" data-mic data-voice-exact data-state="idle" aria-pressed="false" aria-label="Start listening" title="Start listening">${MIC}</button>
      <form class="cb-form" data-form>
        <input type="text" class="cb-input" data-input autocomplete="off" spellcheck="false" enterkeyhint="send" placeholder="Try a page command…" aria-label="A command for the page">
        <button type="submit" class="cb-send">Run</button>
      </form>
      <button type="button" class="cb-toggle" data-toggle data-voice-exact aria-expanded="true" aria-controls="cb-lower cb-settings" aria-label="Collapse bar" title="Collapse bar">${CHEVRON}</button>
    </div>
    <p class="cb-speech-status" data-speech-status role="status" hidden></p>
    <div class="cb-chips" id="cb-chips" data-chips aria-label="Try a command"></div>
    </div>
    <div class="cb-lower" id="cb-lower">
      <div class="cb-decision" data-decision hidden>
        <div class="cb-utt"><span data-utt></span><span class="cb-pills" data-pills></span></div>
        <div class="mini-card" data-top aria-label="Top three commands and probabilities"></div>
        <div class="cb-ask" data-ask hidden></div>
        <p class="cb-note" data-note hidden></p>
        <div class="cb-ctx" data-ctx></div>
      </div>
    </div>
    <div class="cb-settings" id="cb-settings">
    <div class="cb-tabs" role="tablist" aria-label="Command options">
      <button type="button" id="cb-thresholds-tab" role="tab" data-policy-btn data-voice-exact aria-selected="false" aria-expanded="false" aria-controls="cb-thresholds">Thresholds</button>
      <button type="button" id="cb-commands-tab" role="tab" data-avail data-voice-exact aria-selected="false" aria-expanded="false" aria-controls="cb-avail-list" tabindex="-1">Available commands</button>
    </div>
    <div class="cb-policy" id="cb-thresholds" data-policy hidden role="tabpanel" aria-labelledby="cb-thresholds-tab" tabindex="0">
      <div class="cb-policy-row"><label for="cb-conf">lead over next option ≥ <output data-conf-out>0.15</output></label><input id="cb-conf" type="range" min="0" max="1" step="0.05" value="0.15" data-conf></div>
      <div class="cb-policy-row"><label for="cb-addr">command score ≥ <output data-addr-out>0.60</output></label><input id="cb-addr" type="range" min="0.5" max="1" step="0.05" value="0.60" data-addr></div>
      <p class="cb-avail-note" data-policy-note>Both numbers must clear their line for a sentence to run; below that it asks, and below command score 0.5 it is ignored.</p>
    </div>
    <div class="cb-avail-list" id="cb-avail-list" data-avail-list hidden role="tabpanel" aria-labelledby="cb-commands-tab" tabindex="0"></div>
    </div>
  </div>`;
  const q = s => el.querySelector(s);
  const mic = q("[data-mic]"), input = q("[data-input]"), form = q("[data-form]"), toggle = q("[data-toggle]");
  const chipBox = q("[data-chips]"), panel = q("[data-decision]"), utt = q("[data-utt]"), pills = q("[data-pills]"), top = q("[data-top]");
  const availBtn = q("[data-avail]"), availList = q("[data-avail-list]");
  const ask = q("[data-ask]"), note = q("[data-note]"), ctxLine = q("[data-ctx]");
  const say = (t, k) => (toast ? toast(t, k) : null);
  let speechState = "idle", lastText = "", decisionStation = null;

  // This invitation sits outside the scrolling tray, with its pointer on the mic.
  const voiceInvitation = document.createElement("aside");
  voiceInvitation.className = "voice-invitation";
  voiceInvitation.hidden = true;
  voiceInvitation.setAttribute("aria-labelledby", "voice-invitation-title");
  voiceInvitation.setAttribute("aria-live", "polite");
  voiceInvitation.innerHTML = `
    <button type="button" class="voice-invitation-close" data-voice-dismiss aria-label="Dismiss voice invitation">×</button>
    <strong id="voice-invitation-title">Explore by voice</strong>
    <p>Turn on the mic to navigate the page, choose examples, and play.</p>
    <p class="voice-privacy" data-voice-privacy></p>
    <button type="button" class="voice-invitation-start" data-voice-start>Turn on microphone</button>`;
  document.body.appendChild(voiceInvitation);
  const invitationKey = "jev-voice-invitation-dismissed";
  let invitationShown = false, invitationDismissed = false;
  try { invitationDismissed = sessionStorage.getItem(invitationKey) === "1"; } catch { /* private storage may be unavailable */ }
  function positionVoiceInvitation() {
    if (voiceInvitation.hidden) return;
    const rect = mic.getBoundingClientRect();
    const left = Math.max(12, Math.min(rect.left - 6, innerWidth - voiceInvitation.offsetWidth - 12));
    voiceInvitation.style.left = `${left}px`;
    voiceInvitation.style.bottom = `${innerHeight - rect.top + 14}px`;
    voiceInvitation.style.setProperty("--voice-pointer-left", `${rect.left + rect.width / 2 - left}px`);
  }
  function hideVoiceInvitation(dismiss = false) {
    const hadFocus = voiceInvitation.contains(document.activeElement);
    voiceInvitation.hidden = true;
    if (dismiss) {
      invitationDismissed = true;
      try { sessionStorage.setItem(invitationKey, "1"); } catch { /* dismissal still lasts for this page */ }
    }
    if (hadFocus) mic.focus({ preventScroll: true });
  }
  function showVoiceInvitation() {
    if (invitationShown || invitationDismissed || speechMode() === "none" || !speech?.start || speechState !== "idle") return false;
    voiceInvitation.querySelector('[data-voice-privacy]').textContent=speechMode()==='web'?'Your browser’s speech service transcribes the audio. You can stop listening at any time.':MODES.whisper.privacy;
    invitationShown = true;
    voiceInvitation.hidden = false;
    positionVoiceInvitation();
    return true;
  }
  voiceInvitation.querySelector("[data-voice-dismiss]").addEventListener("click", () => hideVoiceInvitation(true));
  voiceInvitation.querySelector("[data-voice-start]").addEventListener("click", () => {
    hideVoiceInvitation(true);
    startListening();
  });
  voiceInvitation.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.preventDefault(); hideVoiceInvitation(true); }
  });
  addEventListener("resize", positionVoiceInvitation, { passive: true });
  el.addEventListener("scroll", positionVoiceInvitation, { passive: true });

  // ---- the bar's height is a page variable: the body pads for it, the
  // autoload card sits above it
  const ro = new ResizeObserver(() => {
    document.documentElement.style.setProperty("--cb-h", `${el.offsetHeight}px`);
    positionVoiceInvitation();
    router.refresh?.();
  });
  ro.observe(el);

  // ---- mic ------------------------------------------------------------------------
  const speechStatus = q("[data-speech-status]");
  const speechMode = () => speech?.mode && MODES[speech.mode] ? speech.mode : "none";
  function setSpeechState(state, detail) {
    if (state && typeof state === "object") { detail = state.detail ?? state.message ?? detail; state = state.state ?? state.status; }
    if (!state) return;
    if (speech?.cancelled) { state = 'cancelled'; detail = 'Refresh the page to load models again.'; }
    const error = state === "error" ? (detail || "The microphone did not start.") : "";
    if (error) { say(error, "warn"); state = "idle"; }
    const mode = speechMode();
    voiceInvitation.querySelector('[data-voice-privacy]').textContent=mode==='web'?'Your browser’s speech service transcribes the audio. You can stop listening at any time.':MODES[mode].privacy;
    speechState = state;
    if (["loading", "listening", "busy", "cancelled"].includes(state)) hideVoiceInvitation(true);
    mic.dataset.state = mode === "none" ? "off" : state;
    const listening = !!speech?.listening || state === "listening";
    mic.setAttribute("aria-pressed", String(listening));
    let status = error;
    if (!error && state === "loading") {
      const pct = typeof detail === "object" ? detail?.pct : null;
      status = detail?.message || (typeof detail === "string" ? detail : "") || (mode === "whisper"
        ? Number.isFinite(pct) && pct < 100 ? `Loading Whisper · ${Math.round(pct)}%` : "Preparing Whisper…"
        : "Starting the microphone…");
    } else if (!error && state === "busy") status = "Transcribing on your device…";
    else if (!error && state === "listening") status = detail || (mode === "whisper" ? "Listening locally · Speak, then pause." : "Listening…");
    else if (state === 'cancelled') status = detail;
    speechStatus.textContent = status || "";
    speechStatus.hidden = !status;
    speechStatus.classList.toggle("is-error", !!error);
    const label = state === 'cancelled' ? 'Models stopped. Refresh the page to enable voice.' : mode === "none" ? "No speech recognition here" : listening ? "Stop listening" : state === "loading" ? "Cancel microphone startup" : "Start listening";
    mic.setAttribute("aria-label", label);
    mic.title = label;
    mic.disabled = mode === "none" || state === 'cancelled';
  }
  async function startListening() {
    if (speech?.cancelled) { setSpeechState('cancelled'); return false; }
    if (speechMode() === "none" || !speech?.start) { say(MODES.none.privacy, "warn"); return false; }
    if (speech?.listening || ["loading", "listening", "busy"].includes(speechState)) return true;
    if (beforeListen && (await beforeListen(speech)) === false) return false;
    try { return (await speech.start()) !== false; }
    catch (err) { setSpeechState("error", err?.message); return false; }
  }
  async function stopListening() {
    try { await speech?.stop?.(); } catch { /* already stopped */ }
    setSpeechState("idle");
  }
  mic.addEventListener("click", () => (speech?.listening || ["loading", "listening", "busy"].includes(speechState) ? stopListening() : startListening()));
  setSpeechState("idle");

  // ---- typing ---------------------------------------------------------------------
  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    router.route(text);
  });
  input.addEventListener("keydown", e => { if (e.key === "Escape") { input.value = ""; input.blur(); } });
  // spoken words fall into the input as they are heard (dim while interim);
  // the final sentence lands, is sent, and clears a beat later so it can be seen
  let heardTimer = 0;
  function setInterim(text) {
    clearTimeout(heardTimer);
    input.classList.toggle("interim", !!text);
    if (text) input.value = text;
  }
  function heard(text) {
    clearTimeout(heardTimer);
    input.classList.remove("interim");
    input.value = text;
    heardTimer = setTimeout(() => { if (input.value === text) input.value = ""; }, 900);
  }

  // ---- chips ----------------------------------------------------------------------
  let tryCommands = [], trySignature = '';
  chipBox.addEventListener("click", e => {
    const b = e.target.closest("[data-try-index]");
    if (!b) return;
    const command = tryCommands[Number(b.dataset.tryIndex)];
    if (command) router.route(command.text, command.action ? { action: command.action, slots: command.slots } : null);
  });
  // ---- what may run right now: a count in the status row, a list on click ----------
  // Current page names take precedence over the older head’s training examples.
  const canonical = {scroll_down:"scroll down",scroll_up:"scroll up",go_top:"go to the top",go_bottom:"go to the bottom",go_section:"go to the results",highlight_model:"highlight embeddings + head"};
  const exampleFor = label => {
    if(canonical[label]) return canonical[label];
    const contextual = router.commandExamples?.().find(c=>c.action===label); if(contextual) return contextual.text;
    const ex = judge?.head?.examples?.find(e => e.label === label);
    return ex ? ex.text : chips.flatMap(g => g.items).find(c => c.action === label)?.text || label.replace(/_/g, " ");
  };
  // the controls on screen are commands too ("open Jev", "press Restart dive"):
  // they come from the router's press resolver, so the list is exactly what a
  // spoken "click …" could reach right now
  const VERB = { link: "open", button: "press", tab: "switch to", "fold-out": "expand" };
  // Commands that exist only as speech (nothing on screen to press): the page's
  // navigation, the house's numeric threshold, the kitchen sentences. Everything
  // else on the page is a control, and its label is the command.
  const SPOKEN_ONLY = ["scroll_down", "scroll_up", "go_top", "go_bottom", "go_section", "highlight_model", "set_threshold"];
  let availControls = [];
  function refreshExamples(allowed, controls) {
    const current = router.commandExamples?.() || [];
    const submarine = current.some(c => c.action?.startsWith('submarine_'));
    if (decisionStation === 'submarine' && !submarine) {
      ask.hidden = true;
      note.textContent = 'Submarine commands become available when the ocean is visible.';
      note.hidden = false;
    }
    tryCommands = selectTryCommands({
      examples: current, allowed, context: router.context,
      controls: controls.filter(c => c.el.hasAttribute('data-try-command') && c.el.getAttribute('aria-pressed') !== 'true').map(c => ({text:c.label})),
      defaults: chips.flatMap(g => g.items),
    });
    const signature = JSON.stringify(tryCommands);
    if (signature !== trySignature) {
      trySignature = signature;
      chipBox.innerHTML = `<div class="cb-group">${tryCommands.map((c,i)=>`<button type="button" class="chip" data-try-index="${i}" data-text="${esc(c.text)}">${esc(c.text)}</button>`).join('')}</div>`;
    }
    input.placeholder = submarine ? 'Say or type a submarine or page command…' : 'Try a page command…';
  }
  function refreshAvail() {
    let set; try { set = router.allowed(); } catch { return; }
    const station = router.context?.station || null;
    const norm = t => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    availControls = set.has("press") ? (router.visibleControls?.() || []).filter(c => !c.el.classList.contains("chip")) : [];
    refreshExamples(set, availControls);
    const spoken = [...new Set([...SPOKEN_ONLY.filter(a => a!=="go_section" && set.has(a)), ...(router.commandExamples?.() || []).map(c=>c.action).filter(Boolean)])];
    const kitchen = (router.kitchen || []).filter(a => set.has(a));
    const total = spoken.length + availControls.length + (kitchen.length ? 1 : 0);
    const chip = (text, attrs, title) => `<button type="button" class="chip" ${attrs} title="${esc(title || text)}">${esc(text)}</button>`;
    const say = spoken.length ? `<div class="cb-group"><span class="cb-group-name">say</span>${spoken.map(a => chip(exampleFor(a), `data-text="${esc(exampleFor(a))}" data-action="${esc(a)}"`, a)).join("")}</div>` : "";
    const kit = kitchen.length ? `<div class="cb-group"><span class="cb-group-name">kitchen (any command, e.g.)</span>${kitchen.map(a => chip(exampleFor(a), `data-text="${esc(exampleFor(a))}" data-action="${esc(a)}"`, a)).join("")}</div>` : "";
    const seen = new Set();
    const ctl = availControls.length ? `<div class="cb-group"><span class="cb-group-name">on screen — say the text</span>${availControls.filter(c => { const k = norm(c.label); if (seen.has(k)) return false; seen.add(k); return true; }).map((c, i) =>
      chip(`${c.label}${c.external ? " ↗" : ""}`, `data-control="${availControls.indexOf(c)}"`, c.kind === "link" ? `link: say “${c.label}” or “open ${c.label}”` : c.kind)).join("")}</div>` : "";
    const destinations = `<div class="cb-group"><span class="cb-group-name">go anywhere</span>${Object.values(SECTIONS).map(names=>chip(`go to ${names[0]}`,`data-text="${esc(`go to ${names[0]}`)}"`)).join("")}</div>`;
    availList.innerHTML = say + destinations + kit + ctl +
      `<p class="cb-avail-note">Say a destination from anywhere on the page. Buttons, tabs and links respond by name while on screen. Start a support question with “Ask support,” or say “stop listening” to turn off the mic.</p>`;
  }
  availList.addEventListener("click", e => {
    const c = e.target.closest("[data-control]");
    if (c) { const ctl = availControls[Number(c.dataset.control)]; if (ctl) router.run?.("press", { control: ctl }, `${VERB[ctl.kind] || "press"} ${ctl.label}`); return; }
    const b = e.target.closest("[data-text]");
    if (!b) return;
    router.route(b.dataset.text, b.dataset.action ? { action: b.dataset.action, slots: null } : null);
  });
  // ---- the policy knob --------------------------------------------------------------
  const policyBtn = q("[data-policy-btn]"), policyBox = q("[data-policy]"), confIn = q("[data-conf]"), addrIn = q("[data-addr]"), confOut = q("[data-conf-out]"), addrOut = q("[data-addr-out]");
  function renderPolicy() {
    const p = judge?.getPolicy?.(); if (!p) return;
    confIn.value = p.actConf; addrIn.value = p.actAddressed;
    confOut.textContent = Number(p.actConf).toFixed(2); addrOut.textContent = Number(p.actAddressed).toFixed(2);
  }
  function selectSettingsTab(tab, open = true) {
    const thresholds = open && tab === 'thresholds', commands = open && tab === 'commands';
    policyBox.hidden = !thresholds;
    availList.hidden = !commands;
    for (const [button, selected] of [[policyBtn, thresholds], [availBtn, commands]]) {
      button.setAttribute('aria-selected', String(selected));
      button.setAttribute('aria-expanded', String(selected));
      button.tabIndex = button === (tab === 'thresholds' ? policyBtn : availBtn) ? 0 : -1;
    }
    if (open) collapse(false);
    if (thresholds) renderPolicy(); else if (commands) refreshAvail();
  }
  function togglePolicy(open = policyBox.hidden) {
    selectSettingsTab('thresholds', open);
  }
  policyBtn.addEventListener('click', () => togglePolicy());
  availBtn.addEventListener('click', () => toggleAvail());
  q('.cb-tabs').addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      selectSettingsTab(e.target === policyBtn ? 'thresholds' : 'commands', false);
      return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? policyBtn : e.key === 'End' ? availBtn : e.target === policyBtn ? availBtn : policyBtn;
    selectSettingsTab(next === policyBtn ? 'thresholds' : 'commands');
    next.focus();
  });
  confIn.addEventListener("input", () => { judge?.setPolicy?.({ actConf: Number(confIn.value) }); renderPolicy(); });
  addrIn.addEventListener("input", () => { judge?.setPolicy?.({ actAddressed: Number(addrIn.value) }); renderPolicy(); });
  renderPolicy();

  function toggleAvail(open = availList.hidden) {
    selectSettingsTab('commands', open);
  }
  try { router.onContext?.(() => { refreshAvail(); }); } catch { /* no context hook */ }
  // Answering an example or changing a result can replace the visible controls.
  document.addEventListener('click', () => requestAnimationFrame(refreshAvail));
  try { router.onDecision?.(() => refreshAvail()); } catch { /* no decision hook */ }
  // Async tools disable their controls while running, then make them available again.
  let controlsFrame = 0;
  new MutationObserver(records => {
    if (controlsFrame || !records.some(r => r.target.hasAttribute('data-try-command'))) return;
    controlsFrame = requestAnimationFrame(() => { controlsFrame = 0; refreshAvail(); });
  }).observe(document.body, {subtree:true, attributes:true, attributeFilter:['disabled','hidden','aria-pressed']});
  let scrollT = 0;
  addEventListener("scroll", () => { clearTimeout(scrollT); scrollT = setTimeout(refreshAvail, 250); }, { passive: true });
  try { judge?.onStatus?.(() => refreshAvail()); } catch { /* fine */ }
  refreshAvail();

  // Legacy "show examples" commands expand the tray; TRY itself always stays visible.
  function toggleChips(open = el.classList.contains("collapsed")) {
    collapse(!open);
  }

  // ---- collapse (the whole lower half; the mic and the input stay) -----------------
  function collapse(on = !el.classList.contains("collapsed")) {
    el.classList.toggle("collapsed", on);
    toggle.setAttribute("aria-expanded", String(!on));
    toggle.setAttribute("aria-label", on ? "Expand bar" : "Collapse bar");
    toggle.title = on ? "Expand" : "Collapse";
  }
  toggle.addEventListener("click", () => collapse());
  collapse(false);

  // ---- the decision panel ---------------------------------------------------------
  const pill = (text, cls = "") => `<span class="pill ${cls}">${esc(text)}</span>`;
  const bandCls = { act: "ok", ask: "accent", ignore: "" };
  function topRows(probs, choice, similarity = false) {
    top.setAttribute("aria-label", similarity ? "Top three commands and similarity scores" : "Top three commands and probabilities");
    const rows = Object.entries(probs || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
    top.innerHTML = rows.map(([l, p]) => `<div class="row ${l === choice ? "top" : ""}"><span class="lbl">${esc(words(l))}</span><span class="bar"><i style="width:${Math.max(0, Math.min(100, p * 100))}%"></i></span><span class="val">${similarity ? p.toFixed(2) : pct(p)}</span></div>`).join("");
  }
  function ctxText(ctx) {
    if (!ctx) return "";
    const parts = [];
    if (ctx.station) parts.push(`on ${ctx.station === "bars" ? "sure vs unsure" : `the ${ctx.station}`}`);
    if (ctx.section) parts.push(`in ${ctx.section.replace(/-/g, " ")}`);
    if (ctx.allowed) parts.push(`${ctx.allowed.size - 1} actions allowed here`);   // minus "none"
    return parts.join(" · ");
  }
  function open(cls = "") {
    panel.hidden = false;
    panel.className = `cb-decision ${cls}`;
    // Command feedback respects the reader’s chosen bar size.
  }
  function showPending(text, ctx) {
    lastText = text; decisionStation = null;
    open("pending");
    utt.textContent = `“${text}”`;
    pills.innerHTML = pill("judging…");
    top.innerHTML = "";
    ask.hidden = true; note.hidden = true;
    ctxLine.textContent = ctxText(ctx);
  }
  function showDecision(d) {
    lastText = d.text; decisionStation = d.station || null;
    open(d.band === "ignore" ? "dim" : "");
    utt.textContent = `“${d.text}”`;
    pills.innerHTML = [
      pill(d.band === "ignore" ? "Ignored · sounds like conversation" : d.band === "ask" ? "Needs clarification" : (d.ran ? `Done · ${words(d.action?.choice)}` : "No action taken"), bandCls[d.band] ?? ""),
      d.ms != null ? pill(`${Math.round(d.ms)} ms`) : "",
    ].join("");
    topRows(d.action?.probs, d.action?.choice, d.scoreKind === "similarity");
    // the ask band: the top two as chips; picking one runs it and teaches the head
    if (d.choices?.length) { showChoices(d.choices, "Which one?"); }
    else if (d.band === "ask") {
      const two = Object.entries(d.action?.probs || {}).sort((x, y) => y[1] - x[1]).slice(0, 2);
      ask.innerHTML = `<span class="cb-ask-q">Did you mean…?</span>${two.map(([l, p]) => `<button type="button" class="chip" data-teach="${esc(l)}">${esc(words(l))} <small>${d.scoreKind === "similarity" ? "" : pct(p)}</small></button>`).join("")}`;
      ask.hidden = false;
    } else ask.hidden = true;
    const notes = [];
    if (d.hint) notes.push(d.hint);
    if (d.band === "act" && !d.ran) notes.push(`${d.action?.choice} had nothing to run here`);
    if (d.band === "ignore") notes.push("Nothing on the page changed.");
    note.textContent = notes.join(" · ");
    note.hidden = !notes.length;
    ctxLine.textContent = "";
  }
  // the model was not ready (or failed): a chip ran on its own, or nothing did
  function showDirect(d) {
    lastText = d.text;
    open(d.action && d.ran !== false ? "direct" : "dim");
    utt.textContent = `“${d.text}”`;
    pills.innerHTML = d.ran === false ? pill("Not completed") : d.action ? pill(words(d.action), "accent") + pill("direct") : pill("not judged");
    top.innerHTML = "";
    ask.hidden = true;
    note.textContent = d.note || "";
    note.hidden = !d.note;
    ctxLine.textContent = ctxText(d.context);
  }
  function showTaught({ text, label, ran, failed = null, taught = true }) {
    note.textContent = `${taught ? "taught" : "confirmed"}: “${text}” → ${words(label)}${ran ? "" : failed ? ` (${failed})` : " (nothing to run)"}`;
    note.hidden = false;
    ask.hidden = true;
  }
  // the press resolver's candidates: a chip per control on screen; a link the
  // browser refused to pop comes as a real anchor to click
  function showChoices(items, question = "Which one?") {
    ask.innerHTML = `<span class="cb-ask-q">${esc(question)}</span>` + items.map(c => c.href
      ? `<a class="chip" href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.label)}</a>`
      : `<button type="button" class="chip" data-choice="${c.index}" title="${esc(c.kind || "")}">${esc(c.label)}${c.kind ? ` <small>${esc(c.kind)}</small>` : ""}</button>`).join("");
    ask.hidden = false;
    panel.hidden = false;
    if (el.classList.contains("collapsed")) say(`${question} Expand the bar to choose.`, "warn");
  }
  ask.addEventListener("click", e => {
    const c = e.target.closest("[data-choice]");
    if (c) { const said = router.pick?.(Number(c.dataset.choice)); if (said) { note.textContent = said; note.hidden = false; } ask.hidden = true; return; }
    const b = e.target.closest("[data-teach]");
    if (b) router.confirm(lastText, b.dataset.teach);
  });

  const bar = { el, setInterim, heard, refreshAvail, toggleAvail, togglePolicy, showChoices, showPending, showDecision, showDirect, showTaught, setSpeechState, startListening, stopListening, showVoiceInvitation, hideVoiceInvitation, toggleChips, collapse, focus: () => input.focus(),
    note(text) { note.textContent = text; note.hidden = !text; panel.hidden = false; } };
  router?.setBar?.(bar);
  return bar;
}
