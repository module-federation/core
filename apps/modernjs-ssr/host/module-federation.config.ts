import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'host',
  shareStrategy: 'loaded-first',
  // This SSR cache E2E exercises runtime loading, not type extraction.
  dts: false,
  remotes: {
    remote: 'remote@http://127.0.0.1:3051/static/mf-manifest.json',
    nested_remote: 'nested_remote@http://127.0.0.1:3052/mf-manifest.json',
  },
  shared: {
    antd: { singleton: true, import: false },
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
