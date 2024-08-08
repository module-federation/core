import { createModuleFederationConfig } from '@module-federation/modern-js';

export default createModuleFederationConfig({
  name: 'app1',
  exposes: {
    './thing': './src/test.ts',
    './react-component': './src/components/react-component.tsx',
  },
  runtimePlugins: ['./runtimePlugin.ts'],
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  dataPrefetch: true,
});
