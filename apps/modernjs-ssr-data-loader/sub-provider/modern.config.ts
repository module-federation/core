import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },

  plugins: [
    appTools({
      // TODO: wait rspack fix react-router-dom shared issue to change bundler type as rspack
      bundler: 'webpack',
    }),
    moduleFederationPlugin(),
  ],
  server: {
    port: 3064,
    ssr: {
      mode: 'stream',
    },
  },
});
