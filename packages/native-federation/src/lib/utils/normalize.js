'use strict';

function normalize(path, trailingSlash) {
  let cand = path.replace(/\\/g, '/');
  if (typeof trailingSlash === 'undefined') {
    return cand;
  }
  while (cand.endsWith('/')) {
    cand = cand.substring(0, cand.length - 1);
  }
  if (trailingSlash) {
    return cand + '/';
  }
  return cand;
}

module.exports = {
  normalize: normalize,
};
//# sourceMappingURL=normalize.js.map
