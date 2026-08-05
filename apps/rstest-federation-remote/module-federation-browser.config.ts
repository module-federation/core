import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_browser_remote',
  filename: 'remoteEntry.js',
  exposes: {
    './button': './src/button.tsx',
  },
  shared: {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },
  dts: false,
  manifest: false,
  dev: false,
});
