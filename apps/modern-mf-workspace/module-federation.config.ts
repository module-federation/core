import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'mf_workspace',
  remotes: {},
  dts: false,
  shared: {
    react: { singleton: true, requiredVersion: '18.3.1' },
    'react-dom': { singleton: true, requiredVersion: '18.3.1' },
  },
});
