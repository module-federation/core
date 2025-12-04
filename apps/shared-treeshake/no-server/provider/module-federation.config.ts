import { createModuleFederationConfig } from '@module-federation/enhanced';

export default createModuleFederationConfig({
  name: 'provider',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/routes/page.tsx',
  },
  shared: {
    antd: {
      singleton: true,
      treeshake: {
        strategy: 'infer',
      },
    },
    react: {},
    'react-dom': {},
  },
  dts: true,
});
