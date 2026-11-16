import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { BuildConnection } from './BuildConnection';

const { spawnBroker, sockets } = rs.hoisted(() => ({
  spawnBroker: rs.fn(),
  sockets: [] as { emit(event: string, ...args: unknown[]): void }[],
}));

rs.mock('./broker/createBroker', () => ({ createBroker: spawnBroker }));
rs.mock('isomorphic-ws', () => ({
  default: class {
    static OPEN = 1;
    private handlers = new Map<string, ((...args: unknown[]) => void)[]>();

    constructor() {
      sockets.push(this);
    }

    on(event: string, listener: (...args: unknown[]) => void) {
      const listeners = this.handlers.get(event) || [];
      listeners.push(listener);
      this.handlers.set(event, listeners);
      return this;
    }

    emit(event: string, ...args: unknown[]) {
      for (const listener of this.handlers.get(event) || []) listener(...args);
    }

    terminate() {
      this.emit('close');
    }
  },
}));

const connections: BuildConnection[] = [];
beforeEach(() => {
  spawnBroker.mockClear();
  sockets.splice(0);
});
afterEach(() => {
  for (const connection of connections.splice(0)) connection.close();
});

describe('development broker automatic startup', () => {
  it.each([
    { name: 'default local broker', port: 16322 },
    { name: 'disabled default broker', autoStartBroker: false },
    { name: 'custom port without opt-in', brokerUrl: 'ws://localhost:29622/' },
    {
      name: 'explicit custom local port',
      brokerUrl: 'ws://127.0.0.1:29622/',
      autoStartBroker: true,
      port: 29622,
    },
    {
      name: 'explicit custom IPv6 port',
      brokerUrl: 'ws://[::1]:29622/',
      autoStartBroker: true,
      port: 29622,
    },
    {
      name: 'disabled custom broker',
      brokerUrl: 'ws://localhost:29622/',
      autoStartBroker: false,
    },
    {
      name: 'secure endpoint',
      brokerUrl: 'wss://localhost:29622/',
      autoStartBroker: true,
    },
    {
      name: 'proxy path',
      brokerUrl: 'ws://localhost:29622/proxy',
      autoStartBroker: true,
    },
    {
      name: 'default-port proxy path',
      brokerUrl: 'ws://localhost:16322/proxy',
      autoStartBroker: true,
    },
    {
      name: 'remote host',
      brokerUrl: 'ws://provider.example:29622/',
      autoStartBroker: true,
    },
  ])('$name', ({ brokerUrl, autoStartBroker, port }) => {
    const connection = new BuildConnection(
      {
        publisher: {
          name: 'shop',
          entry: 'http://localhost:39001/mf-manifest.json',
          brokerUrl,
        },
        autoStartBroker,
      },
      { async update() {}, status() {} },
    );
    connections.push(connection);
    sockets[0].emit(
      'error',
      Object.assign(new Error('refused'), { code: 'ECONNREFUSED' }),
    );
    if (port === undefined) expect(spawnBroker).not.toHaveBeenCalled();
    else {
      expect(spawnBroker).toHaveBeenCalledTimes(1);
      expect(spawnBroker).toHaveBeenCalledWith(port);
    }
  });
});
