import { defineConfig } from '@lynx-js/rspeedy';

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginModuleFederationRspeedy } from '@module-federation/rspeedy-plugin';

export default defineConfig({
  server: {
    host: '172.20.11.93',
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`;
      },
    }),
    pluginReactLynx(),
    // Test with remotes and shared config
    pluginModuleFederationRspeedy({
      name: 'lynx_host',
      remotes: {
        lynx_remote: 'lynx_remote@http://localhost:3001/mf-manifest.json',
      },
    }),
    // pluginTypeCheck(), // Temporarily disabled for MF testing
  ],
});
