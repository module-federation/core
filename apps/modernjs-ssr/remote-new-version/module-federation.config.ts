import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'remote',
  experiments: {
    asyncStartup: true,
  },
  exposes: {
    './Image': './src/components/Image.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
