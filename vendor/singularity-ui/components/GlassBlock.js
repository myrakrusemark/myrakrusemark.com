import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { GlassComponent } from './GlassComponent.js';
import { EDGE_FADE_THRESHOLD } from '../materials/defaults.js';

/**
 * Archive icon SVG for the left face of the block.
 */
function buildArchiveIcon() {
  const div = document.createElement('div');
  // 0x0 + overflow:visible neutralizes CSS3DRenderer's translate(-50%,-50%)
  div.style.cssText = 'width:0;height:0;overflow:visible;pointer-events:none;';
  div.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;top:-16px;left:-16px;">
    <rect x="2" y="3" width="20" height="5" rx="1"/>
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
    <path d="M10 12h4"/>
  </svg>`;
  return new CSS3DObject(div);
}

/**
 * GlassBlock — the card component.
 * Extends GlassComponent with an archive icon on the left face.
 */
export class GlassBlock extends GlassComponent {
  constructor(element, options) {
    super(element, { ...options, componentType: 'block' });

    const rect = element.getBoundingClientRect();

    // Archive icon on the left face
    this.archiveIcon = buildArchiveIcon();
    this.archiveIcon.position.set(-rect.width / 2, 0, 0);
    this.archiveIcon.rotation.set(0, -Math.PI / 2, 0);
    this.cssGroup.add(this.archiveIcon);
  }

  _applyEdgeFade(rotY) {
    super._applyEdgeFade(rotY);

    // Archive icon: face-on when card is at 90deg, edge-on at 0deg
    const sideFacing = Math.abs(Math.sin(rotY));
    this.archiveIcon.element.style.opacity = Math.min(1, sideFacing / EDGE_FADE_THRESHOLD);
  }

  rebuild(geometryConfig) {
    super.rebuild(geometryConfig);

    // Reposition archive icon after geometry change
    const rect = this.element.getBoundingClientRect();
    this.archiveIcon.position.set(-rect.width / 2, 0, 0);
  }
}
