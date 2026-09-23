// Model registry: the ladder in registry.json plus the URL each file resolves
// to. Every rung carries the engine block so the worker imports the pinned
// transformers.js build, not whatever "latest" is that day.

export async function loadRegistry(url = new URL("./registry.json?v=e59fd3176d3189aa58c0", import.meta.url)) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`registry: HTTP ${res.status}`);
  const reg = await res.json();
  for (const rung of [...reg.rungs, reg.speech]) if (rung) rung.engine = reg.engine;
  return reg;
}

export function rungById(reg, id) {
  const rung = reg.rungs.find(r => r.id === id) || (reg.speech?.id === id ? reg.speech : null);
  if (!rung) throw new Error(`unknown rung ${id}`);
  return rung;
}

export const defaultRung = reg => reg.rungs.find(r => r.id === reg.defaultRung) || reg.rungs.find(r => r.default) || reg.rungs[0];

// The speech entry preloads on arrival when local speech is selected.
export const speechRung = reg => reg.speech || null;

// The resolve URLs at the pinned revision, in the registry's file order. These
// are exactly what transformers.js fetches (revision goes into its path
// template), so they are also its Cache API keys.
export function fileUrls(rung) {
  const host = rung.engine?.host || "https://huggingface.co";
  return Object.keys(rung.files).map(f => `${host}/${rung.repo}/resolve/${rung.revision}/${f}`);
}
