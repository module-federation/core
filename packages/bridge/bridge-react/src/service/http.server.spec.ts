import { describe, expect, it, rstest } from '@rstest/core';
import { createBridgeServiceHandler } from './http.server';
import { fetchBridgeService } from './fetch';
import { frames, BRIDGE_PRODUCER_PROTOCOL } from './protocol';
import type { BridgeSSRMessage, BridgeSSRRequest } from '../types';

const encoder = new TextEncoder();
const input = (signal = new AbortController().signal): BridgeSSRRequest => ({
  instanceId: 'app',
  identifierPrefix: 'prefix-',
  url: 'https://host.test/weather',
  props: { city: '北京' },
  signal,
});
const messages: BridgeSSRMessage[] = [
  { type: 'html', html: '<div>晴\n天</div>' },
  { type: 'ready', snapshot: { initial: true } },
  { type: 'update', value: { temperature: 20 } },
  { type: 'done' },
];
const collect = async <T>(stream: ReadableStream<T>) => {
  const result: T[] = [];
  const reader = stream.getReader();
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) return result;
      result.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
};
function fixture(
  options: { cache?: boolean; delay?: number; invalid?: boolean } = {},
) {
  let aborts = 0;
  const render = rstest.fn(async (info: BridgeSSRRequest) => ({
    protocol: BRIDGE_PRODUCER_PROTOCOL as typeof BRIDGE_PRODUCER_PROTOCOL,
    hydration: 'progressive' as const,
    messages: new ReadableStream<BridgeSSRMessage>({
      async start(controller) {
        controller.enqueue(messages[0]);
        controller.enqueue(messages[1]);
        if (options.delay)
          await new Promise((resolve) => setTimeout(resolve, options.delay));
        if (info.signal.aborted) {
          controller.error(info.signal.reason);
          return;
        }
        if (options.invalid) {
          controller.close();
          return;
        }
        controller.enqueue(messages[2]);
        controller.enqueue(messages[3]);
        controller.close();
      },
    }),
    abort() {
      aborts++;
    },
  }));
  const authorize = rstest.fn();
  const handler = createBridgeServiceHandler({
    buildVersion: 'build-1',
    render,
    authorize,
    ...(options.cache ? { cache: { maxAgeMs: 40, maxEntries: 2 } } : {}),
  });
  const fetcher = rstest.fn(async (url, init) =>
    handler(new Request(url, init)),
  ) as unknown as typeof fetch;
  const load = (info = input(), version = 'build-1') =>
    fetchBridgeService(info, {
      url: 'https://service.test/render',
      buildVersion: version,
      fetch: fetcher,
      timeoutMs: 1000,
    });
  return { render, authorize, load, handler, aborts: () => aborts };
}
describe('Service producer transport', () => {
  it('decodes every UTF-8 byte split and distinguishes JSON separators from HTML newlines', async () => {
    const bytes = encoder.encode(
      messages.map((message) => JSON.stringify(message) + '\n').join(''),
    );
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
        controller.close();
      },
    });
    const reader = stream.getReader();
    const decoded = [];
    for await (const frame of frames(reader, 1000)) decoded.push(frame);
    expect(decoded).toEqual(messages);
  });
  it('returns at meta and delivers ready while HTTP is still running', async () => {
    const f = fixture({ delay: 80 });
    const result = await f.load();
    const reader = result.messages.getReader();
    expect((await reader.read()).value).toEqual(messages[0]);
    expect((await reader.read()).value).toEqual(messages[1]);
    expect(f.aborts()).toBe(0);
    expect((await reader.read()).value).toEqual(messages[2]);
    expect((await reader.read()).value).toEqual(messages[3]);
    expect((await reader.read()).done).toBe(true);
  });
  it('caches only successful transcripts, authenticates hits and isolates effective input', async () => {
    const f = fixture({ cache: true });
    expect(await collect((await f.load()).messages)).toEqual(messages);
    expect(await collect((await f.load()).messages)).toEqual(messages);
    expect(f.render).toHaveBeenCalledTimes(1);
    expect(f.authorize).toHaveBeenCalledTimes(2);
    await collect((await f.load({ ...input(), nonce: 'different' })).messages);
    expect(f.render).toHaveBeenCalledTimes(2);
    await new Promise((resolve) => setTimeout(resolve, 50));
    await collect((await f.load()).messages);
    expect(f.render).toHaveBeenCalledTimes(3);
  });
  it('rejects mismatched builds before rendering', async () => {
    const f = fixture();
    await expect(f.load(input(), 'build-2')).rejects.toThrow('409');
    expect(f.render).not.toHaveBeenCalled();
  });
  it('keeps its timeout through the delayed body and cancels the renderer', async () => {
    const f = fixture({ delay: 100 });
    const result = await fetchBridgeService(input(), {
      url: 'https://service.test/render',
      buildVersion: 'build-1',
      timeoutMs: 15,
      fetch: async (url, init) => f.handler(new Request(url, init)),
    });
    await expect(collect(result.messages)).rejects.toThrow('timed out');
    expect(f.aborts()).toBeGreaterThan(0);
  });
  it('rejects truncation and never caches it', async () => {
    const f = fixture({ cache: true, invalid: true });
    for (let i = 0; i < 2; i++)
      await expect(collect((await f.load()).messages)).rejects.toThrow(
        'Truncated',
      );
    expect(f.render).toHaveBeenCalledTimes(2);
  });
  it('rejects unterminated JSON lines', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"type":"done"}'));
        controller.close();
      },
    });
    await expect(
      (async () => {
        for await (const _ of frames(stream.getReader(), 100)) {
        }
      })(),
    ).rejects.toThrow('Truncated');
  });
});

describe('Service input and completion boundaries', () => {
  it('rejects non-serializable application props before calling the producer', async () => {
    const f = fixture();
    const result = f.load({ ...input(), props: { callback() {} } });
    await expect(result).rejects.toThrow('JSON serializable');
    expect(f.render).not.toHaveBeenCalled();
  });
  it.each(
    (
      [
        [{ type: 'ready', snapshot: {} }, { type: 'done' }],
        [
          { type: 'html', html: '<p>x</p>' },
          { type: 'update', value: {} },
          { type: 'done' },
        ],
        [messages[0], messages[1], messages[1], messages[3]],
        [...messages, messages[3]],
      ] as BridgeSSRMessage[][]
    ).map((sequence) => ({ sequence })),
  )(
    'rejects illegal producer ordering without caching it',
    async ({ sequence }) => {
      let calls = 0;
      const handler = createBridgeServiceHandler({
        buildVersion: 'build-1',
        cache: { maxAgeMs: 1000 },
        async render() {
          calls++;
          return {
            protocol: BRIDGE_PRODUCER_PROTOCOL,
            hydration: 'progressive' as const,
            abort() {},
            messages: new ReadableStream<BridgeSSRMessage>({
              start(controller) {
                for (const message of sequence) controller.enqueue(message);
                controller.close();
              },
            }),
          };
        },
      });
      for (let i = 0; i < 2; i++) {
        const result = await fetchBridgeService(input(), {
          url: 'https://service.test/render',
          buildVersion: 'build-1',
          fetch: (url, init) => handler(new Request(url, init)),
        });
        await expect(collect(result.messages)).rejects.toThrow();
      }
      expect(calls).toBe(2);
    },
  );
  it('does not cache a cancelled render and allows an independent retry to finish', async () => {
    const f = fixture({ cache: true, delay: 50 });
    const abort = new AbortController();
    const result = await f.load(input(abort.signal));
    const read = result.messages.getReader();
    await read.read();
    abort.abort(Error('unmounted'));
    await expect(read.read()).rejects.toThrow('unmounted');
    expect(await collect((await f.load()).messages)).toEqual(messages);
    expect(f.render).toHaveBeenCalledTimes(2);
  });
});
