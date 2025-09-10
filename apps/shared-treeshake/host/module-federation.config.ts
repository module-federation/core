import { createModuleFederationConfig } from '@module-federation/enhanced';

export default createModuleFederationConfig({
  name: 'mf_host',
  remotes: {
    mf_remote: 'mf_remote@http://localhost:3002/mf-manifest.json',
  },
  shared: {
    antd: { singleton: true },
    react: {},
    'react-dom': {},
  },
  dts: false,
});
