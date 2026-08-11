import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_profile_local',
  filename: 'remoteEntry.cjs',
  exposes: {
    './ProfileCard': './src/ProfileCard.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  dts: false,
  manifest: false,
  dev: false,
});
