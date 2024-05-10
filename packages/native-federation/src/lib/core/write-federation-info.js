const path = require('path');
const fs = require('fs');

function writeFederationInfo(federationInfo, fedOptions) {
  const metaDataPath = path.join(
    fedOptions.workspaceRoot,
    fedOptions.outputPath,
    'remoteEntry.json',
  );
  fs.writeFileSync(metaDataPath, JSON.stringify(federationInfo, null, 2));
}
module.exports = { writeFederationInfo };
