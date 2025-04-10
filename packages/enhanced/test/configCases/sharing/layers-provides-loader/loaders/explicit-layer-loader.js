/**
 * Loader that injects an explicit layer name as an export
 */
module.exports = function explicitLayerLoader(source) {
  return [source, 'export const layer = "explicit-layer";'].join('\n');
};
