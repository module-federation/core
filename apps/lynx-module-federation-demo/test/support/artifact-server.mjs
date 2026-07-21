import { readFile, realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const contentTypes = new Map([
  ['.bundle', 'application/octet-stream'],
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.wasm', 'application/wasm'],
]);

const isInside = (root, file) => {
  const relative = path.relative(root, file);
  return (
    relative === '' ||
    (relative !== '..' &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
};

const resolveFile = async (root, relativePath) => {
  const candidate = path.resolve(root, relativePath);
  if (!isInside(root, candidate)) return { status: 403 };

  try {
    const resolved = await realpath(candidate);
    if (!isInside(root, resolved)) return { status: 403 };
    const fileStat = await stat(resolved);
    return fileStat.isFile()
      ? { file: resolved, status: 200 }
      : { status: 404 };
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      return { status: 404 };
    }
    throw error;
  }
};

const delay = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export const createArtifactServer = async ({ port = 0, root, routes = {} }) => {
  const artifactRoot = await realpath(path.resolve(root));
  const routeEntries = await Promise.all(
    Object.entries(routes).map(async ([route, target]) => [
      route,
      typeof target === 'string'
        ? await realpath(path.resolve(target))
        : target,
    ]),
  );
  routeEntries.sort(([left], [right]) => right.length - left.length);
  const requests = [];

  const server = createServer(async (request, response) => {
    let pathname = '/';
    const trace = {
      method: request.method ?? 'GET',
      path: pathname,
      status: undefined,
    };
    requests.push(trace);
    response.once('finish', () => {
      trace.status = response.statusCode;
    });

    try {
      const rawPath = (request.url ?? '/').split(/[?#]/, 1)[0];
      pathname = decodeURIComponent(rawPath);
      trace.path = pathname;
      if (pathname.split(/[\\/]/).includes('..')) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      for (const [route, target] of routeEntries) {
        if (typeof target === 'function' && pathname === route) {
          await target(request, response);
          return;
        }
        if (typeof target !== 'string') continue;

        const matchesPrefix = route.endsWith('/') && pathname.startsWith(route);
        if (matchesPrefix) {
          const resolved = await resolveFile(
            target,
            pathname.slice(route.length),
          );
          await serveFile(request, response, resolved);
          return;
        }
      }

      const resolved = await resolveFile(
        artifactRoot,
        pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''),
      );
      await serveFile(request, response, resolved);
    } catch (error) {
      if (!response.headersSent) response.writeHead(500);
      response.end(String(error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Artifact server did not expose a TCP address.');
  }
  const origin = `http://127.0.0.1:${address.port}`;
  let closePromise;

  return {
    origin,
    requests,
    async waitFor(url, timeout = 30_000) {
      const target = new URL(url, origin);
      const deadline = Date.now() + timeout;
      let lastError;
      while (Date.now() < deadline) {
        try {
          const response = await fetch(target);
          if (response.ok) return response;
          lastError = new Error(`${response.status} ${response.statusText}`);
          await response.body?.cancel();
        } catch (error) {
          lastError = error;
        }
        await delay(100);
      }
      throw new Error(
        `Artifact did not become available at ${target}: ${lastError}`,
      );
    },
    close() {
      closePromise ??= new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      return closePromise;
    },
  };
};

const serveFile = async (request, response, resolved) => {
  if (!resolved.file) {
    response
      .writeHead(resolved.status)
      .end(resolved.status === 403 ? 'Forbidden' : 'Not found');
    return;
  }

  const body = await readFile(resolved.file);
  response.writeHead(200, {
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
    'content-length': body.byteLength,
    'content-type':
      contentTypes.get(path.extname(resolved.file)) ??
      'application/octet-stream',
    'cross-origin-embedder-policy': 'require-corp',
    'cross-origin-opener-policy': 'same-origin',
  });
  response.end(request.method === 'HEAD' ? undefined : body);
};
