import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3007,
  },
  runtime: {
    router: true,
  },
  output: {
    disableTsChecker: true,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3007,
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
