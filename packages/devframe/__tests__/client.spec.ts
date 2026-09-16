import { afterEach, expect, it, rs } from '@rstest/core';
import { connectDevframe } from 'devframe/client';
import { connectModuleFederationDevframe } from '../src/client';

rs.mock('devframe/client', () => ({ connectDevframe: rs.fn() }));
afterEach(() => {
  rs.unstubAllGlobals();
  rs.clearAllMocks();
});

it('rejects server-side connection before opening a channel', async () => {
  await expect(connectModuleFederationDevframe()).rejects.toThrow(
    'inside the browser',
  );
  expect(connectDevframe).not.toHaveBeenCalled();
});

it('registers a late reader, refreshes on reconnect and closes its owned connection', async () => {
  rs.stubGlobal('window', {});
  let read!: () => unknown;
  let status!: (value: string) => void;
  const call = rs.fn().mockResolvedValue({ pageId: 'page-1' });
  const off = rs.fn();
  const close = rs.fn();
  const mock = {
    client: {
      register: rs.fn((definition: { handler: () => unknown }) => {
        read = definition.handler;
      }),
    },
    events: {
      on: rs.fn((_event: string, callback: typeof status) => {
        status = callback;
        return off;
      }),
    },
    scope: rs.fn(() => ({ rpc: { call } })),
    close,
  };
  rs.mocked(connectDevframe).mockResolvedValue(
    mock as unknown as Awaited<ReturnType<typeof connectDevframe>>,
  );
  const connection = await connectModuleFederationDevframe({
    baseURL: '/__devframes/',
  });
  expect(read()).toMatchObject({ present: false });
  rs.stubGlobal('__FEDERATION__', {
    __INSTANCES__: [{ options: { name: 'late' } }],
  });
  expect(read()).toMatchObject({ instances: [{ name: 'late' }] });
  status('connected');
  expect(call).toHaveBeenCalledTimes(2);
  connection.close();
  expect(off).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledTimes(1);
});

it('cleans up when the reader handshake is rejected', async () => {
  rs.stubGlobal('window', {});
  const off = rs.fn();
  const close = rs.fn();
  rs.mocked(connectDevframe).mockResolvedValue({
    client: { register: rs.fn() },
    events: { on: () => off },
    scope: () => ({
      rpc: { call: () => Promise.reject(new Error('rejected')) },
    }),
    close,
  } as unknown as Awaited<ReturnType<typeof connectDevframe>>);
  await expect(connectModuleFederationDevframe()).rejects.toThrow('rejected');
  expect(off).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledTimes(1);
});
