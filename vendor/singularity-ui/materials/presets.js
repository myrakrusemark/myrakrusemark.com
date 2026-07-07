/**
 * Named material presets for sg-material attribute.
 *
 * EVERY preset must define EVERY property explicitly.
 * Switching presets does a full overwrite — missing props won't revert.
 */
export const MATERIAL_PRESETS = {
  clear: {
    color: 0xffffff,
    transmission: 1.0,
    opacity: 1.0,
    transparent: false,
    roughness: 0.25,
    ior: 2.5,
    thickness: 0.2,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 1.0,
    envMapIntensity: 0.0,
    iridescence: 0.47,
    iridescenceIOR: 1.71,
    iridescenceThicknessRange: [100, 400],
    attenuationDistance: 5.0,
    attenuationColor: 0x4488ff,
  },

  frosted: {
    color: 0x1a1a2e,
    transmission: 0,
    opacity: 0.45,
    transparent: true,
    roughness: 0.6,
    ior: 1.5,
    thickness: 0,
    metalness: 0.05,
    clearcoat: 0.5,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.0,
    iridescence: 0.1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 400],
    attenuationDistance: 5.0,
    attenuationColor: 0xaabbcc,
  },

  iridescent: {
    color: 0xffffff,
    transmission: 1.0,
    opacity: 1.0,
    transparent: false,
    roughness: 0.25,
    ior: 2.0,
    thickness: 0.2,
    metalness: 0.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.0,
    iridescence: 0.8,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [100, 500],
    attenuationDistance: 5.0,
    attenuationColor: 0x4488ff,
  },

  tinted: {
    color: 0xffffff,
    transmission: 0.9,
    opacity: 1.0,
    transparent: false,
    roughness: 0.2,
    ior: 2.0,
    thickness: 0.4,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 1.0,
    envMapIntensity: 0.0,
    iridescence: 0.2,
    iridescenceIOR: 1.5,
    iridescenceThicknessRange: [100, 400],
    attenuationDistance: 1.5,
    attenuationColor: 0x4488ff,
  },
};

export const DEFAULT_MATERIAL = 'clear';
