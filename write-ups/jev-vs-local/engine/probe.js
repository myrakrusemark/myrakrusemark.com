// Hardware probe (main thread): what this browser can run, and which rung to
// recommend. Feature tests, not user-agent sniffing. Nothing here needs
// cross-origin isolation: the models are small and run single-threaded fine.

export async function probe(registry) {
  const wasm = typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function";
  // requestAdapter can stall on a machine without a GPU; a second is plenty to know
  const webgpu = !!navigator.gpu && !!(await Promise.race([
    navigator.gpu.requestAdapter().catch(() => null),
    new Promise(r => setTimeout(() => r(null), 1000)),
  ]));
  const deviceMemory = navigator.deviceMemory ?? null;   // Chromium only, capped at 8
  const saveData = !!navigator.connection?.saveData;
  const speechRecognition = !!(self.SpeechRecognition || self.webkitSpeechRecognition);
  const mediaRecorder = typeof MediaRecorder === "function" && !!navigator.mediaDevices?.getUserMedia;
  let storage = null;
  try { storage = await navigator.storage.estimate(); } catch { /* not available */ }
  const free = storage?.quota ? storage.quota - (storage.usage || 0) : null;

  const check = r => {
    const reasons = [];
    if (!wasm) reasons.push("needs WebAssembly");
    if (free !== null && r.bytes > free) reasons.push("not enough storage to cache the download");
    return { id: r.id, ok: reasons.length === 0, reasons };
  };
  const rungs = registry.rungs.map(check);
  const speech = registry.speech ? check(registry.speech) : null;

  // the default rung unless the visitor asked for less data or storage is
  // tight (under twice the default's size), then the small one
  const dflt = registry.rungs.find(r => r.id === registry.defaultRung) || registry.rungs[0];
  const tight = free !== null && free < 2 * dflt.bytes;
  const small = registry.rungs.reduce((a, b) => (b.bytes < a.bytes ? b : a));
  let recommended = (saveData || tight) ? small.id : dflt.id;
  if (!rungs.find(x => x.id === recommended)?.ok) recommended = rungs.find(x => x.ok)?.id ?? dflt.id;

  return {
    wasm, webgpu, deviceMemory, saveData, speechRecognition, mediaRecorder,
    storage: storage ? { usage: storage.usage, quota: storage.quota } : null,
    rungs, speech, recommended,
  };
}
