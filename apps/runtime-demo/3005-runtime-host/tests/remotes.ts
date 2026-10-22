import { createServer, type Server } from 'node:http';
import path from 'node:path';
import sirv from 'sirv';

const manifestDirectory = path.resolve(import.meta.dirname, '../..');
const remotes = [
  { app: '3006-runtime-remote', port: 3006 },
  { app: '3007-runtime-remote', port: 3007 },
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
        server.listen(port, '127.0.0.1', resolve);
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
