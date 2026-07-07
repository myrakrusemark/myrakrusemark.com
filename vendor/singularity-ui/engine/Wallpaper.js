import * as THREE from 'three';

/**
 * Background wallpaper plane for transmission/refraction.
 * Lives in the single shared WebGL scene at z=-200.
 * Scrolls with the page by scrollFactor: 0.3 gives the labs their
 * parallax; 0 pins the plane to the viewport so it can stay in register
 * with a `background-attachment: fixed` page background.
 */
export class Wallpaper {
  constructor(scene, url, width, height, { scrollFactor = 0.3 } = {}) {
    this.scene = scene;
    this.mesh = null;
    this.width = width;
    this.height = height;
    this.scrollFactor = scrollFactor;

    if (url) {
      this._load(url);
    }
  }

  _load(url) {
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      this.mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(this.width * 1.5, this.height * 1.5),
        // toneMapped:false — the wallpaper must match the DOM copy color-for-color;
        // only the glass should pass through tone mapping
        new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
      );
      this.mesh.position.z = -600;
      this.scene.add(this.mesh);
    });
  }

  /**
   * Swap the wallpaper image (e.g. lighting-scene washes).
   */
  setImage(url) {
    this.destroy();
    this.mesh = null;
    this._load(url);
  }

  update() {
    if (this.mesh && this.scrollFactor) {
      this.mesh.position.y = window.scrollY * this.scrollFactor;
    }
  }

  destroy() {
    if (this.mesh) {
      this.mesh.material.map?.dispose();
      this.mesh.material.dispose();
      this.mesh.geometry.dispose();
      this.scene.remove(this.mesh);
    }
  }
}
