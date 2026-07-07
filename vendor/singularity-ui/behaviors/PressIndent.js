/**
 * PressIndent — the :active state of a glass component.
 *
 * On pointer-down the glass rocks toward the press point and seats back
 * to bottomDepth in one motion — tilt and plunge together, like a keycap
 * pressed off-center. The tilt target tracks the pointer for the whole
 * hold, so the button stays leaning on the finger while displaced.
 *
 * The camera is orthographic, so the z-plunge alone is invisible — the
 * sink is made visible by scaling the button down (bottomScale) as it
 * seats. Release springs everything back. Press latches on pointer-down
 * inside the rect (CSS :active semantics). While held, isActive() is
 * true and HoverTilt yields, so hover wobble can't muddy the press.
 */
export class PressIndent {
  constructor(component, {
    bottomDepth = -30, // seating depth while held
    bottomScale = 0.94, // visible shrink when seated — the ortho "sink" cue
    maxTilt = 0.4, // radians at the far edge (~23 deg)
    attack = 0.5, // per-frame lerp while held — snaps down
    release = 0.12, // per-frame lerp after release — softer spring back
  } = {}) {
    this.component = component;
    this.bottomDepth = bottomDepth;
    this.bottomScale = bottomScale;
    this.maxTilt = maxTilt;
    this.attack = attack;
    this.release = release;

    this.pressZ = 0;
    this.rx = 0;
    this.ry = 0;
    this.scale = 1;
    this.pressed = false;
    this._wasDown = false;
  }

  isActive() {
    return this.pressed;
  }

  update(_time, _dt, pointer, { rect }) {
    const inside = pointer.x >= rect.left && pointer.x <= rect.right &&
      pointer.y >= rect.top && pointer.y <= rect.bottom;

    if (pointer.down && !this._wasDown && inside) this.pressed = true;
    if (!pointer.down) this.pressed = false;
    this._wasDown = pointer.down;

    let tz = 0, trx = 0, tryy = 0, tscale = 1, ease = this.release;
    if (this.pressed) {
      const dxn = Math.max(-1, Math.min(1,
        (pointer.x - (rect.left + rect.width / 2)) / (rect.width / 2)));
      const dyn = Math.max(-1, Math.min(1,
        (pointer.y - (rect.top + rect.height / 2)) / (rect.height / 2)));

      // Truthful geometry: the pressed corner rotates AWAY from the camera.
      // The ortho silhouette is direction-ambiguous, so shading decides the
      // read — with true geometry the exposed rim always lands on the far
      // side of the tilt, so the lighting cues agree in every corner and
      // under every light scene. (The 2026-07-05 inverted-sign experiment
      // read correctly only where the exposed rim happened to fall in
      // shadow — top-right presses popped toward the viewer.)
      tryy = dxn * this.maxTilt;
      trx = dyn * this.maxTilt;

      tz = this.bottomDepth;
      tscale = this.bottomScale;
      ease = this.attack;
    }

    this.pressZ += (tz - this.pressZ) * ease;
    this.rx += (trx - this.rx) * ease;
    this.ry += (tryy - this.ry) * ease;
    this.scale += (tscale - this.scale) * ease;

    // Scale isn't part of the behavior result contract; apply it directly
    // to both the glass mesh group and the CSS3D content group.
    this.component.group.scale.set(this.scale, this.scale, 1);
    this.component.cssGroup.scale.set(this.scale, this.scale, 1);

    return { position: { z: this.pressZ }, rotation: { x: this.rx, y: this.ry } };
  }
}
