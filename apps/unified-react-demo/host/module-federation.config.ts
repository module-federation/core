import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
export default createModuleFederationConfig({
  name: 'unified_host',
  remotes: {
    remote: 'unified_provider@http://localhost:5103/mf-manifest.json',
  },
  runtimePlugins: [require.resolve('./src/metadata-plugin')],
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
});
