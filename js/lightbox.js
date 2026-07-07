// lightbox.js — full-resolution ribbon media on demand. Needs the
// .lightbox/#lb-stage markup and .ribbon figures; no-ops without.
(function () {
  const box = document.getElementById('lightbox');
  const stage = document.getElementById('lb-stage');
  if (!box || !stage) return; // page has no lightbox markup
  const items = [...document.querySelectorAll('.ribbon figure')].map(fig => {
    const el = fig.querySelector('img, video');
    const isVideo = el.tagName === 'VIDEO';
    return {
      fig,
      // data-iframe figures open an embedded experience instead of media
      iframe: fig.dataset.iframe || null,
      // Thumbs live in assets/media/, full versions in assets/media/full/.
      full: el.getAttribute('src').replace('assets/media/', 'assets/media/full/'),
      isVideo,
      caption: isVideo ? el.getAttribute('aria-label') : el.getAttribute('alt'),
    };
  });
  let current = -1;

  function show(i) {
    current = (i + items.length) % items.length;
    const it = items[current];
    stage.textContent = '';
    let el;
    if (it.iframe) {
      el = document.createElement('iframe');
      el.src = it.iframe;
      el.allow = 'autoplay';
      el.title = it.caption;
    } else if (it.isVideo) {
      el = document.createElement('video');
      el.src = it.full;
      // Sound on: the lightbox only opens from a click, so audible
      // autoplay is permitted. Clips without an audio track are silent.
      el.loop = true;
      el.autoplay = true;
      el.playsInline = true;
      el.controls = true;
    } else {
      el = document.createElement('img');
      el.src = it.full;
      el.alt = it.caption;
    }
    const cap = document.createElement('figcaption');
    cap.textContent = it.caption;
    stage.append(el, cap);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    box.hidden = true;
    stage.textContent = ''; // stop any playing video
    document.body.style.overflow = '';
  }

  items.forEach((it, i) => it.fig.addEventListener('click', () => show(i)));
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
  box.addEventListener('click', e => {
    // Backdrop and caption close; the media itself doesn't.
    if (e.target === box || e.target.tagName === 'FIGCAPTION') close();
  });
  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });
})();
