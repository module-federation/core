import { createModuleFederationConfig } from '@module-federation/modern-js';
import path from 'path';

const isSecondarySharedTreeShaking = Boolean(
  process.env.SECONDARY_SHARED_TREE_SHAKING,
);

export default createModuleFederationConfig({
  name: 'mf_host',
  remotes: {
    mf_remote: 'provider@http://localhost:3002/mf-manifest.json',
  },
  shared: {
    antd: {
      singleton: true,
      treeShaking: {
        mode: 'server-calc',
        usedExports: isSecondarySharedTreeShaking
          ? ['Divider', 'Space', 'Switch', 'Button', 'Badge']
          : undefined,
      },
    },
    react: {},
    'react-dom': {},
  },
  // shareStrategy: 'loaded-first',
  dts: true,
  runtimePlugins: [path.resolve(__dirname, './runtimePlugin.ts')],
});
