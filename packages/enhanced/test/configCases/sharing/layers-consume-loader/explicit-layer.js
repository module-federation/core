module.exports = function layerLoader(source) {
  // Inject the layer name as an export
  return [source, 'export const layer = "explicit-layer";'].join('\n');
};
