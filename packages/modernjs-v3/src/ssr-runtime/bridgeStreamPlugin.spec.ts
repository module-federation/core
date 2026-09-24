import { describe, expect, it } from '@rstest/core';
import { PassThrough } from 'node:stream';
import React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { createRemoteAppComponent } from '@module-federation/bridge-react/base';
import { once } from 'node:events';
import { bridgeStreamPlugin } from './bridgeStreamPlugin.node';
import type {
  BridgeSSRContextValue,
  BridgeSSRRequest,
} from '@module-federation/bridge-react/ssr';

const MODERN_SHELL_TEXT = '<!--<?- SHELL_STREAM_END ?>-->';
const MODERN_SHELL_MARKER = '&lt;!--&lt;?- SHELL_STREAM_END ?&gt;--&gt;';

function createExtender(
  timeoutMs = 1000,
  url = 'https://host.example/dashboard?tab=goods',
) {
  let factory: (() => any) | undefined;
  const plugin = bridgeStreamPlugin({ timeoutMs });
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
