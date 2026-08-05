import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_browser_esm_remote',
  filename: 'remoteEntry.mjs',
  library: {
    type: 'module',
  },
  exposes: {
    './button': './src/button.tsx',
  },
  shared: {
    react: {
      eager: true,
      singleton: true,
    },
    'react-dom': {
      eager: true,
      singleton: true,
    },
  },
  dts: false,
  manifest: false,
  dev: false,
});
