import * as _path from 'path';
import * as fs from 'fs';

export function writeImportMap(sharedInfo, fedOption) {
  const imports = sharedInfo.reduce((acc, cur) => {
    return { ...acc, [cur.packageName]: cur.outFileName };
  }, {});

  const importMap = { imports };

  const importMapPath = _path.join(
    fedOption.workspaceRoot,
    fedOption.outputPath,
    'importmap.json',
  );

  fs.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
}
