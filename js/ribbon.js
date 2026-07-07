// ribbon.js — shuffle + crawl: fresh order every load, then a slow
// drift. Must load before lightbox.js so the lightbox captures the
// shuffled order. No-ops on pages without a ribbon.
(function () {
  const ribbon = document.querySelector('#lens .ribbon');
  if (!ribbon) return;

  // Fisher-Yates on the figure elements, re-appended in shuffled order
  const figs = [...ribbon.children];
  for (let i = figs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [figs[i], figs[j]] = [figs[j], figs[i]];
  }
  figs.forEach(f => ribbon.appendChild(f));

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Slow marquee crawl. Figures that drift fully off the left edge are
  // recycled to the end, so the strip never runs out. Hover pauses it
  // so the thumbnails aren't moving targets.
  const SPEED = 14; // px/s
  const GAP = 10;   // matches .ribbon's flex gap
  let paused = false;
  ribbon.addEventListener('pointerenter', () => { paused = true; });
  ribbon.addEventListener('pointerleave', () => { paused = false; });

  // Position lives in a float: scrollLeft snaps to whole pixels on
  // 1x displays, so sub-pixel += increments would never accumulate.
  let pos = ribbon.scrollLeft;
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(now - last, 100);
    last = now;
    if (!paused && !document.hidden) {
      // Adopt the user's position if they scrolled the strip themselves
      if (Math.abs(ribbon.scrollLeft - pos) > 2) pos = ribbon.scrollLeft;
      pos += SPEED * dt / 1000;
      ribbon.scrollLeft = pos;
      const first = ribbon.firstElementChild;
      const r = first.getBoundingClientRect();
      if (r.right < 0) {
        ribbon.appendChild(first);
        pos -= r.width + GAP;
        ribbon.scrollLeft = pos;
        // Re-inserting a video pauses it; nudge it back into playback
        const vid = first.querySelector('video');
        if (vid) vid.play().catch(() => {});
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
