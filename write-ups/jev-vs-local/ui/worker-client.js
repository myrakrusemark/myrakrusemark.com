// Main-thread client for engine/embed.worker.js: one promise per job, progress
// pumped to the caller's hooks, cancel by restart (a download has no abort hook).

export class EngineClient {
  constructor() {
    this.disposed = false;
    this.pending = new Map();
    this.next = 1;
    this.spawn();
  }
  spawn() {
    if (this.disposed) return;
    this.worker = new Worker(new URL("../engine/embed.worker.js?v=8ee67d2c3612bfccb49e", import.meta.url), { type: "module" });
    this.worker.onmessage = ev => {
      const { reqId, kind, data } = ev.data;
      const p = this.pending.get(reqId);
      if (!p) return;
      if (kind === "progress") p.onProgress?.(data);
      else if (kind === "ready") p.onReady?.(data);
      else if (kind === "done") { this.pending.delete(reqId); p.resolve(data); }
      else if (kind === "cancelled") { this.pending.delete(reqId); p.resolve({ cancelled: true }); }
      else if (kind === "error") { this.pending.delete(reqId); p.reject(new Error(data.message)); }
    };
    this.worker.onerror = e => { for (const p of this.pending.values()) p.reject(new Error(e.message || "worker error")); this.pending.clear(); };
  }
  run(cmd, args = {}, hooks = {}, transfer = []) {
    if (this.disposed) return Promise.resolve({ cancelled: true });
    return new Promise((resolve, reject) => {
      const reqId = this.next++;
      this.pending.set(reqId, { resolve, reject, cmd, ...hooks });
      this.worker.postMessage({ reqId, cmd, args }, transfer);
    });
  }
  // kill the worker and start a fresh one: every pending job resolves as
  // cancelled, and whatever it had loaded is gone
  restart() {
    this.stopWorker();
    this.spawn();
  }
  stopWorker() {
    if (this.worker) {
      this.worker.onmessage = null;
      this.worker.onerror = null;
      this.worker.terminate();
      this.worker = null;
    }
    for (const p of this.pending.values()) p.resolve({ cancelled: true });
    this.pending.clear();
  }
  // A user cancellation is terminal. Unlike restart, it must not create a
  // replacement worker that a late callback can use to resume downloading.
  dispose() { this.disposed = true; this.stopWorker(); }
  load(rung, hooks) { return this.run("load", { rung }, hooks); }
  embed(rung, texts) { return this.run("embed", { rung, texts }); }
  transcribe(rung, audio) { return this.run("transcribe", { rung, audio }, {}, [audio.buffer]); }
  unload(task) { return this.run("unload", { task }); }
  info() { return this.run("info"); }
  get busy() { return [...this.pending.values()].some(p => p.cmd === "load" || p.cmd === "transcribe"); }
}
