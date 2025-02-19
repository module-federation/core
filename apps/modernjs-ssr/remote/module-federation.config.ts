import { createModuleFederationConfig } from '@module-federation/modern-js';
export default createModuleFederationConfig({
  name: 'remote',
  filename: 'remoteEntry.js',
  dts: false,
  exposes: {
    './Image': './src/components/Image.tsx',
    './Button': './src/components/Button.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
