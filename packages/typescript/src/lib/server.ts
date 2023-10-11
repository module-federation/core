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

let server: http.Server | null = null;

export const startServer = async ({
  outputPath,
  port,
  host,
  logger,
}: TypeServerOptions) => {
  return new Promise((resolve) => {
    if (server) {
      resolve(1);
      return;
    }

    server = http.createServer((req, res) => {
      const { url: fileName } = req;

      if (!fileName) {
        logger.log(`Unable to find file: ${fileName} in request url`);
        res.end();
        return;
      }

      const filePath = path.join(outputPath, fileName);

      const fileStream = fs.createReadStream(filePath);

      fileStream.on('error', (err) => {
        logger.log(`Error reading file: ${err}`);
        res.statusCode = 500;
        res.end();
      });

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      fileStream.pipe(res);
    });

    server.listen(port, 'localhost', () => {
      resolve(1);
      logger.log(`Federated Type Server listening on http://${host}:${port}`);
    });
  });
};

export const stopServer = ({ logger }: { logger: LoggerInstance }) => {
  if (!server) return;

  logger.log('Stopping Federated Type Server');

  server.close();
};
