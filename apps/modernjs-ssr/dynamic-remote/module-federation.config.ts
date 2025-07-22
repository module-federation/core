import { createModuleFederationConfig } from '@module-federation/modern-js';
export default createModuleFederationConfig({
  name: 'dynamic_remote',
  filename: 'remoteEntry.js',
  exposes: {
    '.': './src/Index.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
