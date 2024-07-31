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
    port: 3062,
  },
  plugins: [
    appTools({
      // TODO: wait rspack fix react-router-dom shared issue to change bundler type as rspack
      bundler: 'webpack',
    }),
    moduleFederationPlugin({
      importRoutes: true,
    }),
  ],
});
