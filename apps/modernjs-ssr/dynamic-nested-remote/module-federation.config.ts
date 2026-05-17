import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'dynamic_nested_remote',
  experiments: {
    asyncStartup: true,
  },
  filename: 'remoteEntry.js',
  exposes: {
    './Content': './src/components/Content.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
