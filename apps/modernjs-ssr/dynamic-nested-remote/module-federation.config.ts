import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'dynamic_nested_remote',
  filename: 'remoteEntry.js',
  exposes: {
    './Content': './src/components/Content.tsx',
  },
  shared: {
    react: { singleton: false, requiredVersion: false },
    'react-dom': { singleton: false, requiredVersion: false },
  },
  dts: false,
});
