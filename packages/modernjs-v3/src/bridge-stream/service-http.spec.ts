import { describe, expect, it } from '@rstest/core';
import { createServer, type Server } from 'node:http';
import { Readable } from 'node:stream';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessage,
  BridgeSSRMessageResult,
} from '@module-federation/bridge-react/ssr';
import {
  BRIDGE_SERVICE_PROTOCOL,
  createBridgeServiceHandler,
  fetchBridgeService,
} from './service-http';

const revision = 'inventory-build-123';
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  void promise.catch(() => {});
  return { promise, resolve, reject };
}
function source<T>() {
  let controller!: ReadableStreamDefaultController<T>;
  let cancellation: unknown;
  const stream = new ReadableStream<T>({
    start(value) {
      controller = value;
    },
    cancel(reason) {
      cancellation = reason;
    },
  });
  return {
    stream,
    get controller() {
      return controller;
    },
    get cancellation() {
      return cancellation;
    },
  };
}
function request(signal = new AbortController().signal): BridgeSSRRequest {
  return {
    instanceId: 'inventory-1',
    identifierPrefix: 'inventory-1-',
    url: 'http://host.example/inventory',
    props: { shop: '北区' },
    headers: { cookie: 'application-only' },
    signal,
  };
}
function producer() {
  const html = source<Uint8Array>();
  const updates = source<unknown>();
  const final = deferred<unknown>();
  let aborted: unknown;
  const initial = { protocol: 'modern-application/2', pending: [{ id: '0' }] };
  const result: BridgeSSRResult = {
    revision,
    stylesheets: ['http://assets.example/inventory.css'],
    stream: html.stream,
    snapshot: final.promise,
    hydration: {
      snapshot: Promise.resolve(initial),
      updates: updates.stream,
      shellMarker: 'inventory-1-shell',
    },
    abort(reason) {
      aborted = reason;
    },
  };
  return {
    result,
    html,
    updates,
    final,
    initial,
    get aborted() {
      return aborted;
    },
  };
}
async function listen(handler: (request: Request) => Promise<Response>) {
  const sockets = new Set<import('node:net').Socket>();
  const server: Server = createServer(async (incoming, outgoing) => {
    const aborter = new AbortController();
    outgoing.on('close', () => {
      if (!outgoing.writableFinished) aborter.abort(new Error('socket closed'));
    });
    incoming.on('aborted', () => aborter.abort(new Error('request aborted')));
    try {
      const response = await handler(
        new Request(`http://127.0.0.1${incoming.url}`, {
          method: incoming.method,
          headers: incoming.headers as HeadersInit,
          body: Readable.toWeb(incoming) as ReadableStream<Uint8Array>,
          duplex: 'half',
          signal: aborter.signal,
        } as RequestInit),
      );
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      if (!response.body) {
        outgoing.end();
        return;
      }
      const reader = response.body.getReader();
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          outgoing.write(next.value);
        }
        outgoing.end();
      } catch {
        outgoing.destroy();
      } finally {
        reader.releaseLock();
      }
    } catch {
      outgoing.destroy();
    }
  });
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${(server.address() as import('node:net').AddressInfo).port}`,
    async close() {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
function encoded(value: unknown) {
  return Buffer.from(`${JSON.stringify(value)}\n`);
}
const meta = {
  type: 'meta',
  protocol: BRIDGE_SERVICE_PROTOCOL,
  revision,
  identifierPrefix: 'inventory-1-',
  hydration: 'progressive',
};
function fakeFetch(
  body: ReadableStream<Uint8Array>,
  status = 200,
): typeof fetch {
  return (async () =>
    new Response(body, {
      status,
      headers: { 'content-type': 'application/x-ndjson' },
    })) as typeof fetch;
}
async function collect(stream: ReadableStream<BridgeSSRMessage>) {
  const reader = stream.getReader();
  const chunks: string[] = [];
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      if (next.value.type === 'html') chunks.push(next.value.html);
    }
  } finally {
    reader.releaseLock();
  }
  return chunks.join('');
}

describe('Bridge service HTTP transport', () => {
  it('streams complete HTML, producer readiness and ordered loader updates over real HTTP', async () => {
    const live = producer();
    let received: BridgeSSRRequest | undefined;
    let httpCookie: string | null = 'unobserved';
    const handler = createBridgeServiceHandler({
      revision,
      render: async (info) => {
        received = info;
        return live.result;
      },
    });
    const service = await listen(async (req) => {
      httpCookie = req.headers.get('cookie');
      return handler(req);
    });
    try {
      const result = await fetchBridgeService(request(), {
        url: service.url,
        revision,
      });
      expect(httpCookie).toBeNull();
      expect(received?.headers?.cookie).toBe('application-only');
      expect(received?.props).toEqual({ shop: '北区' });
      expect(received?.signal).toBeInstanceOf(AbortSignal);
      expect(result.revision).toBe(revision);
      expect(result.stylesheets).toEqual(live.result.stylesheets);
      expect(result.hydration).toBe('progressive');
      await expect(result.snapshot).rejects.toThrow('no final snapshot');
      const reader = result.messages.getReader();
      const utf8 = Buffer.from(
        '<p>库存🌿</p><template id="inventory-1-shell"></template>',
      );
      for (const byte of utf8)
        live.html.controller.enqueue(Uint8Array.of(byte));
      expect((await reader.read()).value).toEqual({
        type: 'html',
        html: '<p>库存🌿</p>',
      });
      expect((await reader.read()).value).toEqual({
        type: 'html',
        html: '<template id="inventory-1-shell"></template>',
      });
      expect((await reader.read()).value).toEqual({
        type: 'ready',
        snapshot: live.initial,
      });
      live.updates.controller.enqueue({
        id: '0',
        status: 'fulfilled',
        value: '流水',
      });
      expect((await reader.read()).value).toEqual({
        type: 'update',
        value: { id: '0', status: 'fulfilled', value: '流水' },
      });
      live.final.reject(new Error('handled loader rejection'));
      live.html.controller.close();
      live.updates.controller.close();
      expect((await reader.read()).value).toEqual({ type: 'done' });
      expect((await reader.read()).done).toBe(true);
      reader.releaseLock();
    } finally {
      await service.close();
    }
  });

  it('complete mode drains updates and returns the actual final snapshot', async () => {
    const live = producer();
    const handler = createBridgeServiceHandler({
      revision,
      render: async () => live.result,
    });
    const service = await listen(handler);
    try {
      const result = await fetchBridgeService(request(), {
        url: service.url,
        revision,
        hydrationMode: 'complete',
      });
      expect(result.hydration).toBe('complete');
      const complete = collect(result.messages);
      live.updates.controller.enqueue({
        id: '0',
        status: 'fulfilled',
        value: 1,
      });
      live.html.controller.enqueue(Buffer.from('<main>finished</main>'));
      live.html.controller.close();
      live.updates.controller.close();
      const final = {
        protocol: 'modern-application/1',
        routerData: { ready: true },
      };
      live.final.resolve(final);
      expect(await result.snapshot).toEqual(final);
      expect(await complete).toBe('<main>finished</main>');
    } finally {
      await service.close();
    }
  });

  it('propagates cancellation through HTTP to producer signal and both streams', async () => {
    const live = producer();
    const cancelled = deferred<void>();
    const service = await listen(
      createBridgeServiceHandler({
        revision,
        render: async (info) => {
          info.signal.addEventListener('abort', () => cancelled.resolve());
          return live.result;
        },
      }),
    );
    try {
      const aborter = new AbortController();
      const result = await fetchBridgeService(request(aborter.signal), {
        url: service.url,
        revision,
      });
      const reader = result.messages.getReader();
      const waiting = reader.read();
      aborter.abort(new Error('navigation changed'));
      await expect(waiting).rejects.toThrow('navigation changed');
      await cancelled.promise;
      expect(live.aborted).toBeInstanceOf(Error);
      expect(live.html.cancellation).toBeInstanceOf(Error);
      expect(live.updates.cancellation).toBeInstanceOf(Error);
      reader.releaseLock();
    } finally {
      await service.close();
    }
  });

  it('keeps the request timeout active after metadata has arrived', async () => {
    const live = producer();
    const service = await listen(
      createBridgeServiceHandler({ revision, render: async () => live.result }),
    );
    try {
      const result = await fetchBridgeService(request(), {
        url: service.url,
        revision,
        timeoutMs: 100,
      });
      await expect(collect(result.messages)).rejects.toThrow('timed out');
    } finally {
      await service.close();
    }
  });

  it('rejects non-200 and revision mismatch, and propagates a failed initial snapshot through the stream', async () => {
    const live = producer();
    let count = 0;
    const service = await listen(
      createBridgeServiceHandler({
        revision,
        render: async () => {
          count++;
          return live.result;
        },
      }),
    );
    try {
      await expect(
        fetchBridgeService(request(), { url: service.url, revision: 'wrong' }),
      ).rejects.toThrow('HTTP 409');
      expect(count).toBe(0);
      live.result.hydration!.snapshot = Promise.reject(
        new Error('initial data failed'),
      );
      void live.result.hydration!.snapshot.catch(() => {});
      const result = await fetchBridgeService(request(), {
        url: service.url,
        revision,
      });
      const reading = collect(result.messages);
      live.html.controller.enqueue(
        Buffer.from('<template id="inventory-1-shell"></template>'),
      );
      await expect(reading).rejects.toThrow();
      expect(live.aborted).toBeInstanceOf(Error);
    } finally {
      await service.close();
    }
    const body = source<Uint8Array>();
    body.controller.close();
    await expect(
      fetchBridgeService(request(), {
        url: 'http://service.test',
        revision,
        fetch: fakeFetch(body.stream, 503),
      }),
    ).rejects.toThrow('HTTP 503');
  });

  it('rejects malformed metadata and cancels the unread response', async () => {
    for (const bad of [
      { ...meta, protocol: 'unknown' },
      { ...meta, revision: 'wrong' },
      { ...meta, identifierPrefix: 'other' },
      { ...meta, hydration: 'unknown' },
      { ...meta, stylesheets: ['javascript:alert(1)'] },
      { type: 'html', html: 'x' },
    ]) {
      const body = source<Uint8Array>();
      body.controller.enqueue(encoded(bad));
      await expect(
        fetchBridgeService(request(), {
          url: 'http://service.test',
          revision,
          fetch: fakeFetch(body.stream),
        }),
      ).rejects.toThrow();
      expect(body.cancellation).toBeInstanceOf(Error);
    }
  });

  it('rejects duplicate, malformed, truncated and out-of-order frames after metadata', async () => {
    const cases = [
      { frames: [meta], message: 'Unexpected' },
      { frames: [{ type: 'html', html: 7 }], message: 'Invalid' },
      { frames: [{ type: 'data', snapshot: {} }], message: 'Unexpected' },
      { frames: [{ type: 'update' }], message: 'Unexpected' },
      {
        frames: [{ type: 'ready', snapshot: {} }],
        message: 'Unexpected Bridge service readiness',
      },
      {
        frames: [{ type: 'error', message: 'producer failed' }],
        message: 'producer failed',
      },
      { frames: [], message: 'Truncated' },
      {
        frames: [
          { type: 'html', html: '<p>shell</p>' },
          { type: 'ready', snapshot: {} },
          { type: 'done' },
          { type: 'done' },
        ],
        message: 'after done',
      },
    ];
    for (const test of cases) {
      const body = source<Uint8Array>();
      body.controller.enqueue(encoded(meta));
      const result = await fetchBridgeService(request(), {
        url: 'http://service.test',
        revision,
        fetch: fakeFetch(body.stream),
      });
      const reading = collect(result.messages);
      for (const frame of test.frames) body.controller.enqueue(encoded(frame));
      body.controller.close();
      await expect(reading).rejects.toThrow(test.message);
    }
    for (const bytes of [
      Buffer.from('{bad}\n'),
      Buffer.from('{"type":'),
      Uint8Array.from([0xff, 10]),
    ]) {
      const body = source<Uint8Array>();
      body.controller.enqueue(encoded(meta));
      const result = await fetchBridgeService(request(), {
        url: 'http://service.test',
        revision,
        fetch: fakeFetch(body.stream),
      });
      body.controller.enqueue(bytes);
      body.controller.close();
      await expect(collect(result.messages)).rejects.toThrow();
    }
  });

  it('limits UTF-8 frame bytes and the total unread message budget', async () => {
    const body = source<Uint8Array>();
    body.controller.enqueue(encoded(meta));
    const result = await fetchBridgeService(request(), {
      url: 'http://service.test',
      revision,
      maxFrameBytes: 512,
      maxBufferedBytes: 64,
      fetch: fakeFetch(body.stream),
    });
    body.controller.enqueue(
      encoded({ type: 'html', html: '123456'.repeat(20) }),
    );
    await expect(result.messages.getReader().read()).rejects.toThrow(
      'pending buffer',
    );
    expect(body.cancellation).toBeInstanceOf(Error);
    const large = source<Uint8Array>();
    large.controller.enqueue(Buffer.from('x'.repeat(513)));
    await expect(
      fetchBridgeService(request(), {
        url: 'http://service.test',
        revision,
        maxFrameBytes: 512,
        fetch: fakeFetch(large.stream),
      }),
    ).rejects.toThrow('frame exceeds');
    expect(large.cancellation).toBeInstanceOf(Error);
  });

  it('supports an older producer without progressive hydration metadata', async () => {
    const live = producer();
    delete live.result.hydration;
    const service = await listen(
      createBridgeServiceHandler({ revision, render: async () => live.result }),
    );
    try {
      const result = await fetchBridgeService(request(), {
        url: service.url,
        revision,
      });
      expect(result.hydration).toBe('complete');
      const reading = collect(result.messages);
      live.html.controller.enqueue(Buffer.from('<div>legacy</div>'));
      live.html.controller.close();
      live.final.resolve({ protocol: 'modern-application/1' });
      expect(await reading).toBe('<div>legacy</div>');
      expect(await result.snapshot).toEqual({
        protocol: 'modern-application/1',
      });
    } finally {
      await service.close();
    }
  });

  it('aborts both sides when the producer HTML stream rejects after metadata', async () => {
    const live = producer();
    const service = await listen(
      createBridgeServiceHandler({ revision, render: async () => live.result }),
    );
    try {
      const result = await fetchBridgeService(request(), {
        url: service.url,
        revision,
      });
      const reading = collect(result.messages);
      live.html.controller.error(new Error('renderer broke'));
      await expect(reading).rejects.toThrow();
      expect(live.aborted).toBeInstanceOf(Error);
      expect(live.updates.cancellation).toBeInstanceOf(Error);
    } finally {
      await service.close();
    }
  });

  it('rejects duplicate final snapshots, HTML after data, or complete done without data', async () => {
    for (const tail of [
      [
        { type: 'data', snapshot: {} },
        { type: 'data', snapshot: {} },
      ],
      [
        { type: 'data', snapshot: {} },
        { type: 'html', html: 'x' },
      ],
      [{ type: 'done' }],
      [{ type: 'update', value: {} }],
    ]) {
      const body = source<Uint8Array>();
      body.controller.enqueue(encoded({ ...meta, hydration: 'complete' }));
      const result = await fetchBridgeService(request(), {
        url: 'http://service.test',
        revision,
        hydrationMode: 'complete',
        fetch: fakeFetch(body.stream),
      });
      const reading = collect(result.messages);
      for (const frame of tail) body.controller.enqueue(encoded(frame));
      body.controller.close();
      await expect(reading).rejects.toThrow();
    }
  });

  it('releases unread messages on abort even after a successful HTTP EOF', async () => {
    const body = source<Uint8Array>();
    body.controller.enqueue(encoded(meta));
    const result = await fetchBridgeService(request(), {
      url: 'http://service.test',
      revision,
      fetch: fakeFetch(body.stream),
    });
    body.controller.enqueue(encoded({ type: 'html', html: '<p>shell</p>' }));
    body.controller.enqueue(encoded({ type: 'ready', snapshot: {} }));
    body.controller.enqueue(
      encoded({ type: 'update', value: { id: '0', value: 'queued' } }),
    );
    body.controller.enqueue(encoded({ type: 'done' }));
    body.controller.close();
    await new Promise((resolve) => setTimeout(resolve, 0));
    result.abort(new Error('instance removed'));
    await expect(result.messages.getReader().read()).rejects.toThrow(
      'instance removed',
    );
  });

  it('cancels a producer with an unresolved initial snapshot after its shell arrives', async () => {
    const live = producer();
    live.result.hydration!.snapshot = new Promise(() => {});
    const aborter = new AbortController();
    const handler = createBridgeServiceHandler({
      revision,
      render: async () => live.result,
    });
    const response = await handler(
      new Request('http://service.test', {
        method: 'POST',
        signal: aborter.signal,
        body: JSON.stringify({
          protocol: BRIDGE_SERVICE_PROTOCOL,
          revision,
          hydration: 'progressive',
          request: request(),
        }),
      }),
    );
    const pending = response.text();
    live.html.controller.enqueue(
      Buffer.from('<template id="inventory-1-shell"></template>'),
    );
    aborter.abort(new Error('gone'));
    await expect(pending).rejects.toThrow('gone');
    expect(live.aborted).toBeInstanceOf(Error);
  });
});

describe('Bridge service render caching', () => {
  function post(info = request(), hydration = 'complete') {
    const { signal, ...input } = info;
    return new Request('http://service.test', {
      method: 'POST',
      signal,
      body: JSON.stringify({
        protocol: BRIDGE_SERVICE_PROTOCOL,
        revision,
        hydration,
        request: input,
      }),
    });
  }

  function completed(info: BridgeSSRRequest): BridgeSSRResult {
    const { signal, ...snapshot } = info;
    return {
      revision,
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(Buffer.from('<p>库存🌿</p>'));
          controller.close();
        },
      }),
      snapshot: Promise.resolve(snapshot),
      abort() {},
    };
  }

  it('rejects an already-prepared producer that requests hydration before HTML and never caches it', async () => {
    let renders = 0;
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000 },
      async render(): Promise<BridgeSSRMessageResult> {
        renders++;
        return {
          protocol: 'mf-bridge-producer/1',
          revision,
          hydration: 'progressive',
          messages: new ReadableStream({
            start(controller) {
              controller.enqueue({ type: 'ready', snapshot: {} });
              controller.enqueue({ type: 'done' });
              controller.close();
            },
          }),
          snapshot: Promise.resolve({}),
          abort() {},
        };
      },
    });
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await handler(post(request(), 'progressive'));
      expect(response.headers.get('x-mf-bridge-cache')).toBe('miss');
      await expect(response.text()).rejects.toThrow(
        'Unexpected Bridge producer readiness',
      );
    }
    expect(renders).toBe(2);
  });

  it('permits complete hydration of an empty application', async () => {
    const handler = createBridgeServiceHandler({
      revision,
      render: async () => ({
        revision,
        stream: new ReadableStream<Uint8Array>({
          start(controller) {
            controller.close();
          },
        }),
        snapshot: Promise.resolve({ empty: true }),
        abort() {},
      }),
    });
    const response = await handler(post());
    const frames = (await response.text())
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(frames.map((frame) => frame.type)).toEqual(['meta', 'data', 'done']);
  });

  it('reuses completed renders over real HTTP with independent, delayed consumers', async () => {
    let renders = 0;
    const statuses: (string | null)[] = [];
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000 },
      async render(info) {
        renders++;
        return completed(info);
      },
    });
    const service = await listen(async (input) => {
      const response = await handler(input);
      statuses.push(response.headers.get('x-mf-bridge-cache'));
      expect(response.headers.get('cache-control')).toBe('no-store');
      return response;
    });
    try {
      const options = {
        url: service.url,
        revision,
        hydrationMode: 'complete' as const,
      };
      const first = await fetchBridgeService(request(), options);
      const original = await collect(first.messages);
      const snapshot = await first.snapshot;
      const [second, third] = await Promise.all([
        fetchBridgeService(request(), options),
        fetchBridgeService(request(), options),
      ]);
      second.abort(new Error('one consumer left'));
      await expect(collect(second.messages)).rejects.toThrow();
      // The transport may finish before the application starts reading a hit.
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(await collect(third.messages)).toBe(original);
      expect(await third.snapshot).toEqual(snapshot);
      expect(renders).toBe(1);
      expect(statuses).toEqual(['miss', 'hit', 'hit']);
    } finally {
      await service.close();
    }
  });

  it('streams live when a cached transcript exceeds a slow consumer budget and reuses it for a larger budget', async () => {
    let renders = 0;
    const statuses: (string | null)[] = [];
    const budgets: (string | null)[] = [];
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000 },
      async render(info) {
        renders++;
        // This header configures transport replay, never the application render.
        expect(info.headers).toEqual({ cookie: 'application-only' });
        let emitted = 0;
        return {
          revision,
          stream: new ReadableStream<Uint8Array>({
            async pull(controller) {
              await new Promise((resolve) => setTimeout(resolve, 20));
              controller.enqueue(Buffer.from(`<p>${'A'.repeat(64)}</p>`));
              if (++emitted === 10) controller.close();
            },
          }),
          snapshot: Promise.resolve({ complete: true }),
          abort() {},
        };
      },
    });
    const localFetch: typeof fetch = async (url, init) => {
      const input = new Request(url, init);
      budgets.push(input.headers.get('x-mf-bridge-buffer-bytes'));
      const response = await handler(input);
      statuses.push(response.headers.get('x-mf-bridge-cache'));
      return response;
    };
    for (const maxBufferedBytes of [128, 128, undefined]) {
      const result = await fetchBridgeService(request(), {
        url: 'http://service.test',
        revision,
        hydrationMode: 'complete',
        maxBufferedBytes,
        fetch: localFetch,
      });
      const reader = result.messages.getReader();
      const chunks: string[] = [];
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          if (next.value.type === 'html') chunks.push(next.value.html);
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      } finally {
        reader.releaseLock();
      }
      expect(chunks.join('')).toBe(`<p>${'A'.repeat(64)}</p>`.repeat(10));
      expect(await result.snapshot).toEqual({ complete: true });
    }
    expect(statuses).toEqual(['miss', 'miss', 'hit']);
    expect(budgets).toEqual(['128', '128', String(4 * 1024 * 1024)]);
    expect(renders).toBe(2);
  });

  it('rejects malformed replay budgets before rendering', async () => {
    let renders = 0;
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000 },
      async render(info) {
        renders++;
        return completed(info);
      },
    });
    for (const budget of [
      '',
      '0',
      '-1',
      '1.5',
      '1e3',
      'Infinity',
      '9007199254740992',
    ]) {
      const input = post();
      input.headers.set('x-mf-bridge-buffer-bytes', budget);
      expect((await handler(input)).status).toBe(400);
    }
    expect(renders).toBe(0);
  });

  it('uses the default replay budget when a client omits the transport header', async () => {
    let renders = 0;
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000, maxEntryBytes: 8 * 1024 * 1024 },
      async render() {
        renders++;
        let emitted = 0;
        return {
          revision,
          stream: new ReadableStream<Uint8Array>({
            async pull(controller) {
              await new Promise((resolve) => setTimeout(resolve, 1));
              controller.enqueue(
                Buffer.from(`<p>${'A'.repeat(768 * 1024)}</p>`),
              );
              if (++emitted === 7) controller.close();
            },
          }),
          snapshot: Promise.resolve({ complete: true }),
          abort() {},
        };
      },
    });
    for (let i = 0; i < 2; i++) {
      const response = await handler(post());
      expect(response.headers.get('x-mf-bridge-cache')).toBe('miss');
      expect(await response.text()).toContain('"type":"done"');
    }
    const input = post();
    input.headers.set('x-mf-bridge-buffer-bytes', String(8 * 1024 * 1024));
    const hit = await handler(input);
    expect(hit.headers.get('x-mf-bridge-cache')).toBe('hit');
    expect(await hit.text()).toContain('"type":"done"');
    expect(renders).toBe(2);
  });

  it('keeps every render input in the key instead of normalizing away identity or user context', async () => {
    let renders = 0;
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000 },
      async render(info) {
        renders++;
        return completed(info);
      },
    });
    const variants: Partial<BridgeSSRRequest>[] = [
      {},
      { instanceId: 'inventory-2' },
      { identifierPrefix: 'inventory-2-' },
      { props: { shop: '南区' } },
      { url: 'http://host.example/other' },
      { headers: { cookie: 'other-user' } },
      { nonce: 'this-document' },
      { moduleName: 'another/app' },
      { basename: '/nested' },
      { memoryRoute: { entryPath: '/another' } },
    ];
    for (const variant of variants) {
      const info = { ...request(), ...variant };
      const first = await handler(post(info));
      expect(first.headers.get('x-mf-bridge-cache')).toBe('miss');
      const text = await first.text();
      const second = await handler(post(info));
      expect(second.headers.get('x-mf-bridge-cache')).toBe('hit');
      expect(await second.text()).toBe(text);
    }
    expect(renders).toBe(variants.length);
    const differentMode = await handler(post(request(), 'progressive'));
    expect(differentMode.headers.get('x-mf-bridge-cache')).toBe('miss');
    await differentMode.text();
    const stale = post();
    const body = await stale.json();
    body.revision = 'stale-build';
    expect(
      (
        await handler(
          new Request(stale.url, {
            method: 'POST',
            body: JSON.stringify(body),
          }),
        )
      ).status,
    ).toBe(409);
  });

  it('streams misses immediately and records all progressive updates before publishing a hit', async () => {
    const live = producer();
    let renders = 0;
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000 },
      async render() {
        renders++;
        return live.result;
      },
    });
    const first = await handler(post(request(), 'progressive'));
    const reader = first.body!.getReader();
    const chunks = [(await reader.read()).value!];
    expect(JSON.parse(Buffer.from(chunks[0]).toString()).type).toBe('meta');
    live.html.controller.enqueue(
      Buffer.from(
        '<div>shell<template id="inventory-1-shell"></template></div>',
      ),
    );
    chunks.push((await reader.read()).value!);
    live.html.controller.close();
    live.updates.controller.enqueue({ id: '0', value: 'later' });
    live.updates.controller.close();
    live.final.resolve({ complete: true });
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      chunks.push(next.value);
    }
    reader.releaseLock();
    const second = await handler(post(request(), 'progressive'));
    expect(second.headers.get('x-mf-bridge-cache')).toBe('hit');
    expect(await second.text()).toBe(Buffer.concat(chunks).toString());
    expect(renders).toBe(1);
  });

  it('does not merge distinct producer inputs when JSON re-serialization would change numeric values', async () => {
    let renders = 0;
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000 },
      async render(info) {
        renders++;
        const value = info.props.value;
        const label = Object.is(value, -0)
          ? 'negative zero'
          : value === Infinity
            ? 'infinity'
            : value === null
              ? 'null'
              : 'zero';
        return {
          revision,
          stream: new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(Buffer.from(`<p>${label}</p>`));
              controller.close();
            },
          }),
          snapshot: Promise.resolve({ label }),
          abort() {},
        };
      },
    });
    const { signal: _signal, ...info } = request();
    const template = JSON.stringify({
      protocol: BRIDGE_SERVICE_PROTOCOL,
      revision,
      hydration: 'complete',
      request: { ...info, props: { value: 0 } },
    });
    for (const [literal, label] of [
      ['-0', 'negative zero'],
      ['0', 'zero'],
      ['1e400', 'infinity'],
      ['null', 'null'],
    ]) {
      const body = template.replace('"value":0', `"value":${literal}`);
      const input = () =>
        new Request('http://service.test', { method: 'POST', body });
      const first = await handler(input());
      expect(first.headers.get('x-mf-bridge-cache')).toBe('miss');
      const text = await first.text();
      expect(text).toContain(`"snapshot":{"label":"${label}"}`);
      const second = await handler(input());
      expect(second.headers.get('x-mf-bridge-cache')).toBe('hit');
      expect(await second.text()).toBe(text);
    }
    expect(renders).toBe(4);
  });

  for (const field of ['initial', 'final', 'update'] as const) {
    for (const kind of ['undefined', 'toJSON'] as const) {
      it(`rejects a ${field} value omitted by ${kind} serialization and never caches the failed transcript`, async () => {
        let renders = 0;
        const handler = createBridgeServiceHandler({
          revision,
          cache: { maxAgeMs: 60000 },
          async render(info) {
            if (++renders > 1) return completed(info);
            const invalid =
              kind === 'undefined' ? undefined : { toJSON: () => undefined };
            const result = completed(info);
            if (field === 'final') result.snapshot = Promise.resolve(invalid);
            else {
              result.stream = new ReadableStream({
                start(controller) {
                  controller.enqueue(
                    Buffer.from('<template id="shell"></template>'),
                  );
                  controller.close();
                },
              });
              result.hydration = {
                snapshot: Promise.resolve(field === 'initial' ? invalid : {}),
                shellMarker: 'shell',
                updates: new ReadableStream<unknown>({
                  start(controller) {
                    if (field === 'update') controller.enqueue(invalid);
                    controller.close();
                  },
                }),
              };
            }
            return result;
          },
        });
        const mode = field === 'final' ? 'complete' : 'progressive';
        const first = await handler(post(request(), mode));
        expect(first.status).toBe(200);
        await expect(first.text()).rejects.toThrow();
        const second = await handler(post(request(), mode));
        expect(second.headers.get('x-mf-bridge-cache')).toBe('miss');
        const recovered = await second.text();
        expect(recovered).toContain('"type":"done"');
        const third = await handler(post(request(), mode));
        expect(third.headers.get('x-mf-bridge-cache')).toBe('hit');
        expect(await third.text()).toBe(recovered);
        expect(renders).toBe(2);
      });
    }
  }

  it('discards failed or cancelled recordings and does not cache partial output', async () => {
    for (const failure of ['html', 'updates', 'cancel', 'snapshot']) {
      const live = producer();
      let renders = 0;
      const handler = createBridgeServiceHandler({
        revision,
        cache: { maxAgeMs: 60000 },
        async render(info) {
          return ++renders === 1 ? live.result : completed(info);
        },
      });
      const aborter = new AbortController();
      const first = await handler(post(request(aborter.signal)));
      const reading = first.text();
      const rejected = expect(reading).rejects.toThrow();
      if (failure === 'html')
        live.html.controller.error(new Error('render failed'));
      else if (failure === 'updates')
        live.updates.controller.error(new Error('update failed'));
      else if (failure === 'cancel') aborter.abort(new Error('client left'));
      else {
        live.html.controller.close();
        live.updates.controller.close();
        live.final.reject(new Error('snapshot failed'));
      }
      await rejected;
      const second = await handler(post());
      expect(second.headers.get('x-mf-bridge-cache')).toBe('miss');
      await second.text();
      const third = await handler(post());
      expect(third.headers.get('x-mf-bridge-cache')).toBe('hit');
      await third.text();
      expect(renders).toBe(2);
    }
  });

  it('keeps oversized renders working while bypassing cache storage', async () => {
    let renders = 0;
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000, maxEntryBytes: 1 },
      async render(info) {
        renders++;
        return completed(info);
      },
    });
    for (let i = 0; i < 2; i++) {
      const response = await handler(post());
      expect(response.status).toBe(200);
      expect(response.headers.get('x-mf-bridge-cache')).toBe('miss');
      expect(await response.text()).toContain('"type":"done"');
    }
    expect(renders).toBe(2);
  });

  it('cancels one cache replay without evicting or consuming the stored render', async () => {
    const handler = createBridgeServiceHandler({
      revision,
      cache: { maxAgeMs: 60000 },
      render: async (info) => completed(info),
    });
    const original = await (await handler(post())).text();
    const aborter = new AbortController();
    const hit = await handler(post(request(aborter.signal)));
    const reader = hit.body!.getReader();
    expect((await reader.read()).done).toBe(false);
    aborter.abort(new Error('replay cancelled'));
    await expect(reader.read()).rejects.toThrow('replay cancelled');
    reader.releaseLock();
    expect(await (await handler(post())).text()).toBe(original);
  });
});
