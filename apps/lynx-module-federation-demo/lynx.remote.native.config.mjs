import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import {
  createNativeRemoteFederationPlugin,
  resolveAliases,
  resolveOutputRoot,
} from './federation.config.mjs';

const nativeRemoteOrigin =
  process.env.LYNX_REMOTE_ORIGIN?.replace(/\/+$/, '') ??
  'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [
    pluginReactLynx({
      defaultDisplayLinear: false,
      engineVersion: '3.9',
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
    assetPrefix: `${nativeRemoteOrigin}/remote-native/`,
    cleanDistPath: false,
    distPath: {
      root: resolveOutputRoot('remote-native'),
    },
    minify: true,
  },
  resolve: {
    alias: resolveAliases,
  },
  splitChunks: false,
});
