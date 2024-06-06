import { createModuleFederationConfig } from '@module-federation/modern-js';
export default createModuleFederationConfig({
  name: 'dynamic_remote',
  exposes: {
    './thing': './src/test.ts',
  },
  runtimePlugins: ['./runtimePlugin.ts'],
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
