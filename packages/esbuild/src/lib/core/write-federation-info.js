import * as _path from 'path';
import * as fs from 'fs';

export function writeFederationInfo(federationInfo, fedOptions) {
  const metaDataPath = _path.join(
    fedOptions.workspaceRoot,
    fedOptions.outputPath,
    'remoteEntry.json',
  );
  fs.writeFileSync(metaDataPath, JSON.stringify(federationInfo, null, 2));
}
