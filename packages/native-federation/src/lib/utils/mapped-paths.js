const path = require('path');
const fs = require('fs');
const JSON5 = require('json5');

function getMappedPaths({ rootTsConfigPath, sharedMappings, rootPath }) {
  let mappings;
  const result = [];
  if (!path.isAbsolute(rootTsConfigPath)) {
    throw new Error(
      'SharedMappings.register: tsConfigPath needs to be an absolute path!',
    );
  }
  if (!rootPath) {
    rootPath = path.normalize(path.dirname(rootTsConfigPath));
  }
  const shareAll = !sharedMappings;
  if (!sharedMappings) {
    sharedMappings = [];
  }
  const tsConfig = JSON5.parse(
    fs.readFileSync(rootTsConfigPath, { encoding: 'utf-8' }),
  );
  mappings = tsConfig?.compilerOptions?.paths;
  if (!mappings) {
    return result;
  }
  for (const key in mappings) {
    const libPath = path.normalize(path.join(rootPath, mappings[key][0]));
    if (sharedMappings.includes(key) || shareAll) {
      result.push({
        key,
        path: libPath,
      });
    }
  }
  return result;
}
module.exports = { getMappedPaths };
//# sourceMappingURL=mapped-paths.js.map
