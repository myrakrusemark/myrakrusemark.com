/**
 * HoverTilt — the :hover state of a glass component.
 *
 * Mouse over the glass and it leans in the direction the cursor is
 * moving, proportional to cursor velocity — a teaser for the edge
 * refraction as the tilted rim rakes across the background. Stop moving
 * and it settles slowly back to flat; same on leave.
 *
 * No physics: no influence radius, no neighbor disturbance, no springs.
 * Only the hovered component moves, and it follows the cursor directly.
 * Yields while a press/swipe behavior owns the component.
 */
export class HoverTilt {
  constructor(component, {
    strength = 0.02, // radians per px/frame of smoothed cursor velocity
    maxTilt = 0.22, // clamp, ~12.5 deg
    attack = 0.18, // per-frame lerp toward the moving target — responsive
    settle = 0.045, // per-frame lerp back to flat — the slow settle
  } = {}) {
    this.component = component;
    this.strength = strength;
    this.maxTilt = maxTilt;
    this.attack = attack;
    this.settle = settle;

    this.rx = 0;
    this.ry = 0;
  }

  update(_time, _dt, pointer, { rect }) {
    // If another behavior has full control (press, swipe), yield
    const activeBehavior = this.component.behaviors.find((b) => b !== this && b.isActive && b.isActive());
    if (activeBehavior) return null;

    const inside = pointer.x >= rect.left && pointer.x <= rect.right &&
      pointer.y >= rect.top && pointer.y <= rect.bottom;

    // Same sign convention as PressIndent (truthful geometry): the leading
    // edge dips into the page, as if the cursor drags the glass surface.
    let trx = 0, tryy = 0;
    if (inside) {
      tryy = clamp(pointer.vx * this.strength, -this.maxTilt, this.maxTilt);
      trx = clamp(pointer.vy * this.strength, -this.maxTilt, this.maxTilt);
    }

    // Follow quickly while the cursor is moving over the glass; once it
    // stops (velocity decays) or leaves, drift back slowly.
    const moving = inside && Math.abs(pointer.vx) + Math.abs(pointer.vy) > 0.5;
    const ease = moving ? this.attack : this.settle;

    this.rx += (trx - this.rx) * ease;
    this.ry += (tryy - this.ry) * ease;

    return { rotation: { x: this.rx, y: this.ry } };
  }
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
