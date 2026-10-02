import type { Server } from 'net';
import { SEPARATOR } from '@module-federation/sdk';

export * from './logTransform';
export * from './log';
export * from './getIPV4';

export function getIdentifier(options: { name: string; ip?: string }): string {
  const { ip, name } = options;
  return `mf ${SEPARATOR}${name}${ip ? `${SEPARATOR}${ip}` : ''}`;
}

export function fib(n: number): number {
  let i = 2;
  const res = [0, 1, 1];
  while (i <= n) {
    res[i] = res[i - 1] + res[i - 2];
    i++;
  }
  return res[n];
}

/**
 * Binds `server` to `port` and settles once it is listening, rejecting with
 * the bind error (e.g. EADDRINUSE) instead of emitting an unhandled 'error'.
 */
export function listen(server: Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (err: Error) => {
      server.off('listening', onListening);
      reject(err);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port);
  });
}
