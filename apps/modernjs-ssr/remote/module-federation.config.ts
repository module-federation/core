import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'remote',
  manifest: {
    filePath: 'static',
  },
  filename: 'static/remoteEntry.js',
  exposes: {
    './Image': './src/components/Image.tsx',
    './Button': './src/components/Button.tsx',
  },
  shared: {
    react: { singleton: false, requiredVersion: false },
    'react-dom': { singleton: false, requiredVersion: false },
  },
  dts: false,
});
