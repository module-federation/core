import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'dynamic_remote',
  experiments: {
    asyncStartup: true,
  },
  filename: 'remoteEntry.js',
  exposes: {
    '.': './src/Index.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
