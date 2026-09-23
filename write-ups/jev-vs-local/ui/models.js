// Model picker: what this machine can run, what is already downloaded (the
// Cache API transformers.js writes to), the consent dialog with size and time
// before any download that is not the arrival one, and the remembered rung.

import { fileUrls } from "../engine/models.js?v=8ee67d2c3612bfccb49e";

export const MB = b => `${Math.round(b / 1e6)} MB`;
const RUNG_KEY = "jev.rung";
const CACHE_NAME = "transformers-cache";   // transformers.js's browser cache name

// these are small: a one-line estimate is all a visitor needs
export const timeEstimate = bytes => bytes < 60e6 ? "a few seconds on a normal connection" : "under a minute on a normal connection";

export class ModelPicker {
  // select is optional: with none, the picker keeps the choice itself
  constructor({ registry, probe, select = null, status = null, onChange = null }) {
    Object.assign(this, { registry, probe, select, status, onChange });
    this.cached = new Map();    // rung id -> { files: n, bytes }
    this.granted = new Set();   // rungs the visitor already agreed to (the one loading on arrival)
    this.value = null;
    let stored = null;
    try { stored = localStorage.getItem(RUNG_KEY); } catch { /* ignore */ }
    if (this.select) this.select.addEventListener("change", () => this.choose(this.select.value));
    this.render(stored);
  }

  get rungs() { return [...this.registry.rungs, ...(this.registry.speech ? [this.registry.speech] : [])]; }
  get rung() { return this.registry.rungs.find(r => r.id === this.value) || this.registry.rungs[0]; }
  ok(r) { const p = r.id === this.registry.speech?.id ? this.probe.speech : this.probe.rungs.find(x => x.id === r.id); return p ? p.ok : true; }
  reason(r) { const p = r.id === this.registry.speech?.id ? this.probe.speech : this.probe.rungs.find(x => x.id === r.id); return p?.reasons[0] ?? null; }

  choose(id) {
    if (!this.registry.rungs.some(r => r.id === id)) return;
    this.value = id;
    if (this.select && this.select.value !== id) this.select.value = id;
    try { localStorage.setItem(RUNG_KEY, id); } catch { /* ignore */ }
    this.renderStatus();
    this.onChange?.(this.rung);
  }

  render(preferred) {
    const usable = this.registry.rungs.filter(r => this.ok(r));
    const want = preferred && usable.some(r => r.id === preferred) ? preferred : this.probe.recommended;
    this.value = usable.some(r => r.id === want) ? want : (usable[0]?.id ?? this.registry.rungs[0].id);
    if (this.select) {
      this.select.innerHTML = "";
      for (const r of this.registry.rungs) {
        const o = document.createElement("option");
        o.value = r.id;
        o.textContent = `${r.id} · ${MB(r.bytes)}${this.cached.has(r.id) ? " · downloaded" : ""}`;
        if (!this.ok(r)) { o.disabled = true; o.textContent += ` · ${this.reason(r)}`; }
        this.select.appendChild(o);
      }
      this.select.value = this.value;
    }
    this.renderStatus();
  }

  describe(r) {
    return this.cached.has(r.id) ? "downloaded" : `${MB(r.bytes)} download · ${timeEstimate(r.bytes)}`;
  }

  renderStatus() {
    if (!this.status) return;
    const r = this.rung;
    const parts = [this.describe(r)];
    if (!this.ok(r)) parts.push(this.reason(r));
    this.status.textContent = parts.join(" · ");
    this.status.classList.toggle("warn", !this.ok(r));
  }

  // ask before the first download of a rung; true when allowed. dialog#consent
  // carries [data-name] [data-size] [data-time] [data-space]; without the
  // dialog a plain confirm() asks the same question.
  async consent(rung) {
    if (this.cached.has(rung.id) || this.granted.has(rung.id)) return true;
    const dlg = document.getElementById("consent");
    const est = this.probe.storage;
    const space = est?.quota ? `${MB(est.quota - (est.usage || 0))} free in this browser's storage.` : "";
    if (!dlg || typeof dlg.showModal !== "function") {
      const yes = confirm(`Download ${rung.id} (${MB(rung.bytes)})? It takes ${timeEstimate(rung.bytes)} and stays in this browser's storage. ${space}`);
      if (yes) this.granted.add(rung.id);
      return yes;
    }
    const set = (sel, text) => { const el = dlg.querySelector(sel); if (el) el.textContent = text; };
    set("[data-name]", rung.id);
    set("[data-size]", MB(rung.bytes));
    set("[data-time]", timeEstimate(rung.bytes));
    set("[data-space]", space);
    // the answer arrives three ways, whichever first: the form's submit (its
    // submitter is the button pressed), the dialog's close (returnValue), or
    // Escape (cancel). Chrome 152 closes a method="dialog" form without ever
    // firing close, so the submit listener is the one that usually answers.
    const form = dlg.querySelector("form");
    return new Promise(resolve => {
      const done = yes => {
        dlg.removeEventListener("close", onClose); dlg.removeEventListener("cancel", onCancel); form?.removeEventListener("submit", onSubmit);
        if (yes) this.granted.add(rung.id);
        resolve(yes);
      };
      const onSubmit = e => done(e.submitter?.value === "yes");
      const onClose = () => done(dlg.returnValue === "yes");
      const onCancel = () => done(false);
      dlg.addEventListener("close", onClose); dlg.addEventListener("cancel", onCancel); form?.addEventListener("submit", onSubmit);
      if (dlg.open) dlg.close();
      dlg.returnValue = "";
      dlg.showModal();
    });
  }

  // a rung is downloaded when every file it lists is in transformers.js's cache
  async scanCache() {
    this.cached = new Map();
    try {
      if (!self.caches) throw new Error("no Cache API");
      const cache = await caches.open(CACHE_NAME);
      for (const r of this.rungs) {
        const urls = fileUrls(r);
        const hits = await Promise.all(urls.map(u => cache.match(u).then(m => !!m).catch(() => false)));
        if (hits.length && hits.every(Boolean)) this.cached.set(r.id, { files: urls.length, bytes: r.bytes });
      }
    } catch { /* no cache: nothing downloaded */ }
    this.render(this.value);
  }

  // transformers.js only writes a file to the cache once it has all of it, so a
  // cancelled download leaves whole files behind, never a partial; a later
  // load of the same rung reuses them. Nothing to drop.
  async dropPartial() { /* kept for symmetry with the watermark picker */ }

  // forget a rung's files (the "remove download" affordance, if the page offers one)
  async evict(rung) {
    try { const cache = await caches.open(CACHE_NAME); for (const u of fileUrls(rung)) await cache.delete(u); } catch { /* ignore */ }
    await this.scanCache();
  }
}
