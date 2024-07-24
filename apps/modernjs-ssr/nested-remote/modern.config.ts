import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';
import { config } from 'process';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3052,
  },
  runtime: {
    router: true,
  },
  source: {
    // enableAsyncEntry:true,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3052,
  },
  tools: {
    rspack: (config) => {
      // config.resolve?.extensions?.unshift('.server.jsx')
    },
  },
  plugins: [
    appTools({
      bundler: 'experimental-rspack',
    }),
    moduleFederationPlugin(),
  ],
});
