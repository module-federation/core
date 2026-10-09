import path from 'node:path';
import { fileCache } from './fileCache';
import type { MiddlewareHandler } from '@modern-js/server-runtime';

const bundlesAssetPrefix = '/bundles';

function isPathInsideRoot(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === '' ||
    (relative !== '..' &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
}

function joinUrlPath(...parts: string[]): string {
  const joined = parts
    .filter((part) => part != null && part !== '')
    .join('/')
    .replace(/\/{2,}/g, '/');
  return joined.startsWith('/') ? joined : `/${joined}`;
}

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

    return pathname;
  } catch (e) {
    return url;
  }
};

const createStaticMiddleware = (options: {
  assetPrefix: string;
  pwd: string;
}): MiddlewareHandler => {
  const { assetPrefix, pwd } = options;
  const bundlesRoot = path.resolve(pwd, 'bundles');

  return async (c, next) => {
    const pathname = c.req.path;

    // We only handle js file for performance
    if (path.extname(pathname) !== '.js') {
      return next();
    }

    const prefixWithoutHost = removeHost(assetPrefix).replace(/\/+$/, '');
    // URL prefixes must stay POSIX-style; path.join breaks on Windows (`\bundles`).
    const prefixWithBundle = joinUrlPath(prefixWithoutHost, bundlesAssetPrefix);
    // Skip if the request is not for asset prefix + `/bundles`
    if (!pathname.startsWith(prefixWithBundle)) {
      return next();
    }

    const pathnameWithoutPrefix = pathname
      .slice(prefixWithBundle.length)
      .replace(/^\/+/, '');
    if (
      !pathnameWithoutPrefix ||
      pathnameWithoutPrefix.includes('\0') ||
      pathnameWithoutPrefix.split(/[/\\]/).some((segment) => segment === '..')
    ) {
      return next();
    }

    const filepath = path.resolve(bundlesRoot, pathnameWithoutPrefix);
    if (!isPathInsideRoot(bundlesRoot, filepath)) {
      return next();
    }

    const fileResult = await fileCache.getFile(filepath);
    if (!fileResult) {
      return next();
    }

    c.header('Content-Type', 'application/javascript');
    // File content is a UTF-8 string; Content-Length must be byte length or
    // non-ASCII chunks are truncated by clients that honor the header.
    c.header('Content-Length', String(Buffer.byteLength(fileResult.content)));
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
