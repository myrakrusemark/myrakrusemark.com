// Vite ignores the importmap in index.html when it pre-transforms module
// scripts, so mirror the map here (same three.js version as index.html).
export default {
  resolve: {
    alias: [
      { find: /^three\/addons\//, replacement: 'https://cdn.jsdelivr.net/npm/three@0.171.0/examples/jsm/' },
      { find: /^three$/, replacement: 'https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js' },
    ],
  },
};
