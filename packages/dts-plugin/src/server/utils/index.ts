import net from 'net';
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

export function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      // @ts-ignore ignore this line
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });
}
