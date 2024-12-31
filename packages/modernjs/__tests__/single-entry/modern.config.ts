import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '../../src/cli/index';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
  },
  plugins: [
    appTools({
      bundler: 'rspack',
    }),
    moduleFederationPlugin({
      dataLoader: true,
    }),
  ],
});
