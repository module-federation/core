import { afterEach, describe, expect, it } from '@rstest/core';
import { EventEmitter } from 'events';
import WebSocket from 'isomorphic-ws';
import { DEV_BUILD_CHANNEL, type DevBuildMessage } from '../buildProtocol';
import { observeFileLogs } from '../utils/log';
import { BuildBroker } from './BuildBroker';
import { BrokerDiagnostics } from './BrokerDiagnostics';

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

function socket() {
  const received: DevBuildMessage[] = [];
  const client = Object.assign(new EventEmitter(), {
    readyState: WebSocket.OPEN,
    send(message: string) {
      received.push(JSON.parse(message));
    },
  }) as unknown as WebSocket;
  return { client, received };
}

describe('build broker diagnostics', () => {
  it('advertises one endpoint and records actual results from subscribed consumers', () => {
    const logs = new BrokerDiagnostics();
    cleanups.push(observeFileLogs((log) => logs.record(log)));
    const broker = new BuildBroker(logs.info);
    const producer = socket();
    const consumer = socket();
    const remote = {
      name: 'shop',
      entry: 'http://localhost:3001/mf-manifest.json',
    };
    const handle = (
      kind: DevBuildMessage['kind'],
      target: ReturnType<typeof socket>,
      extra: Partial<DevBuildMessage> = {},
    ) =>
      broker.handle(
        { type: DEV_BUILD_CHANNEL, kind, remote, ...extra },
        target.client,
      );
    handle('register', producer, { consumer: 'shop' });
    handle('subscribe', consumer, { consumer: 'store' });
    handle('publish', producer, { publication: { buildVersion: '1' } });
    for (const peer of [producer, consumer])
      expect(
        peer.received.find((message) => message.kind === 'hello')?.diagnostics,
      ).toEqual(logs.info);
    const before = logs.query().nextCursor;
    // Notifications and callback acknowledgements cannot claim an applied result.
    expect(
      logs
        .query()
        .entries.some((log) => log.message === 'Consumer applied update'),
    ).toBe(false);
    handle('result', producer, {
      result: { outcome: 'applied', trigger: 'notification' },
    });
    expect(logs.query({ after: before }).entries).toEqual([]);
    handle('result', consumer, {
      result: {
        outcome: 'applied',
        trigger: 'notification',
        buildVersion: '1',
        operationId: 'update-1',
        timingsMs: { total: 10 },
      },
    });
    handle('result', consumer, {
      result: {
        outcome: 'failed',
        trigger: 'manifest',
        error: 'manifest unavailable',
      },
    });
    expect(
      logs.query({ after: before, consumer: 'store' }).entries,
    ).toMatchObject([
      {
        message: 'Consumer applied update',
        context: {
          outcome: 'applied',
          remote: 'shop',
          operationId: 'update-1',
          timingsMs: { total: 10 },
        },
      },
      {
        level: 'error',
        message: 'Consumer update failed: manifest unavailable',
        context: { outcome: 'failed', trigger: 'manifest' },
      },
    ]);
    expect(
      producer.received.filter((message) => message.kind === 'state'),
    ).toEqual([]);
  });

  it('does not retain heartbeat, repeated subscription or duplicate publication noise', () => {
    const logs = new BrokerDiagnostics();
    cleanups.push(observeFileLogs((log) => logs.record(log)));
    const broker = new BuildBroker(logs.info);
    const producer = socket();
    const consumer = socket();
    const remote = {
      name: 'shop',
      entry: 'http://localhost:3001/mf-manifest.json',
    };
    const send = (
      kind: DevBuildMessage['kind'],
      target: ReturnType<typeof socket>,
      extra: Partial<DevBuildMessage> = {},
    ) =>
      broker.handle(
        { type: DEV_BUILD_CHANNEL, kind, remote, ...extra },
        target.client,
      );
    send('register', producer);
    send('subscribe', consumer);
    send('publish', producer, { publication: { buildVersion: '1' } });
    const cursor = logs.query().nextCursor;
    send('ping', producer);
    send('subscribe', consumer);
    send('publish', producer, { publication: { buildVersion: '1' } });
    expect(logs.query({ after: cursor }).entries).toEqual([]);
    send('publish', producer, { publication: { buildVersion: '2' } });
    expect(
      logs.query({ after: cursor }).entries.map((log) => log.message),
    ).toEqual(['Producer build ready', 'Consumer notified']);
  });
});
