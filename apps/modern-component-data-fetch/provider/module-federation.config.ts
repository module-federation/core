import { createModuleFederationConfig } from '@module-federation/modern-js';
export default createModuleFederationConfig({
  name: 'provider',
  filename: 'remoteEntry.js',
  exposes: {
    './Content': './src/components/Content.tsx',
    './Content2': './src/components/Content2.tsx',
    // './Content.data': './src/components/Content.data.ts',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  runtimePlugins: ['./runtimePlugin.ts'],
});
