import { mountComparison } from '../../scripts/results-comparison.js?v=8ee67d2c3612bfccb49e';
export async function mount(el) {
  el.classList.add('results-comparison');
  el.innerHTML = `<p class="preview-note">Loading results…</p><div class="workbench"><aside aria-label="Choose a test"><p class="small-label">22 TESTS · FILLED = EQUAL OR BETTER THAN JEV</p><div data-result-cases></div></aside><div data-result-detail aria-live="polite"></div></div>`;
  await mountComparison(el);
  return { commands: {} };
}
