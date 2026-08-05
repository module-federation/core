import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_remote',
  filename: 'remoteEntry.cjs',
  exposes: {
    './dynamic-value': './src/dynamic-value.ts',
    './static-value': './src/static-value.ts',
  },
  dts: false,
  manifest: false,
  dev: false,
});
