import { createServer, type Server } from 'node:http';
import path from 'node:path';
import sirv from 'sirv';

const manifestDirectory = path.resolve(import.meta.dirname, '../..');
const remotes = [
  { app: '3009-webpack-provider', port: 3009 },
  { app: '3010-rspack-provider', port: 3010 },
  { app: '3011-rspack-manifest-provider', port: 3011 },
  { app: '3012-rspack-js-entry-provider', port: 3012 },
];
const servers: Server[] = [];

export async function setup(): Promise<void> {
  try {
    for (const { app, port } of remotes) {
      const server = createServer(
        sirv(path.join(manifestDirectory, app, 'dist'), {
          dev: true,
          setHeaders(response) {
            response.setHeader('Access-Control-Allow-Origin', '*');
          },
        }),
      );
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, 'localhost', resolve);
      });
      servers.push(server);
    }
  } catch (error) {
    await teardown();
    throw error;
  }
}

export async function teardown(): Promise<void> {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
}
