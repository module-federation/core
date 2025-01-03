module.exports = function layerLoader(source) {
  // Inject the layer name as an export
  return [source, 'export const layer = "module-layer";'].join('\n');
};
