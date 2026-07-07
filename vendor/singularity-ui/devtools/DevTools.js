import { MATERIAL_PRESETS } from '../materials/presets.js';

/**
 * DevTools — inspector panel for tuning glass components.
 *
 * Click any glass component to select it. Sliders appear for
 * material and geometry properties. "Copy Values" exports the
 * current config as a pasteable object.
 *
 * Usage:
 *   import { DevTools } from './devtools/DevTools.js';
 *   DevTools.attach(engine);
 */
export class DevTools {
  constructor(engine) {
    this.engine = engine;
    this.selected = null;
    this.panel = null;

    this._onClick = this._onClick.bind(this);
    // Use capture phase so we can intercept before pointer tracker
    document.addEventListener('click', this._onClick, true);

    this._buildPanel();
  }

  static attach(engine) {
    return new DevTools(engine);
  }

  _buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'sg-devtools';
    panel.className = 'sg-dt-panel';
    panel.style.cssText = `
      position:fixed;top:16px;right:16px;z-index:9999;width:280px;
      background:rgba(0,0,0,0.82);backdrop-filter:blur(20px);
      border-radius:14px;padding:16px;
      font-family:"SF Mono","Fira Code",monospace;font-size:11px;
      color:rgba(255,255,255,0.8);max-height:90vh;overflow-y:auto;
      pointer-events:auto;
    `;
    panel.innerHTML = '<div class="sg-dt-handle" style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;cursor:grab;user-select:none">⠿ SG DevTools</div><div id="sg-dt-hint" style="color:rgba(255,255,255,0.3);font-size:10px">Click a glass component to inspect</div><div id="sg-dt-controls"></div>';

    // Shared styles for both panels
    const style = document.createElement('style');
    style.textContent = `
      .sg-dt-panel::-webkit-scrollbar{display:none}
      .sg-dt-panel label{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
      .sg-dt-panel label span:first-child{flex-shrink:0;min-width:95px}
      .sg-dt-panel input[type="range"]{width:100px;accent-color:#00d4ff;cursor:pointer}
      .sg-dt-panel .val{width:40px;text-align:right;font-variant-numeric:tabular-nums;color:#00d4ff;flex-shrink:0}
      .sg-dt-panel h4{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:12px 0 8px}
      .sg-dt-panel h4:first-child{margin-top:0}
      .sg-dt-panel .sg-dt-btn{background:rgba(0,212,255,0.2);border:none;color:#00d4ff;padding:6px 12px;border-radius:8px;font-size:10px;cursor:pointer;width:100%;margin-top:8px;font-family:inherit}
      .sg-dt-panel .sg-dt-btn:hover{background:rgba(0,212,255,0.3)}
    `;
    document.head.appendChild(style);
    document.body.appendChild(panel);
    this.panel = panel;
    DevTools._makeDraggable(panel);

    // Light panel — left side, always visible
    this._buildLightPanel();
  }

  _pointInPanel(x, y, panel) {
    if (!panel) return false;
    const r = panel.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  _onClick(e) {
    const x = e.clientX, y = e.clientY;

    // Don't intercept clicks inside devtools panels (rect check, not DOM contains)
    if (this._pointInPanel(x, y, this.panel)) return;
    if (this._pointInPanel(x, y, this.lightPanel)) return;

    // Don't intercept clicks on interactive page elements (nav, buttons, links)
    if (e.target.closest('nav, a, button, [onclick]')) return;

    // Hit test against components — use actual rendered position (group), not DOM rect
    const w = this.engine.renderer.width;
    const h = this.engine.renderer.height;
    for (const comp of this.engine.components) {
      if (comp.dismissed) continue;
      if (!comp.group.visible) continue;
      const rect = comp.element.getBoundingClientRect();
      // Convert group position (ortho space) to screen coords
      const screenX = comp.group.position.x + w / 2;
      const screenY = -comp.group.position.y + h / 2;
      const hw = rect.width / 2, hh = rect.height / 2;
      if (x >= screenX - hw && x <= screenX + hw && y >= screenY - hh && y <= screenY + hh) {
        e.stopPropagation();
        this.select(comp);
        return;
      }
    }
  }

  select(component) {
    this.selected = component;
    const controls = this.panel.querySelector('#sg-dt-controls');
    const hint = this.panel.querySelector('#sg-dt-hint');
    hint.style.display = 'none';

    const mat = component.mesh.material;
    const geo = component.geometryConfig;

    let html = `<div style="color:#00d4ff;font-size:10px;margin-bottom:8px">${component.componentType} — layer ${component.layer}</div>`;

    // Preset chooser
    html += '<h4>Preset</h4>';
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
    const presetNames = Object.keys(this._getPresets());
    for (const name of presetNames) {
      html += `<button class="sg-dt-btn sg-dt-preset" data-preset="${name}" style="width:auto;flex:1;min-width:60px;margin:0;font-size:9px">${name}</button>`;
    }
    html += '</div>';

    // Design knobs — the eight public parameters of the design system
    // (decided 2026-07-04). Perception labels, not physics labels.
    html += '<h4>Design</h4>';
    html += this._colorPicker('Tint', 'color', '#' + mat.color.getHexString());
    html += this._slider('Clarity', 'transmission', mat.transmission, 0, 1, 0.01);
    html += this._slider('Frost', 'roughness', mat.roughness, 0, 1, 0.01);
    html += this._slider('Refraction', 'ior', mat.ior, 1, 2.5, 0.01);
    html += this._slider('Gloss', 'clearcoat', mat.clearcoat, 0, 1, 0.01);
    html += this._slider('Thickness', 'geo-depth', geo.depth, 0.005, 0.15, 0.005);
    html += this._slider('Roundness', 'geo-cornerRadius', geo.cornerRadius, 0.01, 0.3, 0.005);
    html += this._slider('Bevel', 'geo-bevelSize', geo.bevelSize, 0, 0.09, 0.001);

    // Everything else is preset-locked in the design system; DevTools-only.
    html += '<details style="margin-top:12px"><summary style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);cursor:pointer;margin-bottom:8px">Advanced</summary>';
    html += this._slider('Opacity', 'opacity', mat.opacity, 0, 1, 0.01);
    html += this._slider('Refr. Volume', 'thickness', mat.thickness / 100, 0, 3, 0.05);
    html += this._slider('Metalness', 'metalness', mat.metalness, 0, 1, 0.01);
    html += this._slider('CC Rough', 'clearcoatRoughness', mat.clearcoatRoughness, 0, 1, 0.01);
    html += this._slider('Env Intensity', 'envMapIntensity', mat.envMapIntensity, 0, 3, 0.05);
    html += this._slider('Iridescence', 'iridescence', mat.iridescence, 0, 1, 0.01);
    html += this._slider('Irid. IOR', 'iridescenceIOR', mat.iridescenceIOR, 1, 2.5, 0.01);
    html += this._colorPicker('Attn Color', 'attenuationColor', '#' + mat.attenuationColor.getHexString());
    html += this._slider('Attn Dist', 'attenuationDistance', mat.attenuationDistance / 100, 0.1, 5, 0.1);
    html += this._slider('Rotate Y', 'rot-y', 0, -180, 180, 1);
    html += this._slider('Rotate X', 'rot-x', 0, -90, 90, 1);
    html += this._slider('Tone Exposure', 'exposure', this.engine.renderer.webgl.toneMappingExposure, 0.1, 3, 0.05);
    html += '</details>';

    html += '<button class="sg-dt-btn" id="sg-dt-copy">Copy Values</button>';
    html += '<button class="sg-dt-btn" id="sg-dt-apply-all" style="background:rgba(123,104,238,0.2);color:#7b68ee;margin-top:4px">Apply to All Same Type</button>';

    controls.innerHTML = html;
    this._wireSliders(component);
  }

  _colorPicker(label, key, value) {
    return `<label><span>${label}</span><input type="color" value="${value}" data-key="${key}" style="width:40px;height:20px;border:none;cursor:pointer"></label>`;
  }

  _slider(label, key, value, min, max, step) {
    return `<label><span>${label}</span><input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${value}"><span class="val" data-vkey="${key}">${Number(value).toFixed(2)}</span></label>`;
  }

  _getPresets() {
    return MATERIAL_PRESETS;
  }

  _wireSliders(component) {
    const controls = this.panel.querySelector('#sg-dt-controls');

    // Preset buttons
    controls.querySelectorAll('.sg-dt-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = this._getPresets()[btn.dataset.preset];
        if (!preset) return;
        component.setMaterial(preset);
        // Re-select to refresh all slider values
        this.select(component);
      });
    });

    // Color pickers
    controls.querySelectorAll('input[type="color"]').forEach(picker => {
      picker.addEventListener('input', () => {
        const key = picker.dataset.key;
        const mat = component.mesh.material;
        if (key === 'color') {
          mat.color.set(picker.value);
        } else if (key === 'attenuationColor') {
          mat.attenuationColor.set(picker.value);
        }
        mat.needsUpdate = true;
      });
    });

    controls.querySelectorAll('input[type="range"]').forEach(slider => {
      slider.addEventListener('input', () => {
        const key = slider.dataset.key;
        const val = parseFloat(slider.value);
        const display = controls.querySelector(`[data-vkey="${key}"]`);
        if (display) display.textContent = val.toFixed(2);

        if (key === 'exposure') {
          this.engine.renderer.webgl.toneMappingExposure = val;
        } else if (key.startsWith('rot-')) {
          if (!component._devRotation) component._devRotation = { x: 0, y: 0 };
          const axis = key.replace('rot-', '');
          component._devRotation[axis] = val * Math.PI / 180;
        } else if (key.startsWith('geo-')) {
          const geoProp = key.replace('geo-', '');
          component.geometryConfig[geoProp] = val;
          component.rebuild();
          // Thickness is one knob: geometry depth drives the material's
          // refraction volume (px), so glass optics match the visible slab
          if (geoProp === 'depth') {
            const width = component.lastWidth || component.element.getBoundingClientRect().width;
            component.mesh.material.thickness = val * width;
            component.mesh.material.needsUpdate = true;
          }
        } else {
          const mat = component.mesh.material;
          if (key === 'thickness') {
            mat.thickness = val * 100;
          } else if (key === 'attenuationDistance') {
            mat.attenuationDistance = val * 100;
          } else if (key === 'opacity') {
            mat[key] = val;
            mat.transparent = val < 1;
          } else {
            mat[key] = val;
          }
          mat.needsUpdate = true;
        }
      });
    });

    // Copy button
    const copyBtn = controls.querySelector('#sg-dt-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const mat = component.mesh.material;
        const config = {
          material: {
            transmission: mat.transmission,
            opacity: mat.opacity,
            transparent: mat.transparent,
            roughness: mat.roughness,
            ior: mat.ior,
            thickness: mat.thickness / 100,
            metalness: mat.metalness,
            clearcoat: mat.clearcoat,
            clearcoatRoughness: mat.clearcoatRoughness,
            envMapIntensity: mat.envMapIntensity,
            iridescence: mat.iridescence,
            iridescenceIOR: mat.iridescenceIOR,
            attenuationDistance: mat.attenuationDistance / 100,
            color: '#' + mat.color.getHexString(),
          },
          geometry: { ...component.geometryConfig },
          exposure: this.engine.renderer.webgl.toneMappingExposure,
        };
        navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy Values'; }, 1500);
        });
      });
    }

    // Apply to all same type
    const applyBtn = controls.querySelector('#sg-dt-apply-all');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const mat = component.mesh.material;
        const targetType = component.componentType;
        for (const comp of this.engine.components) {
          if (comp === component || comp.componentType !== targetType) continue;
          comp.setMaterial({
            transmission: mat.transmission,
            opacity: mat.opacity,
            transparent: mat.transparent,
            roughness: mat.roughness,
            ior: mat.ior,
            thickness: mat.thickness / 100,
            metalness: mat.metalness,
            clearcoat: mat.clearcoat,
            clearcoatRoughness: mat.clearcoatRoughness,
            envMapIntensity: mat.envMapIntensity,
            iridescence: mat.iridescence,
            iridescenceIOR: mat.iridescenceIOR,
            attenuationDistance: mat.attenuationDistance / 100,
          });
          comp.rebuild(component.geometryConfig);
        }
        applyBtn.textContent = 'Applied!';
        setTimeout(() => { applyBtn.textContent = 'Apply to All Same Type'; }, 1500);
      });
    }

  }

  _buildLightPanel() {
    const lp = document.createElement('div');
    lp.id = 'sg-dt-lights';
    lp.className = 'sg-dt-panel';
    lp.style.cssText = `
      position:fixed;top:16px;left:16px;z-index:9999;width:280px;
      background:rgba(0,0,0,0.82);backdrop-filter:blur(20px);
      border-radius:14px;padding:16px;
      font-family:"SF Mono","Fira Code",monospace;font-size:11px;
      color:rgba(255,255,255,0.8);max-height:90vh;overflow-y:auto;
      pointer-events:auto;
    `;
    document.body.appendChild(lp);
    this.lightPanel = lp;
    this._refreshLightPanel();
    // Re-apply after each refresh since innerHTML rebuild destroys the handle
    DevTools._makeDraggable(lp);
  }

  _refreshLightPanel() {
    const lp = this.lightPanel;
    let html = '<div class="sg-dt-handle" style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;cursor:grab;user-select:none">⠿ Lights</div>';

    const lights = this.engine.lights.getAll();
    lights.forEach(l => {
      const c = '#' + l.light.color.getHexString();
      html += `<div style="border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:8px;margin-bottom:6px">`;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-weight:600">${l.name}</span><span style="font-size:9px;color:rgba(255,255,255,0.3)">${l.type}</span><button data-remove="${l.id}" style="background:rgba(255,100,100,0.2);border:none;color:#ff6b6b;padding:2px 8px;border-radius:4px;font-size:9px;cursor:pointer">✕</button></div>`;
      html += `<label><span>Color</span><input type="color" value="${c}" data-light="${l.id}" data-lprop="color" style="width:36px;height:18px;border:none;cursor:pointer"></label>`;
      const maxI = l.type === 'point' ? 200000 : 5;
      const stepI = l.type === 'point' ? 1000 : 0.05;
      html += `<label><span>Intensity</span><input type="range" data-light="${l.id}" data-lprop="intensity" min="0" max="${maxI}" step="${stepI}" value="${l.light.intensity}"><span class="val">${l.type === 'point' ? Math.round(l.light.intensity) : l.light.intensity.toFixed(2)}</span></label>`;
      if (l.type !== 'ambient') {
        ['x', 'y', 'z'].forEach(axis => {
          html += `<label><span>${axis.toUpperCase()}</span><input type="range" data-light="${l.id}" data-lprop="pos-${axis}" min="-600" max="600" step="10" value="${l.light.position[axis]}"><span class="val">${Math.round(l.light.position[axis])}</span></label>`;
        });
      }
      html += `</div>`;
    });

    html += `<div style="display:flex;gap:4px;margin-top:6px">`;
    html += `<button class="sg-dt-btn" id="sg-lt-add-point" style="flex:1;margin:0">+ Point</button>`;
    html += `<button class="sg-dt-btn" id="sg-lt-add-dir" style="flex:1;margin:0;background:rgba(123,104,238,0.2);color:#7b68ee">+ Directional</button>`;
    html += `<button class="sg-dt-btn" id="sg-lt-add-ambient" style="flex:1;margin:0;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6)">+ Ambient</button>`;
    html += `</div>`;
    html += `<button class="sg-dt-btn" id="sg-lt-copy" style="background:rgba(0,212,255,0.2);margin-top:8px">Copy Light Values</button>`;

    lp.innerHTML = html;
    this._wireLightPanel();
  }

  _wireLightPanel() {
    const lp = this.lightPanel;

    lp.querySelectorAll('[data-light]').forEach(inp => {
      const lightId = parseInt(inp.dataset.light);
      const prop = inp.dataset.lprop;
      const entry = this.engine.lights.getAll().find(l => l.id === lightId);
      if (!entry) return;

      inp.addEventListener('input', () => {
        const disp = inp.parentElement.querySelector('.val');
        if (prop === 'color') {
          entry.light.color.set(inp.value);
        } else if (prop === 'intensity') {
          entry.light.intensity = parseFloat(inp.value);
          if (disp) disp.textContent = entry.type === 'point' ? Math.round(inp.value) : parseFloat(inp.value).toFixed(2);
        } else if (prop.startsWith('pos-')) {
          const axis = prop.split('-')[1];
          entry.light.position[axis] = parseFloat(inp.value);
          if (entry.light.userData.basePos) entry.light.userData.basePos[axis] = parseFloat(inp.value);
          if (disp) disp.textContent = Math.round(inp.value);
        }
      });
    });

    // Remove buttons
    lp.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.engine.lights.remove(parseInt(btn.dataset.remove));
        this._refreshLightPanel();
      });
    });

    // Add buttons
    const addPoint = lp.querySelector('#sg-lt-add-point');
    const addDir = lp.querySelector('#sg-lt-add-dir');
    const addAmb = lp.querySelector('#sg-lt-add-ambient');
    if (addPoint) addPoint.addEventListener('click', () => { this.engine.lights.add('point', { intensity: 50000, name: 'New point' }); this._refreshLightPanel(); });
    if (addDir) addDir.addEventListener('click', () => { this.engine.lights.add('directional', { intensity: 1.0, name: 'New directional' }); this._refreshLightPanel(); });
    if (addAmb) addAmb.addEventListener('click', () => { this.engine.lights.add('ambient', { color: 0x222244, intensity: 0.3, name: 'New ambient' }); this._refreshLightPanel(); });

    // Copy
    const copyBtn = lp.querySelector('#sg-lt-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const data = this.engine.lights.getAll().map(l => ({
          name: l.name, type: l.type,
          color: '#' + l.light.color.getHexString(),
          intensity: l.light.intensity,
          ...(l.type !== 'ambient' ? { position: [Math.round(l.light.position.x), Math.round(l.light.position.y), Math.round(l.light.position.z)] } : {}),
        }));
        navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy Light Values'; }, 1500);
        });
      });
    }
  }

  /**
   * Make a panel draggable by its .sg-dt-handle element.
   */
  static _makeDraggable(panel) {
    const handle = panel.querySelector('.sg-dt-handle');
    if (!handle) return;

    let dragging = false;
    let startX, startY, startLeft, startTop;

    handle.addEventListener('pointerdown', (e) => {
      dragging = true;
      handle.style.cursor = 'grabbing';
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      // Switch from right/bottom anchoring to left/top
      panel.style.left = startLeft + 'px';
      panel.style.top = startTop + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      e.preventDefault();
    });

    document.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.left = (startLeft + dx) + 'px';
      panel.style.top = (startTop + dy) + 'px';
    });

    document.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      handle.style.cursor = 'grab';
    });
  }

  destroy() {
    document.removeEventListener('click', this._onClick, true);
    if (this.panel) this.panel.remove();
    if (this.lightPanel) this.lightPanel.remove();
  }
}
