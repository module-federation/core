import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

import {
  createNativeHostFederationPlugin,
  resolveAliases,
  resolveOutputRoot,
} from './federation.config.mjs';

const nativeRemoteOrigin =
  process.env.LYNX_REMOTE_ORIGIN?.replace(/\/+$/, '') ??
  'http://127.0.0.1:3000';
const nativeHostOrigin = process.env.LYNX_HOST_ORIGIN?.replace(/\/+$/, '');
const devHost = process.env.LYNX_DEV_HOST ?? '127.0.0.1';
const devPort = Number(process.env.LYNX_DEV_PORT ?? 3000);
const nativeManifestUrl =
  process.env.CATALOG_NATIVE_MANIFEST_URL ??
  `${nativeRemoteOrigin}/remote-native/mf-manifest.json`;
const pluginNativeRemoteAssets = {
  name: 'demo:native-remote-assets',
  setup(api) {
    api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) =>
      mergeRsbuildConfig(config, {
        server: {
          publicDir: {
            copyOnBuild: false,
            name: process.env.LYNX_OUTPUT_ROOT ?? 'dist',
            watch: false,
          },
        },
      }),
    );
  },
};

export default defineConfig({
  plugins: [
    pluginReactLynx({ defaultDisplayLinear: false }),
    createNativeHostFederationPlugin(nativeManifestUrl),
    pluginNativeRemoteAssets,
    pluginQRCode({ fullscreen: true }),
  ],
  source: {
    entry: {
      main: './src/app/index.tsx',
    },
  },
  environments: {
    lynx: {},
  },
  output: {
    assetPrefix: nativeHostOrigin
      ? `${nativeHostOrigin}/host-native/`
      : '/host-native/',
    cleanDistPath: false,
    distPath: {
      root: resolveOutputRoot('host-native'),
    },
    minify: true,
  },
  server: {
    host: devHost,
    port: devPort,
  },
  resolve: {
    alias: resolveAliases,
  },
  splitChunks: false,
});
