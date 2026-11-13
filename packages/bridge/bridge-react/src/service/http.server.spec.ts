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
  it('tracks the original HTTP transfer after abort and keeps ownership out of its payload', async () => {
    const pending = new Set<Promise<unknown>>();
    const work = {
      track<T>(promise: Promise<T>) {
        pending.add(promise);
        void promise.then(
          () => pending.delete(promise),
          () => pending.delete(promise),
        );
        return promise;
      },
    };
    let rejectFetch!: (reason: Error) => void;
    const response = new Promise<Response>((_resolve, reject) => {
      rejectFetch = reject;
    });
    let body: any;
    const aborter = new AbortController();
    const result = fetchBridgeService(
      { ...input(aborter.signal), work },
      {
        url: 'https://service.test/render',
        buildVersion: 'build-1',
        fetch: (_url, init) => {
          body = JSON.parse(init!.body as string);
          return response;
        },
      },
    );
    expect(body.request).not.toHaveProperty('work');
    expect(body.request).not.toHaveProperty('signal');
    aborter.abort(Error('disconnected'));
    await expect(result).rejects.toThrow('disconnected');
    expect(pending.size).toBe(1);
    const transfer = [...pending];
    rejectFetch(Error('fetch cancellation completed'));
    await Promise.all(transfer);
    expect(pending.size).toBe(0);
  });

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

describe('Service producer ownership', () => {
  const request = (signal: AbortSignal) => {
    const { signal: _signal, ...info } = input(signal);
    return new Request('https://service.test/render', {
      method: 'POST',
      body: JSON.stringify({
        protocol: BRIDGE_PRODUCER_PROTOCOL,
        buildVersion: 'build-1',
        request: info,
      }),
      signal,
    });
  };
  const tracker = () => {
    const pending = new Set<Promise<unknown>>();
    return {
      pending,
      work: {
        track<T>(promise: Promise<T>) {
          pending.add(promise);
          void promise.then(
            () => pending.delete(promise),
            () => pending.delete(promise),
          );
          return promise;
        },
      },
    };
  };

  it.each(
    (['render', 'snapshot'] as const).flatMap((stage) =>
      (['resolve', 'reject'] as const).map((settlement) => ({
        stage,
        settlement,
      })),
    ),
  )(
    'retains original $stage work after abort until it can $settlement',
    async ({ stage, settlement }) => {
      const { pending, work } = tracker();
      let resolve!: (value: any) => void;
      let reject!: (reason: Error) => void;
      const original = new Promise<any>((yes, no) => {
        resolve = yes;
        reject = no;
      });
      let entered!: () => void;
      const started = new Promise<void>((yes) => {
        entered = yes;
      });
      const raw = {
        stream: new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode('<p>ready</p>'));
            controller.close();
          },
        }),
        snapshot:
          stage === 'snapshot' ? original : Promise.resolve({ value: 'ready' }),
        abort: rstest.fn(),
      };
      const handler = createBridgeServiceHandler({
        buildVersion: 'build-1',
        render(info) {
          expect(info.work).toBe(work);
          entered();
          return stage === 'render' ? original : Promise.resolve(raw);
        },
      });
      const aborter = new AbortController();
      const response = handler(request(aborter.signal), { work });
      await started;
      const body =
        stage === 'snapshot'
          ? (await response).text().catch((error) => error)
          : undefined;
      aborter.abort(Error('disconnected'));
      if (stage === 'render') expect((await response).status).toBe(500);
      else expect(await body).toBeInstanceOf(Error);
      expect(pending.has(original)).toBe(true);
      const tasks = [...pending];
      if (settlement === 'reject')
        reject(Error('producer cancellation completed'));
      else resolve(stage === 'render' ? raw : { value: 'late snapshot' });
      await Promise.allSettled(tasks);
      expect(pending.size).toBe(0);
      if (settlement === 'resolve' || stage === 'snapshot')
        expect(raw.abort).toHaveBeenCalled();
    },
  );

  it('keeps request ownership out of response frames and transcript cache identity', async () => {
    const f = fixture({ cache: true });
    const first = await f.handler(request(new AbortController().signal), {
      work: tracker().work,
    });
    const text = await first.text();
    expect(text).toContain('"type":"done"');
    expect(text).not.toContain('"work"');
    expect(text).not.toContain('"track"');
    const second = await f.handler(request(new AbortController().signal), {
      work: tracker().work,
    });
    expect(second.headers.get('x-mf-bridge-cache')).toBe('hit');
    expect(await second.text()).toBe(text);
    expect(f.render).toHaveBeenCalledTimes(1);
  });

  it('retains a snapshot discovered when an already aborted renderer returns late', async () => {
    const { pending, work } = tracker();
    let finishRender!: (value: any) => void;
    let finishSnapshot!: (reason: Error) => void;
    const rendering = new Promise<any>((resolve) => {
      finishRender = resolve;
    });
    const snapshot = new Promise<unknown>((_resolve, reject) => {
      finishSnapshot = reject;
    });
    let entered!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const handler = createBridgeServiceHandler({
      buildVersion: 'build-1',
      render() {
        entered();
        return rendering;
      },
    });
    const aborter = new AbortController();
    const response = handler(request(aborter.signal), { work });
    await started;
    aborter.abort(Error('disconnected'));
    expect((await response).status).toBe(500);
    finishRender({
      stream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.close();
        },
      }),
      snapshot,
      abort() {},
    });
    await Promise.allSettled([...pending]);
    expect(pending.has(snapshot)).toBe(true);
    finishSnapshot(Error('late producer cancellation'));
    await Promise.allSettled([...pending]);
    expect(pending.size).toBe(0);
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

describe('Service inbound body lifetime', () => {
  function request(body: ReadableStream<Uint8Array>, signal: AbortSignal) {
    return new Request('https://service.test/render', {
      method: 'POST',
      body,
      signal,
      duplex: 'half',
    } as RequestInit);
  }
  async function promptly<T>(result: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    try {
      return await Promise.race([
        result,
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(Error('handler kept waiting for body')),
            500,
          );
        }),
      ]);
    } finally {
      clearTimeout(timer!);
    }
  }
  it('rejects an already aborted request without locking its open body', async () => {
    const f = fixture();
    const aborter = new AbortController();
    aborter.abort(Error('already cancelled'));
    const body = new ReadableStream<Uint8Array>();
    await expect(
      promptly(f.handler(request(body, aborter.signal))),
    ).rejects.toThrow('already cancelled');
    expect(body.locked).toBe(false);
    expect(f.render).not.toHaveBeenCalled();
  });
  it('cancels a reader waiting after a partial body without the adapter closing the stream', async () => {
    const f = fixture();
    const aborter = new AbortController();
    let read!: () => void;
    const reading = new Promise<void>((resolve) => {
      read = resolve;
    });
    // Reader cancellation must unblock read even if the source cleanup stays pending.
    const cancel = rstest.fn(() => new Promise<void>(() => {}));
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"protocol":'));
      },
      pull() {
        read();
      },
      cancel,
    });
    const req = request(body, aborter.signal);
    const remove = rstest.spyOn(req.signal, 'removeEventListener');
    const result = f.handler(req);
    await reading;
    await Promise.resolve();
    expect(body.locked).toBe(true);
    const reason = Error('body cancelled');
    aborter.abort(reason);
    await expect(promptly(result)).rejects.toBe(reason);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith(reason);
    expect(body.locked).toBe(false);
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(f.render).not.toHaveBeenCalled();
  });
  it('unlocks and returns a bad request when the body itself errors', async () => {
    const f = fixture();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(Error('broken body'));
      },
    });
    const req = request(body, new AbortController().signal);
    const remove = rstest.spyOn(req.signal, 'removeEventListener');
    expect((await promptly(f.handler(req))).status).toBe(400);
    expect(body.locked).toBe(false);
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(f.render).not.toHaveBeenCalled();
  });
  it('renders a valid streamed request and unlocks the body', async () => {
    const f = fixture();
    const { signal, ...info } = input();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              protocol: BRIDGE_PRODUCER_PROTOCOL,
              buildVersion: 'build-1',
              request: info,
            }),
          ),
        );
        controller.close();
      },
    });
    const response = await f.handler(request(body, signal));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('"type":"done"');
    expect(body.locked).toBe(false);
    expect(f.render).toHaveBeenCalledTimes(1);
  });
});
