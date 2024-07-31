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
    ssrByRouteIds: ['entry-one_nested-routes/pathname/layout'],
  },
  output: {
    disableTsChecker: true,
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
