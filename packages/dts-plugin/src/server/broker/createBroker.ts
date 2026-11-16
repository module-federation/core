import { fork, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { DEFAULT_WEB_SOCKET_PORT } from '../constant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createBroker(
  port: number = DEFAULT_WEB_SOCKET_PORT,
): ChildProcess {
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new RangeError('Development broker port must be between 1 and 65535');
  const startBrokerPath = path.resolve(
    __dirname,
    `start-broker${path.extname(__filename) === '.mjs' ? '.mjs' : '.js'}`,
  );
  const sub = fork(startBrokerPath, [], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });

  sub.send({ kind: 'start', port });

  // * This will allow child process keep running even if
  // * the main process exits.
  sub.unref();

  return sub;
}
