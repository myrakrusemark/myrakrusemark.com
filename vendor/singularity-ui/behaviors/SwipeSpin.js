/**
 * SwipeSpin — over-swipe past 90deg triggers free spin with momentum.
 * The block spins in place while simultaneously flying off-screen
 * in the swipe direction, pulled down by gravity.
 */
export class SwipeSpin {
  constructor(component, {
    friction = 0.97,
    gravity = 1.2,
    launchMultiplier = 0.4,
    spinMultiplier = 0.008,
    onToss = null,
  } = {}) {
    this.component = component;
    this.friction = friction;
    this.gravity = gravity;
    this.launchMultiplier = launchMultiplier;
    this.spinMultiplier = spinMultiplier;
    this.onToss = onToss;

    this.active = false;
    this.rotY = 0;
    this.spinVelocity = 0;
    this.flyX = 0;
    this.flyY = 0;
    this.flyVX = 0;
    this.flyVY = 0;
  }

  isActive() {
    return this.active;
  }

  /**
   * Called by SwipeArchive when an over-swipe is detected.
   */
  startFromSwipe(currentRotY, releaseVX, releaseVY) {
    this.active = true;
    this.rotY = currentRotY;
    this.spinVelocity = releaseVX * this.spinMultiplier;
    this.flyX = 0;
    this.flyY = 0;
    this.flyVX = releaseVX * this.launchMultiplier;
    this.flyVY = releaseVY * this.launchMultiplier;
  }

  update(_time, _dt, _pointer, _layout) {
    if (!this.active) return null;

    // Spin
    this.rotY += this.spinVelocity;
    this.spinVelocity *= this.friction;

    // Fly with gravity
    this.flyVY += this.gravity;
    this.flyX += this.flyVX;
    this.flyY += this.flyVY;

    const w = this.component.renderer.width;
    const h = this.component.renderer.height;

    // Dismiss when off screen
    if (Math.abs(this.flyX) > w || Math.abs(this.flyY) > h) {
      this.component.dismiss();
      this.active = false;
      if (this.onToss) this.onToss(this.component);
      return null;
    }

    return {
      rotation: { y: this.rotY },
      position: { x: this.flyX, y: -this.flyY }, // negate Y: screen down, Three up
      controlled: true,
    };
  }
}
