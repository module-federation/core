import { createModuleFederationConfig } from '@module-federation/modern-js';
export default createModuleFederationConfig({
  name: 'host',
  filename: 'remoteEntry.js',
  remotes: {
    sub: 'sub@http://localhost:3061/mf-manifest.json',
    'host-provider': 'host_provider@http://localhost:3063/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
