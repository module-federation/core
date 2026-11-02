import React from 'react';
import { act, fireEvent } from '@testing-library/react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { createBridgeComponent } from '../src/v18';
import { createBridgeComponent as createServerBridgeComponent } from '../src/server';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { TextEncoder } from 'node:util';
import { federationRuntime } from '../src/provider/plugin';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
  RenderParams,
} from '../src/types';

afterEach(() => {
  federationRuntime.instance = null;
  document.body.innerHTML = '';
});

it('hydrates exactly the streamed producer tree and keeps its root through updates and destruction', async () => {
  const observedProps: Record<string, unknown>[] = [];
  const App = (props: { label: string; injected?: string }) => {
    observedProps.push(props);
    const [count, setCount] = React.useState(0);
    return (
      <button id={React.useId()} onClick={() => setCount(count + 1)}>
        {props.label}
        {props.injected}: {count}
      </button>
    );
  };
  const extraProps = { injected: ' from plugin' };
  federationRuntime.instance = {
    bridgeHook: {
      lifecycle: { beforeBridgeRender: { emit: () => ({ extraProps }) } },
    },
  } as any;
  const roots = new Map<HTMLElement, Root>();
  const render = jest.fn(
    async (
      app: React.ReactElement,
      container?: HTMLElement | string,
      _info?: RenderParams,
    ) => {
      const dom = container as HTMLElement;
      let root = roots.get(dom);
      if (!root) {
        root = createRoot(dom);
        roots.set(dom, root);
      }
      root.render(app);
      return root;
    },
  );
  const hydrate = jest.fn(async (app, dom, info) => {
    const root = hydrateRoot(dom, app, info.rootOptions);
    roots.set(dom, root);
    return root;
  });
  global.ReadableStream = NodeReadableStream as typeof ReadableStream;
  let html = '';
  const renderStream = jest.fn(async (app, info): Promise<BridgeSSRResult> => {
    html = renderToString(app, { identifierPrefix: info.identifierPrefix });
    return {
      stream: new NodeReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(html));
          controller.close();
        },
      }) as ReadableStream<Uint8Array>,
      snapshot: Promise.resolve({}),
      abort() {},
    };
  });
  const provider = createBridgeComponent({
    rootComponent: App,
    render,
    hydrate,
  })();
  const request: BridgeSSRRequest = {
    instanceId: 'inventory-1',
    identifierPrefix: 'inventory-1-',
    url: 'http://localhost/inventory',
    basename: '/inventory',
    props: { label: 'Stock', url: '/business-url' },
    signal: new AbortController().signal,
  };
  const serverProvider = createServerBridgeComponent({
    rootComponent: App,
    renderStream,
  })();
  const result = await serverProvider.renderStream!(request);
  if (!('messages' in result)) throw Error('Expected normalized Node messages');
  const reader = result.messages.getReader();
  while (!(await reader.read()).done) {}
  reader.releaseLock();
  const dom = document.createElement('div');
  dom.innerHTML = html;
  document.body.appendChild(dom);
  const serverButton = dom.firstChild;
  const recover = jest.fn();
  const hydrationInfo = {
    dom,
    basename: '/inventory',
    label: 'Stock',
    snapshot: { router: true },
    updates: {},
    url: '/business-url',
    rootOptions: {
      identifierPrefix: request.identifierPrefix,
      onRecoverableError: recover,
    },
  };
  await act(async () => provider.hydrate(hydrationInfo as any));
  expect(dom.firstChild).toBe(serverButton);
  expect(provider.renderStream).toBeUndefined();
  expect(hydrate.mock.calls[0][2]).toEqual({
    ...hydrationInfo,
    rootComponent: App,
  });
  expect(
    observedProps.every(
      (props) =>
        !('snapshot' in props) &&
        !('updates' in props) &&
        !('rootOptions' in props),
    ),
  ).toBe(true);
  expect(observedProps.every((props) => props.url === '/business-url')).toBe(
    true,
  );
  fireEvent.click(dom.querySelector('button')!);
  expect(dom.textContent).toBe('Stock from plugin: 1');
  const updateInfo = { dom, basename: '/inventory', label: 'Available' };
  await act(async () => provider.render(updateInfo));
  expect(render.mock.calls[0][2]).toEqual({
    ...updateInfo,
    rootComponent: App,
  });
  expect(dom.firstChild).toBe(serverButton);
  expect(dom.textContent).toBe('Available from plugin: 1');
  expect(recover).not.toHaveBeenCalled();
  await act(async () => provider.destroy({ dom, moduleName: 'inventory/App' }));
  expect(dom.innerHTML).toBe('');
});

it('continues calling the custom renderer on every render and forwards its context', async () => {
  const root = { render: jest.fn(), unmount: jest.fn() };
  const render = jest.fn(() => root);
  const provider = createBridgeComponent({
    rootComponent: () => <div />,
    render,
  })();
  const dom = document.createElement('div');
  const first = { dom, value: 1 };
  const second = { dom, value: 2 };
  await provider.render(first);
  await provider.render(second);
  expect(render.mock.calls).toHaveLength(2);
  expect(render).toHaveBeenNthCalledWith(1, expect.anything(), dom, {
    ...first,
    rootComponent: expect.any(Function),
  });
  expect(render).toHaveBeenNthCalledWith(2, expect.anything(), dom, {
    ...second,
    rootComponent: expect.any(Function),
  });
  expect(root.render).not.toHaveBeenCalled();
  provider.destroy({ dom, moduleName: 'inventory/App' });
  expect(root.unmount).toHaveBeenCalledTimes(1);
});
