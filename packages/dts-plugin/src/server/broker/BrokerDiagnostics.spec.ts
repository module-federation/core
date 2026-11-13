import { afterEach, describe, expect, it, rs } from '@rstest/core';
import type { IncomingMessage, ServerResponse } from 'http';
import { fileLog, observeFileLogs } from '../utils/log';
import { BrokerDiagnostics } from './BrokerDiagnostics';

const fsMocks = rs.hoisted(() => ({
  existsSync: rs.fn(() => true),
  mkdirSync: rs.fn(),
  appendFileSync: rs.fn(),
}));
rs.mock('fs', () => ({ default: fsMocks, ...fsMocks }));

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  rs.restoreAllMocks();
  rs.unstubAllEnvs();
});

function request(
  logs: BrokerDiagnostics,
  path = '/__mf/logs',
  options: {
    address?: string;
    host?: string;
    origin?: string;
    method?: string;
  } = {},
) {
  let body = '';
  const headers: Record<string, string> = {};
  const response = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    end(value: string) {
      body = value;
    },
  };
  const handled = logs.handleRequest(
    {
      url: path,
      method: options.method || 'GET',
      socket: { remoteAddress: options.address || '127.0.0.1' },
      headers: {
        host: options.host || 'localhost:16322',
        origin: options.origin,
      },
    } as unknown as IncomingMessage,
    response as unknown as ServerResponse,
  );
  return {
    handled,
    status: response.statusCode,
    body: body ? JSON.parse(body) : undefined,
    headers,
  };
}

function entry(message: string, consumer = 'store', remote = 'shop') {
  return {
    timestamp: new Date().toISOString(),
    source: 'DevBuild',
    level: 'info',
    message,
    context: { consumer, remote },
  };
}

describe('broker diagnostics', () => {
  it('retains broker logs without DEBUG and isolates faulty observers', () => {
    rs.stubEnv('FEDERATION_DEBUG', '');
    const logs = new BrokerDiagnostics();
    cleanups.push(
      observeFileLogs(() => {
        throw new Error('sink failed');
      }),
    );
    cleanups.push(observeFileLogs((log) => logs.record(log)));
    expect(() =>
      fileLog('Producer ready', 'DevBuild', 'info', { remote: 'shop' }),
    ).not.toThrow();
    const result = request(logs);
    expect(result.status).toBe(200);
    expect(result.body.entries).toMatchObject([
      {
        source: 'DevBuild',
        message: 'Producer ready',
        context: { remote: 'shop' },
      },
    ]);
    expect(result.headers['Cache-Control']).toBe('no-store');
  });

  it('supports a shared broker, filtering and incremental reads without repeat entries', () => {
    const logs = new BrokerDiagnostics();
    logs.record(entry('first', 'store-a'));
    logs.record(entry('second', 'store-b', 'cart'));
    const first = request(logs, '/__mf/logs?consumer=store-a').body;
    expect(
      first.entries.map((value: { message: string }) => value.message),
    ).toEqual(['first']);
    logs.record(entry('third', 'store-a'));
    const next = request(
      logs,
      `/__mf/logs?after=${first.nextCursor}&remote=shop&source=DevBuild`,
    ).body;
    expect(
      next.entries.map((value: { message: string }) => value.message),
    ).toEqual(['third']);
    expect(logs.query({ after: next.nextCursor }).entries).toEqual([]);
    expect(next.brokerId).toBe(first.brokerId);
  });

  it('keeps diagnostics available when the optional DEBUG file cannot be written', () => {
    rs.stubEnv('FEDERATION_DEBUG', 'true');
    const write = fsMocks.appendFileSync.mockImplementation(() => {
      throw new Error('Read-only filesystem');
    });
    const logs = new BrokerDiagnostics();
    cleanups.push(observeFileLogs((log) => logs.record(log)));
    expect(() => fileLog('Update completed', 'DevBuild', 'info')).not.toThrow();
    expect(write).toHaveBeenCalled();
    expect(logs.query().entries[0].message).toBe('Update completed');
  });

  it('bounds retained entries and bytes, reporting gaps and instance changes', () => {
    const logs = new BrokerDiagnostics({ entries: 2, bytes: 1024 });
    const before = logs.query().nextCursor;
    logs.record(entry('first'));
    logs.record(entry('second'));
    logs.record(entry('third'));
    const result = logs.query({ after: before, limit: 1 });
    expect(result.entries[0].message).toBe('second');
    expect(result.truncated).toBe(true);
    expect(result.hasMore).toBe(true);
    expect(logs.query({ after: result.nextCursor }).entries[0].message).toBe(
      'third',
    );
    expect(logs.query({ after: 'previous-broker:3' }).reset).toBe(true);
    logs.record(entry('very large\n'.repeat(10_000)));
    const bounded = logs.query();
    expect(bounded.entries.some((value) => value.truncated)).toBe(true);
    expect(
      Buffer.byteLength(JSON.stringify(bounded.entries)),
    ).toBeLessThanOrEqual(1026);
    expect(bounded.truncated).toBe(true);
  });

  it('rejects invalid cursors and unbounded query limits', () => {
    const logs = new BrokerDiagnostics();
    for (const query of ['limit=0', 'limit=501', 'limit=1.5', 'after=garbage'])
      expect(request(logs, `/__mf/logs?${query}`).status).toBe(400);
    expect(request(logs, '/other').handled).toBe(false);
    expect(request(logs, '/__mf/logs', { method: 'POST' }).status).toBe(405);
  });

  it('keeps oversized failure messages discoverable by consumer and remote', () => {
    const logs = new BrokerDiagnostics({ entries: 2, bytes: 1024 });
    logs.record({
      ...entry('Error: update failed\n'.repeat(10_000)),
      level: 'error',
      context: { consumer: 'host', remote: 'shop', outcome: 'failed' },
    });
    const result = request(logs, '/__mf/logs?consumer=host&remote=shop').body;
    expect(result.entries).toMatchObject([
      {
        level: 'error',
        truncated: true,
        context: { consumer: 'host', remote: 'shop', outcome: 'failed' },
      },
    ]);
    expect(result.entries[0].message).toContain('Error: update failed');
    expect(
      Buffer.byteLength(JSON.stringify(result.entries)),
    ).toBeLessThanOrEqual(1026);
  });

  it('only serves local requests and rejects cross-origin or rebound browser hosts', () => {
    const logs = new BrokerDiagnostics();
    expect(
      request(logs, '/__mf/logs', { address: '192.168.1.10' }).status,
    ).toBe(403);
    expect(
      request(logs, '/__mf/logs', { host: 'evil.example:16322' }).status,
    ).toBe(403);
    expect(
      request(logs, '/__mf/logs', { origin: 'https://evil.example' }).status,
    ).toBe(403);
    expect(
      request(logs, '/__mf/logs', { origin: 'http://localhost:3000' }).status,
    ).toBe(403);
    expect(
      request(logs, '/__mf/logs', {
        address: '::1',
        origin: 'http://localhost:16322',
      }).status,
    ).toBe(200);
  });
});
