/**
 * PointerTracker — unified mouse + touch tracking.
 * Provides smoothed velocity and pointer state to the engine.
 * Routes gesture events to behaviors on hit-tested components.
 */
export class PointerTracker {
  constructor() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.vx = 0;
    this.vy = 0;
    this.down = false;

    this._lastX = this.x;
    this._lastY = this.y;
    this._activeComponent = null; // component currently being gesture-tracked
    this._activeBehavior = null;  // the behavior that consumed the gesture

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('touchstart', this._onTouchStart, { passive: true });
    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend', this._onTouchEnd);
  }

  /**
   * Set the component list for hit testing. Called by the engine.
   */
  setComponents(components) {
    this._components = components;
  }

  _hitTest(x, y) {
    if (!this._components) return null;
    for (const comp of this._components) {
      if (comp.dismissed) continue;
      const rect = comp.element.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return comp;
      }
    }
    return null;
  }

  _handleStart(x, y) {
    this.down = true;
    this.x = this._lastX = x;
    this.y = this._lastY = y;
    this.vx = 0;
    this.vy = 0;

    const comp = this._hitTest(x, y);
    if (comp) {
      this._activeComponent = comp;
      // Notify swipe behaviors
      for (const b of comp.behaviors) {
        if (b.onPointerStart) b.onPointerStart(x, y);
      }
    }
  }

  _handleMove(x, y, preventDefault) {
    const rawVX = x - this._lastX;
    const rawVY = y - this._lastY;

    // Route to active component's behaviors first
    let consumed = false;
    if (this._activeComponent) {
      for (const b of this._activeComponent.behaviors) {
        if (b.onPointerMove && b.onPointerMove(x, y, rawVX, rawVY)) {
          consumed = true;
          this._activeBehavior = b;
          if (preventDefault) preventDefault();
          break;
        }
      }
    }

    if (!consumed) {
      // Normal velocity tracking for tilt/disturbance
      this.vx += (rawVX - this.vx) * 0.15;
      this.vy += (rawVY - this.vy) * 0.15;
    }

    this.x = x;
    this.y = y;
    this._lastX = x;
    this._lastY = y;
  }

  _handleEnd() {
    this.down = false;

    if (this._activeComponent) {
      for (const b of this._activeComponent.behaviors) {
        if (b.onPointerEnd) b.onPointerEnd();
      }
    }
    this._activeComponent = null;
    this._activeBehavior = null;
  }

  /**
   * Decay velocities each frame.
   */
  update() {
    if (!this.down) {
      this.vx *= 0.92;
      this.vy *= 0.92;
    }
  }

  /** Current pointer state as a plain object for behaviors. */
  getState() {
    return { x: this.x, y: this.y, vx: this.vx, vy: this.vy, down: this.down };
  }

  // --- Event handlers ---

  _onMouseDown(e) { this._handleStart(e.clientX, e.clientY); }
  _onMouseMove(e) { this._handleMove(e.clientX, e.clientY, () => e.preventDefault()); }
  _onMouseUp() { this._handleEnd(); }

  _onTouchStart(e) {
    const t = e.touches[0];
    this._handleStart(t.clientX, t.clientY);
  }
  _onTouchMove(e) {
    const t = e.touches[0];
    this._handleMove(t.clientX, t.clientY, () => e.preventDefault());
  }
  _onTouchEnd() { this._handleEnd(); }

  destroy() {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('touchstart', this._onTouchStart);
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);
  }
}
