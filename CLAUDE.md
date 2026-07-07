# myrakrusemark.com

Myra's portfolio site, built on the singularity-ui glass engine. Static —
no build step. Open `index.html` via any static server (`.claude/launch.json`
runs one on port 8380).

## Deploying

This repo IS the live site: `github.com/myrakrusemark/myrakrusemark.com`
→ GitHub Pages (main, root, CNAME myrakrusemark.com, Cloudflare-proxied,
~10 min edge cache). A plain push to main deploys. Live since 2026-07-07;
developed in a separate repo before that, now retired.

- **GitHub rejects any blob over 100 MiB.** The resume-dvd videos are
  already re-encoded under it (CRF 25); run `find . -size +100M` before
  committing new media.
- This repo also hosts standalone apps the site links to — `futures/`,
  `period-tracker/`, `spot-the-difference/`, `image-request-form/`, and
  their `images/` dir. They predate the rebuild; never delete them.
- The watercolor background is CC BY (calebkimbrough) — the footer
  PAPER credit must survive any footer redesign.

## The design law

**Glass = things you can act on. Plain DOM = things you read.**

- Interactive elements — nav links, project cards, buttons, CTAs — are
  glass components (`sg-block` + `sg-tilt sg-press`, etc.). The glass is
  the affordance: if it's glass, you can click it.
- Titles, body text, images, captions are regular page content. Never put
  long-form reading inside glass.

## Code organization — pages share, pages stay thin

- `css/site.css` — the whole design system in one sheet. Cascade order
  matters; page-specific styles go in that page's own `<style>`, after
  the link.
- `js/` — one file per behavior: `physics.js` (DOM button feel),
  `glass.js` (engine bootstrap, module), `group-glaze.js` (shared sheen
  across touching button groups), `ribbon.js`, `lightbox.js`. Each
  no-ops on pages without its markup.
- Shared infra is referenced **root-relative** (`/css/…`, `/js/…`,
  `/vendor/…`, `/assets/texture/…`) so pages at any depth work. A
  page's own content images stay page-relative.
- A new page copies index.html's `<head>` (fonts + site.css) and script
  tags. The three.js **importmap cannot be external** — every page that
  uses glass carries the importmap block inline, version-matched to
  vite.config.js.

## Engine vendoring — experimentation stays out of the site

The engine is developed in `../singularity-ui` (labs like button-lab.html,
demo.html live there — experiment freely, on branches). This site consumes
a **pinned snapshot** at `vendor/singularity-ui/`, committed to this repo.

- `./sync-engine.sh [ref]` — re-copies engine `src/` from the given ref
  (default `master`) into `vendor/singularity-ui/` and stamps
  `vendor/singularity-ui/VERSION` with the source commit.
- Never edit `vendor/` by hand; fix in the engine repo, commit there,
  re-sync. Engine churn cannot break the site between syncs.
- Import via `./vendor/singularity-ui/index.js`. Three.js comes from CDN
  via importmap (same as the engine's own labs).

## Content sources

Current live site: https://myrakrusemark.com (static, "Cool Little
Projects"). UX case studies at /ux/. Résumé PDF at site root. Positioning
comes from the résumé: UX Architect — design systems, IA, AI-era product
experiences; directs AI coding agents to ship what she designs.
