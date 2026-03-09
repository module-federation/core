import { createModuleFederationConfig } from '@module-federation/enhanced';

export default createModuleFederationConfig({
  name: 'mf_host',
  remotes: {
    mf_remote: 'provider@http://localhost:3002/mf-manifest.json',
  },
  shared: {
    antd: {
      singleton: true,
      treeShaking: {
        mode: 'runtime-infer',
        // add provider used exports
        usedExports: ['Button', 'Badge'],
      },
    },
    react: {},
    'react-dom': {},
  },
  // shareStrategy: 'loaded-first',
  dts: true,
  // runtimePlugins: [require.resolve('./runtimePlugin.ts')],
});
