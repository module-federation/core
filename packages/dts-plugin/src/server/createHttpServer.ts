import http from 'http';
import type { AddressInfo } from 'net';
import fs from 'fs';
import { getIPV4, listen } from './utils';
import { DEFAULT_TAR_NAME } from './constant';

interface CreateHttpServerOptions {
  typeTarPath: string;
}

export async function createHttpServer(
  options: CreateHttpServerOptions,
): Promise<{
  server: http.Server;
  serverAddress: string;
}> {
  const { typeTarPath } = options;
  const server = http.createServer((req, res) => {
    const requestPath = req.url?.split('?')[0] ?? '/';
    if (requestPath === `/${DEFAULT_TAR_NAME}`) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/x-gzip');
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const stream = fs.createReadStream(typeTarPath);
      stream.on('error', () => {
        if (!res.headersSent) {
          res.statusCode = 500;
        }
        res.end();
      });
      res.on('close', () => {
        stream.destroy();
      });
      stream.pipe(res);
      return;
    }
    res.statusCode = 404;
    res.end();
  });

  // Let the OS pick the port: probing for a free port and binding it later
  // races with other processes started at the same time.
  await listen(server, 0);
  const { port } = server.address() as AddressInfo;

  return {
    server,
    serverAddress: `http://${getIPV4()}:${port}`,
  };
}
