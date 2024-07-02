import { createModuleFederationConfig } from '@module-federation/modern-js';
export default createModuleFederationConfig({
  name: 'dynamic_nested_remote',
  filename: 'remoteEntry.js',
  exposes: {
    './Content': './src/components/Content.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
