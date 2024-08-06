import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3052,
  },
  runtime: {
    router: true,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3052,
  },
  plugins: [
    appTools({
      bundler: 'experimental-rspack',
    }),
    moduleFederationPlugin(),
  ],
});
