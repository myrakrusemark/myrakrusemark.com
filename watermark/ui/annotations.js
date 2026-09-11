// Local editorial notes: native text selection -> editor -> project JSONL file.
const style = document.createElement('link');
style.rel = 'stylesheet'; style.href = new URL('../styles/annotations.css', import.meta.url);
document.head.append(style);
const ui = document.createElement('aside');
ui.id = 'annotation-ui';
ui.innerHTML = `
  <button class="an-toggle" type="button">Notes <span data-count>0</span></button>
  <section class="an-panel" hidden aria-label="Saved annotations">
    <div class="an-title"><b>Page notes</b><button type="button" data-close aria-label="Close notes">×</button></div>
    <p>Select text anywhere in the essay to add a note. Ask the assistant to read your notes when you’re ready.</p>
    <div data-notes></div>
  </section>
  <form class="an-editor" hidden aria-label="Add annotation">
    <div class="an-title"><b>Add a note</b><button type="button" data-cancel aria-label="Cancel annotation">×</button></div>
    <blockquote data-quote></blockquote>
    <textarea aria-label="Annotation" placeholder="Your comment or question…" rows="3" required maxlength="16000"></textarea>
    <div class="an-actions"><small>Enter to save · Shift+Enter for a new line</small><button type="submit">Save</button></div>
    <p data-error role="alert"></p>
  </form>
  <div class="an-status" role="status" aria-live="polite"></div>`;
document.body.append(ui);
const q = s => ui.querySelector(s);
const editor = q('form'), input = q('textarea'), panel = q('.an-panel');
let notes = [], selected = null, saving = false;
const ranges = new Map();
function pageText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement.closest('#annotation-ui, script, style, textarea, select, [hidden]')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = []; let text = '', node;
  while ((node = walker.nextNode())) { nodes.push({ node, start: text.length }); text += node.textContent; }
  return { nodes, text };
}
function findRange(note) {
  const { nodes, text } = pageText();
  let start = text.indexOf(note.prefix + note.quote + note.suffix);
  if (start >= 0) start += note.prefix.length;
  else start = text.indexOf(note.quote);
  if (start < 0) return null;
  const end = start + note.quote.length;
  const first = nodes.find(n => n.start + n.node.length > start);
  const last = nodes.find(n => n.start + n.node.length >= end);
  if (!first || !last) return null;
  const range = document.createRange();
  range.setStart(first.node, start - first.start); range.setEnd(last.node, end - last.start);
  return range;
}
function render() {
  q('[data-count]').textContent = notes.length;
  const list = q('[data-notes]'); list.replaceChildren();
  if (!notes.length) list.textContent = 'No notes yet. Highlight a passage to begin.';
  for (const note of notes) {
    const card = document.createElement('article');
    const quote = document.createElement('button'); quote.type = 'button'; quote.className = 'an-quote'; quote.textContent = note.quote;
    quote.onclick = () => {
      const range = findRange(note);
      if (range) range.startContainer.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else q('.an-status').textContent = 'The passage has changed. Your original quote is preserved in this note.';
    };
    const body = document.createElement('p'); body.textContent = note.note;
    const meta = document.createElement('small'); meta.textContent = `${note.status || 'open'} · ${note.section || 'Page'}`;
    card.append(meta, quote, body);
    if (note.response) { const response = document.createElement('p'); response.textContent = `Response: ${note.response}`; card.append(response); }
    list.append(card);
    const range = findRange(note); if (range) ranges.set(note.id, range);
  }
  if (globalThis.Highlight && CSS.highlights) CSS.highlights.set('page-notes', new Highlight(...ranges.values()));
}
async function load() {
  try {
    const res = await fetch('/api/annotations'); if (!res.ok) throw Error();
    notes = await res.json(); render();
  } catch { q('.an-status').textContent = 'Notes need the local review server. Saved notes have not been changed.'; }
}
function openSelection() {
  if (saving || !editor.hidden) return;
  const selection = getSelection();
  if (!selection.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0).cloneRange();
  if (ui.contains(range.startContainer) || ui.contains(range.endContainer)) return;
  const parent = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  if (parent.closest('input, textarea, [contenteditable="true"]')) return;
  const quote = range.cloneContents().textContent; if (!quote.trim()) return;
  const { text, nodes } = pageText();
  const first = nodes.find(n => n.node === range.startContainer);
  const start = first ? first.start + range.startOffset : text.indexOf(quote);
  const section = parent.closest('section')?.querySelector('h2')?.textContent || 'Page introduction';
  selected = { quote, section, page: location.pathname, prefix: start >= 0 ? text.slice(Math.max(0, start - 120), start) : '', suffix: start >= 0 ? text.slice(start + quote.length, start + quote.length + 120) : '', range };
  q('[data-quote]').textContent = quote;
  q('[data-error]').textContent = ''; input.value = ''; editor.hidden = false; input.focus();
}
document.addEventListener('mouseup', e => { if (!ui.contains(e.target)) setTimeout(openSelection, 0); });
document.addEventListener('keyup', e => { if (e.key === 'Shift' && !ui.contains(e.target)) openSelection(); });
q('.an-toggle').onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) load(); };
q('[data-close]').onclick = () => { panel.hidden = true; };
const cancel = () => { if (!saving) { editor.hidden = true; selected = null; } };
q('[data-cancel]').onclick = cancel;
input.addEventListener('keydown', e => {
  if (e.isComposing) return;
  if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editor.requestSubmit(); }
});
editor.addEventListener('submit', async e => {
  e.preventDefault(); if (saving || !selected || !input.value.trim()) return;
  saving = true; q('[type="submit"]').disabled = true;
  try {
    const { range, ...payload } = selected;
    const res = await fetch('/api/annotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, note: input.value }) });
    const result = await res.json(); if (!res.ok) throw Error(result.error);
    notes.push(result); ranges.set(result.id, range); render();
    editor.hidden = true; selected = null; getSelection().removeAllRanges();
    q('.an-status').textContent = 'Saved to the project. The assistant can read this note.';
  } catch (err) { q('[data-error]').textContent = err.message || 'Not saved. Your note is still here; try again.'; }
  finally { saving = false; q('[type="submit"]').disabled = false; }
});
await load();
