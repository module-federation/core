import { createModuleFederationConfig } from '@module-federation/modern-js';
export default createModuleFederationConfig({
  name: 'dynamic_remote',
  exposes: {
    '.': './src/components/Image.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
