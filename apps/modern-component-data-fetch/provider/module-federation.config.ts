import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'provider',
  filename: 'remoteEntry.js',
  exposes: {
    './BasicComponent': './src/components/BasicComponent/index.tsx',
    './ClientDowngrade': './src/components/ClientDowngrade/index.tsx',
    './ServerDowngrade': './src/components/ServerDowngrade/index.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
