import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'host',
  remotes: {
    remote: 'provider@http://localhost:5002/mf-manifest.json',
    'provider-csr': 'provider_csr@http://localhost:5003/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
