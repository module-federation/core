import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import {
  createWebHostFederationPlugin,
  resolveAliases,
  resolveOutputRoot,
} from './federation.config.mjs';

const manifestUrl =
  process.env.CATALOG_WEB_MANIFEST_URL ?? '/remote-web/mf-manifest.json';

export default defineConfig({
  plugins: [
    pluginReactLynx({ defaultDisplayLinear: false }),
    createWebHostFederationPlugin(manifestUrl),
  ],
  source: {
    entry: {
      main: './src/app/index.tsx',
    },
  },
  environments: {
    web: {},
  },
  output: {
    cleanDistPath: false,
    distPath: {
      root: resolveOutputRoot('host-web'),
    },
    minify: false,
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: resolveAliases,
  },
  splitChunks: false,
});
