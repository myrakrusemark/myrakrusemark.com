// bench.js — the workbench's two live touches. No-ops on pages
// without the markup; every failure path leaves the page identical
// to the static version.
//
// 1. The specimen dish: clicking it fires the sacred
//    #frederico-spawn path (frederico.js owns the spawn; this only
//    forwards the click) and swaps the callout's action line.
// 2. Live wind: fetch the latest KSTL observation from the National
//    Weather Service, convert km/h to mph, and only then unhide the
//    pre-rendered mono span in the Wind Chime row. No spinners, no
//    layout shift, nothing shown on any failure.
(function () {
  // ---- specimen dish ----
  var dish = document.getElementById('specimen-dish');
  var note = document.getElementById('dish-note');
  if (dish) {
    var act = null;
    if (note) {
      act = document.createElement('span');
      act.className = 'dish-act';
      act.textContent = 'Click to release';
      note.appendChild(act);
    }
    dish.addEventListener('click', function () {
      var spawn = document.getElementById('frederico-spawn');
      if (spawn) spawn.click();
      if (act) act.textContent = 'Released · Feed him letters';
    });
  }

  // ---- live St. Louis wind ----
  var span = document.getElementById('live-wind');
  if (!span || !window.fetch || !window.AbortController) return;

  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, 4000);

  fetch('https://api.weather.gov/stations/KSTL/observations/latest', {
    signal: ctrl.signal,
    headers: { 'Accept': 'application/geo+json' }
  })
    .then(function (res) {
      if (!res.ok) throw new Error('nws ' + res.status);
      return res.json();
    })
    .then(function (json) {
      clearTimeout(timer);
      var p = json && json.properties;
      var speed = p && p.windSpeed ? p.windSpeed.value : null; // km/h
      if (speed === null || speed === undefined) return; // calm days report null
      var mph = Math.round(speed * 0.621371);
      var deg = p && p.windDirection ? p.windDirection.value : null;
      var dir = '';
      if (deg !== null && deg !== undefined) {
        var points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        dir = ' ' + points[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
      }
      span.textContent = 'Live · St. Louis wind ' + mph + ' mph' + dir;
      span.hidden = false;
      span.classList.add('on');
    })
    .catch(function () {
      clearTimeout(timer);
      // stay hidden — the static page is the fallback
    });
})();
