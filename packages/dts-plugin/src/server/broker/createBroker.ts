import { fork, ChildProcess } from 'child_process';
import path from 'path';

export function createBroker(): ChildProcess {
  const startBrokerPath = path.resolve(__dirname, './startBroker.js');
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
