import { defineConfig } from '@lynx-js/rspeedy';

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginModuleFederationRspeedy } from '@module-federation/rspeedy-plugin';

export default defineConfig({
  server: {
    port: 3001,
  },
  dev: {
    hmr: false,
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`;
      },
    }),
    pluginReactLynx(),
    pluginModuleFederationRspeedy({
      name: 'lynx_remote',
      filename: 'lynx_remote.container.bundle',
      exposes: {
        './SimpleMFDemo': './src/components/SimpleMFDemoCompiled.tsx',
      },
      shared: {
        '@lynx-js/react': {
          singleton: true,
          eager: false,
        },
      },
      dts: false,
    }),
    pluginTypeCheck(),
  ],
});
