import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'host',
  remotes: {
    remote: 'remote@http://127.0.0.1:3051/static/mf-manifest.json',
    nested_remote: 'nested_remote@http://127.0.0.1:3052/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
