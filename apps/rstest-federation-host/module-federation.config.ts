import path from 'node:path';
import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

const localRemoteEntryPath = path.resolve(
  import.meta.dirname,
  '../rstest-federation-remote/dist/local/remoteEntry.cjs',
);

export default createModuleFederationConfig({
  name: 'rstest_federation_host',
  remotes: {
    rstestRemote: `commonjs ${localRemoteEntryPath}`,
    rstestHttpRemote:
      'rstest_federation_http_remote@http://127.0.0.1:3301/node/remoteEntry.cjs',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  dts: false,
  manifest: false,
  dev: false,
});
