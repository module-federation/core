import { describe, expect, it, rstest } from '@rstest/core';
import { PassThrough } from 'node:stream';
import { once } from 'node:events';
import {
  createBridgeSSRController,
  type BridgeSSRControllerOptions,
} from './compositor.server';
import type {
  BridgeProviderInstance,
  BridgeSSRMessage,
  BridgeSSRRequest,
} from '../types';

const marker = '<template id="host-shell"></template>';
function setup(
  timeoutMs = 1000,
  signal?: AbortSignal,
  onError?: BridgeSSRControllerOptions['onError'],
) {
  return createBridgeSSRController({
    request: new Request('https://host.example/inventory/detail/42', {
      headers: { cookie: 'session=a' },
      signal,
    }),
    nonce: 'nonce-a',
    shellEndMarker: marker,
    identifierPrefix: 'host-',
    timeoutMs,
    onError,
  });
}
function producer() {
  let controller!: ReadableStreamDefaultController<BridgeSSRMessage>;
  let request: BridgeSSRRequest | undefined;
  let aborts = 0;
  const messages = new ReadableStream<BridgeSSRMessage>({
    start(value) {
      controller = value;
    },
  });
  const provider: BridgeProviderInstance = {
    render() {},
    destroy() {},
    async renderStream(info) {
      request = info;
      return {
        protocol: 'mf-bridge-producer/1',
        hydration: 'complete',
        messages,
        snapshot: Promise.resolve({ value: 'ready' }),
        abort() {
          aborts++;
        },
      };
    },
  };
  return {
    provider,
    html(html: string) {
      controller.enqueue({ type: 'html', html });
    },
    end() {
      controller.enqueue({ type: 'data', snapshot: { value: 'ready' } });
      controller.enqueue({ type: 'done' });
      controller.close();
    },
    get request() {
      return request;
    },
    get aborts() {
      return aborts;
    },
  };
}
function collect(
  controller: ReturnType<typeof setup>,
  input = new PassThrough(),
) {
  const output = controller.processStream(input);
  let html = '';
  output.on('data', (chunk: Buffer) => {
    html += chunk.toString();
  });
  return {
    input,
    output,
    done: once(output, 'end'),
    get html() {
      return html;
    },
  };
}
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('request-scoped Bridge composition', () => {
  it('keeps the response open after Host EOF while a reserved loader becomes a Bridge', async () => {
    const controller = setup();
    const slot = controller.context.reserve('a');
    const live = collect(controller);
    let ended = false;
    void live.done.then(() => {
      ended = true;
    });
    live.input.end('<main><div id="a"></div></main>' + marker);
    await tick();
    expect(ended).toBe(false);
    const remote = producer();
    slot.activate(() => remote.provider, {
      basename: '/inventory',
      props: { title: 'Stock' },
    });
    remote.html('<p>actual remote content</p>');
    remote.end();
    await live.done;
    expect(live.html).toContain('actual remote content');
    expect(live.html.indexOf('<main>')).toBeLessThan(
      live.html.indexOf('.accept.apply'),
    );
    expect(remote.request).toMatchObject({
      basename: '/inventory',
      url: 'https://host.example/inventory/detail/42',
      headers: { cookie: 'session=a' },
      nonce: 'nonce-a',
      props: { title: 'Stock' },
    });
  });

  it('includes a new application after the Host shell and before EOF', async () => {
    const controller = setup();
    const live = collect(controller);
    live.input.write('<main>Host</main>' + marker);
    await tick();
    const remote = producer();
    controller.context
      .reserve('late')
      .activate(() => remote.provider, { props: {} });
    remote.html('<p>late remote</p>');
    remote.end();
    live.input.end('<div id="late"></div>');
    await live.done;
    expect(live.html).toContain('late remote');
  });

  it('releases ordinary components and CSR-only providers without a browser session', async () => {
    const controller = setup();
    const component = controller.context.reserve('component');
    const csr = controller.context.reserve('csr');
    component.skip();
    csr.activate(() => ({ render() {}, destroy() {} }), { props: {} });
    const live = collect(controller);
    live.input.end('<p>ordinary component HTML</p>' + marker);
    await live.done;
    expect(live.html).toContain('ordinary component HTML');
    expect(live.html).not.toContain('.accept.apply');
    expect(controller.getBootstrap()).not.toContain('"instanceIds"');
  });

  it('rejects a stalled preparation on its deadline so the Host can finish naturally', async () => {
    const controller = setup(20);
    const slot = controller.context.reserve('unknown');
    const live = collect(controller);
    live.input.write('<main>Host</main>' + marker);
    const preparing = slot.wait(new Promise<never>(() => {}));
    await expect(preparing).rejects.toThrow('timed out');
    live.input.end('<p>loader fallback</p>');
    await live.done;
    expect(live.html).toContain('loader fallback');
    expect(live.html).not.toContain('.accept.apply');
  });

  it('times out a selected stream without relying on the provider to close its reader', async () => {
    const controller = setup(20);
    const remote = producer();
    controller.context
      .reserve('a')
      .activate(() => remote.provider, { props: {} });
    const live = collect(controller);
    live.input.end('<div id="a"></div>' + marker);
    await live.done;
    expect(live.html).toContain('"type":"error"');
    expect(live.html).not.toContain('"type":"done"');
    expect(remote.aborts).toBeGreaterThan(0);
  });

  it('reports the original producer failure only to the server diagnostic callback', async () => {
    const error = Error('loader failed with private upstream details');
    const onError = rstest.fn(() => {
      throw Error('diagnostic destination unavailable');
    });
    const controller = setup(1000, undefined, onError);
    controller.context.reserve('failed-app').activate(
      () => ({
        render() {},
        destroy() {},
        async renderStream() {
          throw error;
        },
      }),
      { props: {} },
    );
    const live = collect(controller);
    live.input.end('<div id="failed-app"></div>' + marker);
    await live.done;
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error, 'failed-app');
    expect(live.html).toContain('Bridge server rendering failed');
    expect(live.html).not.toContain(error.message);
    expect(live.html).not.toContain('diagnostic destination unavailable');
    expect(live.html).not.toContain('"type":"done"');
  });

  it('aborts every selected renderer when the response closes', async () => {
    const controller = setup();
    const a = producer();
    const b = producer();
    controller.context.reserve('a').activate(() => a.provider, { props: {} });
    controller.context.reserve('b').activate(() => b.provider, { props: {} });
    const live = collect(controller);
    live.input.write('<div id="a"></div><div id="b"></div>' + marker);
    await tick();
    const closed = once(live.output, 'close');
    live.output.destroy();
    await closed;
    expect(a.aborts).toBeGreaterThan(0);
    expect(b.aborts).toBeGreaterThan(0);
    expect(live.input.destroyed).toBe(true);
  });

  it('closes the response and preparations when the request signal is cancelled', async () => {
    const request = new AbortController();
    const controller = setup(1000, request.signal);
    const pending = controller.context.reserve('pending');
    const waiting = pending.wait(new Promise<never>(() => {}));
    const live = collect(controller);
    live.input.write('<main>Host</main>' + marker);
    const closed = once(live.output, 'close');
    const reason = Error('navigation cancelled');
    request.abort(reason);
    await closed;
    await expect(waiting).rejects.toBe(reason);
    expect(live.input.destroyed).toBe(true);
    expect(live.html).not.toContain('"type":"done"');
  });

  it('aborts a renderer result that resolves after its deadline', async () => {
    const controller = setup(20);
    let resolve!: (
      result: Awaited<
        ReturnType<NonNullable<BridgeProviderInstance['renderStream']>>
      >,
    ) => void;
    const rendered = new Promise<
      Awaited<ReturnType<NonNullable<BridgeProviderInstance['renderStream']>>>
    >((yes) => {
      resolve = yes;
    });
    let aborts = 0;
    controller.context.reserve('late').activate(
      () => ({
        render() {},
        destroy() {},
        renderStream: () => rendered,
      }),
      { props: {} },
    );
    const live = collect(controller);
    live.input.end('<div id="late"></div>' + marker);
    await live.done;
    resolve({
      stream: new ReadableStream<Uint8Array>(),
      snapshot: Promise.resolve({}),
      abort() {
        aborts++;
      },
    });
    await tick();
    expect(aborts).toBe(1);
    expect(live.html).toContain('"type":"error"');
    expect(live.html).not.toContain('"type":"done"');
  });
});
