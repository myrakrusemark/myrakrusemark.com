/**
 * ScaleIn — scales a component from center with a bounce.
 * Typically used with GlassModal for centered overlays.
 *
 * Scales from 0.8 to 1.0 with easeOutBack overshoot on open.
 * Component is centered on screen, not anchored to DOM position.
 */
export class ScaleIn {
  constructor(component, {
    duration = 0.5,
    startScale = 0.8,
    onOpen = null,
    onClose = null,
  } = {}) {
    this.component = component;
    this.duration = duration;
    this.startScale = startScale;
    this.onOpen = onOpen;
    this.onClose = onClose;

    this.state = 'closed';
    this.progress = 0;
    this._speed = 1 / (duration * 60);
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

    if (this.state === 'opening') {
      this.progress += this._speed;
      if (this.progress >= 1) {
        this.progress = 1;
        this.state = 'open';
        if (this.onOpen) this.onOpen(this.component);
      }
    } else if (this.state === 'closing') {
      this.progress -= this._speed * 1.5; // close faster
      if (this.progress <= 0) {
        this.progress = 0;
        this.state = 'closed';
        this.component.hide();
        if (this.onClose) this.onClose(this.component);
        return null;
      }
    }

    // Overshoot on open, smooth on close
    const t = (this.state === 'closing')
      ? easeInCubic(this.progress)
      : easeOutBack(this.progress);

    // Scale from startScale to 1.0
    const scale = this.startScale + (1 - this.startScale) * t;

    // Center on screen
    const w = this.component.renderer.width;
    const h = this.component.renderer.height;

    this.component.group.scale.set(scale, scale, scale);
    this.component.cssGroup.scale.set(scale, scale, scale);

    // Disable edge-fade during animation
    this.component._disableEdgeFade = (this.state === 'opening' || this.state === 'closing');

    return {
      position: { x: 0, y: -cy }, // keep DOM x (column-aligned), center vertically
      controlled: true,
    };
  }
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInCubic(t) {
  return t * t * t;
}
