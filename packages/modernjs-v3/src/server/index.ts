import type { ServerPlugin } from '@modern-js/server-runtime';
import helpers from '@module-federation/runtime/helpers';
import {
  createCorsMiddleware,
  createStaticMiddleware,
} from './staticMiddleware';

const staticServePlugin = (): ServerPlugin => ({
  name: '@modern-js/module-federation/server',
  setup: (api) => {
    // A dev rebuild clears the SSR bundles from the require cache, but their
    // federation runtime lives on globalThis. Reset it, or the re-required
    // bundles reuse the previous build's containers and shared singletons.
    api.onReset(({ event }) => {
      if (event.type === 'repack') {
        helpers.global.resetFederationRuntime();
      }
    });

    api.onPrepare(() => {
      // In development, we don't need to serve the manifest file, bundler dev server will handle it
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      const { middlewares } = api.getServerContext();
      const config = api.getServerConfig();

      const assetPrefix = config.output?.assetPrefix || '';
      // When SSR is enabled, we need to serve the files in `bundle/` directory externally
      // Modern.js will only serve the files in `static/` directory
      if (config.server?.ssr) {
        const context = api.getServerContext();
        const pwd = context.distDirectory!;
        const serverStaticMiddleware = createStaticMiddleware({
          assetPrefix,
          pwd,
        });
        middlewares.push({
          name: 'module-federation-serve-manifest',
          handler: serverStaticMiddleware,
        });
      }

      // When the MODERN_MF_AUTO_CORS environment variable is set, the server will add CORS headers to the response
      // This environment variable should only be set when running `serve` command in local test.
      if (process.env.MODERN_MF_AUTO_CORS) {
        const corsMiddleware = createCorsMiddleware();
        middlewares.push({
          name: 'module-federation-cors',
          handler: corsMiddleware,
        });
      }
    });
  },
});

export default staticServePlugin;
export { staticServePlugin };
