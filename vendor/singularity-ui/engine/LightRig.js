import * as THREE from 'three';

/**
 * Light rig for the glass scene.
 * All lights live in the single shared WebGL scene.
 */
export class LightRig {
  constructor(scene) {
    this.scene = scene;
    this.lights = [];
    this._idCounter = 0;
  }

  add(type, { color = 0xffffff, intensity = 1.0, position = [0, 0, 300], name, drift = false } = {}) {
    const id = this._idCounter++;
    let light;

    if (type === 'ambient') {
      light = new THREE.AmbientLight(color, intensity);
    } else if (type === 'directional') {
      light = new THREE.DirectionalLight(color, intensity);
      light.position.set(...position);
    } else if (type === 'point') {
      light = new THREE.PointLight(color, intensity, 1000);
      light.position.set(...position);
    }

    this.scene.add(light);
    const entry = { id, type, light, name: name || `${type}-${id}`, drift };
    this.lights.push(entry);
    return entry;
  }

  remove(id) {
    const idx = this.lights.findIndex((l) => l.id === id);
    if (idx === -1) return;
    this.scene.remove(this.lights[idx].light);
    this.lights[idx].light.dispose();
    this.lights.splice(idx, 1);
  }

  update(time) {
    for (let i = 0; i < this.lights.length; i++) {
      const entry = this.lights[i];
      if (!entry.drift) continue;

      const base = entry.light.userData.basePos ||
        { x: entry.light.position.x, y: entry.light.position.y, z: entry.light.position.z };
      if (!entry.light.userData.basePos) {
        entry.light.userData.basePos = { ...base };
      }
      entry.light.position.x = base.x + Math.sin(time * 0.3 + i * 2) * 40;
      entry.light.position.y = base.y + Math.cos(time * 0.5 + i * 3) * 30;
    }
  }

  getAll() {
    return this.lights;
  }

  destroy() {
    for (const entry of this.lights) {
      this.scene.remove(entry.light);
      entry.light.dispose();
    }
    this.lights.length = 0;
  }
}
