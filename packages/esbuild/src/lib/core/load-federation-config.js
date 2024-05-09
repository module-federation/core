import * as _path from 'path';
import * as fs from 'fs';

export async function loadFederationConfig(fedOptions) {
  const fullConfigPath = _path.join(
    fedOptions.workspaceRoot,
    fedOptions.federationConfig,
  );

  if (!fs.existsSync(fullConfigPath)) {
    throw new Error('Expected ' + fullConfigPath);
  }

  const config = await import(`${fullConfigPath}`);
  return config;
}
