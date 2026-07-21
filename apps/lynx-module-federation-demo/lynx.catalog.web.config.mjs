import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import { resolveAliases, resolveOutputRoot } from './federation.config.mjs';

export default defineConfig({
  plugins: [pluginReactLynx({ defaultDisplayLinear: false })],
  source: {
    entry: {
      main: './src/catalog-app/index.tsx',
    },
  },
  environments: {
    web: {},
  },
  output: {
    cleanDistPath: false,
    distPath: {
      root: resolveOutputRoot('catalog-web'),
    },
    minify: false,
  },
  server: {
    port: Number(process.env.CATALOG_DEV_PORT ?? 3001),
  },
  resolve: {
    alias: resolveAliases,
  },
  splitChunks: false,
});
