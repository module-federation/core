import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },

  plugins: [
    appTools({
      bundler: 'experimental-rspack',
    }),
    moduleFederationPlugin(),
  ],
  server: {
    port: 3063,
    ssr: {
      mode: 'stream',
    },
  },
});
