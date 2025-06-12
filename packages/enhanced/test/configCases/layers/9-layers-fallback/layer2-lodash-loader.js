// Loader to modify lodash for layer2
module.exports = function (source) {
  return source
    .replace('unlayered-fallback', 'layer2-modified')
    .replace('4.17.21', '4.17.22');
};
