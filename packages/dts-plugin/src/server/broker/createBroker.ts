import { fork, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createBroker(): ChildProcess {
  const startBrokerPath = path.resolve(__dirname, './start-broker.js');
  const sub = fork(startBrokerPath, [], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });

  sub.send('start');

  // * This will allow child process keep running even if
  // * the main process exits.
  sub.unref();

  return sub;
}
