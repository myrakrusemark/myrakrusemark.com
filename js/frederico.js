// Frederico — the "Birth a worm here" button in the projects list.
// Turns the button into a live bookmarklet: clicking it spawns a worm on THIS
// page; dragging it to the bookmarks bar installs it for any page. On a page
// where the worm is already running, both just add another worm.
// No-ops on any page without the button.
(function () {
  var btn = document.getElementById('frederico-spawn');
  if (!btn) return;

  var OVERLAY = 'https://myrakrusemark.com/frederico/frederico-overlay.js';

  // Bookmarklet source: start the worm if it isn't running here yet, otherwise
  // add another worm via the hook the overlay exposes once booted.
  var code =
    "(function(){" +
      "if(window.__frederico){" +
        "if(window.__fredericoAddWorm){window.__fredericoAddWorm();}" +
        "return;" +
      "}" +
      "window.__frederico=1;" +
      "var s=document.createElement('script');" +
      "s.type='module';" +
      "s.src='" + OVERLAY + "';" +
      "s.onerror=function(){window.__frederico=0;alert('Frederico could not load here \\u2014 this site probably blocks external scripts (CSP).');};" +
      "(document.body||document.documentElement).appendChild(s);" +
    "})();";

  // Draggable bookmarklet target (drop it on the bookmarks bar to install).
  btn.setAttribute('href', 'javascript:' + encodeURI(code));
  btn.setAttribute('draggable', 'true');

  // Clicking on this page runs it directly (spawn a worm here) without navigating
  // — more reliable than relying on the javascript: href firing through the glass
  // button. Middle-click / open-in-new-tab still fall back to the project page.
  btn.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    try { (0, eval)(code); } catch (err) { /* CSP or eval blocked — ignore */ }
  });
})();
