import { createModuleFederationConfig } from '@module-federation/enhanced';

export default createModuleFederationConfig({
  name: 'mf_host',
  remotes: {
    mf_remote: 'mf_remote@http://localhost:3002/mf-manifest.json',
  },
  shared: {
    antd: { singleton: true, treeshake: true },
    react: {},
    'react-dom': {},
  },
  // shareStrategy: 'loaded-first',
  dts: false,
  runtimePlugins: [require.resolve('./runtimePlugin.ts')],
});
