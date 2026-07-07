import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { EDGE_FADE_THRESHOLD, LAYER_DEFAULTS, LAYER_Z_OFFSET } from '../materials/defaults.js';


/**
 * Base class for all glass components.
 * Manages the dual group (WebGL + CSS3D), DOM tracking, material,
 * geometry, edge-fade, and composable behaviors.
 */
export class GlassComponent {
  /**
   * @param {HTMLElement} element - Source DOM element
   * @param {object} options - { renderer, materialConfig, geometryConfig, componentType }
   */
  constructor(element, { renderer, materialConfig, geometryConfig, componentType = 'block' }) {
    this.element = element;
    this.renderer = renderer;
    this.componentType = componentType;
    this.layer = LAYER_DEFAULTS[componentType] ?? 0;
    this.behaviors = [];
    this.dismissed = false;
    this.visible = true;

    // Read accent color from data attribute
    this.accent = element.dataset.accent || element.dataset.sgAccent || '#00d4ff';

    // Measure element
    const rect = element.getBoundingClientRect();
    this.lastWidth = rect.width;
    this.lastHeight = rect.height;

    // Build geometry
    this.geometryConfig = { ...geometryConfig };
    this.materialConfig = { ...materialConfig };

    // The element's CSS border-radius is the source of truth for glass
    // corner rounding — components follow basic CSS rules, including an
    // explicit 0 (square corners). Computed style always yields a px
    // value, so the abstract cornerRadius token is only a fallback for
    // detached/zero-width measurement.
    const brPx = parseFloat(getComputedStyle(element).borderTopLeftRadius);
    if (Number.isFinite(brPx) && rect.width > 0) {
      this.geometryConfig.cornerRadius = (brPx * 1.45) / rect.width;
    }

    // Z-offset for layer separation (ortho camera = invisible to viewer)
    this.zOffset = this.layer * LAYER_Z_OFFSET;

    // Create mesh
    this.mesh = this._buildMesh(rect.width, rect.height);

    // WebGL group — single shared scene, z-separated by layer
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    renderer.scene.add(this.group);

    // Contact shadow — grounds the glass on the page. The ortho camera
    // gives no depth cue, so the shadow is what says "resting on the desk".
    // Lives outside the group: it tracks position and scale but must not
    // inherit tilt.
    this.shadow = this._buildShadow(rect.width, rect.height);
    renderer.scene.add(this.shadow);

    // CSS3D content — separate renderer per layer for DOM stacking
    const cssLayer = renderer.getCSSLayer(this.layer);
    this.contentDiv = this._buildContentDiv(rect.width, rect.height);
    this.cssObject = new CSS3DObject(this.contentDiv);
    this.cssObject.position.z = 0; // center of glass

    // CSS3D group
    this.cssGroup = new THREE.Group();
    this.cssGroup.add(this.cssObject);
    cssLayer.cssScene.add(this.cssGroup);

    // Hide source element
    element.style.visibility = 'hidden';

    // Disturbance state (used by behaviors)
    this.disturbance = { rx: 0, ry: 0, pressZ: 0 };
  }

  /**
   * Build the extruded glass mesh.
   */
  _buildMesh(width, height) {
    const { depth, cornerRadius, bevelSize, bevelSegments } = this.geometryConfig;
    const glassDepthPx = depth * width;
    const cr = cornerRadius * (width / 1.45 / 10);
    const bevelPx = bevelSize * width * 0.3;

    const shape = GlassComponent.roundedRectShape(
      width - bevelPx * 2,
      height - bevelPx * 2,
      Math.max(0.1, cr * 10 - bevelPx),
    );

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: glassDepthPx,
      bevelEnabled: bevelSize > 0.0005,
      bevelThickness: bevelPx,
      bevelSize: bevelPx,
      bevelSegments,
    });
    geometry.center();
    GlassComponent.remapUVs(geometry, width, height);

    // Edge-gated refraction: the thickness map is ~0 across the face and
    // ramps up in a ring at the rim, so material.thickness bends the
    // background hard at the edges without making the slab read thick.
    this._edgeMap?.dispose();
    this._edgeMap = GlassComponent.buildEdgeThicknessTexture(width, height, bevelPx * 2 + 12);

    const mc = this.materialConfig;
    const material = new THREE.MeshPhysicalMaterial({
      thicknessMap: this._edgeMap,
      color: mc.color ?? 0xffffff,
      metalness: mc.metalness ?? 0,
      roughness: mc.roughness ?? 0.25,
      transmission: mc.transmission ?? 1.0,
      thickness: (mc.thickness ?? 0.2) * 100,
      ior: mc.ior ?? 2.5,
      envMap: this.renderer.envMap,
      envMapIntensity: mc.envMapIntensity ?? 0,
      clearcoat: mc.clearcoat ?? 0,
      clearcoatRoughness: mc.clearcoatRoughness ?? 1.0,
      side: THREE.FrontSide,
      transparent: mc.transparent ?? false,
      opacity: mc.opacity ?? 1.0,
      attenuationColor: new THREE.Color(mc.attenuationColor ?? 0x4488ff),
      attenuationDistance: (mc.attenuationDistance ?? 5.0) * 100,
      iridescence: mc.iridescence ?? 0,
      iridescenceIOR: mc.iridescenceIOR ?? 1.3,
      iridescenceThicknessRange: mc.iridescenceThicknessRange ?? [100, 400],
    });

    this.glassDepthPx = glassDepthPx;
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Soft elliptical contact shadow on a plane behind the glass.
   */
  _buildShadow(width, height) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
    g.addColorStop(0, 'rgba(52, 44, 64, 0.38)');
    g.addColorStop(0.55, 'rgba(52, 44, 64, 0.16)');
    g.addColorStop(1, 'rgba(52, 44, 64, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 1.35, height * 1.9),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
      }),
    );
    return mesh;
  }

  /**
   * Build the CSS3D content element: a deep clone of the source element.
   * The element's own classes ride along, so class-based page CSS applies
   * inside the CSS3D layer — components follow basic CSS rules (size,
   * typography, layout, content all come from the page). Caveat: selectors
   * scoped to ancestors of the source element (e.g. `.page .card h3`)
   * won't match the clone; style components with class-based selectors.
   * Subclasses can override for custom content layouts.
   */
  _buildContentDiv(width, height) {
    const clone = this.element.cloneNode(true);
    clone.removeAttribute('id'); // no duplicate ids in the document
    // Pin the box to the measured rect; the source element stays in the
    // page flow (hidden) and remains the layout source of truth.
    clone.style.visibility = 'visible';
    clone.style.margin = '0';
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.boxSizing = 'border-box';
    clone.style.pointerEvents = 'auto';
    return clone;
  }

  /**
   * Attach a behavior to this component.
   * @param {class} BehaviorClass - Behavior constructor
   * @param {object} options - Behavior-specific options
   */
  use(BehaviorClass, options = {}) {
    const behavior = new BehaviorClass(this, options);
    this.behaviors.push(behavior);
    return this;
  }

  /**
   * Get a specific attached behavior by class.
   */
  getBehavior(BehaviorClass) {
    return this.behaviors.find((b) => b instanceof BehaviorClass) || null;
  }

  /**
   * Update DOM tracking, behaviors, and edge-fade.
   * Called each frame by the engine.
   */
  update(time, dt, pointer) {
    if (this.dismissed) return;

    const rect = this.element.getBoundingClientRect();
    const w = this.renderer.width;
    const h = this.renderer.height;
    const cx = rect.left + rect.width / 2 - w / 2;
    const cy = -(rect.top + rect.height / 2 - h / 2);

    // Let behaviors modify position and rotation
    let posX = cx, posY = cy, posZ = 0;
    let rotX = 0, rotY = 0, rotZ = 0;
    for (const behavior of this.behaviors) {
      const result = behavior.update(time, dt, pointer, { cx, cy, rect });
      if (result) {
        if (result.position) {
          posX += result.position.x || 0;
          posY += result.position.y || 0;
          posZ += result.position.z || 0;
        }
        if (result.rotation) {
          rotX += result.rotation.x || 0;
          rotY += result.rotation.y || 0;
          rotZ += result.rotation.z || 0;
        }
      }
    }

    this.group.position.set(posX, posY, posZ + this.zOffset);
    this.cssGroup.position.set(posX, posY, posZ + this.zOffset);

    // Shadow tracks position/scale but not tilt; sinking (posZ < 0)
    // tightens it toward the surface. Offset down-left, away from the lamp.
    if (this.shadow) {
      const s = this.group.scale.x * Math.max(0.6, 1 + posZ / 350);
      this.shadow.position.set(posX - 10, posY - 14, this.zOffset - 120);
      this.shadow.scale.set(s, s, 1);
    }
    // DevTools rotation override
    if (this._devRotation) {
      rotX += this._devRotation.x;
      rotY += this._devRotation.y;
    }
    this.group.rotation.set(rotX, rotY, rotZ);
    this.cssGroup.rotation.set(rotX, rotY, rotZ);

    // Edge-fade
    this._applyEdgeFade(rotY);
  }

  _applyEdgeFade(rotY) {
    // Skip edge-fade if a behavior has disabled it (e.g., hinge animation)
    if (this._disableEdgeFade) {
      this.cssObject.element.style.opacity = 1;
      return;
    }
    const frontFacing = Math.abs(Math.cos(rotY));
    this.cssObject.element.style.opacity = Math.min(1, frontFacing / EDGE_FADE_THRESHOLD);
  }

  /**
   * Rebuild geometry (e.g., after slider change).
   */
  rebuild(geometryConfig) {
    if (geometryConfig) {
      Object.assign(this.geometryConfig, geometryConfig);
    }

    const rect = this.element.getBoundingClientRect();
    const { depth, cornerRadius, bevelSize, bevelSegments } = this.geometryConfig;
    const pw = rect.width;
    const ph = rect.height;
    const glassDepthPx = depth * pw;
    const cr = cornerRadius * (pw / 1.45 / 10);
    const bevelPx = bevelSize * pw * 0.3;

    const shape = GlassComponent.roundedRectShape(
      pw - bevelPx * 2,
      ph - bevelPx * 2,
      Math.max(0.1, cr * 10 - bevelPx),
    );

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: glassDepthPx,
      bevelEnabled: bevelSize > 0.0005,
      bevelThickness: bevelPx,
      bevelSize: bevelPx,
      bevelSegments,
    });
    geometry.center();

    this.mesh.geometry.dispose();
    this.mesh.geometry = geometry;
    this.glassDepthPx = glassDepthPx;

    GlassComponent.remapUVs(geometry, pw, ph);
    this._edgeMap?.dispose();
    this._edgeMap = GlassComponent.buildEdgeThicknessTexture(pw, ph, bevelPx * 2 + 12);
    this.mesh.material.thicknessMap = this._edgeMap;
    this.mesh.material.needsUpdate = true;

    // Etch z-spread follows the slab depth
    if (this._etched) this._rebuildEtch();
  }

  /**
   * Normalize UVs to the element box (0..1 across width/height) so
   * box-aligned maps (edge thickness) line up with the extruded shape.
   */
  static remapUVs(geometry, width, height) {
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    if (!uv) return;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, pos.getX(i) / width + 0.5, pos.getY(i) / height + 0.5);
    }
    uv.needsUpdate = true;
  }

  /**
   * Ring texture for thicknessMap (green channel): black face, white rim
   * band of ringPx, feathered inward.
   */
  static buildEdgeThicknessTexture(width, height, ringPx) {
    const W = 512;
    const H = Math.max(64, Math.round((W * height) / width));
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);

    const insetX = (ringPx * W) / width;
    const insetY = (ringPx * H) / height;
    ctx.filter = `blur(${Math.max(2, insetX * 0.5)}px)`;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(insetX, insetY, W - insetX * 2, H - insetY * 2,
      Math.min(24, (H - insetY * 2) / 2));
    ctx.fill();
    ctx.filter = 'none';

    return new THREE.CanvasTexture(c);
  }

  /**
   * Update material properties.
   */
  setMaterial(props) {
    Object.assign(this.materialConfig, props);
    const mat = this.mesh.material;
    if (props.transmission !== undefined) mat.transmission = props.transmission;
    if (props.roughness !== undefined) mat.roughness = props.roughness;
    if (props.ior !== undefined) mat.ior = props.ior;
    if (props.thickness !== undefined) mat.thickness = props.thickness * 100;
    if (props.metalness !== undefined) mat.metalness = props.metalness;
    if (props.clearcoat !== undefined) mat.clearcoat = props.clearcoat;
    if (props.clearcoatRoughness !== undefined) mat.clearcoatRoughness = props.clearcoatRoughness;
    if (props.iridescence !== undefined) mat.iridescence = props.iridescence;
    if (props.iridescenceIOR !== undefined) mat.iridescenceIOR = props.iridescenceIOR;
    if (props.attenuationDistance !== undefined) mat.attenuationDistance = props.attenuationDistance * 100;
    if (props.envMapIntensity !== undefined) mat.envMapIntensity = props.envMapIntensity;
    if (props.transparent !== undefined) mat.transparent = props.transparent;
    if (props.opacity !== undefined) mat.opacity = props.opacity;
    if (props.color !== undefined) mat.color.set(props.color);
    if (props.attenuationColor !== undefined) mat.attenuationColor.set(props.attenuationColor);
  }

  /**
   * Laser-etch mode — the bubblegram paperweight. Rasterize the element's
   * text as a mask, fill it with grayscale white>transparent noise, and
   * show that instead of the glyphs. Applied in the CSS3D layer, not
   * WebGL: the DOM compositor renders the noise at native pixel density
   * (the WebGL canvas pixelated it and its premultiplied-alpha blend put
   * dark fringes on the grains), it can never be blurred by the glass
   * material, and child divs with translateZ spread the noise through the
   * slab depth so it parallaxes under tilt exactly like scene geometry.
   * Single-line text only: rasterization draws element.textContent.
   */
  etch() {
    this._etched = true;
    this._rebuildEtch();
    // Rasterize again once webfonts arrive — engine init usually wins the
    // race against the font load and would etch the fallback face.
    document.fonts?.ready.then(() => { if (this._etched) this._rebuildEtch(); });
  }

  _rebuildEtch() {
    const rect = this.element.getBoundingClientRect();
    const width = rect.width, height = rect.height;
    if (width < 1 || height < 1) return;

    // Keep the clone's layout box but hide its glyphs; the noise layers
    // become the visible text. (Nested elements that set their own color
    // would defeat this — etch is for single-line text content.)
    this.contentDiv.style.color = 'transparent';
    this.contentDiv.style.transformStyle = 'preserve-3d';
    this.contentDiv.querySelectorAll('.sg-etch-layer').forEach((el) => el.remove());

    const SS = 3; // supersample factor for the raster
    const GRAIN = 3; // canvas px per noise grain → ~1 CSS px
    const LAYERS = 3;

    // Rasterize the text once as a mask
    const mc = document.createElement('canvas');
    mc.width = Math.round(width * SS);
    mc.height = Math.round(height * SS);
    const mctx = mc.getContext('2d', { willReadFrequently: true });
    const cs = getComputedStyle(this.element);
    mctx.scale(SS, SS);
    mctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if (cs.letterSpacing && cs.letterSpacing !== 'normal') mctx.letterSpacing = cs.letterSpacing;
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.fillStyle = '#fff';
    mctx.fillText(this.element.textContent.trim(), width / 2, height / 2);
    const mask = mctx.getImageData(0, 0, mc.width, mc.height).data;

    // The etch floats mid-slab. Thin slabs still get a minimum spread so
    // the layers parallax under tilt instead of reading as a decal.
    const zSpread = Math.max(this.geometryConfig.depth * width * 0.7, 6);

    for (let li = 0; li < LAYERS; li++) {
      const nc = document.createElement('canvas');
      nc.width = mc.width;
      nc.height = mc.height;
      const nctx = nc.getContext('2d');
      nctx.fillStyle = '#fff';
      for (let y = 0; y < nc.height; y += GRAIN) {
        for (let x = 0; x < nc.width; x += GRAIN) {
          const a = mask[(y * mc.width + x) * 4 + 3] / 255;
          if (a === 0) continue;
          // Grayscale, not 1-bit: every grain gets a continuous alpha,
          // weighted faint so a few bright grains ride over a dim field.
          // The glyph mask's antialiased edges feather the noise out.
          nctx.globalAlpha = a * 0.9 * (0.08 + 0.92 * Math.random() ** 2);
          nctx.fillRect(x, y, GRAIN, GRAIN);
        }
      }
      const z = (li / (LAYERS - 1) - 0.5) * zSpread;
      const layer = document.createElement('div');
      layer.className = 'sg-etch-layer';
      layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;' +
        `background:url(${nc.toDataURL()}) center / 100% 100% no-repeat;` +
        `transform:translateZ(${z.toFixed(1)}px);`;
      this.contentDiv.appendChild(layer);
    }
  }

  /**
   * Remove this component from the scene.
   */
  dismiss() {
    this.dismissed = true;
    this.group.visible = false;
    this.cssGroup.visible = false;
    if (this.shadow) this.shadow.visible = false;
    this.element.style.display = 'none';
  }

  destroy() {
    for (const behavior of this.behaviors) {
      if (behavior.destroy) behavior.destroy();
    }
    this.behaviors.length = 0;

    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this._edgeMap?.dispose();
    this._etched = false;
    this.renderer.scene.remove(this.group);
    if (this.shadow) {
      this.shadow.geometry.dispose();
      this.shadow.material.map?.dispose();
      this.shadow.material.dispose();
      this.renderer.scene.remove(this.shadow);
    }
    const cssLayer = this.renderer.getCSSLayer(this.layer);
    cssLayer.cssScene.remove(this.cssGroup);

    this.element.style.visibility = '';
    this.element.style.display = '';
  }

  /**
   * Rounded rectangle shape for extrusion.
   */
  static roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const hw = w / 2, hh = h / 2;
    r = Math.min(r, hw, hh);
    s.moveTo(-hw + r, -hh);
    s.lineTo(hw - r, -hh);
    s.quadraticCurveTo(hw, -hh, hw, -hh + r);
    s.lineTo(hw, hh - r);
    s.quadraticCurveTo(hw, hh, hw - r, hh);
    s.lineTo(-hw + r, hh);
    s.quadraticCurveTo(-hw, hh, -hw, hh - r);
    s.lineTo(-hw, -hh + r);
    s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
    return s;
  }
}
