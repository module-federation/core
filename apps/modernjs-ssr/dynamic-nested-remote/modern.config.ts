import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3009,
    // hmr: false,
    // liveReload: false,
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
    port: 3009,
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
