import { createModuleFederationConfig } from '@module-federation/modern-js';
export default createModuleFederationConfig({
  name: 'provider',
  filename: 'remoteEntry.js',
  exposes: {
    './Content': './src/components/Content.tsx',
    './Content.data': './src/components/Content.data.ts',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
