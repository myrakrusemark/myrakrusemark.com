import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

/**
 * Dual renderer: WebGL (glass meshes) + CSS3D (DOM content).
 *
 * Single WebGL scene — all glass shares the same wallpaper, lights, and
 * refraction. Components are separated by z-offset to prevent collision
 * (blocks at z=0, panels at z=100, modals at z=200).
 *
 * Multiple CSS3D renderers stacked by z-index so DOM content from higher
 * layers renders on top without fighting.
 */
export class GlassRenderer {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();

    /** @type {Map<number, { cssScene: THREE.Scene, css3d: CSS3DRenderer }>} */
    this.cssLayers = new Map();

    this._initCamera();
    this._initWebGLRenderer();
    this._initEnvMap();

    // Create default CSS layer 0
    this.getCSSLayer(0);

    // Backward compat
    this.cssScene = this.getCSSLayer(0).cssScene;

    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  /**
   * Get or create a CSS3D layer.
   * Each layer gets its own CSS3DRenderer with a higher z-index.
   * The WebGL scene is shared — only CSS3D is layered.
   */
  getCSSLayer(index) {
    if (this.cssLayers.has(index)) return this.cssLayers.get(index);

    const cssScene = new THREE.Scene();
    const css3d = new CSS3DRenderer();
    css3d.setSize(this.width, this.height);

    // Kill the mobile tap-highlight overlay on CSS3D content: the touched
    // element is the flat DOM clone, so the browser's gray flash paints a
    // rectangle around the glass. Not inherited, so a rule must reach every
    // descendant — injected once for all layers.
    if (!document.getElementById('sg-css3d-style')) {
      const style = document.createElement('style');
      style.id = 'sg-css3d-style';
      style.textContent = '.sg-css3d-layer, .sg-css3d-layer * { -webkit-tap-highlight-color: transparent; }';
      document.head.appendChild(style);
    }

    // Wrap CSS3D renderer in an isolation container so z-index
    // stacking works between layers (preserve-3d breaks z-index)
    const wrapper = document.createElement('div');
    wrapper.className = 'sg-css3d-layer';
    const zIndex = Math.max(1, 2 + index * 2);
    wrapper.style.cssText = `position:fixed;inset:0;z-index:${zIndex};pointer-events:none;isolation:isolate;`;
    css3d.domElement.style.cssText = 'pointer-events:none;';
    wrapper.appendChild(css3d.domElement);
    this.container.appendChild(wrapper);

    const layer = { cssScene, css3d };
    this.cssLayers.set(index, layer);
    return layer;
  }

  _initCamera() {
    const { width: w, height: h } = this;
    this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 2000);
    this.camera.position.z = 800;
  }

  _initWebGLRenderer() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    this.container.appendChild(this.canvas);

    this.webgl = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.webgl.setSize(this.width, this.height);
    this.webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webgl.toneMapping = THREE.ACESFilmicToneMapping;
    this.webgl.toneMappingExposure = 0.5;
    this.webgl.outputColorSpace = THREE.SRGBColorSpace;
    this.webgl.setClearColor(0x000000, 0);
  }

  _initEnvMap() {
    const tmpRenderer = new THREE.WebGLRenderer({ alpha: true });
    tmpRenderer.setSize(1, 1);
    const envScene = new THREE.Scene();
    const cubeCamera = new THREE.CubeCamera(0.1, 100, new THREE.WebGLCubeRenderTarget(128));

    // Day-room gradient: bright paper below, cool daylight above.
    // Reflections are what make clearcoat glass read as glass — a dark
    // env map leaves the surface dead on light scenes.
    envScene.add(new THREE.Mesh(
      new THREE.SphereGeometry(50, 16, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader: `varying vec3 vWP;void main(){vWP=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec3 vWP;void main(){float y=normalize(vWP).y*0.5+0.5;gl_FragColor=vec4(mix(vec3(0.90,0.87,0.82),vec3(0.66,0.73,0.86),smoothstep(0.15,0.95,y)),1.0);}`,
      }),
    ));

    // Hot lamp glint upper-right — the moving specular life of the glass
    const lampGlint = new THREE.Mesh(
      new THREE.SphereGeometry(7, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe0b0 }),
    );
    lampGlint.position.set(24, 20, 28);
    envScene.add(lampGlint);

    // Cool window band upper-left
    const windowBand = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 34),
      new THREE.MeshBasicMaterial({ color: 0xdce8fa, side: THREE.DoubleSide }),
    );
    windowBand.position.set(-36, 16, 18);
    windowBand.lookAt(0, 0, 0);
    envScene.add(windowBand);

    cubeCamera.update(tmpRenderer, envScene);
    this.envMap = cubeCamera.renderTarget.texture;
    tmpRenderer.dispose();
  }

  render() {
    // Single WebGL pass — all glass in one scene
    this.webgl.render(this.scene, this.camera);

    // CSS3D layers rendered in order
    const sortedKeys = [...this.cssLayers.keys()].sort((a, b) => a - b);
    for (const key of sortedKeys) {
      const layer = this.cssLayers.get(key);
      layer.css3d.render(layer.cssScene, this.camera);
    }
  }

  _onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const { camera, width: w, height: h } = this;

    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();

    this.webgl.setSize(w, h);
    for (const layer of this.cssLayers.values()) {
      layer.css3d.setSize(w, h);
    }
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    this.webgl.dispose();
    this.canvas.remove();
    for (const layer of this.cssLayers.values()) {
      // Remove wrapper (parent of css3d.domElement)
      const wrapper = layer.css3d.domElement.parentElement;
      if (wrapper) wrapper.remove();
    }
    this.cssLayers.clear();
  }
}
