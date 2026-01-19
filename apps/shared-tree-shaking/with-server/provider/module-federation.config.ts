import { createModuleFederationConfig } from '@module-federation/modern-js';

const isSecondarySharedTreeShaking = Boolean(
  process.env.SECONDARY_SHARED_TREE_SHAKING,
);

export default createModuleFederationConfig({
  name: 'provider',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/routes/page.tsx',
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
  dts: true,
});
