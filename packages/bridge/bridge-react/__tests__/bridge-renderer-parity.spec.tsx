import React, { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { createRemoteAppComponent as createLegacyBase } from '../src/base';
import { createReactRemote as createUnifiedBase } from '../src/reactRemote';
import {
  createRemoteAppComponent,
  createReactRemote,
  ReactRemote,
} from '../src';
import { createBridgeComponent } from '../src/v18';
import { useBridgeRouter } from '../src/provider/context';
import { remoteRuntime } from './reactRemote-utils';
import type { BridgeNavigation } from '../src/types';

function consumer(
  legacy: boolean,
  provider: any,
  navigation?: BridgeNavigation,
) {
  const runtime = remoteRuntime({ default: provider }, 'bridge');
  const Remote = legacy
    ? createLegacyBase({
        loader: async () => ({ default: provider }),
        instance: runtime.instance,
        navigation,
        loading: null,
        fallback: ({ error, resetErrorBoundary }: any) => (
          <button onClick={resetErrorBoundary}>{error.message}</button>
        ),
      })
    : createUnifiedBase({
        remote: 'shop/Card',
        instance: runtime.instance,
        navigation,
        fallback: ({ error, retry }) => (
          <button onClick={retry}>{error.message}</button>
        ),
      });
  return { Remote, runtime };
}

describe.each([true, false])('shared Bridge renderer (legacy=%s)', (legacy) => {
  it('retains the Root and business props while routing controls update', async () => {
    let channel: BridgeNavigation | undefined;
    const navigation = {
      getLocation: () => '/app',
      subscribe: () => () => {},
      navigate: jest.fn(),
    };
    const businessNavigation = { screen: 'details' };
    function App(props: any) {
      channel = useBridgeRouter()?.navigation;
      const [count, setCount] = React.useState(0);
      return (
        <button onClick={() => setCount(count + 1)}>
          {props.label}:{count}:{props.navigation.screen}
        </button>
      );
    }
    const provider = jest.fn(createBridgeComponent({ rootComponent: App }));
    const { Remote } = consumer(legacy, provider, navigation);
    const view = render(
      <Remote label="first" navigation={businessNavigation} />,
    );
    await screen.findByText('first:0:details');
    act(() => screen.getByRole('button').click());
    view.rerender(<Remote label="updated" navigation={businessNavigation} />);
    await screen.findByText('updated:1:details');
    expect(channel).toBe(navigation);
    expect(provider).toHaveBeenCalledTimes(1);
    await act(async () => view.unmount());
  });

  it('does not leak the navigation adapter to an older provider', async () => {
    const received: any[] = [];
    const navigation = {
      getLocation: () => '/app',
      subscribe: () => () => {},
      navigate: jest.fn(),
    };
    const { Remote } = consumer(
      legacy,
      () => ({ render: (info: any) => received.push(info), destroy() {} }),
      navigation,
    );
    const view = render(<Remote basename="/app" />);
    await waitFor(() => expect(received).toHaveLength(1));
    expect(received[0].basename).toBe('/app');
    expect(received[0].navigation).toBeUndefined();
    await act(async () => view.unmount());
  });

  it('retries asynchronous render failures with a fresh provider and disposes the failed one', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const destroy = jest.fn();
    let attempts = 0;
    const factory = jest.fn(() => {
      const attempt = ++attempts;
      return {
        render: async ({ dom }: any) => {
          if (attempt === 1) throw new Error('render failed');
          dom.textContent = 'recovered';
        },
        destroy,
      };
    });
    try {
      const { Remote } = consumer(legacy, factory);
      const view = render(<Remote />);
      const retry = await screen.findByRole('button', {
        name: 'render failed',
      });
      act(() => retry.click());
      await screen.findByText('recovered');
      expect(factory).toHaveBeenCalledTimes(2);
      expect(destroy).toHaveBeenCalledTimes(1);
      await act(async () => view.unmount());
      expect(destroy).toHaveBeenCalledTimes(2);
    } finally {
      errors.mockRestore();
    }
  });

  it('disposes a provider that resolves after unmount without rendering it', async () => {
    let resolve!: (provider: any) => void;
    const provider = { render: jest.fn(), destroy: jest.fn() };
    const factory = jest.fn(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const { Remote } = consumer(legacy, factory);
    const view = render(<Remote />);
    await waitFor(() => expect(factory).toHaveBeenCalledTimes(1));
    await act(async () => view.unmount());
    await act(async () => resolve(provider));
    expect(provider.render).not.toHaveBeenCalled();
    expect(provider.destroy).toHaveBeenCalledTimes(1);
  });

  it('commits placeholder removal before giving the container to the producer', async () => {
    let resolve!: (provider: any) => void;
    const seen: string[] = [];
    const provider = {
      render: jest.fn(({ dom }: any) => {
        seen.push(dom.textContent);
        dom.textContent = 'producer content';
      }),
      destroy: jest.fn(),
    };
    const factory = jest.fn(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const runtime = remoteRuntime({ default: factory }, 'bridge');
    const loading = <span>pending provider</span>;
    const Remote = legacy
      ? createLegacyBase({
          loader: async () => ({ default: factory }),
          loading,
          fallback: () => null,
        })
      : createUnifiedBase({
          remote: 'shop/Card',
          instance: runtime.instance,
          loading,
        });
    const view = render(
      <Remote className="styled-container" style={{ color: 'red' }} />,
    );
    await waitFor(() => expect(factory).toHaveBeenCalledTimes(1));
    const placeholder = screen.getByText('pending provider');
    const mount = placeholder.parentElement!;
    if (legacy) {
      expect(mount.className).toContain('styled-container');
      expect(mount.style.color).toBe('red');
    }
    expect(provider.render).not.toHaveBeenCalled();
    await act(async () => resolve(provider));
    await screen.findByText('producer content');
    expect(provider.render.mock.calls[0][0].dom).toBe(mount);
    expect(seen).toEqual(['']);
    expect(screen.queryByText('pending provider')).toBeNull();
    await act(async () => view.unmount());
    expect(provider.destroy).toHaveBeenCalledTimes(1);
  });

  it('preserves render metadata in consumer destroy lifecycle hooks', async () => {
    const destroy = jest.fn();
    const { Remote, runtime } = consumer(legacy, () => ({
      render() {},
      destroy,
    }));
    const before = jest.fn();
    const after = jest.fn();
    (runtime.instance as any).bridgeHook = {
      lifecycle: {
        beforeBridgeRender: { emit: jest.fn() },
        afterBridgeRender: { emit: jest.fn() },
        beforeBridgeDestroy: { emit: before },
        afterBridgeDestroy: { emit: after },
      },
    };
    const memoryRoute = { entryPath: '/detail' };
    const view = render(
      <Remote basename="/app" memoryRoute={memoryRoute} label="business" />,
    );
    await waitFor(() =>
      expect(
        (runtime.instance as any).bridgeHook.lifecycle.afterBridgeRender.emit,
      ).toHaveBeenCalled(),
    );
    await act(async () => view.unmount());
    const info = before.mock.calls[0][0];
    expect(info).toMatchObject({
      basename: '/app',
      memoryRoute,
      label: 'business',
    });
    expect(after.mock.calls[0][0]).toBe(info);
    expect(destroy).toHaveBeenCalledWith({
      moduleName: info.moduleName,
      dom: info.dom,
    });
  });

  it('keeps one live provider through StrictMode replay', async () => {
    const destroy = jest.fn();
    const provider = jest.fn(() => ({
      render: ({ dom }: any) => {
        dom.textContent = 'strict';
      },
      destroy,
    }));
    const { Remote } = consumer(legacy, provider);
    const view = render(
      <StrictMode>
        <Remote />
      </StrictMode>,
    );
    await screen.findByText('strict');
    expect(provider).toHaveBeenCalledTimes(1);
    expect(destroy).not.toHaveBeenCalled();
    await act(async () => view.unmount());
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});

describe.each([true, false])(
  'default entry Router parity (legacy=%s)',
  (legacy) => {
    it.each([undefined, '/explicit'])(
      'infers the local boundary and notifies query/hash changes (basename=%s)',
      async (basename) => {
        const values: any[] = [];
        const provider = jest.fn(() => ({
          render: (info: any) => values.push(info),
          destroy() {},
        }));
        const runtime = remoteRuntime({ default: provider }, 'bridge');
        const Remote = legacy
          ? createRemoteAppComponent({
              loader: async () => ({ default: provider }),
              loading: null,
              fallback: () => null,
            })
          : createReactRemote({
              remote: 'shop/Card',
              instance: runtime.instance,
              basename,
            });
        let navigate!: ReturnType<typeof useNavigate>;
        function Host() {
          navigate = useNavigate();
          return <Remote {...(legacy ? { basename } : {})} />;
        }
        const notify = jest.fn();
        window.addEventListener('popstate', notify);
        const view = render(
          <MemoryRouter
            basename="/admin"
            initialEntries={['/admin/stores/100/inventory/detail/42']}
          >
            <Routes>
              <Route path="stores/:storeId/inventory/*" element={<Host />} />
            </Routes>
          </MemoryRouter>,
        );
        try {
          await waitFor(() => expect(values).toHaveLength(1));
          expect(values[0].basename).toBe(
            basename || '/admin/stores/100/inventory',
          );
          await act(async () =>
            navigate('/stores/100/inventory/detail/42?tab=stock#summary'),
          );
          await waitFor(() => expect(notify).toHaveBeenCalledTimes(1));
          await act(async () =>
            navigate('/stores/200/inventory/detail/42?tab=stock#summary'),
          );
          await waitFor(() =>
            expect(values.at(-1).basename).toBe(
              basename || '/admin/stores/200/inventory',
            ),
          );
          expect(provider).toHaveBeenCalledTimes(1);
        } finally {
          await act(async () => view.unmount());
          window.removeEventListener('popstate', notify);
        }
      },
    );
  },
);

it('keeps the default-entry Root when navigation integration is enabled and disabled', async () => {
  function App() {
    const [count, setCount] = React.useState(0);
    return <button onClick={() => setCount(count + 1)}>count:{count}</button>;
  }
  const provider = jest.fn(createBridgeComponent({ rootComponent: App }));
  const runtime = remoteRuntime({ default: provider }, 'bridge');
  const navigation = {
    getLocation: () => '/app',
    subscribe: () => () => {},
    navigate: jest.fn(),
  };
  const element = (adapter?: BridgeNavigation) => (
    <MemoryRouter initialEntries={['/app']}>
      <ReactRemote
        remote="shop/Card"
        instance={runtime.instance}
        navigation={adapter}
      />
    </MemoryRouter>
  );
  const view = render(element());
  await screen.findByText('count:0');
  act(() => screen.getByRole('button').click());
  view.rerender(element(navigation));
  await screen.findByText('count:1');
  view.rerender(element());
  await screen.findByText('count:1');
  expect(provider).toHaveBeenCalledTimes(1);
  await act(async () => view.unmount());
});
