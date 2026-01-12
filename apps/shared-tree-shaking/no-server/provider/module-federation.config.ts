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
      treeShaking: {
        strategy: 'infer',
        // add consumer used exports
        usedExports: ['Divider', 'Space', 'Switch'],
      },
    },
    react: {},
    'react-dom': {},
  },
  dts: true,
});
