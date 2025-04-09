/**
 * Loader that injects the multi-pkg layer name as an export
 */
module.exports = function multiPkgLayerLoader(source) {
  return [source, 'export const layer = "multi-pkg-layer";'].join('\n');
};
