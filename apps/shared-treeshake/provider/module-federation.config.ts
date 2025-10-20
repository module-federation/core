import { createModuleFederationConfig } from '@module-federation/enhanced';

export default createModuleFederationConfig({
  name: 'provider',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/routes/page.tsx',
  },
  shared: {
    antd: { singleton: true, treeshake: true },
    react: {},
    'react-dom': {},
  },
  dts: false,
});
