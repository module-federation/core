import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'node_remote',
  experiments: {
    asyncStartup: true,
  },
  filename: 'remoteEntry.js',
  exposes: {
    './test': './src/expose.js',
  },
  remotes: {
    remote1: 'node_dynamic_remote@http://localhost:3026/remoteEntry.js',
  },
  dts: false,
});
