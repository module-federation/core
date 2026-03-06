import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'nested_remote',
  filename: 'remoteEntry.js',
  exposes: {
    './Content': './src/components/Content.tsx',
  },
  remotes: {
    remote: 'remote@http://localhost:3051/static/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
