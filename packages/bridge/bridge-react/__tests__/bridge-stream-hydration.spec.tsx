import React from 'react';
import { act, fireEvent } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { RemoteAppWrapper } from '../src/remote/RemoteAppWrapper';
import { createBridgeComponent } from '../src/v18';
import { createBridgeComponent as createServerBridgeComponent } from '../src/server';
import { RemoteAppWrapper as ServerRemoteAppWrapper } from '../src/remote/RemoteAppWrapper.server';
import { TextEncoder } from 'node:util';
import { bridgeStreamBootstrap } from '../src/ssr-stream/bootstrap';
import type { BridgeStreamBrowserRuntime } from '../src/ssr-stream/protocol';
import type { BridgeProviderInstance, BridgeSSRRequest } from '../src/types';

const roots: Root[] = [];
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
beforeEach(() => {
  global.ReadableStream = NodeReadableStream as typeof ReadableStream;
});
afterEach(async () => {
  await act(async () => {
    roots.splice(0).forEach((root) => root.unmount());
    await tick();
  });
  window.dispatchEvent(new Event('pagehide'));
  delete window.__MF_BRIDGE_SSR__;
  document.body.innerHTML = '';
});

class Boundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error ? (
      <p role="alert">{this.state.error.message}</p>
    ) : (
      this.props.children
    );
  }
}

async function setup(
  id = 'remote-a',
  hydrationFailure?: Error,
  observeUpdates: boolean | 'cancel-on-abort' = false,
) {
  const Counter = ({ title }: { title: string }) => {
    const [count, setCount] = React.useState(0);
    return (
      <button onClick={() => setCount(count + 1)}>
        {title}: {count}
      </button>
    );
  };
  let html = '';
  const makeProvider = createBridgeComponent({ rootComponent: Counter });
  const makeServerProvider = createServerBridgeComponent({
    rootComponent: Counter,
    renderStream: async (element) => {
      html = renderToString(element);
      return {
        stream: new NodeReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(html));
            controller.close();
          },
        }) as ReadableStream<Uint8Array>,
        snapshot: Promise.resolve({ loaderData: { value: 'restored' } }),
        abort() {},
      };
    },
  });
  const server = makeServerProvider();
  const rendered = await server.renderStream!({
    instanceId: id,
    identifierPrefix: `${id}-`,
    url: 'https://host.example/inventory',
    basename: '/inventory',
    props: { title: 'initial' },
    signal: new AbortController().signal,
  } as BridgeSSRRequest);
  if ('messages' in rendered) {
    const reader = rendered.messages.getReader();
    while (!(await reader.read()).done) {}
    reader.releaseLock();
  }
  const hydrate = jest.fn();
  const render = jest.fn();
  const destroy = jest.fn();
  const updateErrors = jest.fn();
  const factory = jest.fn((): BridgeProviderInstance => {
    const provider = makeProvider();
    return {
      ...provider,
      async hydrate(info) {
        hydrate(info);
        if (hydrationFailure) throw hydrationFailure;
        if (observeUpdates && info.updates) {
          const reader = info.updates.getReader();
          if (observeUpdates === 'cancel-on-abort') {
            info.signal?.addEventListener(
              'abort',
              () => {
                void reader.cancel(info.signal?.reason).catch(() => {});
              },
              { once: true },
            );
          }
          // Framework restoration can report a failed deferred hydration after
          // session release rejects the pending data stream.
          void reader
            .read()
            .catch((error) => {
              updateErrors(error);
              info.rootOptions?.onRecoverableError?.(error);
            })
            .finally(() => reader.releaseLock());
        }
        await provider.hydrate!(info);
      },
      async render(info) {
        render(info);
        await provider.render(info);
      },
      destroy(info) {
        destroy(info);
        provider.destroy(info);
      },
    };
  });
  const view = (title: string, serverProvider?: BridgeProviderInstance) => {
    const Wrapper = serverProvider ? ServerRemoteAppWrapper : RemoteAppWrapper;
    return (
      <Boundary>
        <Wrapper
          moduleName="shop/App"
          ssrInstanceId={id}
          ssrProvider={serverProvider}
          providerInfo={factory}
          routing={{ basename: '/inventory' }}
          remoteProps={{ title }}
          loading={<p>loading</p>}
        />
      </Boundary>
    );
  };
  const host = document.createElement('div');
  document.body.appendChild(host);
  host.innerHTML = renderToString(view('initial', server));
  bridgeStreamBootstrap({ timeoutMs: 1000 });
  const runtime = window.__MF_BRIDGE_SSR__ as BridgeStreamBrowserRuntime;
  const sendHTML = () => {
    runtime.accept(id, {
      type: 'meta',
      protocol: 'mf-bridge/1',
      identifierPrefix: `${id}-`,
      hydration: 'progressive',
    });
    runtime.accept(id, { type: 'html', html });
    runtime.accept(id, {
      type: 'ready',
      snapshot: { loaderData: { value: 'restored' } },
    });
  };
  const mount = async () => {
    let root!: Root;
    await act(async () => {
      root = hydrateRoot(host, view('initial'));
      roots.push(root);
      await tick();
    });
    return root;
  };
  return {
    id,
    host,
    runtime,
    factory,
    hydrate,
    render,
    destroy,
    updateErrors,
    view,
    sendHTML,
    mount,
  };
}

it('reuses streamed DOM, one provider and the hydrated root across interaction and props updates', async () => {
  const live = await setup();
  live.sendHTML();
  const button = live.host.querySelector('button')!;
  const root = await live.mount();
  expect(live.host.querySelector('button')).toBe(button);
  expect(live.factory).toHaveBeenCalledTimes(1);
  expect(live.hydrate).toHaveBeenCalledTimes(1);
  expect(live.hydrate.mock.calls[0][0].snapshot).toEqual({
    loaderData: { value: 'restored' },
  });
  expect(live.render).not.toHaveBeenCalled();
  fireEvent.click(button);
  expect(button.textContent).toBe('initial: 1');
  await act(async () => {
    root.render(live.view('updated'));
    await tick();
  });
  expect(live.host.querySelector('button')).toBe(button);
  expect(button.textContent).toBe('updated: 1');
  expect(live.factory).toHaveBeenCalledTimes(1);
  expect(live.hydrate).toHaveBeenCalledTimes(1);
  live.runtime.accept(live.id, { type: 'done' });
  await act(async () => {
    root.unmount();
    roots.splice(roots.indexOf(root), 1);
    await tick();
  });
  expect(live.destroy).toHaveBeenCalledTimes(1);
  expect(live.host.querySelector('button')).toBeNull();
});

it('waits for late metadata after Host hydration instead of starting a CSR root', async () => {
  const live = await setup();
  await live.mount();
  expect(live.factory).toHaveBeenCalledTimes(1);
  expect(live.hydrate).not.toHaveBeenCalled();
  expect(live.render).not.toHaveBeenCalled();
  expect(live.host.textContent).toBe('loading');
  let button!: HTMLButtonElement;
  await act(async () => {
    live.sendHTML();
    button = live.host.querySelector('button')!;
    await tick();
  });
  expect(live.host.querySelector('button')).toBe(button);
  expect(live.hydrate).toHaveBeenCalledTimes(1);
  fireEvent.click(button);
  expect(button.textContent).toBe('initial: 1');
  live.runtime.accept(live.id, { type: 'done' });
});

it('does not hydrate or insert late output after unmounting a pending session', async () => {
  const live = await setup();
  const root = await live.mount();
  await act(async () => {
    root.unmount();
    roots.splice(roots.indexOf(root), 1);
    await tick();
  });
  live.sendHTML();
  live.runtime.accept(live.id, { type: 'done' });
  await tick();
  expect(live.hydrate).not.toHaveBeenCalled();
  expect(live.render).not.toHaveBeenCalled();
  expect(live.destroy).toHaveBeenCalledTimes(1);
  expect(live.host.innerHTML).toBe('');
});

it('requests document recovery when the claimed provider rejects hydration', async () => {
  const failure = new Error('Cannot restore the remote loader snapshot');
  const live = await setup('failed-remote', failure);
  const fallback = jest
    .spyOn(live.runtime, 'fallback')
    .mockImplementation(() => {});
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  try {
    live.sendHTML();
    await live.mount();
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledWith(failure);
    expect(live.host.querySelector('[role="alert"]')?.textContent).toBe(
      failure.message,
    );
    expect(live.hydrate).toHaveBeenCalledTimes(1);
    expect(live.render).not.toHaveBeenCalled();
    expect(live.destroy).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls.flat().join(' ')).toContain(failure.message);
  } finally {
    consoleError.mockRestore();
    fallback.mockRestore();
  }
});

it('does not recover the document when releasing a mounted session rejects a pending hydration update', async () => {
  const live = await setup('unmounted-stream', undefined, true);
  const fallback = jest
    .spyOn(live.runtime, 'fallback')
    .mockImplementation(() => {});
  try {
    live.sendHTML();
    const root = await live.mount();
    expect(live.hydrate).toHaveBeenCalledTimes(1);
    expect(live.updateErrors).not.toHaveBeenCalled();
    await act(async () => {
      root.unmount();
      roots.splice(roots.indexOf(root), 1);
      await tick();
    });
    expect(live.updateErrors).toHaveBeenCalledTimes(1);
    expect(live.updateErrors).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Bridge instance unmounted' }),
    );
    expect(live.destroy).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
    expect(live.host.innerHTML).toBe('');
  } finally {
    fallback.mockRestore();
  }
});

it('releases transport ownership before producer abort listeners cancel pending data readers', async () => {
  const previousURL = window.location.href;
  // Exercise bootstrap's internal fallback without attempting jsdom navigation.
  window.history.replaceState(null, '', '/?csr=1');
  try {
    const live = await setup('abort-reader', undefined, 'cancel-on-abort');
    live.sendHTML();
    const root = await live.mount();
    const done = live.runtime.get(live.id)!.done;
    expect(live.hydrate).toHaveBeenCalledTimes(1);
    expect(document.querySelector('#mf-bridge-fatal-error')).toBeNull();
    await act(async () => {
      root.unmount();
      roots.splice(roots.indexOf(root), 1);
      await tick();
    });
    expect(document.querySelector('#mf-bridge-fatal-error')).toBeNull();
    await expect(done).rejects.toThrow('Bridge instance unmounted');
    expect(live.destroy).toHaveBeenCalledTimes(1);
    expect(live.host.innerHTML).toBe('');
  } finally {
    window.history.replaceState(null, '', previousURL);
  }
});
