// group-glaze.js — chips packed into a touching group (flush
// chip/cta rows) sample one shared sheen gradient instead of each
// restarting its own. Sets --grp* on the source chips (inline
// style survives the engine's cloneNode) and mirrors onto live
// clones. glass.js calls groupGlaze() again once clones exist.
function groupGlaze() {
  for (const group of document.querySelectorAll('.chip-row.flush, .cta-row.flush')) {
    const g = group.getBoundingClientRect();
    if (!g.width) continue;
    for (const chip of group.querySelectorAll('.g-cta, .g-chip')) {
      const r = chip.getBoundingClientRect();
      const vars = [
        ['--grpw', g.width + 'px'], ['--grph', g.height + 'px'],
        ['--grpx', (r.left - g.left) + 'px'], ['--grpy', (r.top - g.top) + 'px'],
      ];
      const clone = window.engine?.components?.find(c => c.element === chip)?.contentDiv;
      for (const [k, v] of vars) {
        chip.style.setProperty(k, v);
        clone?.style.setProperty(k, v);
      }
    }
  }
}
groupGlaze();
document.fonts?.ready.then(groupGlaze); // Jost changes chip widths when it lands
window.addEventListener('resize', groupGlaze);
