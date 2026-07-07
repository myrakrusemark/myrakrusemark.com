/**
 * SwipeArchive — swipe-right-to-archive gesture.
 *
 * Phases: idle → deciding → swiping → committed → animating-out → dismissed
 *
 * Short swipe (60-90deg): settles at 90deg, pauses, then dismisses.
 * Yields to SwipeSpin for over-swipes past 90deg.
 * Cancelled swipes spring back via decay.
 */
export class SwipeArchive {
  constructor(component, {
    deadzone = 10,
    commitAngle = 60,
    maxAngle = 90,
    velocityCommit = 15,
    holdFrames = 24,
    onArchive = null,
  } = {}) {
    this.component = component;
    this.deadzone = deadzone;
    this.commitAngle = commitAngle;
    this.maxAngle = maxAngle;
    this.velocityCommit = velocityCommit;
    this.holdFrames = holdFrames;
    this.onArchive = onArchive;

    this.phase = 'idle';
    this.startX = 0;
    this.startY = 0;
    this.deltaX = 0;
    this.rotY = 0;
    this.releaseVX = 0;
    this.releaseVY = 0;
    this.animProgress = 0;
    this.holdTimer = 0;

    // Decay state for cancelled swipes
    this.decayRY = 0;
  }

  isActive() {
    return this.phase !== 'idle';
  }

  /** Find SwipeSpin by duck-typing to avoid circular imports. */
  _findSpinBehavior() {
    return this.component.behaviors.find((b) => typeof b.startFromSwipe === 'function') || null;
  }

  /**
   * Called by the engine's pointer system when a pointer starts on this component.
   */
  onPointerStart(x, y) {
    if (this.phase !== 'idle') return;
    this.phase = 'deciding';
    this.startX = x;
    this.startY = y;
    this.deltaX = 0;
    this.rotY = 0;
    this.releaseVX = 0;
    this.releaseVY = 0;
  }

  /**
   * Called by the engine's pointer system during pointer move.
   * Returns true if this behavior consumed the event.
   */
  onPointerMove(x, y, rawVX, rawVY) {
    if (this.phase === 'deciding') {
      const dx = x - this.startX;
      const dy = y - this.startY;
      if (Math.abs(dx) > this.deadzone && Math.abs(dx) > Math.abs(dy) && dx > 0) {
        this.phase = 'swiping';
        return true;
      } else if (Math.abs(dy) > this.deadzone) {
        this.phase = 'idle';
        return false;
      }
    }

    if (this.phase === 'swiping') {
      this.deltaX = Math.max(0, x - this.startX);
      const rect = this.component.element.getBoundingClientRect();
      const angleDeg = (this.deltaX / rect.width) * this.maxAngle;
      this.rotY = angleDeg * Math.PI / 180;
      this.releaseVX = rawVX;
      this.releaseVY = rawVY;
      return true;
    }

    return false;
  }

  /**
   * Called by the engine's pointer system on pointer end.
   */
  onPointerEnd() {
    if (this.phase === 'swiping') {
      const angleDeg = this.rotY * 180 / Math.PI;

      if (angleDeg >= this.commitAngle && angleDeg <= this.maxAngle) {
        // Archive zone
        this.phase = 'committed';
        this.animProgress = 0;
      } else if (angleDeg > this.maxAngle) {
        // Over-swipe — hand off to SwipeSpin if present
        const spin = this._findSpinBehavior();
        if (spin) {
          spin.startFromSwipe(this.rotY, this.releaseVX, this.releaseVY);
          this.phase = 'idle';
          this.rotY = 0;
        } else {
          // No spin behavior — commit to archive anyway
          this.phase = 'committed';
          this.animProgress = 0;
        }
      } else if (this.releaseVX > this.velocityCommit && angleDeg < this.maxAngle) {
        // Fast flick
        this.phase = 'committed';
        this.animProgress = 0;
      } else {
        // Cancel — spring back
        this.decayRY = this.rotY;
        this.phase = 'idle';
        this.rotY = 0;
      }
    } else if (this.phase === 'deciding') {
      this.phase = 'idle';
    }
  }

  update(_time, _dt, _pointer, _layout) {
    // Decay from cancelled swipe
    this.decayRY *= 0.88;
    if (Math.abs(this.decayRY) < 0.001) this.decayRY = 0;

    // Committed animation
    if (this.phase === 'committed') {
      this.animProgress += 0.02;
      const t = easeOutCubic(Math.min(1, this.animProgress));
      this.rotY = this.rotY + (Math.PI / 2 - this.rotY) * t;
      if (this.animProgress >= 1) {
        this.rotY = Math.PI / 2;
        this.phase = 'animating-out';
        this.holdTimer = 0;
      }
    }

    if (this.phase === 'animating-out') {
      this.holdTimer++;
      if (this.holdTimer > this.holdFrames) {
        this.component.dismiss();
        this.phase = 'dismissed';
        if (this.onArchive) this.onArchive(this.component);
      }
    }

    if (this.phase === 'idle' && this.decayRY !== 0) {
      return { rotation: { y: this.decayRY } };
    }

    if (this.phase === 'swiping' || this.phase === 'committed' || this.phase === 'animating-out') {
      return { rotation: { y: this.rotY }, controlled: true };
    }

    return null;
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
