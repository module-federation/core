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
      const { url: fileName } = req;

      if (!fileName) {
        logger.log(`Unable to find file: ${fileName} in request url`);
        res.end();
        return;
      }

      const safeSuffix = path
        .normalize(fileName)
        .replace(/^(\.\.(\/|\\|$))+/, '');
      const safeJoin = path.join(outputPath, safeSuffix);

      logger.log(`Retrieving file: ${safeJoin}`);

      const fileStream = fs.createReadStream(safeJoin);

      fileStream.on('error', (err) => {
        logger.log(`Error reading file: ${err}`);
        res.statusCode = 500;
        res.end();
      });

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      fileStream.pipe(res);
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
