import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3055,
  },
  runtime: {
    router: true,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
  },

  tools: {
    webpack: (config) => {
      config.output!.uniqueName = 'modernjs-ssr-remote-new-version';
      config.output!.chunkLoadingGlobal =
        'chunk_modernjs-ssr-dynamic-remote-new-version';
    },
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
