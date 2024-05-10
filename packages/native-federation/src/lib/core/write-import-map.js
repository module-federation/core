const path = require('path');
const fs = require('fs');

function writeImportMap(sharedInfo, fedOption) {
  const imports = sharedInfo.reduce((acc, cur) => {
    return { ...acc, [cur.packageName]: cur.outFileName };
  }, {});
  const importMap = { imports };
  const importMapPath = path.join(
    fedOption.workspaceRoot,
    fedOption.outputPath,
    'importmap.json',
  );
  fs.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
}
module.exports = { writeImportMap };
