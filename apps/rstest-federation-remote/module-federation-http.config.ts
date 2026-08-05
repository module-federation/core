import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_http_remote',
  filename: 'remoteEntry.cjs',
  exposes: {
    './button': './src/button.tsx',
    './dynamic-value': './src/dynamic-value.ts',
    './static-value': './src/static-value.ts',
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
