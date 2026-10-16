import { describe, expect, it } from '@rstest/core';
import { createServer, type Server } from 'node:http';
import { Readable } from 'node:stream';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
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
  snapshot: {},
  shellMarker: 'shell',
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
async function collect(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString();
}

describe('Bridge service HTTP transport', () => {
  it('returns early metadata and streams raw HTML and loader updates independently over real HTTP', async () => {
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
      expect(await result.hydration!.snapshot).toEqual(live.initial);
      await expect(result.snapshot).rejects.toThrow('no final snapshot');
      const html = result.stream.getReader();
      const data = result.hydration!.updates.getReader();
      const utf8 = Buffer.from('<p>库存🌿</p>');
      for (const byte of utf8)
        live.html.controller.enqueue(Uint8Array.of(byte));
      const bytes: Uint8Array[] = [];
      while (bytes.length < utf8.length) bytes.push((await html.read()).value!);
      expect(Buffer.concat(bytes).toString()).toBe('<p>库存🌿</p>');
      live.updates.controller.enqueue({
        id: '0',
        status: 'fulfilled',
        value: '流水',
      });
      expect((await data.read()).value).toEqual({
        id: '0',
        status: 'fulfilled',
        value: '流水',
      });
      // A handled loader rejection can reject the legacy snapshot. It must not
      // block or fail progressive completion.
      live.final.reject(new Error('handled loader rejection'));
      live.html.controller.close();
      live.updates.controller.close();
      expect((await html.read()).done).toBe(true);
      expect((await data.read()).done).toBe(true);
      html.releaseLock();
      data.releaseLock();
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
      expect(result.hydration).toBeUndefined();
      const complete = collect(result.stream);
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
      const reader = result.stream.getReader();
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
      await expect(collect(result.stream)).rejects.toThrow('timed out');
    } finally {
      await service.close();
    }
  });

  it('rejects non-200, revision mismatch, and producer initial-snapshot rejection before accepting a result', async () => {
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
      await expect(
        fetchBridgeService(request(), { url: service.url, revision }),
      ).rejects.toThrow('HTTP 500');
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
      { type: 'html', bytes: 'eA==' },
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
      { frames: [{ type: 'html', bytes: '@invalid' }], message: 'Invalid' },
      { frames: [{ type: 'data', snapshot: {} }], message: 'Unexpected' },
      { frames: [{ type: 'update' }], message: 'Unexpected' },
      {
        frames: [{ type: 'error', message: 'producer failed' }],
        message: 'producer failed',
      },
      { frames: [], message: 'Truncated' },
      { frames: [{ type: 'done' }, { type: 'done' }], message: 'after done' },
    ];
    for (const test of cases) {
      const body = source<Uint8Array>();
      body.controller.enqueue(encoded(meta));
      const result = await fetchBridgeService(request(), {
        url: 'http://service.test',
        revision,
        fetch: fakeFetch(body.stream),
      });
      const reading = collect(result.stream);
      for (const frame of test.frames) body.controller.enqueue(encoded(frame));
      body.controller.close();
      await expect(reading).rejects.toThrow(test.message);
      await expect(
        result.hydration!.updates.getReader().read(),
      ).rejects.toThrow(test.message);
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
      await expect(collect(result.stream)).rejects.toThrow();
    }
  });

  it('limits UTF-8 frame bytes and total unread HTML plus update bytes', async () => {
    const body = source<Uint8Array>();
    body.controller.enqueue(encoded(meta));
    const result = await fetchBridgeService(request(), {
      url: 'http://service.test',
      revision,
      maxFrameBytes: 512,
      maxBufferedBytes: 10,
      fetch: fakeFetch(body.stream),
    });
    body.controller.enqueue(
      encoded({
        type: 'html',
        bytes: Buffer.from('123456').toString('base64'),
      }),
    );
    body.controller.enqueue(encoded({ type: 'update', value: '中文' }));
    await expect(result.hydration!.updates.getReader().read()).rejects.toThrow(
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
      expect(result.hydration).toBeUndefined();
      const reading = collect(result.stream);
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
      const reading = collect(result.stream);
      const pending = result.hydration!.updates.getReader().read();
      live.html.controller.error(new Error('renderer broke'));
      await expect(reading).rejects.toThrow();
      await expect(pending).rejects.toThrow();
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
        { type: 'html', bytes: 'eA==' },
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
      const reading = collect(result.stream);
      for (const frame of tail) body.controller.enqueue(encoded(frame));
      body.controller.close();
      await expect(reading).rejects.toThrow();
    }
  });

  it('releases buffered data on abort even after a successful HTTP EOF', async () => {
    const body = source<Uint8Array>();
    body.controller.enqueue(encoded(meta));
    const result = await fetchBridgeService(request(), {
      url: 'http://service.test',
      revision,
      fetch: fakeFetch(body.stream),
    });
    body.controller.enqueue(
      encoded({ type: 'update', value: { id: '0', value: 'queued' } }),
    );
    body.controller.enqueue(encoded({ type: 'done' }));
    body.controller.close();
    expect(await collect(result.stream)).toBe('');
    result.abort(new Error('instance removed'));
    await expect(result.hydration!.updates.getReader().read()).rejects.toThrow(
      'instance removed',
    );
  });

  it('cancels a service still awaiting its initial snapshot', async () => {
    const live = producer();
    live.result.hydration!.snapshot = new Promise(() => {});
    const aborter = new AbortController();
    const handler = createBridgeServiceHandler({
      revision,
      render: async () => live.result,
    });
    const pending = handler(
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
    await new Promise((resolve) => setTimeout(resolve, 0));
    aborter.abort(new Error('gone'));
    expect((await pending).status).toBe(500);
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
      const original = await collect(first.stream);
      const snapshot = await first.snapshot;
      const [second, third] = await Promise.all([
        fetchBridgeService(request(), options),
        fetchBridgeService(request(), options),
      ]);
      second.abort(new Error('one consumer left'));
      await expect(collect(second.stream)).rejects.toThrow();
      // The transport may finish before the application starts reading a hit.
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(await collect(third.stream)).toBe(original);
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
              controller.enqueue(Buffer.alloc(64, 65));
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
      const reader = result.stream.getReader();
      const chunks: Uint8Array[] = [];
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          chunks.push(next.value);
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      } finally {
        reader.releaseLock();
      }
      expect(Buffer.concat(chunks).toString()).toBe('A'.repeat(640));
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
              controller.enqueue(Buffer.alloc(512 * 1024, 65));
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
    live.html.controller.enqueue(Buffer.from('<div>shell</div>'));
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
        if (field === 'initial') {
          expect(first.status).toBe(500);
          await first.text();
        } else {
          expect(first.status).toBe(200);
          await expect(first.text()).rejects.toThrow('during serialization');
        }
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
