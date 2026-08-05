import path from 'node:path';
import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

const remoteEntryPath = path.resolve(
  import.meta.dirname,
  '../rstest-federation-remote/dist/remoteEntry.cjs',
);

export default createModuleFederationConfig({
  name: 'rstest_federation_host',
  remotes: {
    rstestRemote: `commonjs ${remoteEntryPath}`,
  },
  dts: false,
  manifest: false,
  dev: false,
});
