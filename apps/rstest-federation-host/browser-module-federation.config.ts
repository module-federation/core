import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_browser_host',
  remotes: {
    catalogRemote:
      'rstest_federation_catalog_browser@http://127.0.0.1:3301/browser/remoteEntry.js',
    profileRemote:
      'rstest_federation_profile_browser@http://127.0.0.1:3302/browser/remoteEntry.js',
  },
  shared: {
    react: { eager: true, singleton: true },
    'react-dom': { eager: true, singleton: true },
  },
  dts: false,
  manifest: false,
  dev: false,
});
