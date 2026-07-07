import { GlassComponent } from './GlassComponent.js';

/**
 * GlassPanel — full-height side panel component.
 * Slides in from an edge (default: right). Thinner glass slab than blocks,
 * designed for detail views, chat sheets, settings drawers.
 */
export class GlassPanel extends GlassComponent {
  constructor(element, options) {
    super(element, { ...options, componentType: 'panel' });

    // Panels start hidden — SlideIn behavior controls visibility
    this.group.visible = false;
    this.cssGroup.visible = false;
  }

  /**
   * Panel content builder — simpler than block.
   * Preserves the full inner HTML structure with inline styles.
   */
  _buildContentDiv(width, height) {
    const el = this.element;

    const div = document.createElement('div');
    div.style.cssText = `width:${width}px;height:${height}px;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:#fff;pointer-events:auto;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column;`;

    // Header
    const header = el.querySelector('header, [data-sg-header]');
    if (header) {
      const headerDiv = document.createElement('div');
      headerDiv.style.cssText = 'padding:20px 24px 12px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,0.08);';

      const title = header.querySelector('h2, h3');
      if (title) {
        const titleEl = document.createElement('h3');
        titleEl.textContent = title.textContent;
        titleEl.style.cssText = 'font-size:18px;font-weight:700;color:#fff;margin:0;line-height:1.3;';
        headerDiv.appendChild(titleEl);
      }

      const subtitle = header.querySelector('p, .subtitle');
      if (subtitle) {
        const subEl = document.createElement('p');
        subEl.textContent = subtitle.textContent;
        subEl.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.4);margin:4px 0 0;';
        headerDiv.appendChild(subEl);
      }

      div.appendChild(headerDiv);
    }

    // Body — scrollable content area
    const body = el.querySelector('.sg-panel-body, [data-sg-body]');
    if (body) {
      const bodyDiv = document.createElement('div');
      bodyDiv.style.cssText = 'flex:1;overflow-y:auto;padding:16px 24px;';

      // Clone paragraphs and other content
      for (const child of body.children) {
        const tag = child.tagName.toLowerCase();
        const clone = document.createElement(tag === 'p' ? 'p' : 'div');
        clone.textContent = child.textContent;

        if (tag === 'p') {
          clone.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin:0 0 12px;';
        } else if (tag === 'h3' || tag === 'h4') {
          clone.style.cssText = 'font-size:14px;font-weight:600;color:rgba(255,255,255,0.85);margin:16px 0 8px;';
        } else {
          clone.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.55);line-height:1.5;margin:0 0 8px;';
        }

        bodyDiv.appendChild(clone);
      }

      div.appendChild(bodyDiv);
    }

    // Footer
    const footer = el.querySelector('footer, [data-sg-footer]');
    if (footer) {
      const footerDiv = document.createElement('div');
      footerDiv.style.cssText = 'padding:12px 24px 20px;flex-shrink:0;border-top:1px solid rgba(255,255,255,0.08);';

      for (const child of footer.children) {
        const clone = document.createElement('div');
        clone.textContent = child.textContent;
        clone.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.4);';
        footerDiv.appendChild(clone);
      }

      div.appendChild(footerDiv);
    }

    return div;
  }

  /**
   * Show the panel (called by SlideIn behavior).
   */
  show() {
    this.group.visible = true;
    this.cssGroup.visible = true;
    this.dismissed = false;
  }

  /**
   * Hide the panel without destroying it.
   */
  hide() {
    this.group.visible = false;
    this.cssGroup.visible = false;
  }
}
