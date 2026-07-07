/**
 * SlideIn — animates a component in from off-screen.
 *
 * Two modes:
 * - slide (default): translates on/off screen
 * - hinge: rotates around the edge like a glass door swinging open.
 *   The pivot is at the entry edge. 90deg = edge-on (closed), 0deg = face-on (open).
 */
export class SlideIn {
  constructor(component, {
    edge = 'right',        // 'left' | 'right' | 'bottom' | 'top'
    mode = 'slide',        // 'slide' | 'hinge'
    duration = 1.67,       // seconds
    easing = 'cubic',      // 'cubic' | 'linear'
    onOpen = null,
    onClose = null,
  } = {}) {
    this.component = component;
    this.edge = edge;
    this.mode = mode;
    this.duration = duration;
    this.easing = easing;
    this.onOpen = onOpen;
    this.onClose = onClose;

    this.state = 'closed';  // closed | opening | open | closing
    this.progress = 0;       // 0 = closed, 1 = fully open
    this._speed = 1 / (duration * 60); // progress per frame at 60fps

    // For hinge mode: offset mesh/css inside the group so pivot is at the edge,
    // and zero out the z-offset since the panel sweeps through z-space when rotated
    if (mode === 'hinge') {
      this.component.zOffset = 0;
      this._setupHingePivot();
    }
  }

  _setupHingePivot() {
    const rect = this.component.element.getBoundingClientRect();
    const pw = rect.width;

    // Offset mesh and cssObject inside the group so the hinge edge
    // is at the group origin. For 'right' edge: shift left by pw/2.
    let offsetX = 0;
    if (this.edge === 'right') offsetX = -pw / 2;
    else if (this.edge === 'left') offsetX = pw / 2;

    this.component.mesh.position.x = offsetX;
    this.component.cssObject.position.x = offsetX;

    // Also offset archive icon if it exists (GlassBlock)
    if (this.component.archiveIcon) {
      this.component.archiveIcon.position.x = offsetX - pw / 2;
    }
  }

  isActive() {
    return this.state !== 'closed';
  }

  open() {
    if (this.state === 'open' || this.state === 'opening') return;
    this.state = 'opening';
    this.component.show();
  }

  close() {
    if (this.state === 'closed' || this.state === 'closing') return;
    this.state = 'closing';
  }

  toggle() {
    if (this.state === 'closed' || this.state === 'closing') {
      this.open();
    } else {
      this.close();
    }
  }

  update(_time, _dt, _pointer, { cx, cy }) {
    if (this.state === 'closed') return null;

    // Animate progress
    if (this.state === 'opening') {
      this.progress += this._speed;
      if (this.progress >= 1) {
        this.progress = 1;
        this.state = 'open';
        if (this.onOpen) this.onOpen(this.component);
      }
    } else if (this.state === 'closing') {
      this.progress -= this._speed;
      if (this.progress <= 0) {
        this.progress = 0;
        this.state = 'closed';
        this.component.hide();
        if (this.onClose) this.onClose(this.component);
        return null;
      }
    }

    let t;
    if (this.easing === 'cubic') {
      if (this.state === 'closing') {
        t = 1 - easeInCubic(1 - this.progress);
      } else {
        // Overshoot on open — swings past, settles back
        t = easeOutBack(this.progress);
      }
    } else {
      t = this.progress;
    }

    if (this.mode === 'hinge') {
      return this._updateHinge(t, cx, cy);
    }
    return this._updateSlide(t, cx, cy);
  }

  _updateHinge(t, cx, cy) {
    const w = this.component.renderer.width;

    // Disable edge-fade during hinge — we want the glass visible while swinging
    this.component._disableEdgeFade = (this.state === 'opening' || this.state === 'closing');

    // Group origin is at the hinge edge (right edge of screen)
    // Rotation: 90deg (closed, edge-on) → 0deg (open, face-on)
    let targetX, rotY;

    if (this.edge === 'right') {
      targetX = w / 2;
      rotY = (1 - t) * (-Math.PI / 2);
    } else if (this.edge === 'left') {
      targetX = -w / 2;
      rotY = (1 - t) * (Math.PI / 2);
    } else {
      // Fallback to slide for top/bottom
      return this._updateSlide(t, cx, cy);
    }

    return {
      position: { x: targetX - cx, y: -cy },
      rotation: { y: rotY },
      controlled: true,
    };
  }

  _updateSlide(t, cx, cy) {
    const w = this.component.renderer.width;
    const h = this.component.renderer.height;
    const rect = this.component.element.getBoundingClientRect();
    const pw = rect.width;
    const ph = rect.height;

    let offsetX = 0, offsetY = 0;

    if (this.edge === 'right') {
      const targetX = w / 2 - pw / 2;
      const startX = targetX + pw;
      const currentX = startX + (targetX - startX) * t;
      offsetX = currentX - cx;
      offsetY = -cy;
    } else if (this.edge === 'left') {
      const targetX = -w / 2 + pw / 2;
      const startX = targetX - pw;
      const currentX = startX + (targetX - startX) * t;
      offsetX = currentX - cx;
      offsetY = -cy;
    } else if (this.edge === 'bottom') {
      const targetY = -h / 2 + ph / 2;
      const startY = targetY - ph;
      const currentY = startY + (targetY - startY) * t;
      offsetX = -cx;
      offsetY = currentY - cy;
    } else if (this.edge === 'top') {
      const targetY = h / 2 - ph / 2;
      const startY = targetY + ph;
      const currentY = startY + (targetY - startY) * t;
      offsetX = -cx;
      offsetY = currentY - cy;
    }

    return {
      position: { x: offsetX, y: offsetY },
      controlled: true,
    };
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
  return t * t * t;
}

function easeOutBack(t) {
  // Overshoots to ~1.05 then settles to 1.0
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
