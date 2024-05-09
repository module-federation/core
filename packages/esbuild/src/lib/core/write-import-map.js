'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.writeImportMap = void 0;
const tslib_1 = require('tslib');
const path = tslib_1.__importStar(require('path'));
const fs = tslib_1.__importStar(require('fs'));
function writeImportMap(sharedInfo, fedOption) {
  const imports = sharedInfo.reduce((acc, cur) => {
    return Object.assign(Object.assign({}, acc), {
      [cur.packageName]: cur.outFileName,
    });
  }, {});
  const importMap = { imports };
  const importMapPath = path.join(
    fedOption.workspaceRoot,
    fedOption.outputPath,
    'importmap.json',
  );
  fs.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
}
exports.writeImportMap = writeImportMap;
//# sourceMappingURL=write-import-map.js.map
