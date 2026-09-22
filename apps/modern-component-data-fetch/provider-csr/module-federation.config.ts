import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'provider_csr',
  filename: 'remoteEntry.js',
  exposes: {
    '.': './src/index.tsx',
    './no-data': './src/no-data.tsx',
    // Used to compare parent rerenders with remote remounts.
    './reload-demo': './src/reload-demo.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
