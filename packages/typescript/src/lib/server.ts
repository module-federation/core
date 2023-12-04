import http from 'http';
import fs from 'fs';
import path from 'path';
import { TypeServeOptions } from '../types';
import { LoggerInstance } from '../Logger';

export type TypeServerOptions = {
  outputPath: string;
  port: TypeServeOptions['port'];
  host: TypeServeOptions['host'];
  logger: LoggerInstance;
};

const activeServers: Map<number, http.Server | null> = new Map();

export const startServer = async ({
  outputPath,
  port,
  host,
  logger,
}: TypeServerOptions) => {
  return new Promise((resolve) => {
    if (activeServers.get(port!)) {
      resolve(1);
      return;
    }

    const server = http.createServer((req, res) => {
      const safeSuffix = path
        .normalize(req.url!)
        .replace(/^(\.\.(\/|\\|$))+/, '');

      const fileName = path.join(outputPath, safeSuffix);

      try {
        // Ensure the requested file is within the specified directory
        if (!fileName.startsWith(outputPath)) {
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          res.end('Forbidden');
          return;
        }

        // Check if the file exists
        fs.stat(fileName, (err, stat) => {
          if (err) {
            logger.log(`Error reading file: ${err}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          } else {
            if (stat.isFile()) {
              res.writeHead(200, { 'Content-Type': 'text/plain' });
              fs.createReadStream(fileName).pipe(res);
            } else {
              // Handle non-file requests (e.g., directories)
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('Not Found');
            }
          }
        });
      } catch (err) {
        logger.log(`Error reading file: ${err}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });

    server.listen(port, host, () => {
      logger.log(`Federated Type Server listening on http://${host}:${port}`);
      resolve(1);
    });

    activeServers.set(port!, server);
  });
};

export const stopServer = ({
  port,
  logger,
}: {
  port: number | undefined;
  logger: LoggerInstance;
}) => {
  if (!activeServers.get(port!)) return;

  logger.log('Stopping Federated Type Server');

  const server = activeServers.get(port!);
  if (server) {
    server.close();
  }
};
