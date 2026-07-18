import fs from 'node:fs';
import path from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';

function getContentType(filePath: string) {
  if (filePath.endsWith('.json')) {
    return 'application/json';
  }
  if (filePath.endsWith('.js')) {
    return 'application/javascript';
  }
  if (filePath.endsWith('.map')) {
    return 'application/json';
  }
  return 'application/octet-stream';
}

export function pluginServeSsrDist(rootDir = process.cwd()): RsbuildPlugin {
  const ssrDir = path.join(rootDir, 'dist', 'ssr');

  return {
    name: 'plugin-serve-ssr-dist',
    setup(api) {
      api.modifyRsbuildConfig((config) => {
        config.dev ??= {};
        const previous = config.dev.setupMiddlewares;

        config.dev.setupMiddlewares = (middlewares, server) => {
          if (typeof previous === 'function') {
            previous(middlewares, server);
          } else if (Array.isArray(previous)) {
            previous.forEach((setup) => setup(middlewares, server));
          }

          middlewares.unshift((req, res, next) => {
            const url = req.url?.split('?')[0] ?? '';
            if (!url.startsWith('/ssr/')) {
              next();
              return;
            }

            const relativePath = decodeURIComponent(url.slice('/ssr/'.length));
            const filePath = path.join(ssrDir, relativePath);

            if (
              !filePath.startsWith(ssrDir) ||
              !fs.existsSync(filePath) ||
              fs.statSync(filePath).isDirectory()
            ) {
              next();
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', getContentType(filePath));
            res.setHeader('Access-Control-Allow-Origin', '*');
            fs.createReadStream(filePath).pipe(res);
          });
        };
      });
    },
  };
}
