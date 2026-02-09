import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'provider_csr',
  experiments: {
    asyncStartup: true,
  },
  filename: 'remoteEntry.js',
  exposes: {
    '.': './src/index.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
