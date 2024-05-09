'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.loadFederationConfig = void 0;
const tslib_1 = require('tslib');
const path = tslib_1.__importStar(require('path'));
const fs = tslib_1.__importStar(require('fs'));
function loadFederationConfig(fedOptions) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    const fullConfigPath = path.join(
      fedOptions.workspaceRoot,
      fedOptions.federationConfig,
    );
    if (!fs.existsSync(fullConfigPath)) {
      throw new Error('Expected ' + fullConfigPath);
    }
    const config = yield Promise.resolve(`${fullConfigPath}`).then((s) =>
      tslib_1.__importStar(require(s)),
    );
    return config;
  });
}
exports.loadFederationConfig = loadFederationConfig;
//# sourceMappingURL=load-federation-config.js.map
