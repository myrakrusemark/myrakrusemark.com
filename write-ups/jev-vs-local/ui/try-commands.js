// Curated examples arrive only from currently available stations and controls.
// Keep this short enough to remain useful in the collapsed command bar.
export function selectTryCommands({ examples = [], controls = [], allowed, context = {}, defaults = [] }) {
  const candidates = [
    ...examples.filter(c => c.try && (!c.action || allowed.has(c.action))),
    ...controls,
    ...defaults.filter(c => (!c.action || allowed.has(c.action)) &&
      !(c.action === 'go_section' && (c.slots?.section === context.section || c.slots?.section === `st-${context.station}`)) &&
      !(c.action === 'scroll_down' && context.section === 'conclusion')),
    { text: 'back to the top', action: 'go_top' },
  ];
  const seen = new Set();
  return candidates.filter(c => {
    const key = c.text.toLowerCase();
    if (seen.has(key) || (c.action && !allowed.has(c.action))) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
}
