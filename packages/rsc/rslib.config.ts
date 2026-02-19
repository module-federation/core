import { defineConfig } from '@rslib/core';

const shared = {
  syntax: 'es2021',
  bundle: false,
};

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
      dts: {
        distPath: './dist',
      },
    },
    {
      ...shared,
      format: 'cjs',
      dts: false,
    },
  ],
  source: {
    entry: {
      'runtime/rscRuntimePlugin': './runtime/rscRuntimePlugin.ts',
      'runtime/rscSSRRuntimePlugin': './runtime/rscSSRRuntimePlugin.ts',
      'webpack/AutoIncludeClientComponentsPlugin':
        './webpack/AutoIncludeClientComponentsPlugin.ts',
      'webpack/ClientServerActionsBootstrapPlugin':
        './webpack/ClientServerActionsBootstrapPlugin.ts',
      'webpack/CollectServerActionsPlugin':
        './webpack/CollectServerActionsPlugin.ts',
      'webpack/CanonicalizeClientManifestPlugin':
        './webpack/CanonicalizeClientManifestPlugin.ts',
      'webpack/ExtraFederationManifestPlugin':
        './webpack/ExtraFederationManifestPlugin.ts',
      'webpack/ServerActionsBootstrapPlugin':
        './webpack/ServerActionsBootstrapPlugin.ts',
      'webpack/serverActionUtils': './webpack/serverActionUtils.ts',
      'webpack/serverActionsRegistry': './webpack/serverActionsRegistry.ts',
      'webpack/webpackShared': './webpack/webpackShared.ts',
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: [
      /@module-federation\//,
      'webpack',
      '@module-federation/react-server-dom-webpack',
      'pnpapi',
    ],
  },
});
