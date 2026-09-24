import React, { StrictMode, useId, useState } from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { createBridgeComponent } from '../src/v18';
import { RemoteAppWrapper } from '../src/remote/RemoteAppWrapper';
import { BridgeSSRContext } from '../src/ssr';
import { ErrorBoundary } from '../src/error-boundary';
import type { BridgeSSRBrowserSnapshot } from '../src/ssr';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function Product({ value }: { value: string }) {
  const id = useId();
  const [count, setCount] = useState(0);
  return (
    <button id={id} onClick={() => setCount(count + 1)}>
      {value}: {count}
    </button>
  );
}

describe('independent Bridge SSR roots', () => {
  let host: Root | undefined;
  afterEach(async () => {
    await act(async () => host?.unmount());
    host = undefined;
    delete window.__MF_BRIDGE_SSR__;
    document.body.innerHTML = '';
  });

  it('hydrates with the producer root, preserves DOM through host updates, and reuses the root', async () => {
    const provider = createBridgeComponent({ rootComponent: Product })();
    const render = jest.spyOn(provider, 'render');
    const hydrate = jest.spyOn(provider, 'hydrate');
    const destroy = jest.spyOn(provider, 'destroy');
    const factory = jest.fn(() => provider);
    const ready = deferred<BridgeSSRBrowserSnapshot>();
    const errors: unknown[] = [];
    const register = jest.fn();
    const Fixture = ({ value = '商品' }: { value?: string }) => (
      <StrictMode>
        <RemoteAppWrapper
          moduleName="products/App"
          providerInfo={factory}
          exportName="default"
          loading={<p>Loading</p>}
          fallback={() => null}
          value={value}
        />
      </StrictMode>
    );
    const container = document.createElement('main');
    document.body.appendChild(container);
    container.innerHTML = renderToString(
      <BridgeSSRContext.Provider value={{ register }}>
        <Fixture />
      </BridgeSSRContext.Provider>,
    );
    expect(register).toHaveBeenCalledTimes(1);
    const [instanceId, registeredFactory, params] = register.mock.calls[0];
    expect(registeredFactory).toBe(factory);
    expect(params).toEqual({
      moduleName: 'products/App',
      basename: undefined,
      memoryRoute: undefined,
      props: { value: '商品' },
    });
    const remoteContainer = document.getElementById(instanceId)!;
    const session = { identifierPrefix: 'products-1-', done: ready.promise };
    const claim = jest.fn(() => session);
    const release = jest.fn();
    window.__MF_BRIDGE_SSR__ = { get: () => session, claim, release };

    await act(async () => {
      host = hydrateRoot(container, <Fixture />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(hydrate).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();

    // The stream finishes after the host root has hydrated.
    remoteContainer.innerHTML = renderToString(<Product value="商品" />, {
      identifierPrefix: 'products-1-',
    });
    const originalButton = remoteContainer.querySelector('button');
    await act(async () =>
      ready.resolve({ snapshot: {}, identifierPrefix: 'products-1-' }),
    );
    expect(hydrate).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(render).not.toHaveBeenCalled();
    expect(remoteContainer.querySelector('button')).toBe(originalButton);

    fireEvent.click(originalButton!);
    expect(originalButton?.textContent).toBe('商品: 1');
    await act(async () => host!.render(<Fixture value="更新商品" />));
    await waitFor(() =>
      expect(originalButton?.textContent).toBe('更新商品: 1'),
    );
    expect(remoteContainer.querySelector('button')).toBe(originalButton);
    expect(render).toHaveBeenCalledTimes(1);
    expect(errors).toEqual([]);

    await act(async () => host!.unmount());
    host = undefined;
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledWith(instanceId, remoteContainer);
  });

  it('drops hydration when an unfinished remote is unmounted', async () => {
    const ready = deferred<BridgeSSRBrowserSnapshot>();
    const provider = {
      render: jest.fn(),
      hydrate: jest.fn(),
      destroy: jest.fn(),
    };
    const factory = () => provider;
    const Fixture = () => (
      <RemoteAppWrapper
        moduleName="inventory/App"
        providerInfo={factory}
        exportName="default"
        loading={null}
        fallback={() => null}
      />
    );
    const container = document.createElement('main');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<Fixture />);
    const release = jest.fn();
    const session = { done: ready.promise };
    window.__MF_BRIDGE_SSR__ = {
      get: () => session,
      claim: () => session,
      release,
    };
    await act(async () => {
      host = hydrateRoot(container, <Fixture />);
    });
    await act(async () => host!.unmount());
    host = undefined;
    await act(async () =>
      ready.resolve({ snapshot: {}, identifierPrefix: 'inventory-' }),
    );
    expect(provider.hydrate).not.toHaveBeenCalled();
    expect(provider.render).not.toHaveBeenCalled();
    expect(provider.destroy).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('uses one hydrated root for later provider updates and destroys it once', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<Product value="库存" />, {
      identifierPrefix: 'stock-',
    });
    const original = container.firstChild;
    const provider = createBridgeComponent({ rootComponent: Product })();
    await act(async () =>
      provider.hydrate({
        dom: container,
        snapshot: {},
        value: '库存',
        rootOptions: { identifierPrefix: 'stock-' },
      }),
    );
    expect(container.firstChild).toBe(original);
    await act(async () => provider.render({ dom: container, value: '仓库' }));
    expect(container.firstChild).toBe(original);
    expect(container.textContent).toBe('仓库: 0');
    await act(async () =>
      provider.destroy({ dom: container, moduleName: 'stock/App' }),
    );
    provider.destroy({ dom: container, moduleName: 'stock/App' });
    expect(container.innerHTML).toBe('');
  });

  it('keeps two instances of one producer separate when their streams finish in reverse order', async () => {
    const factory = createBridgeComponent({ rootComponent: Product });
    const register = jest.fn();
    const Fixture = () => (
      <>
        {['商品 A', '商品 B'].map((value) => (
          <RemoteAppWrapper
            key={value}
            moduleName="products/App"
            providerInfo={factory}
            exportName="default"
            loading={<p>Loading {value}</p>}
            fallback={() => null}
            value={value}
          />
        ))}
      </>
    );
    const container = document.createElement('main');
    document.body.appendChild(container);
    container.innerHTML = renderToString(
      <BridgeSSRContext.Provider value={{ register }}>
        <Fixture />
      </BridgeSSRContext.Provider>,
    );
    const ids = register.mock.calls.map(([id]) => id as string);
    expect(new Set(ids).size).toBe(2);
    const pending = ids.map(() => deferred<BridgeSSRBrowserSnapshot>());
    const sessions = new Map(
      ids.map((id, index) => [id, { done: pending[index].promise }]),
    );
    window.__MF_BRIDGE_SSR__ = {
      get: (id) => sessions.get(id),
      claim: (id) => sessions.get(id),
      release: jest.fn(),
    };
    const errors: unknown[] = [];
    await act(async () => {
      host = hydrateRoot(container, <Fixture />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    const complete = async (index: number) => {
      const prefix = `product-${index}-`;
      const slot = document.getElementById(ids[index])!;
      slot.innerHTML = renderToString(
        <Product value={index ? '商品 B' : '商品 A'} />,
        { identifierPrefix: prefix },
      );
      await act(async () =>
        pending[index].resolve({ snapshot: {}, identifierPrefix: prefix }),
      );
      return slot.querySelector('button')!;
    };
    const second = await complete(1);
    expect(document.getElementById(ids[0])?.textContent).toBe('Loading 商品 A');
    fireEvent.click(second);
    const first = await complete(0);
    expect(first.id).not.toBe(second.id);
    expect(first.textContent).toBe('商品 A: 0');
    expect(second.textContent).toBe('商品 B: 1');
    expect(errors).toEqual([]);
  });

  it('cleans up a custom hydration that completes after cancellation', async () => {
    const root = { render: jest.fn(), unmount: jest.fn() };
    const ready = deferred<typeof root>();
    const provider = createBridgeComponent({
      rootComponent: Product,
      hydrate: () => ready.promise,
    })();
    const controller = new AbortController();
    const hydration = provider.hydrate({
      dom: document.createElement('div'),
      value: '商品',
      snapshot: {},
      signal: controller.signal,
    });
    controller.abort();
    ready.resolve(root);
    await hydration;
    expect(root.unmount).toHaveBeenCalledTimes(1);
    expect(root.render).not.toHaveBeenCalled();
  });
});

describe('Bridge registration before lazy module loading', () => {
  it('reserves independent instances before a shared MF loader resolves', async () => {
    const { createRemoteAppComponent } =
      await import('../src/remote/base-component/create');
    const module = deferred<{
      default: () => { render(): void; destroy(): void };
    }>();
    const loader = jest.fn(() => module.promise);
    const providerFactory = jest.fn(() => ({ render() {}, destroy() {} }));
    const Remote = createRemoteAppComponent({
      loader,
      loading: <p>loading</p>,
      fallback: () => null,
    });
    const register = jest.fn();
    renderToString(
      <BridgeSSRContext.Provider value={{ register }}>
        <Remote
          value="A"
          loading={<p>consumer loading</p>}
          fallback={() => null}
          decoration={<span>host-only</span>}
        />
        <Remote value="B" />
      </BridgeSSRContext.Provider>,
    );
    expect(register).toHaveBeenCalledTimes(2);
    const [first, second] = register.mock.calls;
    expect(first[0]).not.toBe(second[0]);
    expect(first[3]).toEqual({ deferRender: true });
    expect(first[2].props).toEqual({ value: 'A' });
    const firstProvider = first[1]();
    const secondProvider = second[1]();
    module.resolve({ default: providerFactory });
    expect(await firstProvider).not.toBe(await secondProvider);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(providerFactory).toHaveBeenCalledTimes(2);
  });

  it('connects a rejected MF loader to the already registered SSR task', async () => {
    const { createRemoteAppComponent } =
      await import('../src/remote/base-component/create');
    const loader = jest.fn(async () => {
      throw new Error('MF Node entry unavailable');
    });
    const Remote = createRemoteAppComponent({
      loader,
      loading: <p>loading</p>,
      fallback: () => null,
    });
    const register = jest.fn();
    renderToString(
      <BridgeSSRContext.Provider value={{ register }}>
        <Remote />
      </BridgeSSRContext.Provider>,
    );
    const provider = register.mock.calls[0][1]();
    await expect(provider).rejects.toThrow('MF Node entry unavailable');
    expect(loader).toHaveBeenCalledTimes(1);
  });
});

describe('Bridge SSR hydration fallback', () => {
  for (const mode of ['reject', 'recoverable', 'csr'] as const) {
    it(`handles ${mode} errors without changing the ordinary CSR failure path`, async () => {
      const failure = Error(
        mode === 'reject'
          ? 'Application version mismatch'
          : 'Hydration mismatch',
      );
      const callback = jest.fn();
      const fallback = jest.fn();
      const provider = {
        render: jest.fn(async () => {
          if (mode === 'csr') throw failure;
        }),
        hydrate: jest.fn(async (info: any) => {
          if (mode === 'reject') throw failure;
          info.rootOptions.onRecoverableError(failure);
        }),
        destroy: jest.fn(),
      };
      const fixture = (
        <ErrorBoundary FallbackComponent={() => <p>Application error</p>}>
          <RemoteAppWrapper
            moduleName="products/App"
            providerInfo={() => provider}
            exportName="default"
            loading={<p>Loading</p>}
            fallback={() => null}
            rootOptions={{ onRecoverableError: callback }}
          />
        </ErrorBoundary>
      );
      const container = document.createElement('main');
      document.body.appendChild(container);
      container.innerHTML = renderToString(fixture);
      const session = {
        done: Promise.resolve({ snapshot: {}, identifierPrefix: 'p-' }),
      };
      window.__MF_BRIDGE_SSR__ = {
        get: () => (mode === 'csr' ? undefined : session),
        claim: () => (mode === 'csr' ? undefined : session),
        release: jest.fn(),
        fallback,
      };
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      let root: Root | undefined;
      try {
        await act(async () => {
          root = hydrateRoot(container, fixture);
        });
        if (mode === 'csr') {
          expect(provider.render).toHaveBeenCalledTimes(1);
          expect(provider.hydrate).not.toHaveBeenCalled();
          expect(fallback).not.toHaveBeenCalled();
        } else {
          expect(provider.hydrate).toHaveBeenCalledTimes(1);
          expect(fallback).toHaveBeenCalledWith(failure);
          expect(provider.render).not.toHaveBeenCalled();
        }
        if (mode === 'recoverable')
          expect(callback).toHaveBeenCalledWith(failure);
        else expect(callback).not.toHaveBeenCalled();
      } finally {
        await act(async () => root?.unmount());
        container.remove();
        delete window.__MF_BRIDGE_SSR__;
        consoleError.mockRestore();
      }
    });
  }
});
