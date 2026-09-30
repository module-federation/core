import { describe, expect, it, rs } from '@rstest/core';
import { PassThrough, Readable } from 'node:stream';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { createRemoteAppComponent } from '@module-federation/bridge-react/base';
import { once } from 'node:events';
import {
  bridgeStreamPlugin,
  type BridgeStreamPluginOptions,
} from './bridgeStreamPlugin.node';
import { loadRemote } from '@module-federation/runtime';
import { loadBridgeRemote } from '../bridge-stream/remote.server';
import { createBridgeServiceHandler } from '../bridge-stream/service-http';
import type {
  BridgeSSRContextValue,
  BridgeSSRRequest,
} from '@module-federation/bridge-react/ssr';

rs.mock('@module-federation/runtime', () => ({
  loadRemote: rs.fn(() => {
    throw Error('The Host has no producer Node artifact');
  }),
  getInstance: () => null,
}));

const MODERN_SHELL_TEXT = '<!--<?- SHELL_STREAM_END ?>-->';
const MODERN_SHELL_MARKER = '&lt;!--&lt;?- SHELL_STREAM_END ?&gt;--&gt;';

function createExtender(
  timeoutMs = 1000,
  url = 'https://host.example/dashboard?tab=goods',
  services?: BridgeStreamPluginOptions['services'],
) {
  let factory: (() => any) | undefined;
  const plugin = bridgeStreamPlugin({ timeoutMs, services });
  plugin.setup({
    extendStreamSSR: (callback: () => any) => {
      factory = callback;
    },
  } as any);
  const extender = factory!();
  extender.init({
    shellEndMarker: MODERN_SHELL_MARKER,
    identifierPrefix: 'modern-js-',
    request: new Request(url, {
      headers: { cookie: 'user=a' },
    }),
    runtimeContext: { ssrContext: { nonce: 'test-nonce' } },
  });
  const root = extender.modifyRootElement(null);
  return { extender, context: root.props.value as BridgeSSRContextValue };
}

function producer(value: string) {
  let controller: ReadableStreamDefaultController<Uint8Array>;
  let aborts = 0;
  let received: BridgeSSRRequest | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  return {
    write(html: string) {
      controller.enqueue(new TextEncoder().encode(html));
    },
    end() {
      controller.close();
    },
    get request() {
      return received;
    },
    get aborts() {
      return aborts;
    },
    factory: () => ({
      render() {},
      destroy() {},
      async renderStream(request: BridgeSSRRequest) {
        received = request;
        return {
          stream,
          snapshot: Promise.resolve({ value }),
          abort() {
            aborts++;
          },
        };
      },
    }),
  };
}

async function until(predicate: () => boolean) {
  for (let tries = 0; tries < 30; tries++) {
    if (predicate()) return;
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
  throw Error('Expected stream progress');
}

describe('Modern Bridge stream plugin', () => {
  it('preserves the Host tree and useId path without adding an SSR-only sibling', () => {
    const { extender } = createExtender();
    function Host() {
      return React.createElement('div', { id: React.useId() }, 'Host');
    }
    const root = React.createElement(
      React.Fragment,
      null,
      React.createElement(Host),
      MODERN_SHELL_TEXT,
    );
    const options = { identifierPrefix: 'modern-js-' };
    expect(renderToString(extender.modifyRootElement(root), options)).toBe(
      renderToString(root, options),
    );
  });

  it('fails explicitly when Modern does not supply its shell and identifier contracts', () => {
    const { extender } = createExtender();
    expect(() =>
      extender.init({ request: new Request('https://host.example/') }),
    ).toThrow('Unsupported Modern Bridge SSR runtime');
    expect(() =>
      extender.init({ shellEndMarker: MODERN_SHELL_MARKER }),
    ).toThrow('identifierPrefix');
  });
  for (const query of ['csr=1&csr=', 'csr=1']) {
    it(`honors Modern's selected SSR mode without reinterpreting ${query}`, async () => {
      const { extender, context } = createExtender(
        1000,
        `https://host.example/?${query}`,
      );
      const remote = producer('ssr');
      context.register('a', remote.factory, { props: {} });
      const input = new PassThrough();
      const output = extender.processStream(input);
      let text = '';
      output.on('data', (chunk: Buffer) => {
        text += chunk.toString();
      });
      const done = once(output, 'end');
      input.end('<main><div id="a"></div></main>' + MODERN_SHELL_MARKER);
      remote.write('<p>server content</p>');
      remote.end();
      await done;
      expect(text).toContain('server content');
      expect(text).toContain('"type":"done"');
    });
  }
  it('executes Node providers with request context and interleaves completed fragments', async () => {
    const { extender, context } = createExtender();
    const a = producer('A');
    const b = producer('B');
    context.register('a', a.factory, { props: { page: 1 } });
    context.register('b', b.factory, { props: {} });
    const bootstrap = extender.getStyleTags();
    expect(bootstrap).toContain('nonce="test-nonce"');
    expect(bootstrap).toContain('"instanceIds":["a","b"]');
    const input = new PassThrough();
    const output = extender.processStream(input);
    let text = '';
    output.on('data', (chunk: Buffer) => {
      text += chunk.toString();
    });
    const done = once(output, 'end');
    input.end(
      '<main><div id="a"></div><div id="b"></div></main>' + MODERN_SHELL_MARKER,
    );
    a.write('<section>A shell</section>');
    b.write('<section>B shell</section>');
    await until(() => text.includes('A shell') && text.includes('B shell'));
    expect(text).not.toContain('"type":"done"');
    expect(a.request!.headers!.cookie).toBe('user=a');
    expect(a.request!.nonce).toBe('test-nonce');
    expect(a.request!.props).toEqual({ page: 1 });
    expect(a.request!.identifierPrefix).not.toBe(b.request!.identifierPrefix);
    a.end();
    await until(() => text.includes('"snapshot":{"value":"A"}'));
    expect(text).not.toContain('"snapshot":{"value":"B"}');
    b.end();
    await done;
    expect(text.indexOf('<main>')).toBeLessThan(text.indexOf('.accept.apply'));
    expect(text.match(/"type":"done"/g)).toHaveLength(2);
    expect(text).toContain(
      '<script nonce="test-nonce">window.__MF_BRIDGE_SSR__',
    );
  });

  it('composes real HTTP React output and deferred frames without loading a Host Node expose', async () => {
    rs.mocked(loadRemote).mockClear();
    const revision = 'service-only-build';
    let release!: () => void;
    let resolved = false;
    const pending = new Promise<void>((resolve) => {
      release = () => {
        resolved = true;
        resolve();
      };
    });
    let updates!: ReadableStreamDefaultController<unknown>;
    let request: BridgeSSRRequest | undefined;
    let remoteRendering: ReturnType<typeof renderToPipeableStream> | undefined;
    const handler = createBridgeServiceHandler({
      revision,
      async render(info) {
        request = info;
        const stream = new PassThrough();
        const shellMarker = `${info.identifierPrefix}shell`;
        function DeferredContent() {
          if (!resolved) throw pending;
          return React.createElement(
            'button',
            null,
            'Service deferred content',
          );
        }
        remoteRendering = renderToPipeableStream(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('h2', null, 'Service shell'),
            React.createElement(
              React.Suspense,
              { fallback: React.createElement('p', null, 'Service pending') },
              React.createElement(DeferredContent),
            ),
            React.createElement('template', { id: shellMarker }),
          ),
          {
            identifierPrefix: info.identifierPrefix,
            onShellReady() {
              remoteRendering!.pipe(stream);
            },
          },
        );
        return {
          revision,
          stream: Readable.toWeb(stream) as ReadableStream<Uint8Array>,
          snapshot: pending.then(() => ({ complete: true })),
          // Exercise the opaque hydration contract; Modern owns the actual data codec.
          hydration: {
            shellMarker,
            snapshot: Promise.resolve({ pending: 'activity' }),
            updates: new ReadableStream({
              start(controller) {
                updates = controller;
              },
            }),
          },
          abort: (reason) => remoteRendering!.abort(reason),
        };
      },
    });
    const server = createServer(async (incoming, outgoing) => {
      try {
        const response = await handler(
          new Request(`http://127.0.0.1${incoming.url}`, {
            method: incoming.method,
            headers: incoming.headers as HeadersInit,
            body: Readable.toWeb(incoming),
            duplex: 'half',
          } as RequestInit),
        );
        outgoing.writeHead(
          response.status,
          Object.fromEntries(response.headers),
        );
        Readable.fromWeb(
          response.body as Parameters<typeof Readable.fromWeb>[0],
        ).pipe(outgoing);
      } catch (error) {
        outgoing.destroy(error as Error);
      }
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const { extender } = createExtender(5000, undefined, {
      'service/app': {
        url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/render`,
        revision,
        // No localFallback and no usable Host Node artifact.
      },
    });
    const Remote = createRemoteAppComponent({
      loader: () => loadBridgeRemote('service/app'),
      loading: React.createElement('p', null, 'Remote module loading'),
      fallback: () => null,
    });
    const input = new PassThrough();
    const output = extender.processStream(input);
    let text = '';
    let shellReady!: () => void;
    const ready = new Promise<void>((resolve) => {
      shellReady = resolve;
    });
    output.on('data', (chunk: Buffer) => {
      text += chunk.toString();
      if (text.includes('"type":"ready"')) shellReady();
    });
    const done = once(output, 'end');
    const hostRendering = renderToPipeableStream(
      extender.modifyRootElement(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(Remote),
          MODERN_SHELL_TEXT,
        ),
      ),
      {
        identifierPrefix: 'modern-js-',
        onShellReady() {
          hostRendering.pipe(input);
        },
      },
    );
    try {
      await Promise.race([
        ready,
        done.then(() => {
          throw Error('Host ended before the service shell was ready');
        }),
      ]);
      expect(request?.moduleName).toBe('service/app');
      expect(text).toContain('Service shell');
      expect(text).toContain('Service pending');
      expect(text).not.toContain('Service deferred content');
      expect(text).not.toContain('"type":"done"');
      expect(loadRemote).not.toHaveBeenCalled();
      updates.enqueue({ id: 'activity', value: 'loaded' });
      updates.close();
      release();
      await done;
      expect(text).toContain('Service deferred content');
      expect(text).toContain(
        '"type":"update","value":{"id":"activity","value":"loaded"}',
      );
      expect(text).toContain('"type":"done"');
      expect(text).not.toContain('"type":"error"');
      expect(text.indexOf('"type":"ready"')).toBeLessThan(
        text.indexOf('"type":"update"'),
      );
      expect(loadRemote).not.toHaveBeenCalled();
    } finally {
      hostRendering.abort();
      remoteRendering?.abort();
      output.destroy();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('deduplicates known CSS in the head and transports late CSS before that instance HTML', async () => {
    const { extender, context } = createExtender();
    const a = producer('A');
    const b = producer('B');
    const shared = 'https://cdn.example/shared.css?v=1&theme=light';
    context.register('a', a.factory, { props: {} });
    context.register('b', b.factory, { props: {} });
    context.registerStyles!('a', [shared, shared]);
    context.registerStyles!('b', [shared]);
    const head = extender.getStyleTags();
    expect(head.match(/rel="stylesheet"/g)).toHaveLength(1);
    expect(head).toContain(
      'href="https://cdn.example/shared.css?v=1&amp;theme=light" nonce="test-nonce"',
    );
    expect(head.indexOf('<link')).toBeLessThan(head.indexOf('<script'));
    // The head has already been generated; the meta frame is the fallback path
    // for dependencies discovered by a later Host Suspense boundary.
    context.registerStyles!('b', [shared, 'https://cdn.example/late.css']);
    const input = new PassThrough();
    const output = extender.processStream(input);
    let text = '';
    output.on('data', (chunk: Buffer) => {
      text += chunk.toString();
    });
    const done = once(output, 'end');
    input.end(
      '<main><div id="a"></div><div id="b"></div></main>' + MODERN_SHELL_MARKER,
    );
    a.write('<p>A styled</p>');
    a.end();
    b.write('<p>B styled</p>');
    b.end();
    await done;
    expect(text).toContain(
      '"stylesheets":["https://cdn.example/shared.css?v=1&theme=light","https://cdn.example/late.css"]',
    );
    expect(text.indexOf('https://cdn.example/late.css')).toBeLessThan(
      text.indexOf('B styled'),
    );
  });

  it('includes applications discovered after the Host shell', async () => {
    const { extender, context } = createExtender();
    const input = new PassThrough();
    const output = extender.processStream(input);
    let text = '';
    output.on('data', (chunk: Buffer) => {
      text += chunk.toString();
    });
    const done = once(output, 'end');
    input.write('<main>Host</main>' + MODERN_SHELL_MARKER);
    await until(() => text.includes('Host'));
    const late = producer('late');
    context.register('late', late.factory, { props: {} });
    late.write('<p>late application</p>');
    late.end();
    input.end('<div hidden id="host-S:0"><div id="late"></div></div>');
    await done;
    expect(text).toContain('late application');
    expect(text).toContain('"snapshot":{"value":"late"}');
  });

  it('bounds a stalled producer stream even if its abort callback does not close it', async () => {
    const { extender, context } = createExtender(20);
    const remote = producer('stalled');
    context.register('a', remote.factory, { props: {} });
    const input = new PassThrough();
    const output = extender.processStream(input);
    let text = '';
    output.on('data', (chunk: Buffer) => {
      text += chunk.toString();
    });
    const done = once(output, 'end');
    input.end('<main></main>' + MODERN_SHELL_MARKER);
    await done;
    expect(text).toContain('"type":"error"');
    expect(text).not.toContain('"type":"done"');
    expect(remote.aborts).toBeGreaterThan(0);
  });
});

describe('Bridge lazy MF module failures', () => {
  for (const mode of ['reject', 'stall'] as const) {
    it(`publishes a CSR failure when the Node loader ${mode}s before the wrapper exists`, async () => {
      const { extender } = createExtender(30);
      let loads = 0;
      const Remote = createRemoteAppComponent({
        loader: () => {
          loads++;
          return mode === 'reject'
            ? Promise.reject(Error('MF Node entry unavailable'))
            : new Promise<never>(() => {});
        },
        loading: React.createElement('p', null, 'Remote module loading'),
        fallback: () => null,
      });
      const input = new PassThrough();
      const output = extender.processStream(input);
      let text = '';
      let bootstrap = '';
      const failure = new Promise<void>((resolve) => {
        output.on('data', (chunk: Buffer) => {
          text += chunk.toString();
          if (text.includes('"type":"error"')) resolve();
        });
      });
      const rendering = renderToPipeableStream(
        extender.modifyRootElement(
          React.createElement(
            React.Fragment,
            null,
            React.createElement(Remote),
            MODERN_SHELL_TEXT,
          ),
        ),
        {
          onShellReady() {
            bootstrap = extender.getStyleTags();
            rendering.pipe(input);
          },
          onError() {},
        },
      );
      try {
        await failure;
        expect(loads).toBe(1);
        expect(bootstrap).toMatch(/"instanceIds":\["mf-bridge-/);
        expect(text).toContain('Remote module loading');
        expect(text).toContain('"type":"error"');
        expect(text).not.toContain('"type":"done"');
      } finally {
        rendering.abort();
        output.destroy();
      }
    });
  }

  it('waits for the resolved wrapper params while sharing a single preloaded job', async () => {
    const { extender, context } = createExtender();
    const remote = producer('ready');
    context.register(
      'a',
      async () => remote.factory(),
      { props: { value: 'initial' } },
      { deferRender: true },
    );
    const input = new PassThrough();
    const output = extender.processStream(input);
    let text = '';
    output.on('data', (chunk: Buffer) => {
      text += chunk.toString();
    });
    const done = once(output, 'end');
    input.write('<main></main>' + MODERN_SHELL_MARKER);
    await until(() => text.includes('<main>'));
    expect(remote.request).toBeUndefined();
    context.register('a', remote.factory, {
      basename: '/actual-route',
      props: { value: 'resolved' },
    });
    remote.write('<p>ready</p>');
    remote.end();
    input.end();
    await done;
    expect(remote.request!.basename).toBe('/actual-route');
    expect(remote.request!.props).toEqual({ value: 'resolved' });
    expect(text.match(/"type":"meta"/g)).toHaveLength(1);
    expect(text.match(/"type":"done"/g)).toHaveLength(1);
  });
});
