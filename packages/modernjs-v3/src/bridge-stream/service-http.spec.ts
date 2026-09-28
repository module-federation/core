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
