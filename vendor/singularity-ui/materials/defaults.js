/**
 * Default geometry settings per component type.
 * Each component reads its defaults from here, overridable via attributes.
 */
export const GEOMETRY_DEFAULTS = {
  block: {
    depth: 0.095,
    cornerRadius: 0.09,
    bevelSize: 0.039,
    bevelSegments: 4,
  },

  panel: {
    depth: 0.06,
    cornerRadius: 0.06,
    bevelSize: 0.02,
    bevelSegments: 3,
  },

  button: {
    depth: 0.12,
    cornerRadius: 0.15,
    bevelSize: 0.05,
    bevelSegments: 4,
  },

  nav: {
    depth: 0.04,
    cornerRadius: 0.02,
    bevelSize: 0.01,
    bevelSegments: 2,
  },

  modal: {
    depth: 0.08,
    cornerRadius: 0.07,
    bevelSize: 0.03,
    bevelSegments: 4,
  },
};

/**
 * Render layer per component type.
 * Higher layers get a z-offset in the single WebGL scene to prevent collision,
 * and a separate CSS3D renderer so DOM content stacks correctly.
 */
export const LAYER_DEFAULTS = {
  block: -2,
  panel: 0,
  button: -2,
  nav: 1,
  modal: 2,
};

/** Z-offset per layer — ortho camera makes this invisible to the viewer */
export const LAYER_Z_OFFSET = 200;

/** Edge-fade threshold — 2 degrees from edge-on */
export const EDGE_FADE_THRESHOLD = Math.sin(2 * Math.PI / 180);
