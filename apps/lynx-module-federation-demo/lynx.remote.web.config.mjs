import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import {
  createWebRemoteFederationPlugin,
  resolveAliases,
  resolveOutputRoot,
} from './federation.config.mjs';

export default defineConfig({
  plugins: [
    pluginReactLynx({
      defaultDisplayLinear: false,
      experimental_isLazyBundle: true,
    }),
    createWebRemoteFederationPlugin(),
  ],
  source: {
    entry: {
      bootstrap: './src/remote-ui/bootstrap.ts',
    },
  },
  environments: {
    web: {},
  },
  output: {
    assetPrefix: 'auto',
    cleanDistPath: false,
    distPath: {
      root: resolveOutputRoot('remote-web'),
    },
    minify: false,
  },
  resolve: {
    alias: resolveAliases,
  },
  splitChunks: false,
});
