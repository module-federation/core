import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_browser_host',
  remotes: {
    rstestBrowserRemote:
      'rstest_federation_browser_remote@http://127.0.0.1:3301/browser/remoteEntry.js',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  dts: false,
  manifest: false,
  dev: false,
});
