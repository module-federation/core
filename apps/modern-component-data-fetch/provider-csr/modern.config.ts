import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 5003,
  },
  plugins: [
    appTools({
      bundler: 'rspack',
    }),
    moduleFederationPlugin(),
  ],
});
