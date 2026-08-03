// click-counter.js — report a few outbound clicks to the click-counter
// Worker, which feeds the KPI rows on the dynacat board. Cloudflare Web
// Analytics only counts pageloads, so clicks have nowhere else to land.
// Worker source: ~/Dropbox/Work/click-counter. No-ops on pages without
// any of the tracked elements.
(function () {
  const URL = 'https://click-counter.myrakrusemark.workers.dev/e';
  const SITE = 'myrakrusemark.com';

  // event name -> selector. Both résumé buttons share one count.
  const TRACKED = {
    'resume-click': 'a[href$="Resume.pdf"]',
  };

  const send = (event) => {
    // keepalive lets the request outlive the page, same reason sendBeacon
    // exists. sendBeacon itself returns true and then aborts, so don't.
    // no-cors keeps the default text/plain content type, which is
    // CORS-safelisted and skips the preflight; the Worker parses the body
    // as JSON regardless of what the header claims.
    fetch(URL, {
      method: 'POST',
      body: JSON.stringify({ site: SITE, event }),
      keepalive: true,
      mode: 'no-cors',
    });
  };

  // Delegated, so it still fires on anything rendered after load. Capture
  // phase on purpose: the glass press handlers stop the click bubbling, so
  // a listener on the bubble phase never sees it.
  const selectors = Object.entries(TRACKED);
  if (!selectors.length) return;

  document.addEventListener(
    'click',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;
      for (const [event, selector] of selectors) {
        if (el.closest(selector)) {
          send(event);
          return;
        }
      }
    },
    true
  );
})();
