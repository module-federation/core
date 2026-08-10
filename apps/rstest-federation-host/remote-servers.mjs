import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import sirv from 'sirv';

const HOST = '127.0.0.1';
const REMOTES = [
  {
    directory: path.resolve(
      import.meta.dirname,
      '../rstest-federation-remote/dist',
    ),
    port: 3301,
  },
  {
    directory: path.resolve(
      import.meta.dirname,
      '../rstest-federation-profile-remote/dist',
    ),
    port: 3302,
  },
];

const servers = [];

export const setup = async () => {
  try {
    for (const remote of REMOTES) {
      const remoteStats = await stat(remote.directory).catch(() => undefined);
      if (!remoteStats?.isDirectory()) {
        throw new Error(
          `Expected the built federation remote at ${remote.directory}.`,
        );
      }

      const serveRemote = sirv(remote.directory, {
        dev: true,
        setHeaders(response) {
          response.setHeader('Access-Control-Allow-Origin', '*');
        },
      });
      const server = createServer(serveRemote);
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(remote.port, HOST, resolve);
      });
      servers.push(server);
    }
  } catch (error) {
    await teardown();
    throw error;
  }
};

export const teardown = async () => {
  const activeServers = servers.splice(0);
  await Promise.all(
    activeServers.map(
      (server) =>
        new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
};
