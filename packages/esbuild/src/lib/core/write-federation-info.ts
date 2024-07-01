import * as _path from 'path';
import * as fs from 'fs';

interface FederationInfo {
  // Define the structure of federationInfo here
  [key: string]: any;
}

interface FedOptions {
  workspaceRoot: string;
  outputPath: string;
}

export function writeFederationInfo(
  federationInfo: FederationInfo,
  fedOptions: FedOptions,
): void {
  const metaDataPath = _path.join(
    fedOptions.workspaceRoot,
    fedOptions.outputPath,
    'remoteEntry.json',
  );
  fs.writeFileSync(metaDataPath, JSON.stringify(federationInfo, null, 2));
}
