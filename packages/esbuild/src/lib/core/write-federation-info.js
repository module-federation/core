'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.writeFederationInfo = void 0;
const tslib_1 = require('tslib');
const path = tslib_1.__importStar(require('path'));
const fs = tslib_1.__importStar(require('fs'));
function writeFederationInfo(federationInfo, fedOptions) {
  const metaDataPath = path.join(
    fedOptions.workspaceRoot,
    fedOptions.outputPath,
    'remoteEntry.json',
  );
  fs.writeFileSync(metaDataPath, JSON.stringify(federationInfo, null, 2));
}
exports.writeFederationInfo = writeFederationInfo;
//# sourceMappingURL=write-federation-info.js.map
