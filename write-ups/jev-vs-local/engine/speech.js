// Browser speech when available; otherwise local Whisper transcribes each
// utterance after a pause and keeps the microphone open until the user stops it.
import { EngineClient } from "../ui/worker-client.js?v=e59fd3176d3189aa58c0";
import { createWhisperCapture } from "./whisper-capture.js?v=e59fd3176d3189aa58c0";

const SR = () => self.SpeechRecognition || self.webkitSpeechRecognition || null;
const SERVICE_KEY = "jev.browser-speech-service";
function serviceStatus() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SERVICE_KEY));
    return saved?.userAgent === navigator.userAgent ? saved.status : null;
  } catch { return null; }
}
function rememberService(status) {
  try { sessionStorage.setItem(SERVICE_KEY, JSON.stringify({ userAgent: navigator.userAgent, status })); } catch { /* session-only hint */ }
}

// An exposed SpeechRecognition constructor does not prove that a Chromium
// build has credentials for Google's service. Prefer branded Chrome or a
// service that has actually returned a result in this browser session.
export function selectSpeechMode({ web, whisper, brands, userAgent = "", vendor = "", brave = false, service = null }) {
  const otherBrowser = brave || /Electron\/|Edg[eiOS]*\/|OPR\/|Opera|Vivaldi\/|Chromium\/|SamsungBrowser\//i.test(userAgent);
  const chrome = !otherBrowser && (brands?.length
    ? brands.some(({ brand }) => brand === "Google Chrome")
    : /Chrome\//.test(userAgent) && vendor === "Google Inc.");
  if (web && service !== "failed" && (chrome || service === "working")) return "web";
  return whisper ? "whisper" : "none";
}

export const MODE_NOTE = {
  web: "Browser speech recognition: your browser sends the audio to its vendor to transcribe it.",
  whisper: "Whisper-tiny runs locally. Speak, then pause; click the mic again to stop. Audio stays on this device.",
  none: "No speech input in this browser: type instead.",
};

export function detectModes() {
  const web = !!SR();
  const whisper = typeof WebAssembly === "object"
    && !!(self.AudioContext || self.webkitAudioContext)
    && !!navigator.mediaDevices?.getUserMedia;
  return { web, whisper, pick: selectSpeechMode({ web, whisper,
    brands: navigator.userAgentData?.brands, userAgent: navigator.userAgent,
    vendor: navigator.vendor, brave: !!navigator.brave, service: serviceStatus(),
  }) };
}

const webError = code => ({
  network: "The browser’s speech service could not connect. Your local decision models are still available.",
  "not-allowed": "Microphone access was denied. Allow the microphone for this page, then try again.",
  "service-not-allowed": "This browser’s speech service is unavailable.",
  "audio-capture": "The browser could not capture microphone audio. Check your microphone and try again.",
}[code] || `Speech recognition failed: ${code}`);

export function createSpeech({ onText = () => {}, onInterim = () => {}, onState = () => {}, onLoadState = () => {}, onModeChange = () => {}, client = null, rung = null, consent = async () => true, loadHooks = {}, mode = null, captureFactory = createWhisperCapture } = {}) {
  const supports = detectModes();
  const api = { supports, mode: mode && supports[mode] ? mode : supports.pick };
  let state = "idle", rec = null, wantWeb = false, wantWhisper = false;
  let engine = client, loaded = false, loadJob = null, capture = null, detectorJob = null, session = 0;
  let keepWarm = false, preloadJob = null, consentJob = null;
  let cancelled = false, resolveCancelled;
  const cancelledJob = new Promise(resolve => { resolveCancelled = resolve; });
  const active = promise => Promise.race([promise, cancelledJob]);
  const setState = (next, detail = null) => { state = next; onState(next, detail); };
  setState("idle");

  function startWeb() {
    if (cancelled) return false;
    const R = SR(), recognition = new R();
    rec = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = ev => {
      if (rec !== recognition || !wantWeb) return;
      rememberService("working");
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i], text = result[0]?.transcript?.trim() || "";
        if (result.isFinal) {
          if (text) { onInterim(""); onText(text, { mode: "web", confidence: result[0].confidence }); }
        } else interim += (interim ? " " : "") + text;
      }
      if (interim) onInterim(interim);
    };
    recognition.onerror = ev => {
      if (rec !== recognition || ev.error === "no-speech" || ev.error === "aborted") return;
      wantWeb = false;
      if (["network", "service-not-allowed"].includes(ev.error) && supports.whisper) {
        rememberService("failed");
        rec = null;
        try { recognition.abort(); } catch { /* service already stopped */ }
        api.mode = "whisper";
        setState("error", "Browser speech is unavailable. Preparing local speech; click the mic when the models are ready.");
        onModeChange("whisper");
        return;
      }
      setState("error", webError(ev.error));
    };
    recognition.onend = () => {
      if (rec !== recognition) return;
      if (wantWeb) {
        try { recognition.start(); } catch (err) { wantWeb = false; setState("error", err.message); }
      } else if (state !== "error") setState("idle");
    };
    wantWeb = true;
    recognition.start();
    setState("listening");
    return true;
  }

  function allowModels() {
    if (cancelled) return Promise.resolve(false);
    if (!rung) return Promise.reject(new Error('The local speech model is not configured.'));
    if (!consentJob) consentJob = active(Promise.resolve().then(() => consent(rung))).finally(() => { consentJob = null; });
    return consentJob;
  }

  async function ensureWhisper() {
    if (cancelled) return false;
    if (loaded) return true;
    if (!rung) throw new Error("The local speech model is not configured.");
    if (loadJob) return loadJob;
    loadJob = (async () => {
      if (cancelled) return false;
      onLoadState("whisper", "loading");
      engine ||= new EngineClient();
      if (wantWhisper) setState("loading", { pct: 0 });
      const result = await active(engine.load(rung, { onProgress: progress => {
        if (cancelled) return;
        if (wantWhisper) setState("loading", progress.all || progress);
        loadHooks.onProgress?.(progress);
        onLoadState("whisper", "loading", progress.all || progress);
      } }));
      if (cancelled) return false;
      if (result?.cancelled) { onLoadState("whisper", "error", "Loading was interrupted"); return false; }
      loaded = true;
      onLoadState("whisper", "ready");
      return true;
    })().catch(error => { if (cancelled) return false; onLoadState("whisper", "error", error.message); throw error; }).finally(() => { loadJob = null; });
    return loadJob;
  }

  function getCapture() {
    if (capture) return capture;
    let input;
    const current = () => !cancelled && capture === input && wantWhisper;
    const fail = error => {
      if (!current()) return;
      wantWhisper = false;
      capture?.stop();
      capture = null;
      setState("error", error?.name === "NotAllowedError"
        ? "Microphone access was denied. Allow the microphone for this page, then try again."
        : `Local speech failed: ${error?.message || error}`);
    };
    input = captureFactory({
      async onAudio(audio) {
        if (!current()) return;
        const id = session;
        setState("busy");
        const result = await active(engine.transcribe(rung, audio));
        if (!current() || id !== session) return;
        if (result?.cancelled) { loaded = false; throw new Error("Transcription was interrupted. Click the mic to try again."); }
        const text = String(result?.text || "").trim();
        if (text) { onInterim(""); onText(text, { mode: "whisper" }); }
        if (current()) setState("listening", text ? null : "No words caught. Try speaking again.");
      },
      onError(error) {
        if (capture === input && !input.loaded) onLoadState("silero", detectorJob?.input === input ? "error" : "waiting", error?.message || String(error));
        fail(error);
      },
      onState(message) { if (current()) setState("loading", { message }); },
    });
    capture = input;
    return input;
  }

  async function ensureDetector(input = getCapture()) {
    if (cancelled) return false;
    if (input.loaded) return true;
    if (detectorJob?.input === input) return detectorJob.promise;
    onLoadState("silero", "loading");
    const promise = Promise.resolve().then(() => cancelled ? false : active(input.preload())).then(ok => {
      if (cancelled || capture !== input) return false;
      if (!ok) throw new Error("The voice detector could not load. Click the mic to retry.");
      onLoadState("silero", "ready");
      return true;
    }).catch(error => { if (capture === input) onLoadState("silero", "error", error.message); throw error; })
      .finally(() => { if (detectorJob?.input === input) detectorJob = null; });
    detectorJob = { input, promise };
    return promise;
  }

  function preload() {
    if (cancelled) return Promise.resolve(false);
    if (api.mode !== "whisper") return Promise.resolve(true);
    keepWarm = true;
    if (preloadJob) return preloadJob;
    // Whisper and Silero have independent runtimes and can warm together.
    // No AudioContext or microphone request. A normal mic stop can replace a
    // disposed detector; terminal model cancellation cannot.
    preloadJob = (async () => {
      if (!(await allowModels()) || cancelled) return false;
      const detector = (async () => {
        while (keepWarm && !cancelled && api.mode === 'whisper') {
          if (await ensureDetector()) return true;
        }
        return false;
      })();
      const ready = await Promise.all([ensureWhisper(), detector]);
      return ready.every(Boolean);
    })().finally(() => { preloadJob = null; });
    return preloadJob;
  }

  async function startWhisper() {
    const id = ++session;
    wantWhisper = true;
    const current = () => !cancelled && id === session && wantWhisper;
    const input = getCapture();
    setState("loading", { pct: 0 });
    try {
      // Resume the native-rate audio context during the click, before a model
      // download can consume the browser's user-activation window.
      if (!(await active(input.prepare()))) return false;
      if (!current()) return false;
      if (!(await allowModels()) || !current()) {
        if (current()) { wantWhisper = false; capture = null; input.stop(); setState("idle"); }
        return false;
      }
      const ready = await Promise.all([ensureWhisper(), ensureDetector(input)]);
      if (!ready.every(Boolean)) {
        if (current()) { wantWhisper = false; capture = null; input.stop(); setState('idle'); }
        return false;
      }
      if (!current()) return false;
      await input.start();
      if (!current()) { input.stop(); return false; }
      setState("listening");
      return true;
    } catch (error) {
      if (current()) {
        wantWhisper = false; input.stop(); capture = null;
        setState("error", `Local speech failed: ${error?.message || error}`);
      }
      return false;
    }
  }

  function stop() {
    ++session;
    wantWeb = false;
    wantWhisper = false;
    const recognition = rec;
    rec = null;
    try { recognition?.abort(); } catch { /* already stopped */ }
    capture?.stop();
    capture = null;
    if (!cancelled && api.mode === "whisper") onLoadState("silero", "waiting");
    onInterim("");
    setState(cancelled ? 'cancelled' : 'idle', cancelled ? 'Refresh the page to load models again.' : null);
    if (!cancelled && keepWarm && api.mode === "whisper") void preload().catch(() => {});
  }

  Object.assign(api, {
    async start() {
      if (cancelled) { setState('cancelled', 'Refresh the page to load models again.'); return false; }
      if (wantWeb || wantWhisper || state === "busy") return false;
      try {
        if (api.mode === "web") return startWeb();
        if (api.mode === "whisper") return await startWhisper();
        setState("error", "No speech input in this browser; type instead.");
      } catch (err) { wantWeb = false; setState("error", err.message); }
      return false;
    },
    stop,
    cancel() {
      if (cancelled) return;
      cancelled = true; keepWarm = false; loaded = false;
      resolveCancelled(false);
      stop();
      engine?.dispose?.();
      if (api.mode === 'whisper') for (const model of ['silero', 'whisper']) onLoadState(model, 'cancelled');
    },
    toggle() { return api.listening ? stop() : api.start(); },
    preload,
    setMode(next) {
      if (cancelled) return false;
      if (!supports[next] && next !== "none") return false;
      if (next !== "whisper") keepWarm = false;
      stop();
      api.mode = next;
      setState("idle");
      onModeChange(next);
      return true;
    },
  });
  // Object.assign would evaluate accessors once, leaving these values stale.
  Object.defineProperties(api, {
    state: { get: () => state },
    listening: { get: () => wantWeb || wantWhisper },
    loaded: { get: () => !cancelled && (api.mode === "web" || (loaded && !!capture?.loaded)) },
    cancelled: { get: () => cancelled },
    engine: { get: () => engine },
    note: { get: () => MODE_NOTE[api.mode] },
  });
  return api;
}
