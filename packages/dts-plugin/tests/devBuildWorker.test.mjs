import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { createRequire } from 'node:module';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createConnection, createServer } from 'node:net';

// Run after the package build with a broker port reserved for this test run.
async function availablePort() {
  const probe = createServer();
  probe.listen(0);
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  return port;
}
const brokerPort = process.env.JO_PORT_BROKER
  ? Number(process.env.JO_PORT_BROKER)
  : await availablePort();
assert.ok(
  Number.isInteger(brokerPort) && brokerPort > 0 && brokerPort < 65536,
  'JO_PORT_BROKER must be a valid reserved port',
);
test('CJS producer and ESM consumer use the packaged build worker', async () => {
  const dist = new URL('../dist/', import.meta.url);
  const require = createRequire(import.meta.url);
  const cjs = require(fileURLToPath(new URL('index.js', dist)));
  const esm = await import(new URL('esm/index.mjs', dist));
  const connections = [];
  const errors = [];
  const diagnostics = [];
  const remote = {
    name: 'js-only-provider',
    entry: 'http://127.0.0.1:39001/mf-manifest.json',
    brokerUrl: `ws://127.0.0.1:${brokerPort}`,
  };
  const waitFor = async (check) => {
    const deadline = Date.now() + 15000;
    while (!check()) {
      if (Date.now() > deadline) throw Error('Worker integration timed out');
      if (errors.length) throw errors[0];
      await delay(10);
    }
  };
  const broker = fork(new URL('start-broker.js', dist), [], {
    stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
  });
  try {
    const ready = once(broker, 'message');
    broker.send({ kind: 'start', port: brokerPort });
    assert.equal((await ready)[0], 'ready');
    const publisher = cjs.createDevBuildConnection(
      { publisher: remote, autoStartBroker: false },
      {
        async onUpdate() {},
        onError: (error) => errors.push(error),
        onDiagnostics: (value) => diagnostics.push(value),
      },
    );
    connections.push(publisher);
    publisher.publish({ buildVersion: 'js-build-one' });
    const updates = [];
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    const consumer = esm.createDevBuildConnection(
      {
        consumer: 'worker-consumer',
        remotes: [remote],
        autoStartBroker: false,
      },
      {
        async onUpdate(update, { signal }) {
          updates.push(update);
          if (update.publication.buildVersion === 'js-build-one')
            await Promise.race([
              pending,
              new Promise((resolve) =>
                signal.addEventListener('abort', resolve, { once: true }),
              ),
            ]);
          consumer.reportResult(update.remote, {
            outcome: 'applied',
            trigger: 'notification',
            buildVersion: update.publication.buildVersion,
          });
        },
        onError: (error) => errors.push(error),
        onDiagnostics: (value) => diagnostics.push(value),
      },
    );
    connections.push(consumer);
    await waitFor(() => updates.length === 1);
    assert.equal(consumer.isSynchronized(remote), false);
    await waitFor(() => diagnostics.length === 2);
    assert.equal(diagnostics[0].url, diagnostics[1].url);
    assert.equal(new URL(diagnostics[0].url).port, String(brokerPort));
    const initialLogs = await fetch(diagnostics[0].url).then((response) =>
      response.json(),
    );
    assert.ok(
      !initialLogs.entries.some(
        (entry) =>
          entry.context?.consumer === 'worker-consumer' &&
          entry.context?.buildVersion === 'js-build-one' &&
          entry.message.includes('applied'),
      ),
    );
    release();
    await waitFor(() => consumer.isSynchronized(remote));
    let applied;
    for (let attempt = 0; attempt < 100; attempt++) {
      const logs = await fetch(
        diagnostics[0].url + '?consumer=worker-consumer',
      ).then((response) => response.json());
      applied = logs.entries.find(
        (entry) =>
          entry.context?.buildVersion === 'js-build-one' &&
          entry.message.includes('applied'),
      );
      if (applied) break;
      await delay(10);
    }
    assert.ok(
      applied,
      'framework result reaches the broker through IPC and WS',
    );
    publisher.invalidate();
    await waitFor(() => !consumer.isSynchronized(remote));
    publisher.publish({
      buildVersion: 'js-build-two',
      sources: [
        {
          name: 'nested',
          entry: 'http://localhost:39002/mf-manifest.json',
          buildVersion: 'nested-one',
        },
      ],
    });
    await waitFor(
      () => updates.length === 2 && consumer.isSynchronized(remote),
    );
    assert.equal(updates[1].publication.sources[0].name, 'nested');
    const exited = once(broker, 'exit');
    await Promise.all(connections.map((connection) => connection.close()));
    const exitCode = await Promise.race([
      exited,
      delay(5000, undefined, { ref: false }).then(() => {
        throw Error('Broker did not stop after the last build client');
      }),
    ]);
    assert.equal(exitCode[0], 0);
    assert.deepEqual(errors, []);
    assert.equal(consumer.isSynchronized(remote), false);
  } finally {
    // Repeated close is part of the service lifecycle contract.
    await Promise.allSettled(
      connections.map((connection) => connection.close()),
    );
    if (broker.exitCode === null) broker.kill('SIGTERM');
  }
});

test('an ESM worker starts the local broker without a types worker', async () => {
  const dist = new URL('../dist/', import.meta.url);
  const esm = await import(new URL('esm/index.mjs', dist));
  const remote = {
    name: 'esm-auto-start',
    entry: 'http://localhost:39001/mf-manifest.json',
    brokerUrl: `ws://localhost:${brokerPort}`,
  };
  const errors = [];
  const publisher = esm.createDevBuildConnection(
    { publisher: remote, autoStartBroker: true },
    { async onUpdate() {}, onError: (error) => errors.push(error) },
  );
  const consumer = esm.createDevBuildConnection(
    { remotes: [remote], autoStartBroker: false },
    { async onUpdate() {}, onError: (error) => errors.push(error) },
  );
  try {
    publisher.publish({ buildVersion: 'esm-ready' });
    const deadline = Date.now() + 15000;
    while (!consumer.isSynchronized(remote)) {
      if (Date.now() > deadline) throw Error('ESM broker startup timed out');
      if (errors.length) throw errors[0];
      await delay(10);
    }
  } finally {
    await Promise.all([consumer.close(), publisher.close()]);
  }
  const deadline = Date.now() + 5000;
  while (
    await new Promise((resolve) => {
      const socket = createConnection({ host: 'localhost', port: brokerPort });
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => resolve(false));
    })
  ) {
    if (Date.now() > deadline)
      throw Error('Auto-started broker was not released');
    await delay(10);
  }
  assert.deepEqual(errors, []);
});
