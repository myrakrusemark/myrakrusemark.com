// glass.js (module) — singularity-ui engine bootstrap: wallpaper
// canvas, north-window lights, flat-slab glass recipe, Necker-
// breaking shade loop. Requires the page to define the three.js
// importmap and to load physics.js and group-glaze.js first.
// Glass buttons: real singularity-ui slabs with the entire styled pill
// displayed inside (the engine clones the element, so the same CSS
// renders it in the glass). Whittle down from here. Cards keep the DOM
// physics. Buttons hand their motion to the engine via __physicsDrop.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    const [{ SingularityEngine }, { NoToneMapping }] = await Promise.all([
      import('/vendor/singularity-ui/index.js'),
      import('three'),
    ]);

    // The engine's wallpaper plane must match the page background —
    // it's what the glass refracts: warm cream paper, blue drafting
    // grid (minor 22px, major 110px), warm radial light. Pure canvas,
    // no texture loads — the layers mirror the CSS background list.
    const c = document.createElement('canvas');
    c.width = Math.round(window.innerWidth * 1.5);
    c.height = Math.round(window.innerHeight * 1.5);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#faf6ef';
    ctx.fillRect(0, 0, c.width, c.height);
    // The plane is 1.5x the viewport, centered — its left/top edge sits
    // 0.25 viewport off-screen. Phase the grid so it lands exactly on
    // the DOM background's fixed lattice (origin 0,0), the same way the
    // dot lattice was phased.
    const phase = (n) => ((c.width / 6) % n + n) % n;
    const phaseY = (n) => ((c.height / 6) % n + n) % n;
    const gridPass = (period, color) => {
      ctx.fillStyle = color;
      for (let x = phase(period); x < c.width; x += period) {
        ctx.fillRect(Math.round(x), 0, 1, c.height);
      }
      for (let y = phaseY(period); y < c.height; y += period) {
        ctx.fillRect(0, Math.round(y), c.width, 1);
      }
    };
    gridPass(22, 'rgba(96, 140, 190, 0.11)');
    gridPass(110, 'rgba(96, 140, 190, 0.18)');
    // Warm radial — CSS: radial-gradient(1200px 800px at 18% -8%, …).
    // CSS geometry is viewport-relative; map it onto the plane.
    const cx0 = 0.18 * (c.width / 1.5) + c.width / 6;
    const cy0 = -0.08 * (c.height / 1.5) + c.height / 6;
    ctx.save();
    ctx.translate(cx0, cy0);
    ctx.scale(1, 800 / 1200); // circular gradient → 1200x800 ellipse
    const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1200);
    rg.addColorStop(0, 'rgba(255, 211, 160, 0.32)');
    rg.addColorStop(0.62, 'rgba(255, 211, 160, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(-10000, -10000, 20000, 20000);
    ctx.restore();

    const engine = SingularityEngine.init('#app', {
      wallpaper: c.toDataURL(),
      wallpaperScroll: 0,
      // North-window rig: directional light has no position, so every
      // button reads the same wherever it sits and however far the
      // page scrolls.
      lights: [
        { type: 'directional', color: 0xdae6f5, intensity: 2.2, position: [-400, 300, 500], name: 'Window', drift: true },
        { type: 'ambient', color: 0xeef2f8, intensity: 0.35, name: 'Sky bounce' },
      ],
    });
    engine.renderer.webgl.toneMapping = NoToneMapping;

    // The button-lab beveled-lens recipe
    const GLASS = {
      material: {
        transmission: 1, opacity: 1, transparent: false,
        roughness: 0.16, ior: 1.3, thickness: 0.4,
        metalness: 0, clearcoat: 0, clearcoatRoughness: 1,
        envMapIntensity: 0, iridescence: 0.47, iridescenceIOR: 1.71,
        attenuationDistance: 5, attenuationColor: 0xf4f8ff, color: '#ffffff',
      },
      geometry: { depth: 0.005, bevelSize: 0, bevelSegments: 4 },
    };
    for (const comp of engine.components) {
      comp.setMaterial(GLASS.material);
      comp.rebuild(GLASS.geometry);
      // Contact shadows were tuned for white paper — back on for the
      // warm-light theme.
      if (comp.shadow) comp.shadow.visible = true;
      window.__physicsDrop?.(comp.element);
    }

    // The ortho camera has no perspective, so a tilt's silhouette is
    // identical pointing up or down — a Necker reversal. Break the tie
    // with shading: read each slab's true rotation and light the clone
    // like the window would. Tips up-left toward the light → brighten
    // (--shi); tips down-right toward the desk → dim (--dm).
    // three.js axes (y up): rotation.x+ tips the face DOWN (the normal
    // rotates to −y); rotation.y+ turns it right, away from the window.
    (function shade() {
      for (const comp of engine.components) {
        const rx = comp.group.rotation.x;
        const ry = comp.group.rotation.y;
        const el = comp.contentDiv;
        if (Math.abs(rx) < 0.004 && Math.abs(ry) < 0.004) {
          if (el.style.getPropertyValue('--shi') || el.style.getPropertyValue('--dm')) {
            el.style.removeProperty('--shi');
            el.style.removeProperty('--dm');
          }
          continue;
        }
        const facing = -rx * 3.2 - ry * 2.2;
        el.style.setProperty('--shi', Math.min(1, Math.max(0, facing)).toFixed(3));
        el.style.setProperty('--dm', Math.min(1, Math.max(0, -facing)).toFixed(3));
      }
      requestAnimationFrame(shade);
    })();

    window.engine = engine;
    // clones exist now — mirror the group vars onto them (only on
    // pages that load group-glaze.js)
    window.groupGlaze?.();
  } catch (err) {
    console.warn('Glass disabled:', err);
  }
}
