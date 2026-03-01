import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'dynamic_remote',
  exposes: {
    '.': './src/components/Image.tsx',
  },
  shared: {
    react: { singleton: false, requiredVersion: false },
    'react-dom': { singleton: false, requiredVersion: false },
  },
  dts: false,
});
