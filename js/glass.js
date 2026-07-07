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
    // it's what the glass refracts: blue slate, kraft grain,
    // watercolor wash, dot lattice. Layer order mirrors the CSS
    // background list (bottom-up: paper, then watercolor).
    const load = (src) => new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
    const [paper, wash] = await Promise.all([
      load('/assets/texture/paper.webp'),
      load('/assets/texture/watercolor-381.webp'),
    ]);

    const c = document.createElement('canvas');
    c.width = Math.round(window.innerWidth * 1.5);
    c.height = Math.round(window.innerHeight * 1.5);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#343b49';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'soft-light';
    for (let y = 0; y < c.height; y += 800) {
      for (let x = 0; x < c.width; x += 1200) {
        ctx.drawImage(paper, x, y, 1200, 800);
      }
    }
    // the wash stretches once over the whole plane (CSS: cover/center)
    const s = Math.max(c.width / wash.width, c.height / wash.height);
    ctx.drawImage(wash, (c.width - wash.width * s) / 2,
      (c.height - wash.height * s) / 2, wash.width * s, wash.height * s);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(232, 238, 248, 0.10)';
    // The plane is 1.5x the viewport, centered — its left/top edge sits
    // 0.25 viewport off-screen. Phase the dots so they land exactly on
    // the DOM background's fixed 22px lattice (origin 11,11).
    const phaseX = ((11 + c.width / 6) % 22 + 22) % 22;
    const phaseY = ((11 + c.height / 6) % 22 + 22) % 22;
    for (let y = phaseY; y < c.height; y += 22) {
      for (let x = phaseX; x < c.width; x += 22) {
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

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
      // Contact shadows were tuned for white paper; on slate they read
      // as smudges. The sheen and refraction carry the depth instead.
      if (comp.shadow) comp.shadow.visible = false;
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
