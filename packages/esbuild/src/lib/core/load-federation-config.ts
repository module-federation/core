import * as _path from 'path';
import * as fs from 'fs';

interface FederationOptions {
  workspaceRoot: string;
  federationConfig: string;
}

export async function loadFederationConfig(
  fedOptions: FederationOptions,
): Promise<any> {
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
