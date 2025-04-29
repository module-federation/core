/**
 * Loader that injects a different layer name as an export
 */
module.exports = function differentLayerLoader(source) {
  return [source, 'export const layer = "differing-layer";'].join('\n');
};
