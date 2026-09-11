import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import { resolveAliases, resolveOutputRoot } from './federation.config.mjs';

const catalogDevHost = process.env.CATALOG_DEV_HOST ?? '127.0.0.1';
const catalogDevPort = Number(process.env.CATALOG_DEV_PORT ?? 3001);

export default defineConfig({
  plugins: [
    pluginReactLynx({
      defaultDisplayLinear: false,
      engineVersion: '3.9',
    }),
    pluginQRCode({ fullscreen: true }),
  ],
  source: {
    entry: {
      main: './src/catalog-app/index.tsx',
    },
  },
  environments: {
    lynx: {},
  },
  output: {
    assetPrefix: '/catalog-native/',
    cleanDistPath: false,
    distPath: {
      root: resolveOutputRoot('catalog-native'),
    },
    minify: true,
  },
  server: {
    host: catalogDevHost,
    port: catalogDevPort,
  },
  resolve: {
    alias: resolveAliases,
  },
  splitChunks: false,
});
