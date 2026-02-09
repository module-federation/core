import fs from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';

function contentTypeByExt(filePath: string): string {
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
}

export const DEFAULT_STATIC_ROOT = path.join(process.cwd(), 'log', 'static');

async function serveLocalFile(c: any, rootDir: string) {
  let requestPath = c.req.path;
  try {
    requestPath = decodeURIComponent(requestPath);
  } catch {
    return c.text('Not Found', 404);
  }
  const relPath = requestPath.replace(/^\/+/, '');
  const rootResolved = path.resolve(rootDir);
  const filePath = path.resolve(rootResolved, relPath);
  if (
    filePath !== rootResolved &&
    !filePath.startsWith(`${rootResolved}${path.sep}`)
  ) {
    return c.text('Not Found', 404);
  }
  try {
    const buf = await fs.promises.readFile(filePath);
    return new Response(buf, {
      status: 200,
      headers: { 'Content-Type': contentTypeByExt(filePath) },
    });
  } catch {
    return c.text('Not Found', 404);
  }
}

export function createStaticRoute(opts?: { rootDir?: string }) {
  const staticRoute = new Hono();
  const rootDir = opts?.rootDir ?? DEFAULT_STATIC_ROOT;
  // origin/feat/build public artifact prefix.
  staticRoute.get('/tree-shaking-shared/*', async (c) => {
    return serveLocalFile(c, rootDir);
  });
  return staticRoute;
}
