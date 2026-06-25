import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  output: {
    assetPrefix: 'http://127.0.0.1:3055',
  },

  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3055,
  },

  tools: {
    rspack: (config) => {
      config.output!.uniqueName = 'modernjs-ssr-remote-new-version';
      config.output!.chunkLoadingGlobal =
        'chunk_modernjs-ssr-dynamic-remote-new-version';
    },
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
