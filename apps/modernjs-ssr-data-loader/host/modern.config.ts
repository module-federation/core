import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    // port: 3062,
    // FIXME: it should be removed , related issue: https://github.com/web-infra-dev/modern.js/issues/5999
    host: '0.0.0.0',
  },
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
  // source: {
  //   alias: {
  //     // FIXME: becasue modernjs set alias value as package, so the value will use @module-federation/modern-js's @modern-js/runtime , and it will cause multiple instance
  //     '@meta/runtime': require.resolve('@modern-js/runtime'),
  //   },
  // },
  plugins: [
    appTools({
      bundler: 'experimental-rspack',
    }),
    moduleFederationPlugin({
      dataLoader: true,
    }),
  ],
});
