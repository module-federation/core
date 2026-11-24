/** @jest-environment node */
import React from 'react';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server.node';
import { createReactRemote } from '../src/reactRemote.node';
import { BridgeSSRContext } from '../src/ssr';
import { createBridgeSSRController } from '../src/ssr-stream/compositor.server';
import { snapshotRuntime } from './reactRemote-runtime-utils';
import type { BridgeSSRRequest } from '../src/types';

const marker = '<span id="shell-end"></span>';
function streamHost(element: React.ReactElement, timeoutMs = 1000) {
  const controller = createBridgeSSRController({
    request: new Request('https://host.test/inventory/detail/42'),
    shellEndMarker: marker,
    identifierPrefix: 'host-',
    timeoutMs,
  });
  const input = new PassThrough();
  let shellReady!: () => void;
  const shell = new Promise<void>((resolve) => {
    shellReady = resolve;
  });
  let response = '';
  const result = new Promise<string>((resolve, reject) => {
    const output = controller.processStream(input);
    output.on('data', (chunk) => {
      response += chunk.toString();
    });
    output.on('end', () => resolve(response));
    output.on('close', () => resolve(response));
    output.on('error', reject);
  });
  const react = renderToPipeableStream(
    <BridgeSSRContext.Provider value={controller.context}>
      {element}
      <span id="shell-end" />
    </BridgeSSRContext.Provider>,
    {
      identifierPrefix: 'host-',
      onShellReady() {
        react.pipe(input);
        shellReady();
      },
      onError() {},
    },
  );
  return { result, controller, react, shell };
}
function provider() {
  const renderStream = jest.fn(async (info: BridgeSSRRequest) => ({
    stream: new ReadableStream<Uint8Array>({
      start(target) {
        target.enqueue(
          new TextEncoder().encode(`<strong>${info.props.title}</strong>`),
        );
        target.close();
      },
    }),
    snapshot: Promise.resolve({ loaderData: { title: info.props.title } }),
    abort: jest.fn(),
  }));
  const factory = jest.fn(() => ({
    render: jest.fn(),
    destroy: jest.fn(),
    renderStream,
  }));
  return { factory, renderStream };
}

it.each(['loader', 'preloaded'] as const)(
  'streams real Bridge content for %s input with one factory and request-local mount props',
  async (form) => {
    const { factory, renderStream } = provider();
    const runtime = snapshotRuntime({
      module: { default: factory },
      render: 'bridge',
    });
    const preloaded =
      form === 'preloaded'
        ? await runtime.instance.loadRemote<{ default: typeof factory }>(
            'alias/Card',
          )
        : undefined;
    const remote =
      form === 'loader'
        ? () => runtime.instance.loadRemote('alias/Card')
        : () => preloaded!.default;
    const Remote = createReactRemote({
      remote,
      instance: runtime.instance,
      basename: '/inventory',
    });
    const { result } = streamHost(<Remote title="server content" />);
    const body = await result;
    expect(body).toContain('data-mf-bridge-ssr=""');
    expect(body).toContain('server content');
    expect(body).toContain('"type":"html"');
    expect(body).toContain('"type":"done"');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(renderStream).toHaveBeenCalledTimes(1);
    expect(renderStream.mock.calls[0][0]).toMatchObject({
      basename: '/inventory',
      url: 'https://host.test/inventory/detail/42',
      props: { title: 'server content' },
    });
  },
);

it('finishes naturally when an unclassified loader never resolves', async () => {
  const runtime = snapshotRuntime({ module: {}, render: 'bridge' });
  const Remote = createReactRemote({
    instance: runtime.instance,
    remote: () => new Promise<never>(() => {}),
    loading: <p>pending</p>,
    fallback: ({ error }) => <p>{error.message}</p>,
  });
  const { result } = streamHost(<Remote />, 25);
  const body = await result;
  expect(body).toContain('Bridge SSR timed out');
  expect(body).not.toContain('"type":"meta"');
  expect(body).not.toContain('"type":"error"');
});

it('keeps the Host response open while a delayed function is still unclassified', async () => {
  const { factory, renderStream } = provider();
  const runtime = snapshotRuntime({
    module: { default: factory },
    render: 'bridge',
  });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const Remote = createReactRemote({
    instance: runtime.instance,
    remote: async () => {
      await pending;
      return runtime.instance.loadRemote('alias/Card');
    },
    loading: <p>awaiting remote type</p>,
  });
  const { result, shell } = streamHost(<Remote title="late SSR body" />);
  let ended = false;
  void result.then(() => {
    ended = true;
  });
  await shell;
  await new Promise((resolve) => setImmediate(resolve));
  expect(ended).toBe(false);
  expect(factory).not.toHaveBeenCalled();
  release();
  const body = await result;
  expect(body).toContain('awaiting remote type');
  const frames = Array.from(
    body.matchAll(
      /\.accept\.apply\(window\.__MF_BRIDGE_SSR__,(\[.*?\])\)<\/script>/g,
    ),
    ([, frame]) => JSON.parse(frame)[1],
  );
  expect(frames).toContainEqual({
    type: 'html',
    html: '<strong>late SSR body</strong>',
  });
  expect(body).toContain('"loaderData":{"title":"late SSR body"}');
  expect(body).toContain('"type":"done"');
  expect(renderStream).toHaveBeenCalledTimes(1);
});

it('does not instantiate a Bridge provider after request cancellation during classification', async () => {
  const { factory } = provider();
  const runtime = snapshotRuntime({
    module: { default: factory },
    render: 'bridge',
  });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const Remote = createReactRemote({
    instance: runtime.instance,
    remote: async () => {
      await pending;
      return runtime.instance.loadRemote('alias/Card');
    },
    fallback: ({ error }) => <p>{error.message}</p>,
  });
  const { controller, result, shell, react } = streamHost(<Remote />);
  await shell;
  controller.abort(new Error('request cancelled'));
  react.abort();
  expect(await result).not.toContain('"type":"html"');
  release();
  await new Promise((resolve) => setImmediate(resolve));
  expect(factory).not.toHaveBeenCalled();
});

it('does not start a timed out loader after its late completion', async () => {
  const { factory, renderStream } = provider();
  const runtime = snapshotRuntime({
    module: { default: factory },
    render: 'bridge',
  });
  let release!: (value: unknown) => void;
  const Remote = createReactRemote({
    instance: runtime.instance,
    remote: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
    fallback: () => <p>timed out</p>,
  });
  await streamHost(<Remote />, 25).result;
  release(await runtime.instance.loadRemote('alias/Card'));
  await new Promise((resolve) => setImmediate(resolve));
  expect(factory).not.toHaveBeenCalled();
  expect(renderStream).not.toHaveBeenCalled();
});

it('preserves CSR-only providers and noSSR without starting an application stream', async () => {
  const factory = jest.fn(() => ({ render: jest.fn(), destroy: jest.fn() }));
  const runtime = snapshotRuntime({
    module: { default: factory },
    render: 'bridge',
  });
  const Remote = createReactRemote({
    remote: () => runtime.instance.loadRemote('alias/Card'),
    instance: runtime.instance,
    loading: <p>CSR</p>,
  });
  const body = await streamHost(<Remote />).result;
  expect(body).toContain('CSR');
  expect(body).not.toContain('data-mf-bridge-ssr');
  const ClientOnly = createReactRemote({
    remote: () => runtime.instance.loadRemote('alias/Card'),
    instance: runtime.instance,
    noSSR: true,
    loading: <p>client only</p>,
  });
  expect(await streamHost(<ClientOnly />).result).toContain('client only');
  expect(factory).toHaveBeenCalledTimes(1);
});
