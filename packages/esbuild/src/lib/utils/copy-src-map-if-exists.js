import * as fs from 'fs';

export function copySrcMapIfExists(cachedFile, fullOutputPath) {
  const mapSrc = cachedFile + '.map';
  const mapDest = fullOutputPath + '.map';
  if (fs.existsSync(mapSrc)) {
    fs.copyFileSync(mapSrc, mapDest);
  }
}
