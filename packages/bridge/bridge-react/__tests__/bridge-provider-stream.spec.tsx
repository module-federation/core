/** @jest-environment node */
import React, { Suspense } from 'react';
import { PassThrough, Readable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { createBridgeComponent } from '../src/server';
import { federationRuntime } from '../src/provider/plugin';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessageResult,
} from '../src/types';

// The server entry must not evaluate a browser renderer, even when a consumer
// only imports the producer factory from a combined application bundle.
jest.mock('react-dom/client', () => {
  throw new Error('The Node provider imported react-dom/client');
});

const request = (props: Record<string, unknown> = {}): BridgeSSRRequest => ({
  moduleName: 'inventory/App',
  instanceId: 'inventory-1',
  identifierPrefix: 'inventory-1-',
  basename: '/inventory',
  url: 'http://localhost/inventory?delay=2000',
  props,
  signal: new AbortController().signal,
});

afterEach(() => {
  federationRuntime.instance = null;
});

it('renders the supplied root as a real stream without a DOM and retains the framework protocol', async () => {
  let release!: () => void;
  let ready = false;
  const pending = new Promise<void>((resolve) => {
    release = () => {
      ready = true;
      resolve();
    };
  });
  const Detail = () => {
    if (!ready) throw pending;
    return <button>late inventory</button>;
  };
  const Root = ({ title, injected }: { title: string; injected?: string }) => (
    <main>
      <h1 id={React.useId()}>{title + injected}</h1>
      <Suspense fallback={<p>loading inventory</p>}>
        <Detail />
      </Suspense>
    </main>
  );
  const before = jest.fn(() => ({ extraProps: { injected: ' from plugin' } }));
  const after = jest.fn();
  federationRuntime.instance = {
    bridgeHook: {
      lifecycle: {
        beforeBridgeRender: { emit: before },
        afterBridgeRender: { emit: after },
      },
    },
  } as any;

  const snapshot = pending.then(() => ({ loaderData: 'complete' }));
  let frameworkResult!: BridgeSSRResult;
  const renderStream = jest.fn(async (app, info): Promise<BridgeSSRResult> => {
    const output = new PassThrough();
    const react = renderToPipeableStream(app, {
      identifierPrefix: info.identifierPrefix,
      onShellReady() {
        react.pipe(output);
      },
    });
    frameworkResult = {
      stream: Readable.toWeb(output) as ReadableStream<Uint8Array>,
      snapshot,
      abort: react.abort,
      stylesheets: ['/inventory.css'],
    };
    return frameworkResult;
  });
  const provider = createBridgeComponent({
    rootComponent: Root,
    renderStream,
  })();
  const info = request({ title: 'Stock' });
  const result = (await provider.renderStream!(info)) as BridgeSSRMessageResult;
  expect(result.protocol).toBe('mf-bridge-producer/1');
  expect(renderStream.mock.calls[0][1]).toEqual({
    ...info,
    rootComponent: Root,
  });
  expect(before).toHaveBeenCalledWith(
    info,
    expect.objectContaining({ side: 'producer' }),
  );
  expect(after.mock.calls[0][1].context).toBe(before.mock.calls[0][1]);

  const reader = result.messages.getReader();
  const first = (await reader.read()).value!;
  expect(first.type).toBe('html');
  const shell = first.type === 'html' ? first.html : '';
  expect(shell).toContain('Stock from plugin');
  expect(shell).toContain('inventory-1-');
  expect(shell).toContain('loading inventory');
  expect(shell).not.toContain('late inventory');
  expect(ready).toBe(false);

  release();
  let rest = '';
  let restored: unknown;
  for (
    let frame = await reader.read();
    !frame.done;
    frame = await reader.read()
  ) {
    if (frame.value.type === 'html') rest += frame.value.html;
    if (frame.value.type === 'data') restored = frame.value.snapshot;
  }
  expect(rest).toContain('late inventory');
  expect(restored).toEqual({ loaderData: 'complete' });
});

it('does not advertise stream support for an existing CSR provider', () => {
  const provider = createBridgeComponent({ rootComponent: () => <div /> })();
  expect('renderStream' in provider).toBe(false);
});

it('does not start rendering an already cancelled request', async () => {
  const renderStream = jest.fn();
  const provider = createBridgeComponent({
    rootComponent: () => <div />,
    renderStream,
  })();
  const controller = new AbortController();
  const reason = new Error('host disconnected');
  controller.abort(reason);
  await expect(
    provider.renderStream!({ ...request(), signal: controller.signal }),
  ).rejects.toBe(reason);
  expect(renderStream).not.toHaveBeenCalled();
});

it('propagates a renderer failure without a completion event', async () => {
  const after = jest.fn();
  federationRuntime.instance = {
    bridgeHook: { lifecycle: { afterBridgeRender: { emit: after } } },
  } as any;
  const error = new Error('loader failed');
  const provider = createBridgeComponent({
    rootComponent: () => <div />,
    renderStream: async () => {
      throw error;
    },
  })();
  await expect(provider.renderStream!(request())).rejects.toBe(error);
  expect(after).not.toHaveBeenCalled();
});
