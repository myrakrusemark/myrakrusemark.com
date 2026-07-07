import { GlassRenderer } from './GlassRenderer.js';
import { Wallpaper } from './Wallpaper.js';
import { LightRig } from './LightRig.js';
import { PointerTracker } from './PointerTracker.js';
import { GlassBlock } from '../components/GlassBlock.js';
import { GlassPanel } from '../components/GlassPanel.js';
import { GlassModal } from '../components/GlassModal.js';
import { GlassComponent } from '../components/GlassComponent.js';
import { MATERIAL_PRESETS, DEFAULT_MATERIAL } from '../materials/presets.js';
import { GEOMETRY_DEFAULTS } from '../materials/defaults.js';
import { HoverTilt } from '../behaviors/HoverTilt.js';
import { SwipeArchive } from '../behaviors/SwipeArchive.js';
import { SwipeSpin } from '../behaviors/SwipeSpin.js';
import { PressIndent } from '../behaviors/PressIndent.js';
import { SlideIn } from '../behaviors/SlideIn.js';
import { ScaleIn } from '../behaviors/ScaleIn.js';

/** Attribute → behavior class mapping */
const BEHAVIOR_MAP = {
  'sg-tilt': HoverTilt,
  'sg-swipe': SwipeArchive,
  'sg-spin': SwipeSpin,
  'sg-press': PressIndent,
};

/** sg-slide="right" → SlideIn behavior with edge option */
const SLIDE_EDGES = ['left', 'right', 'top', 'bottom'];

/** CSS selector → component class mapping */
const COMPONENT_MAP = {
  'sg-block': GlassBlock,
  'sg-panel': GlassPanel,
  'sg-modal': GlassModal,
  'sg-button': GlassComponent, // TODO: GlassButton
  'sg-nav': GlassComponent,    // TODO: GlassNav
};

/**
 * SingularityEngine — top-level orchestrator.
 * Auto-discovers sg-* elements, creates glass components, wires behaviors.
 */
export class SingularityEngine {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.options = options;
    this.components = [];
    this._animationId = null;
    this._time = 0;

    // Core systems
    this.renderer = new GlassRenderer(this.container);
    this.pointer = new PointerTracker();
    this.lights = new LightRig(this.renderer.scene);
    this.wallpaper = new Wallpaper(
      this.renderer.scene,
      options.wallpaper || null,
      this.renderer.width,
      this.renderer.height,
      { scrollFactor: options.wallpaperScroll ?? 0.3 },
    );

    // Default lights
    if (options.lights) {
      for (const l of options.lights) {
        this.lights.add(l.type, l);
      }
    } else {
      // Default rig: "drafting table" (chosen 2026-07-04) — warm task lamp
      // close in from the upper right, cool window daylight from the left,
      // low warm bounce so the shadow side never goes dead.
      this.lights.add('point', { color: 0xffcf99, intensity: 90000, position: [260, 210, 320], name: 'Lamp' });
      this.lights.add('directional', { color: 0xdfe9f7, intensity: 1.6, position: [-420, 280, 480], name: 'Window' });
      this.lights.add('ambient', { color: 0xfff4e6, intensity: 0.25, name: 'Bounce' });
    }
  }

  /**
   * Auto-discover all sg-* elements and create components.
   */
  discover() {
    for (const [className, ComponentClass] of Object.entries(COMPONENT_MAP)) {
      const elements = this.container.querySelectorAll(`.${className}`);
      for (const el of elements) {
        this._createComponent(el, ComponentClass, className.replace('sg-', ''));
      }
    }

    this.pointer.setComponents(this.components);
    return this;
  }

  /**
   * Manually add a single element as a glass component.
   */
  addBlock(element, options = {}) {
    return this._createComponent(element, GlassBlock, 'block', options);
  }

  addPanel(element, options = {}) {
    return this._createComponent(element, GlassPanel, 'panel', options);
  }

  addModal(element, options = {}) {
    return this._createComponent(element, GlassModal, 'modal', options);
  }

  _createComponent(element, ComponentClass, type, overrides = {}) {
    // Resolve material
    const presetName = element.getAttribute('sg-material') || overrides.material || DEFAULT_MATERIAL;
    const materialConfig = { ...(MATERIAL_PRESETS[presetName] || MATERIAL_PRESETS[DEFAULT_MATERIAL]), ...overrides.materialConfig };

    // Resolve geometry
    const geometryConfig = { ...(GEOMETRY_DEFAULTS[type] || GEOMETRY_DEFAULTS.block), ...overrides.geometryConfig };

    const component = new ComponentClass(element, {
      renderer: this.renderer,
      materialConfig,
      geometryConfig,
    });

    // Auto-attach behaviors from attributes
    for (const [attr, BehaviorClass] of Object.entries(BEHAVIOR_MAP)) {
      if (element.hasAttribute(attr)) {
        component.use(BehaviorClass);
      }
    }

    // SlideIn behavior from sg-slide="right" or sg-slide="right:hinge"
    const slideAttr = element.getAttribute('sg-slide');
    if (slideAttr) {
      const [edge, mode] = slideAttr.split(':');
      if (SLIDE_EDGES.includes(edge)) {
        component.use(SlideIn, { edge, mode: mode || 'slide' });
      }
    }

    // ScaleIn behavior from sg-scale attribute
    if (element.hasAttribute('sg-scale')) {
      component.use(ScaleIn);
    }

    // Etch mode from sg-etch attribute — content becomes a point cloud
    // floating in the slab, like a laser-etched glass paperweight
    if (element.hasAttribute('sg-etch')) {
      component.etch();
    }

    this.components.push(component);
    this.pointer.setComponents(this.components);
    return component;
  }

  /**
   * Start the render/update loop.
   */
  start() {
    const loop = () => {
      this._animationId = requestAnimationFrame(loop);
      this._time += 0.016;

      this.pointer.update();
      const pointerState = this.pointer.getState();

      // Per-layer overlay progress — find the max active overlay progress above each layer
      const overlayByLayer = new Map();
      for (const comp of this.components) {
        for (const b of comp.behaviors) {
          if (b.isActive && b.isActive() && b.progress !== undefined) {
            overlayByLayer.set(comp.layer, Math.max(overlayByLayer.get(comp.layer) || 0, b.progress));
          }
        }
      }

      for (const comp of this.components) {
        comp.update(this._time, 0.016, pointerState);

        // Find highest overlay progress from any layer above this component
        let fadeFrom = 0;
        for (const [layer, progress] of overlayByLayer) {
          if (layer > comp.layer) fadeFrom = Math.max(fadeFrom, progress);
        }

        if (fadeFrom > 0) {
          const fadeOpacity = 1 - fadeFrom * 0.6;
          comp.cssObject.element.style.opacity = Math.min(
            parseFloat(comp.cssObject.element.style.opacity) || 1,
            fadeOpacity,
          );
          comp.mesh.material.opacity = fadeOpacity;
          comp.mesh.material.transparent = true;
        } else if (fadeFrom === 0 && comp.mesh.material.transparent && comp.materialConfig.transparent !== true) {
          comp.mesh.material.opacity = 1;
          comp.mesh.material.transparent = false;
        }
      }

      // Blur lower CSS3D layers when overlay is active
      for (const [layerIdx, cssLayer] of this.renderer.cssLayers) {
        let blurFrom = 0;
        for (const [oLayer, progress] of overlayByLayer) {
          if (oLayer > layerIdx) blurFrom = Math.max(blurFrom, progress);
        }
        const wrapper = cssLayer.css3d.domElement.parentElement;
        if (wrapper) {
          wrapper.style.filter = blurFrom > 0 ? `blur(${blurFrom * 1}px)` : '';
        }
      }

      this.lights.update(this._time);
      this.wallpaper.update();
      this.renderer.render();
    };

    loop();
    return this;
  }

  /**
   * Stop the render loop.
   */
  stop() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
  }

  /**
   * Remove a component.
   */
  removeComponent(component) {
    const idx = this.components.indexOf(component);
    if (idx !== -1) {
      component.destroy();
      this.components.splice(idx, 1);
      this.pointer.setComponents(this.components);
    }
  }

  /**
   * Set material on all components.
   */
  setMaterial(props) {
    for (const comp of this.components) {
      comp.setMaterial(props);
    }
  }

  /**
   * Rebuild geometry on all components.
   */
  rebuildAll(geometryConfig) {
    for (const comp of this.components) {
      comp.rebuild(geometryConfig);
    }
  }

  /**
   * Static factory — one-liner init.
   */
  static init(containerOrSelector, options = {}) {
    const engine = new SingularityEngine(containerOrSelector, options);
    engine.discover().start();
    return engine;
  }

  destroy() {
    this.stop();
    for (const comp of this.components) {
      comp.destroy();
    }
    this.components.length = 0;
    this.lights.destroy();
    this.wallpaper.destroy();
    this.pointer.destroy();
    this.renderer.destroy();
  }
}
