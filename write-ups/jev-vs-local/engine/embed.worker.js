// Engine worker: owns the transformers.js pipelines (one per task) so
// tokenizing and the ONNX run stay off the main thread. One message per
// request; download progress is forwarded as it happens. The library itself
// is import()ed from the URL the registry pins, not bundled.

const FALLBACK_ENGINE = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
let lib = null;           // the transformers.js module, once
const pipes = new Map();  // task -> { rung, pipe }

async function library(rung) {
  if (lib) return lib;
  lib = await import(rung?.engine?.url || FALLBACK_ENGINE);
  lib.env.allowLocalModels = false;   // never probe /models/... on this origin first
  lib.env.useBrowserCache = true;     // Cache API 'transformers-cache': the picker reads it
  // Embedding and speech have separate workers and initialize concurrently.
  // Keep each WASM runtime to one thread, as with Qwen and Silero; this also
  // works on static hosts without cross-origin isolation.
  lib.env.backends.onnx.wasm.numThreads = 1;
  return lib;
}

// Per-file progress from transformers.js, plus a sum over the rung so the
// page can draw one bar: the registry's byte total is the denominator until
// the library has reported every file's size.
function progressForwarder(rung, reqId) {
  const seen = new Map();
  return e => {
    if (e.status !== "progress" && e.status !== "done" && e.status !== "download") return;
    if (e.file) seen.set(e.file, { loaded: e.status === "done" ? (e.total ?? seen.get(e.file)?.total ?? 0) : (e.loaded ?? 0), total: e.total ?? seen.get(e.file)?.total ?? 0 });
    let loaded = 0, total = 0;
    for (const v of seen.values()) { loaded += v.loaded; total += v.total; }
    total = Math.max(total, rung.bytes || 0);
    self.postMessage({ reqId, kind: "progress", data: {
      file: e.file, loaded: e.loaded ?? 0, total: e.total ?? 0, pct: e.total ? Math.round(100 * (e.loaded ?? 0) / e.total) : 0,
      all: { loaded, total, pct: total ? Math.round(100 * loaded / total) : 0 },
    } });
  };
}

async function ensurePipe(rung, reqId) {
  const task = rung.task || "feature-extraction";
  const have = pipes.get(task);
  if (have && have.rung.id === rung.id && have.rung.revision === rung.revision) return have.pipe;
  const t = await library(rung);
  if (have) { pipes.delete(task); await have.pipe.dispose?.().catch(() => {}); }
  const pipe = await t.pipeline(task, rung.repo, {
    revision: rung.revision,           // the pin is real: this goes into the resolve URL
    dtype: rung.dtype || "q8",         // q8 -> onnx/*_quantized.onnx, the files the registry lists
    device: "wasm",
    progress_callback: progressForwarder(rung, reqId),
  });
  pipes.set(task, { rung, pipe });
  self.postMessage({ reqId, kind: "ready", data: info() });
  return pipe;
}

function info() {
  return [...pipes.entries()].map(([task, p]) => ({ task, rung: p.rung.id, repo: p.rung.repo, revision: p.rung.revision }));
}

// one job at a time: info bypasses the queue so a stuck load can still be asked about
let chain = Promise.resolve();
self.onmessage = ev => {
  if (ev.data.cmd === "info") return handle(ev);
  chain = chain.then(() => handle(ev)).catch(() => {});
};

async function handle(ev) {
  const { reqId, cmd, args = {} } = ev.data;
  const done = (data, transfer) => self.postMessage({ reqId, kind: "done", data }, transfer || []);
  try {
    if (cmd === "info") return done(info());
    if (cmd === "unload") {
      for (const [task, p] of [...pipes]) {
        if (args.task && args.task !== task) continue;
        pipes.delete(task);
        await p.pipe.dispose?.().catch(() => {});
      }
      return done({});
    }
    if (cmd === "load") {
      await ensurePipe(args.rung, reqId);
      return done(info());
    }
    if (cmd === "embed") {
      // pooling and normalization are the head's, from the registry: cls for
      // bge, mean for MiniLM; both heads were trained on normalized vectors
      const pipe = await ensurePipe(args.rung, reqId);
      const texts = Array.isArray(args.texts) ? args.texts : [args.texts];
      if (!texts.length) return done({ n: 0, dim: 0, data: new Float32Array(0) });
      const out = await pipe(texts, { pooling: args.rung.pooling || "cls", normalize: args.rung.normalize !== false });
      const data = out.data instanceof Float32Array ? out.data : Float32Array.from(out.data);
      const dim = out.dims[out.dims.length - 1];
      out.dispose?.();
      return done({ n: texts.length, dim, data }, [data.buffer]);
    }
    if (cmd === "transcribe") {
      // audio: Float32Array, mono, 16 kHz (the main thread decodes it to that)
      const pipe = await ensurePipe(args.rung, reqId);
      const res = await pipe(args.audio, { chunk_length_s: 30, return_timestamps: false });
      return done({ text: String(res?.text ?? "").trim() });
    }
    throw new Error(`unknown command ${cmd}`);
  } catch (err) {
    self.postMessage({ reqId, kind: "error", data: { message: String(err && err.message || err) } });
  }
}
