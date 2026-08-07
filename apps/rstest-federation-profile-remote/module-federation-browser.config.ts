import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_profile_browser',
  filename: 'remoteEntry.js',
  exposes: {
    './ProfileCard': './src/ProfileCard.tsx',
  },
  shared: {
    react: { eager: true, singleton: true },
    'react-dom': { eager: true, singleton: true },
  },
  dts: false,
  manifest: false,
  dev: false,
});
