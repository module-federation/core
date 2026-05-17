import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'host',
  experiments: {
    asyncStartup: true,
  },
  remotes: {
    remote: 'remote@http://localhost:3051/static/mf-manifest.json',
    nested_remote: 'nested_remote@http://localhost:3052/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
