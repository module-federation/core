import { stat } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import path from 'node:path';
import sirv from 'sirv';

const HOST = '127.0.0.1';
const PORT = 3301;
const REMOTE_DIRECTORY = path.resolve(
  import.meta.dirname,
  '../rstest-federation-remote/dist',
);

let server: Server | undefined;

const serveRemote = sirv(REMOTE_DIRECTORY, {
  dev: true,
  setHeaders(response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
  },
});

export const setup = async (): Promise<void> => {
  const remoteStats = await stat(REMOTE_DIRECTORY).catch(() => undefined);
  if (!remoteStats?.isDirectory()) {
    throw new Error(
      `Expected the built federation remote at ${REMOTE_DIRECTORY}.`,
    );
  }

  const nextServer = createServer(serveRemote);
  try {
    await new Promise<void>((resolve, reject) => {
      nextServer.once('error', reject);
      nextServer.listen(PORT, HOST, resolve);
    });
  } catch (error) {
    nextServer.close();
    throw error;
  }

  server = nextServer;
};

export const teardown = async (): Promise<void> => {
  const activeServer = server;
  server = undefined;
  if (!activeServer?.listening) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    activeServer.close((error) => (error ? reject(error) : resolve()));
  });
};
