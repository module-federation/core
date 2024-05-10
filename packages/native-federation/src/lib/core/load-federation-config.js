'use strict';
const path = require('path');
const fs = require('fs');

function loadFederationConfig(fedOptions) {
  return new Promise((resolve, reject) => {
    const fullConfigPath = path.join(
      fedOptions.workspaceRoot,
      fedOptions.federationConfig,
    );
    if (!fs.existsSync(fullConfigPath)) {
      reject(new Error('Expected ' + fullConfigPath));
      return;
    }
    resolve(require(fullConfigPath));
  });
}

module.exports = { loadFederationConfig };
