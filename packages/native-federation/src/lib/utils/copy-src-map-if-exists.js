'use strict';
const fs = require('fs');

function copySrcMapIfExists(cachedFile, fullOutputPath) {
  const mapSrc = cachedFile + '.map';
  const mapDest = fullOutputPath + '.map';
  if (fs.existsSync(mapSrc)) {
    fs.copyFileSync(mapSrc, mapDest);
  }
}

module.exports = {
  copySrcMapIfExists: copySrcMapIfExists,
};
