import { createServer, type Server } from 'node:http';
import path from 'node:path';
import sirv from 'sirv';

const appsDirectory = path.resolve(import.meta.dirname, '..');

export const HTTP_REMOTES = {
  node_remote: { app: 'node-remote', port: 3022 },
  node_dynamic_remote: { app: 'node-dynamic-remote', port: 3026 },
  node_dynamic_remote_new_version: {
    app: 'node-dynamic-remote-new-version',
    port: 3027,
  },
} as const;

export type HttpRemoteName = keyof typeof HTTP_REMOTES;

export const remoteEntryUrl = (name: HttpRemoteName): string =>
  `http://127.0.0.1:${HTTP_REMOTES[name].port}/remoteEntry.js`;

export const localRemoteEntryPath = path.join(
  appsDirectory,
  'node-local-remote/dist/remoteEntry.js',
);

const servers: Server[] = [];

const listen = (server: Server, port: number) =>
  new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

export const setup = async (): Promise<void> => {
  try {
    for (const { app, port } of Object.values(HTTP_REMOTES)) {
      const server = createServer(
        sirv(path.join(appsDirectory, app, 'dist'), { dev: true }),
      );
      await listen(server, port);
      servers.push(server);
    }
  } catch (error) {
    await teardown();
    throw error;
  }
};

export const teardown = async (): Promise<void> => {
  await Promise.all(
    servers
      .splice(0)
      .map(
        (server) =>
          new Promise<void>((resolve) => server.close(() => resolve())),
      ),
  );
};
