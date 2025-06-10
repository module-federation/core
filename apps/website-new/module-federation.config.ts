import { createModuleFederationConfig } from '@module-federation/enhanced';

export default createModuleFederationConfig({
  name: 'mf_doc',
  exposes: {
    './cli-zh': './docs/zh/guide/basic/cli.mdx',
    './cli-en': './docs/en/guide/basic/cli.mdx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    '@mdx-js/react': { singleton: true },
  },
  dts: false,
});
