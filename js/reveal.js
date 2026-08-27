// reveal.js — the one scroll vocabulary for the whole site.
// [data-reveal] elements fade-up on intersection (CSS owns the look;
// this script only adds classes: .rvl on <html>, .revealed per
// element). [data-count] spans count up from 0 on reveal, 900ms,
// tabular-nums. No-ops on pages without the markup; with JS off
// nothing ever hides. Reduced motion: opacity-only (CSS) and no
// counters — final numbers are already in the markup.
(function () {
  var reveals = document.querySelectorAll('[data-reveal]');
  var counts = document.querySelectorAll('[data-count]');
  if (!reveals.length && !counts.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Count-up: the span's markup already holds the final number, so a
  // failed or skipped animation is simply the correct end state.
  function countUp(el) {
    if (reduced || el.__counted) return;
    el.__counted = true;
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var t0 = null;
    var DUR = 900;
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / DUR);
      // decelerating ramp, so the last digits settle rather than snap
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0';
    requestAnimationFrame(tick);
  }

  function revealNow(el) {
    el.classList.add('revealed');
    var inner = el.querySelectorAll('[data-count]');
    for (var i = 0; i < inner.length; i++) countUp(inner[i]);
    if (el.hasAttribute('data-count')) countUp(el);
  }

  if (!('IntersectionObserver' in window)) {
    // never hide anything: skip the .rvl gate entirely
    return;
  }

  document.documentElement.classList.add('rvl');

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      io.unobserve(entries[i].target);
      revealNow(entries[i].target);
    }
  }, { threshold: 0.15 });

  for (var i = 0; i < reveals.length; i++) io.observe(reveals[i]);

  // counters that live outside any [data-reveal] (the hero stats)
  // get observed on their own
  for (var j = 0; j < counts.length; j++) {
    if (!counts[j].closest('[data-reveal]')) io.observe(counts[j]);
  }
})();
