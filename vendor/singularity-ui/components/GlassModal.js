import { GlassComponent } from './GlassComponent.js';

/**
 * GlassModal — centered overlay panel.
 * Thick frosted glass slab, scales in from center.
 * Layer 2 — sits above blocks and panels.
 */
export class GlassModal extends GlassComponent {
  constructor(element, options) {
    super(element, { ...options, componentType: 'modal' });

    // Modals start hidden — ScaleIn behavior controls visibility
    this.group.visible = false;
    this.cssGroup.visible = false;
  }

  /**
   * Modal content builder — header with close, tabs, body, footer.
   */
  _buildContentDiv(width, height) {
    const el = this.element;

    const div = document.createElement('div');
    div.style.cssText = `width:${width}px;height:${height}px;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:#fff;pointer-events:auto;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column;`;

    // Header
    const header = el.querySelector('header, [data-sg-header]');
    if (header) {
      const headerDiv = document.createElement('div');
      headerDiv.style.cssText = 'padding:20px 24px 0;flex-shrink:0;display:flex;justify-content:space-between;align-items:center;';

      const title = header.querySelector('h2, h3');
      if (title) {
        const titleEl = document.createElement('h3');
        titleEl.textContent = title.textContent;
        titleEl.style.cssText = 'font-size:20px;font-weight:700;color:#fff;margin:0;';
        headerDiv.appendChild(titleEl);
      }

      div.appendChild(headerDiv);
    }

    // Tabs
    const tabs = el.querySelector('.sg-modal-tabs, [data-sg-tabs]');
    if (tabs) {
      const tabsDiv = document.createElement('div');
      tabsDiv.style.cssText = 'padding:12px 24px 0;flex-shrink:0;display:flex;gap:4px;';

      for (const tab of tabs.children) {
        const tabEl = document.createElement('span');
        tabEl.textContent = tab.textContent;
        const isActive = tab.classList.contains('active') || tab.hasAttribute('data-active');
        tabEl.style.cssText = `padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;${isActive ? 'background:rgba(255,255,255,0.15);color:#fff;' : 'color:rgba(255,255,255,0.4);'}`;
        tabsDiv.appendChild(tabEl);
      }

      div.appendChild(tabsDiv);
    }

    // Body
    const body = el.querySelector('.sg-modal-body, [data-sg-body]');
    if (body) {
      const bodyDiv = document.createElement('div');
      bodyDiv.style.cssText = 'flex:1;overflow-y:auto;padding:16px 24px;';

      for (const child of body.children) {
        const tag = child.tagName.toLowerCase();

        if (tag === 'label' || child.classList.contains('sg-field')) {
          // Form field
          const fieldDiv = document.createElement('div');
          fieldDiv.style.cssText = 'margin-bottom:14px;';

          const labelText = child.querySelector('.sg-label, label')?.textContent || child.getAttribute('data-label') || '';
          if (labelText) {
            const lbl = document.createElement('div');
            lbl.textContent = labelText;
            lbl.style.cssText = 'font-size:10px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:6px;';
            fieldDiv.appendChild(lbl);
          }

          const input = child.querySelector('input, textarea');
          if (input) {
            const inp = document.createElement('div');
            inp.textContent = input.value || input.placeholder || '';
            inp.style.cssText = 'padding:10px 14px;border-radius:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);font-size:14px;color:#fff;';
            fieldDiv.appendChild(inp);
          }

          bodyDiv.appendChild(fieldDiv);
        } else if (tag === 'p') {
          const pEl = document.createElement('p');
          pEl.textContent = child.textContent;
          pEl.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin:0 0 12px;';
          bodyDiv.appendChild(pEl);
        } else {
          const clone = document.createElement('div');
          clone.textContent = child.textContent;
          clone.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.55);line-height:1.5;margin:0 0 8px;';
          bodyDiv.appendChild(clone);
        }
      }

      div.appendChild(bodyDiv);
    }

    // Footer / actions
    const footer = el.querySelector('footer, [data-sg-footer]');
    if (footer) {
      const footerDiv = document.createElement('div');
      footerDiv.style.cssText = 'padding:12px 24px 20px;flex-shrink:0;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:8px;';

      for (const child of footer.children) {
        const btn = document.createElement('button');
        btn.textContent = child.textContent;
        const isPrimary = child.classList.contains('primary') || child.hasAttribute('data-primary');
        btn.style.cssText = `flex:1;padding:10px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;${isPrimary ? 'background:rgba(0,212,255,0.3);color:#00d4ff;' : 'background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.1);'}`;
        footerDiv.appendChild(btn);
      }

      div.appendChild(footerDiv);
    }

    return div;
  }

  show() {
    this.group.visible = true;
    this.cssGroup.visible = true;
    this.dismissed = false;
  }

  hide() {
    this.group.visible = false;
    this.cssGroup.visible = false;
  }
}
