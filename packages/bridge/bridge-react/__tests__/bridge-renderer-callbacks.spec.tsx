import React from 'react';
import { act, fireEvent } from '@testing-library/react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { createBridgeComponent } from '../src/v18';
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
  let html = '';
  const renderStream = jest.fn(async (app, info): Promise<BridgeSSRResult> => {
    html = renderToString(app, { identifierPrefix: info.identifierPrefix });
    return {
      stream: {} as ReadableStream<Uint8Array>,
      snapshot: Promise.resolve({}),
      abort() {},
    };
  });
  const provider = createBridgeComponent({
    rootComponent: App,
    render,
    hydrate,
    renderStream,
  })();
  const request: BridgeSSRRequest = {
    instanceId: 'inventory-1',
    identifierPrefix: 'inventory-1-',
    url: 'http://localhost/inventory',
    basename: '/inventory',
    props: { label: 'Stock', url: '/business-url' },
    signal: new AbortController().signal,
  };
  await provider.renderStream!(request);
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
  expect(hydrate.mock.calls[0][0].type).toBe(
    renderStream.mock.calls[0][0].type,
  );
  expect(hydrate.mock.calls[0][2]).toBe(hydrationInfo);
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
  expect(render.mock.calls[0][2]).toBe(updateInfo);
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
  expect(render).toHaveBeenNthCalledWith(1, expect.anything(), dom, first);
  expect(render).toHaveBeenNthCalledWith(2, expect.anything(), dom, second);
  expect(root.render).not.toHaveBeenCalled();
  provider.destroy({ dom, moduleName: 'inventory/App' });
  expect(root.unmount).toHaveBeenCalledTimes(1);
});
