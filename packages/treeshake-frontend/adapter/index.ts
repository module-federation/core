import fs from 'node:fs';
import path from 'node:path';

export type FrontendAdapter = {
  id: string;
  register: (app: { get: (path: string, handler: any) => void }) => void;
};

export type TreeshakeFrontendAdapterOptions = {
  basePath?: string;
  distDir?: string;
  indexFile?: string;
  spaFallback?: boolean;
};

const defaultBasePath = '/tree-shaking';

const contentTypeByExt = (filePath: string) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.json')) return 'application/json';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg'))
    return 'image/jpeg';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
};

const resolveDistDir = (override?: string) => {
  if (override) return override;
  const candidate = path.resolve(__dirname, '..');
  const candidateIndex = path.join(candidate, 'index.html');
  if (fs.existsSync(candidateIndex)) return candidate;
  return path.resolve(__dirname, '..', '..', 'dist');
};

const safeResolve = (rootDir: string, requestPath: string) => {
  const rootResolved = path.resolve(rootDir);
  const rel = requestPath.replace(/^\/+/, '');
  const filePath = path.resolve(rootResolved, rel);
  if (
    filePath !== rootResolved &&
    !filePath.startsWith(`${rootResolved}${path.sep}`)
  ) {
    return null;
  }
  return filePath;
};

export function createTreeshakeFrontendAdapter(
  opts: TreeshakeFrontendAdapterOptions = {},
): FrontendAdapter {
  const basePath = opts.basePath ?? defaultBasePath;
  const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  const distDir = resolveDistDir(opts.distDir);
  const indexFile = opts.indexFile ?? 'index.html';
  const spaFallback = opts.spaFallback ?? true;

  const handler = async (c: any) => {
    let requestPath = c.req.path;
    try {
      requestPath = decodeURIComponent(requestPath);
    } catch {
      return c.text('Not Found', 404);
    }

    let relPath = requestPath;
    if (normalizedBase && requestPath.startsWith(normalizedBase)) {
      relPath = requestPath.slice(normalizedBase.length);
    }
    if (!relPath || relPath === '/') {
      relPath = `/${indexFile}`;
    }

    const filePath = safeResolve(distDir, relPath);
    if (filePath) {
      try {
        const stat = await fs.promises.stat(filePath);
        if (stat.isFile()) {
          const buf = await fs.promises.readFile(filePath);
          return new Response(buf, {
            status: 200,
            headers: { 'Content-Type': contentTypeByExt(filePath) },
          });
        }
      } catch {
        // fall through to spa fallback
      }
    }

    if (!spaFallback) {
      return c.text('Not Found', 404);
    }

    const fallbackPath = safeResolve(distDir, `/${indexFile}`);
    if (!fallbackPath) {
      return c.text('Not Found', 404);
    }
    try {
      const buf = await fs.promises.readFile(fallbackPath);
      return new Response(buf, {
        status: 200,
        headers: { 'Content-Type': contentTypeByExt(fallbackPath) },
      });
    } catch {
      return c.text('Not Found', 404);
    }
  };

  return {
    id: 'treeshake-frontend',
    register(app) {
      const base = normalizedBase || '/';
      app.get(base, handler);
      app.get(`${base}/*`, handler);
    },
  };
}
