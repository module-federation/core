import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'replacement_remote',
  exposes: {
    './Image': './src/components/Image.tsx',
    './Heavy': './src/components/Heavy.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
