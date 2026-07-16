import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import {
  createWebRemoteFederationPlugin,
  resolveAliases,
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
    cleanDistPath: false,
    distPath: {
      root: 'dist/remote-web',
    },
    minify: false,
  },
  resolve: {
    alias: resolveAliases,
  },
  splitChunks: false,
});
