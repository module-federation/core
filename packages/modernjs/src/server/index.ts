import type { MiddlewareHandler, ServerPlugin } from '@modern-js/server-core';
import { fs } from '@modern-js/utils';
import path from 'node:path';

const createStaticMiddleware = (options: {
  assetPrefix: string;
  pwd: string;
}): MiddlewareHandler => {
  const { assetPrefix, pwd } = options;

  return async (c, next) => {
    const pathname = c.req.path;

    // We only handle js file for performance
    if (path.extname(pathname) !== '.js') {
      return next();
    }

    // Skip if the request is not for asset prefix
    const bundlesAssetPrefix = path.join(assetPrefix, 'bundles');
    if (!pathname.startsWith(bundlesAssetPrefix)) {
      return next();
    }

    const filepath = path.join(pwd, pathname.replace(assetPrefix, ''));

    if (!(await fs.pathExists(filepath))) {
      return next();
    }

    c.header('Content-Type', 'application/javascript');
    const stat = await fs.lstat(filepath);
    const { size } = stat;
    // TODO: cache file
    const chunk = await fs.readFile(filepath, 'utf-8');
    c.header('Content-Length', String(size));
    return c.body(chunk, 200);
  };
};

const staticServePlugin = (): ServerPlugin => ({
  name: '@modern-js/plugin-module-federation/server',
  setup: (api) => {
    api.onPrepare(() => {
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      const { middlewares } = api.getServerContext();
      const config = (api as any).getConfig();

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
