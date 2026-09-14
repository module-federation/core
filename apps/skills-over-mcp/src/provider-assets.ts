import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

interface ProviderAssetServerOptions {
  port?: number;
}

interface ProviderAssetServer {
  origin: string;
  close: () => Promise<void>;
}

const routes = new Map([
  ['/runtime/', path.resolve(import.meta.dirname, '../dist/runtime-provider')],
  [
    '/delivery/',
    path.resolve(import.meta.dirname, '../dist/delivery-provider'),
  ],
]);

const contentType = (filePath: string): string =>
  filePath.endsWith('.json') ? 'application/json' : 'text/javascript';

export const startProviderAssetServer = async ({
  port = 0,
}: ProviderAssetServerOptions = {}): Promise<ProviderAssetServer> => {
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
      const route = [...routes].find(([prefix]) => pathname.startsWith(prefix));
      if (!route) {
        response.writeHead(404).end('Not found');
        return;
      }

      const [prefix, root] = route;
      const filePath = path.resolve(
        root,
        decodeURIComponent(pathname.slice(prefix.length)),
      );
      if (!filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      const body = await readFile(filePath);
      response
        .writeHead(200, {
          'content-type': contentType(filePath),
          'cache-control': 'no-store',
        })
        .end(body);
    } catch (error) {
      const code =
        error instanceof Error && 'code' in error ? error.code : undefined;
      response.writeHead(code === 'ENOENT' ? 404 : 500).end('Not found');
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Provider asset server did not bind a TCP port');
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
};
