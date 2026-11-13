import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import { once } from 'events';
import WebSocket from 'isomorphic-ws';
import { BuildBroker } from './broker/BuildBroker';
import { BuildConnection } from './BuildConnection';
import {
  devBuildKey,
  type DevBuildRemote,
  type DevBuildStatus,
  type DevBuildUpdate,
} from './buildProtocol';

describe('development build subscriptions', () => {
  let server: WebSocket.Server;
  let brokerUrl: string;
  const connections: BuildConnection[] = [];

  beforeEach(async () => {
    const broker = new BuildBroker();
    server = new WebSocket.Server({
      port: Number(process.env.JO_PORT_BROKER || 0),
      host: '127.0.0.1',
    });
    server.on('connection', (socket) => {
      socket.on('message', (data) =>
        broker.handle(JSON.parse(data.toString()), socket),
      );
    });
    await once(server, 'listening');
    const address = server.address() as { port: number };
    brokerUrl = `ws://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    for (const connection of connections.splice(0)) connection.close();
    for (const socket of server.clients) socket.terminate();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  function remote(port = 3001): DevBuildRemote {
    return {
      name: 'provider',
      entry: `http://localhost:${port}/mf-manifest.json`,
      brokerUrl,
    };
  }

  function publisher(target = remote()) {
    const connection = new BuildConnection(
      { publisher: target, autoStartBroker: false },
      { async update() {}, status() {} },
    );
    connections.push(connection);
    return connection;
  }

  function subscriber(
    target = remote(),
    apply: (update: DevBuildUpdate) => Promise<void> = async () => {},
  ) {
    const result = {
      status: 'disconnected' as DevBuildStatus,
      updates: [] as DevBuildUpdate[],
      connection: undefined as unknown as BuildConnection,
    };
    result.connection = new BuildConnection(
      { remotes: [target], autoStartBroker: false },
      {
        async update(update) {
          result.updates.push(update);
          await apply(update);
        },
        status(_, status) {
          result.status = status;
        },
      },
    );
    connections.push(result.connection);
    return result;
  }

  it('keys a provider by name and full endpoint, with equivalent loopback hosts', () => {
    expect(devBuildKey(remote())).not.toBe(devBuildKey(remote(3002)));
    expect(devBuildKey(remote())).toBe(
      devBuildKey({
        ...remote(),
        entry: 'http://127.0.0.1:3001/mf-manifest.json',
      }),
    );
    expect(devBuildKey(remote())).not.toBe(
      devBuildKey({
        ...remote(),
        entry: 'http://localhost:3001/other/mf-manifest.json',
      }),
    );
  });

  it('synchronizes a late subscriber only after its async update completes', async () => {
    const provider = publisher();
    provider.publish({ buildVersion: 'one' });
    let complete!: () => void;
    const pending = new Promise<void>((resolve) => {
      complete = resolve;
    });
    const consumer = subscriber(remote(), () => pending);
    await expect.poll(() => consumer.updates.length).toBe(1);
    expect(consumer.status).toBe('updating');
    complete();
    await expect.poll(() => consumer.status).toBe('ready');
    expect(consumer.updates[0].publication.buildVersion).toBe('one');
  });

  it('does not let an old acknowledgement publish readiness after another save', async () => {
    const provider = publisher();
    let complete!: () => void;
    const pending = new Promise<void>((resolve) => {
      complete = resolve;
    });
    const consumer = subscriber(remote(), (update) =>
      update.publication.buildVersion === 'one' ? pending : Promise.resolve(),
    );
    provider.publish({ buildVersion: 'one' });
    await expect.poll(() => consumer.updates.length).toBe(1);
    provider.invalidate();
    await expect.poll(() => consumer.status).toBe('waiting');
    complete();
    await pending;
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(consumer.status).toBe('waiting');
    provider.publish({ buildVersion: 'two' });
    await expect.poll(() => consumer.status).toBe('ready');
    expect(
      consumer.updates.map((update) => update.publication.buildVersion),
    ).toEqual(['one', 'two']);
  });

  it('isolates same-name producers and same-name consumers on different endpoints', async () => {
    const first = publisher(remote(3001));
    const second = publisher(remote(3002));
    first.publish({ buildVersion: 'one' });
    second.publish({ buildVersion: 'two' });
    const consumerA = subscriber(remote(3001));
    const consumerB = subscriber(remote(3001));
    const consumerC = subscriber(remote(3002));
    await expect
      .poll(() => [consumerA.status, consumerB.status, consumerC.status])
      .toEqual(['ready', 'ready', 'ready']);
    first.publish({ buildVersion: 'three' });
    await expect
      .poll(() => consumerA.updates.at(-1)?.publication.buildVersion)
      .toBe('three');
    await expect
      .poll(() => consumerB.updates.at(-1)?.publication.buildVersion)
      .toBe('three');
    expect(
      consumerC.updates.map((update) => update.publication.buildVersion),
    ).toEqual(['two']);
    consumerA.connection.close();
    first.publish({ buildVersion: 'four' });
    await expect
      .poll(() => consumerB.updates.at(-1)?.publication.buildVersion)
      .toBe('four');
  });

  it('resubscribes and replays the latest ready publication after transport loss', async () => {
    const provider = publisher();
    const consumer = subscriber();
    const publication = {
      buildVersion: 'one',
      sources: [{ ...remote(3002), buildVersion: 'nested-two' }],
    };
    provider.publish(publication);
    await expect.poll(() => consumer.status).toBe('ready');
    for (const socket of server.clients) socket.terminate();
    await expect.poll(() => consumer.updates.length, { timeout: 5000 }).toBe(2);
    await expect.poll(() => consumer.status).toBe('ready');
    expect(consumer.updates[1].publication).toEqual(publication);
  });

  it('leaves failures unsynchronized and recovers on the next ready update', async () => {
    const provider = publisher();
    const consumer = subscriber(remote(), async (update) => {
      if (update.publication.buildVersion === 'bad')
        throw Error('prepare failed');
    });
    provider.publish({ buildVersion: 'bad' });
    await expect.poll(() => consumer.updates.length).toBe(1);
    await expect.poll(() => consumer.status).toBe('waiting');
    provider.publish({ buildVersion: 'good' });
    await expect.poll(() => consumer.status).toBe('ready');
    provider.close();
    await expect.poll(() => consumer.status).toBe('waiting');
  });

  it('does not claim readiness for a running broker without a producer', async () => {
    const consumer = subscriber();
    await expect.poll(() => consumer.status).toBe('waiting');
    expect(consumer.updates).toEqual([]);
  });

  it('detects a broker that only supports the older type protocol', async () => {
    server.removeAllListeners('connection');
    server.on('connection', (socket) => socket.on('message', () => {}));
    const consumer = subscriber();
    await expect
      .poll(() => consumer.status, { timeout: 7000 })
      .toBe('unsupported');
    expect(consumer.updates).toEqual([]);
  });
});
