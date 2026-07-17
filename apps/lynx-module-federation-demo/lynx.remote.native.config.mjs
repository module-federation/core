import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import {
  createNativeRemoteFederationPlugin,
  resolveAliases,
} from './federation.config.mjs';

export default defineConfig({
  plugins: [
    pluginReactLynx({
      defaultDisplayLinear: false,
      experimental_isLazyBundle: true,
    }),
    createNativeRemoteFederationPlugin(),
  ],
  source: {
    entry: {
      bootstrap: './src/remote-ui/bootstrap.ts',
    },
  },
  environments: {
    lynx: {},
  },
  output: {
    assetPrefix: 'auto',
    cleanDistPath: false,
    distPath: {
      root: 'dist/remote-native',
    },
    minify: true,
  },
  resolve: {
    alias: resolveAliases,
  },
  splitChunks: false,
});
