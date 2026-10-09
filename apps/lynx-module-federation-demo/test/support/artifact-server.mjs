import { readFile, readdir, realpath, stat } from 'node:fs/promises';
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

const indexFiles = async (root) => {
  const resolvedRoot = await realpath(path.resolve(root));
  const files = new Map();
  const visited = new Set();

  const visit = async (directory) => {
    const resolvedDirectory = await realpath(directory);
    if (
      visited.has(resolvedDirectory) ||
      !isInside(resolvedRoot, resolvedDirectory)
    ) {
      return;
    }
    visited.add(resolvedDirectory);

    for (const entry of await readdir(resolvedDirectory, {
      withFileTypes: true,
    })) {
      const resolved = await realpath(path.join(resolvedDirectory, entry.name));
      if (!isInside(resolvedRoot, resolved)) continue;

      const fileStat = await stat(resolved);
      if (fileStat.isDirectory()) {
        await visit(resolved);
      } else if (fileStat.isFile()) {
        const relative = path.relative(resolvedRoot, resolved);
        files.set(`/${relative.split(path.sep).join('/')}`, resolved);
      }
    }
  };

  await visit(resolvedRoot);
  return files;
};

const delay = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export const createArtifactServer = async ({ port = 0, root, routes = {} }) => {
  const artifactFiles = await indexFiles(root);
  const routeEntries = await Promise.all(
    Object.entries(routes).map(async ([route, target]) => [
      route,
      typeof target === 'string'
        ? { files: await indexFiles(target) }
        : { handler: target },
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
        if (target.handler && pathname === route) {
          await target.handler(request, response);
          return;
        }
        if (!target.files) continue;

        const matchesPrefix = route.endsWith('/') && pathname.startsWith(route);
        if (matchesPrefix) {
          const relativePath = `/${pathname.slice(route.length)}`;
          await serveFile(request, response, target.files.get(relativePath));
          return;
        }
      }

      await serveFile(
        request,
        response,
        artifactFiles.get(pathname === '/' ? '/index.html' : pathname),
      );
    } catch {
      if (!response.headersSent) response.writeHead(500);
      response.end('Internal server error');
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

const serveFile = async (request, response, file) => {
  if (!file) {
    response.writeHead(404).end('Not found');
    return;
  }

  const body = await readFile(file);
  response.writeHead(200, {
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
    'content-length': body.byteLength,
    'content-type':
      contentTypes.get(path.extname(file)) ?? 'application/octet-stream',
    'cross-origin-embedder-policy': 'require-corp',
    'cross-origin-opener-policy': 'same-origin',
  });
  response.end(request.method === 'HEAD' ? undefined : body);
};
