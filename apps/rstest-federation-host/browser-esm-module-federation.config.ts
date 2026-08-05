import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_browser_esm_host',
  remoteType: 'module',
  remotes: {
    rstestEsmRemote: 'http://127.0.0.1:3301/browser-esm/remoteEntry.mjs',
  },
  shared: {
    react: { eager: true, singleton: true },
    'react-dom': { eager: true, singleton: true },
  },
  dts: false,
  manifest: false,
  dev: false,
});
