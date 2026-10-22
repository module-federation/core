import { createServer, type Server } from 'node:http';
import path from 'node:path';
import sirv from 'sirv';

const routerDirectory = path.resolve(import.meta.dirname, '../..');
const remotes = [
  { app: 'router-remote1-2001', port: 2001 },
  { app: 'router-remote2-2002', port: 2002 },
  { app: 'router-remote3-2003', port: 2003 },
  { app: 'router-remote4-2004', port: 2004 },
  { app: 'router-remote5-2005', port: 2005 },
  { app: 'router-remote6-2006', port: 2006 },
];
const servers: Server[] = [];

export async function setup(): Promise<void> {
  try {
    for (const { app, port } of remotes) {
      const server = createServer(
        sirv(path.join(routerDirectory, app, 'dist'), {
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
