/**
 * Loader that injects the React layer name as an export
 */
module.exports = function reactLayerLoader(source) {
  return [source, 'export const layer = "react-layer";'].join('\n');
};
