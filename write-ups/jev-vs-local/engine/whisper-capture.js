// Silero VAD finds utterance boundaries and supplies mono 16 kHz PCM. Keep
// capture paused while Whisper transcribes, so inference jobs never pile up.
const VAD_ASSETS = "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.31/dist/";
const ORT_ASSETS = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
const MAX_SPEECH_MS = 10000;
const MAX_SAMPLES = MAX_SPEECH_MS * 16;
let libraryJob = null;

function loadScript(url, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return; }
    const script = document.createElement("script");
    script.src = url;
    script.crossOrigin = "anonymous";
    const cleanup = () => signal?.removeEventListener('abort', abort);
    const abort = () => { cleanup(); script.onload = script.onerror = null; script.remove(); script.removeAttribute('src'); reject(new DOMException('Cancelled', 'AbortError')); };
    signal?.addEventListener('abort', abort, {once: true});
    script.onload = () => { cleanup(); resolve(); };
    script.onerror = () => { cleanup(); script.remove(); reject(new Error("Could not load the voice detector. Check your connection and try again.")); };
    document.head.appendChild(script);
  });
}

async function loadVADLibrary({signal} = {}) {
  if (globalThis.vad?.MicVAD?.new) return globalThis.vad;
  if (!libraryJob) {
    libraryJob = (async () => {
      await loadScript(`${ORT_ASSETS}ort.wasm.min.js`, signal);
      await loadScript(`${VAD_ASSETS}bundle.min.js`, signal);
      if (!globalThis.vad?.MicVAD?.new) throw new Error("The voice detector did not initialize.");
      return globalThis.vad;
    })().catch(error => { libraryJob = null; throw error; });
  }
  return libraryJob;
}

async function loadVADModel(signal) {
  // vad-web 0.0.31 has no model-fetch abort hook. Download the weights here,
  // where they can be cancelled, then give its loader a local blob URL. URL
  // fragments are ignored by fetch, so its appended model filename is safe.
  const response = await fetch(`${VAD_ASSETS}silero_vad_v5.onnx`, {signal});
  if (!response.ok) throw new Error('Could not download the voice detector. Please retry.');
  const blob = await response.blob();
  signal.throwIfAborted();
  const url = URL.createObjectURL(blob);
  return {baseAssetPath: `${url}#`, release: () => URL.revokeObjectURL(url)};
}

export function createWhisperCapture({
  onAudio = async () => {}, onError = () => {}, onState = () => {},
  loadVAD = loadVADLibrary,
  loadModel = loadVAD === loadVADLibrary ? loadVADModel : async () => ({baseAssetPath: VAD_ASSETS, release() {}}),
  getStream: requestStream = () => navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, autoGainControl: true, noiseSuppression: true },
  }),
} = {}) {
  let session = null;
  const current = value => session === value && value.enabled;
  function getSession() {
    session ||= {
      context: null, enabled: false, stream: null, detector: null,
      loadJob: null, resumeJob: null, startJob: null, pauseJob: null, destroyJob: null,
      speechTimer: null, processing: false, controller: new AbortController(),
    };
    return session;
  }
  function clearSpeechTimer(value) {
    if (value.speechTimer !== null) clearTimeout(value.speechTimer);
    value.speechTimer = null;
  }
  function stopTracks(stream) {
    for (const track of stream?.getTracks() || []) {
      try { track.stop(); } catch { /* already ended */ }
    }
  }
  function destroyDetector(value) {
    if (!value.detector || value.destroyJob) return;
    value.destroyJob = Promise.resolve().then(async () => {
      try { await value.detector.destroy(); }
      catch {
        // Pinned vad-web 0.0.31 throws from getAudioInstances before releasing
        // its model if startup was cancelled. The verified published build
        // exposes that model here; release it even without initialized nodes.
        await value.detector.model?.release?.();
      }
    }).catch(() => {});
  }
  function stop() {
    const value = session;
    if (!value) return;
    session = null; // Invalidate permission, model, VAD and transcription callbacks first.
    value.controller.abort();
    value.enabled = false;
    clearSpeechTimer(value);
    stopTracks(value.stream);
    value.stream = null;
    try { Promise.resolve(value.context?.close()).catch(() => {}); } catch { /* already closed */ }
    destroyDetector(value);
  }
  function fail(error, value) {
    if (session !== value) return;
    stop();
    onError(error instanceof Error ? error : new Error(String(error?.message || error)));
  }

  // Run from the mic click before awaiting model downloads. Firefox then has
  // user activation when the native-rate AudioContext is created and resumed.
  function prepare() {
    const value = getSession();
    if (value.resumeJob) return value.resumeJob;
    try {
      const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContext) throw new Error("This browser cannot capture microphone audio.");
      value.context = new AudioContext();
      // MicVAD.options is public in pinned 0.0.31. Its first start() reads
      // audioContext only after obtaining a stream, so preload needs no audio
      // resources; this click supplies the context before that first start.
      if (value.detector) value.detector.options.audioContext = value.context;
      value.resumeJob = Promise.resolve(value.context.resume()).then(() => session === value, error => {
        fail(error, value);
        return false;
      });
      return value.resumeJob;
    } catch (error) {
      fail(error, value);
      return Promise.resolve(false);
    }
  }

  function pauseDetector(value) {
    if (value.pauseJob) return value.pauseJob;
    // Install the promise before pause() can synchronously emit onSpeechEnd.
    const job = Promise.resolve().then(() => value.detector.pause());
    value.pauseJob = job;
    const clear = () => { if (value.pauseJob === job) value.pauseJob = null; };
    void job.then(clear, clear);
    return job;
  }
  async function resumeDetector(value) {
    if (!current(value)) return;
    await value.detector.start();
    if (!current(value)) destroyDetector(value);
  }
  function acceptSpeech(value, audio) {
    if (!current(value) || value.processing || !audio?.length) return;
    clearSpeechTimer(value);
    value.processing = true;
    // The worker transfers ownership of its input buffer. Give it a bounded
    // copy so detaching that buffer cannot disturb the VAD's own state.
    const pcm = audio.slice(0, MAX_SAMPLES);
    void (async () => {
      try {
        await pauseDetector(value);
        if (!current(value)) return;
        await onAudio(pcm);
        if (!current(value)) return;
        value.processing = false;
        await resumeDetector(value);
      } catch (error) { fail(error, value); }
    })();
  }
  function speechStarted(value) {
    if (!current(value) || value.processing) return;
    clearSpeechTimer(value);
    value.speechTimer = setTimeout(() => {
      clearSpeechTimer(value);
      void (async () => {
        try {
          // submitUserSpeechOnPause flushes a long utterance through the same
          // onSpeechEnd path. Short misfires resume without calling Whisper.
          await pauseDetector(value);
          if (current(value) && !value.processing) await resumeDetector(value);
        } catch (error) { fail(error, value); }
      })();
    }, MAX_SPEECH_MS);
  }

  // Load the actual Silero inference session ahead of a mic click. With
  // startOnLoad false, MicVAD.new does not create a context or request audio.
  function preload() {
    const value = getSession();
    if (value.detector) return Promise.resolve(true);
    if (value.loadJob) return value.loadJob;
    const task = (async () => {
      let asset;
      try {
        onState("Loading voice detector…");
        const { MicVAD } = await loadVAD({signal: value.controller.signal});
        if (session !== value) return false;
        asset = await loadModel(value.controller.signal);
        if (session !== value) return false;
        const detector = await MicVAD.new({
          model: "v5", startOnLoad: false,
          ...(value.context ? { audioContext: value.context } : {}),
          baseAssetPath: asset.baseAssetPath, onnxWASMBasePath: ORT_ASSETS,
          ortConfig: ort => { ort.env.wasm.numThreads = 1; },
          minSpeechMs: 160, redemptionMs: 800, preSpeechPadMs: 300,
          submitUserSpeechOnPause: true,
          getStream: async () => {
            if (!current(value)) throw new Error("Microphone start was cancelled.");
            onState("Waiting for microphone permission…");
            const microphone = await requestStream();
            if (!current(value)) {
              stopTracks(microphone);
              throw new Error("Microphone start was cancelled.");
            }
            value.stream = microphone;
            for (const track of microphone.getTracks()) {
              track.addEventListener?.("ended", () => fail(new Error("The microphone disconnected. Try turning it on again."), value), { once: true });
            }
            return microphone;
          },
          // A short inference pause keeps permission and the existing stream.
          // stop() is the sole owner of releasing the physical microphone.
          pauseStream: async () => {},
          resumeStream: async () => {
            if (!current(value) || !value.stream) throw new Error("Microphone start was cancelled.");
            return value.stream;
          },
          onSpeechStart: () => speechStarted(value),
          onVADMisfire: () => clearSpeechTimer(value),
          onSpeechEnd: audio => acceptSpeech(value, audio),
        });
        // startOnLoad:false delays worklet loading until a click. Restore its
        // CDN directory after the model has read the temporary blob URL.
        detector.options.baseAssetPath = VAD_ASSETS;
        value.detector = detector;
        if (session !== value) { destroyDetector(value); return false; }
        if (value.context) detector.options.audioContext = value.context;
        return true;
      } catch (error) {
        fail(error, value);
        return false;
      } finally { asset?.release(); }
    })();
    const aborted = new Promise(resolve => value.controller.signal.addEventListener('abort', () => resolve(false), {once: true}));
    value.loadJob = Promise.race([task, aborted]);
    return value.loadJob;
  }

  function start() {
    const prepared = prepare();
    const value = session;
    if (!value) return Promise.resolve(false);
    if (value.startJob) return value.startJob;
    if (value.enabled) return Promise.resolve(true);
    value.enabled = true;
    value.startJob = (async () => {
      try {
        if (!(await prepared) || !current(value)) return false;
        if (!(await preload()) || !current(value)) return false;
        await value.detector.start();
        if (!current(value)) { destroyDetector(value); return false; }
        return true;
      } catch (error) {
        fail(error, value);
        return false;
      }
    })();
    return value.startJob;
  }

  return { preload, prepare, start, stop, get loaded() { return !!session?.detector; } };
}
