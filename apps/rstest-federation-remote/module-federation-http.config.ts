import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_catalog_node',
  filename: 'remoteEntry.cjs',
  exposes: {
    './ProductPanel': './src/ProductPanel.tsx',
    './product-details': './src/product-details.ts',
  },
  shared: {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },
  dts: false,
  manifest: false,
  dev: false,
});
