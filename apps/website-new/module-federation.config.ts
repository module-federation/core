import { createModuleFederationConfig } from '@module-federation/enhanced';

export default createModuleFederationConfig({
  filename: 'remoteEntry.js',
  name: 'mf_doc',
  exposes: {
    './cli-zh': './docs/zh/guide/basic/cli.mdx',
    './cli-en': './docs/en/guide/basic/cli.mdx',
  },
  shared: {
    react: { singleton: true, import: require.resolve('react') },
    'react-dom': { singleton: true, import: require.resolve('react-dom') },
    '@mdx-js/react': { singleton: true, requiredVersion: false },
  },
  dts: false,
});
