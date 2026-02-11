import http from 'http';
import fs from 'fs-extra';
import { getFreePort, getIPV4 } from './utils';
import { DEFAULT_TAR_NAME } from './constant';

interface CreateKoaServerOptions {
  typeTarPath: string;
}

export async function createKoaServer(
  options: CreateKoaServerOptions,
): Promise<{
  server: http.Server;
  serverAddress: string;
}> {
  const { typeTarPath } = options;
  const freeport = await getFreePort();
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

  server.listen(freeport);

  return {
    server,
    serverAddress: `http://${getIPV4()}:${freeport}`,
  };
}
