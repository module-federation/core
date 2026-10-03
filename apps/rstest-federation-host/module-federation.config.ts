import path from 'node:path';
import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

const localRemoteEntryPath = path.resolve(
  import.meta.dirname,
  '../rstest-federation-profile-remote/dist/local/remoteEntry.cjs',
);

export default createModuleFederationConfig({
  name: 'rstest_federation_host',
  remotes: {
    catalogRemote:
      'rstest_federation_catalog_node@http://127.0.0.1:3301/node/remoteEntry.cjs',
    profileRemote: `commonjs ${localRemoteEntryPath}`,
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  dts: false,
  manifest: false,
  dev: false,
});
