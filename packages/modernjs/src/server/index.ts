import type { ServerPlugin } from '@modern-js/server-runtime';
import { createStaticMiddleware } from './staticMiddleware';

const staticServePlugin = (): ServerPlugin => ({
  name: '@modern-js/module-federation/server',
  setup: (api) => {
    api.onPrepare(() => {
      // In development, we don't need to serve the manifest file, bundler dev server will handle it
      console.log(process.env.NODE_ENV);
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      const { middlewares } = api.getServerContext();
      const config = api.getServerConfig();

      const assetPrefix = config.output?.assetPrefix || '';
      if (!config.server?.ssr) {
        return;
      }

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
    });
  },
});

export default staticServePlugin;
export { staticServePlugin };
