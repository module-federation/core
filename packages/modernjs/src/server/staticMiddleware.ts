import { access } from 'fs/promises';
import path from 'node:path';
import { fileCache } from './fileCache';
import type { MiddlewareHandler } from '@modern-js/server-runtime';

const pathExists = async (filepath: string): Promise<boolean> => {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
};

const bundlesAssetPrefix = '/bundles';
const manifestFileNames = new Set(['/mf-manifest.json', '/mf-stats.json']);

const getContentType = (filepath: string) => {
  if (path.extname(filepath) === '.json') {
    return 'application/json';
  }
  return 'application/javascript';
};

// Remove domain name from assetPrefix if it exists
// and remove trailing slash if it exists, if the url is a single slash, return it as empty string
const removeHost = (url: string): string => {
  try {
    // Extract pathname
    const hasProtocol = url.includes('://');
    const hasDomain = hasProtocol || url.startsWith('//');
    const pathname = hasDomain
      ? new URL(hasProtocol ? url : `http:${url}`).pathname
      : url;

    return pathname === '/' ? '' : pathname.replace(/\/$/, '');
  } catch (e) {
    return url;
  }
};

const createStaticMiddleware = (options: {
  assetPrefix: string;
  pwd: string;
}): MiddlewareHandler => {
  const { assetPrefix, pwd } = options;
  const prefixWithoutHost = removeHost(assetPrefix);
  const prefixWithBundle = path.join(prefixWithoutHost, bundlesAssetPrefix);

  return async (c, next) => {
    const pathname = c.req.path;

    const pathnameWithoutAssetPrefix = pathname.replace(prefixWithoutHost, '');
    const isBundleJs =
      path.extname(pathname) === '.js' && pathname.startsWith(prefixWithBundle);
    const isManifestJson = manifestFileNames.has(pathnameWithoutAssetPrefix);

    // Only serve bundled JS files and root federation manifest files.
    if (!isBundleJs && !isManifestJson) {
      return next();
    }

    const filepath = isBundleJs
      ? path.join(
          pwd,
          bundlesAssetPrefix,
          pathname.replace(prefixWithBundle, ''),
        )
      : path.join(pwd, pathnameWithoutAssetPrefix);
    if (!(await pathExists(filepath))) {
      return next();
    }

    const fileResult = await fileCache.getFile(filepath);
    if (!fileResult) {
      return next();
    }

    c.header('Content-Type', getContentType(filepath));
    c.header('Content-Length', String(fileResult.content.length));
    return c.body(fileResult.content, 200);
  };
};

const createCorsMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const pathname = c.req.path;
    // If the request is only for a static file
    if (path.extname(pathname)) {
      c.header('Access-Control-Allow-Origin', '*');
      c.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      );
      c.header('Access-Control-Allow-Headers', '*');
    }
    return next();
  };
};

export { createStaticMiddleware, createCorsMiddleware };
