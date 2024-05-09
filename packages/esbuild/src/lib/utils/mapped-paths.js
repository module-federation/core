import * as path from 'path';
import * as fs from 'fs';
import * as JSON5 from 'json5';

export function getMappedPaths({ rootTsConfigPath, sharedMappings, rootPath }) {
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
  const mappings = tsConfig?.compilerOptions?.paths;
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
