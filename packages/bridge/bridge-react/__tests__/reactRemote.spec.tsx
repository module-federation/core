import React, { StrictMode, createContext, useContext } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server.node';
import { createReactRemote, ReactRemote } from '../src/reactRemote';
import { remoteRuntime } from './reactRemote-utils';
import { BRIDGE_ROUTING } from '../src/provider/routing';
import { useBridgeRouter } from '../src/provider/context';
import { createBridgeComponent } from '../src/provider/versions/v18';

describe('unified React remote consumption', () => {
  it.each([false, true])(
    'hydrates noSSR without a redundant loading commit or recovery errors (ancestor Suspense: %s)',
    async (nested) => {
      const { instance, loadRemote } = remoteRuntime({
        default: () => <strong>client weather</strong>,
      });
      const Remote = createReactRemote({
        remote: 'shop/Card',
        instance,
        noSSR: true,
        loading: <p>connecting</p>,
      });
      const container = document.createElement('div');
      const commits: string[] = [];
      const content = (
        <React.Profiler
          id="noSSR"
          onRender={() => {
            commits.push(container.textContent || '');
          }}
        >
          <Remote />
        </React.Profiler>
      );
      const element = nested ? (
        <React.Suspense fallback={null}>{content}</React.Suspense>
      ) : (
        content
      );
      container.innerHTML = renderToString(element);
      expect(container.textContent).toBe('connecting');
      expect(loadRemote).not.toHaveBeenCalled();
      document.body.appendChild(container);
      const onRecoverableError = jest.fn();
      let root: ReturnType<typeof hydrateRoot>;
      try {
        act(() => {
          root = hydrateRoot(container, element, { onRecoverableError });
        });
        await screen.findByText('client weather');
        expect(onRecoverableError).not.toHaveBeenCalled();
        // Root and Suspense hydration retain the placeholder. Preparation
        // then commits content directly, without another loading render.
        expect(commits).toEqual(['connecting', 'connecting', 'client weather']);
      } finally {
        act(() => root!.unmount());
        container.remove();
      }
    },
  );
  it('loads noSSR once through StrictMode and preserves component state when props change', async () => {
    function Weather({ label }: { label: string }) {
      const [count, setCount] = React.useState(0);
      return (
        <button onClick={() => setCount((v) => v + 1)}>
          {label}: {count}
        </button>
      );
    }
    const { instance, loadRemote } = remoteRuntime({ default: Weather });
    const view = render(
      <StrictMode>
        <ReactRemote
          noSSR
          remote="shop/Card"
          instance={instance}
          props={{ label: 'first' }}
        />
      </StrictMode>,
    );
    await screen.findByText('first: 0');
    act(() => screen.getByRole('button').click());
    view.rerender(
      <StrictMode>
        <ReactRemote
          noSSR
          remote="shop/Card"
          instance={instance}
          props={{ label: 'updated' }}
        />
      </StrictMode>,
    );
    await screen.findByText('updated: 1');
    expect(loadRemote).toHaveBeenCalledTimes(1);
  });
  it('retries failed noSSR preparation without retaining the previous rejection', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const runtime = remoteRuntime({ default: () => <p>client recovered</p> });
    runtime.loadRemote.mockRejectedValueOnce(new Error('client offline'));
    try {
      render(
        <ReactRemote
          noSSR
          remote="shop/Card"
          instance={runtime.instance}
          fallback={({ error, retry }) => (
            <button onClick={retry}>{error.message}</button>
          )}
        />,
      );
      const button = await screen.findByRole('button', {
        name: /client offline/,
      });
      act(() => button.click());
      await screen.findByText('client recovered');
      expect(runtime.loadRemote).toHaveBeenCalledTimes(2);
    } finally {
      errors.mockRestore();
    }
  });
  it('preserves runtime load recovery when the manifest protocol lookup fails', async () => {
    const runtime = remoteRuntime({ default: () => null });
    const error = new Error('manifest unavailable');
    runtime.snapshotHandler.loadRemoteSnapshotInfo.mockRejectedValue(error);
    runtime.errorLoadRemote.mockResolvedValue({
      default: () => <p>runtime recovered weather</p>,
    });
    render(<ReactRemote remote="shop/Card" instance={runtime.instance} />);
    await screen.findByText('runtime recovered weather');
    expect(runtime.errorLoadRemote).toHaveBeenCalledTimes(1);
    expect(runtime.errorLoadRemote).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'shop/Card', error, lifecycle: 'onLoad' }),
    );
    expect(runtime.loadRemote).not.toHaveBeenCalled();
  });
  it('releases host loading DOM before mounting the producer React root', async () => {
    const provider = createBridgeComponent({
      rootComponent: () => <strong>independent root</strong>,
    });
    const { instance } = remoteRuntime({ default: provider }, 'bridge');
    const view = render(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        loading={<em>host loading</em>}
      />,
    );
    await screen.findByText('independent root');
    await waitFor(() => expect(screen.queryByText('host loading')).toBeNull());
    await act(async () => view.unmount());
  });

  it('recovers an asynchronous provider render failure with a new provider instance', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      let attempts = 0;
      const destroy = jest.fn();
      const provider = jest.fn(() => {
        const current = ++attempts;
        return {
          render: async ({ dom }: { dom: HTMLElement }) => {
            if (current === 1) throw new Error('provider failed');
            dom.textContent = 'provider recovered';
          },
          destroy,
        };
      });
      const { instance } = remoteRuntime({ default: provider }, 'bridge');
      render(
        <ReactRemote
          remote="shop/Card"
          instance={instance}
          fallback={({ error, retry }) => (
            <button onClick={retry}>{error.message}</button>
          )}
        />,
      );
      const button = await screen.findByRole('button', {
        name: 'provider failed',
      });
      act(() => button.click());
      await screen.findByText('provider recovered');
      expect(provider).toHaveBeenCalledTimes(2);
      expect(destroy).toHaveBeenCalledTimes(1);
    } finally {
      errors.mockRestore();
    }
  });
  it('accepts callable namespaces returned by runtime plugins without changing raw exports', async () => {
    const module = Object.assign(() => null, {
      default: () => <span>plugin export</span>,
    });
    const { instance } = remoteRuntime(module);
    render(<ReactRemote remote="shop/Card" instance={instance} />);
    await screen.findByText('plugin export');
    expect(typeof module).toBe('function');
    expect(Object.getOwnPropertySymbols(module)).toEqual([]);
  });
  it('renders an unmarked ordinary component in the host context and preserves props', async () => {
    const Context = createContext('missing');
    const raw = Object.freeze({
      default: ({ name }: { name: string }) => (
        <span>
          {useContext(Context)} {name}
        </span>
      ),
    });
    const { instance, loadRemote } = remoteRuntime(raw);
    const Card = createReactRemote<{ name: string }>({
      remote: 'alias/Card',
      instance,
    });
    const view = render(
      <Context.Provider value="host">
        <Card name="one" />
      </Context.Provider>,
    );
    await screen.findByText('host one');
    view.rerender(
      <Context.Provider value="host">
        <Card name="two" />
      </Context.Provider>,
    );
    await screen.findByText('host two');
    expect(loadRemote).toHaveBeenCalledTimes(1);
    expect(Object.getOwnPropertySymbols(raw)).toEqual([]);
  });
  it('supports named memo exports through the declarative API without recreating on rerender', async () => {
    const { instance, loadRemote } = remoteRuntime(
      {
        Named: React.memo(({ value }: { value: string }) => (
          <span>{value}</span>
        )),
      },
      'component',
    );
    const view = render(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        exportName="Named"
        props={{ value: 'first' }}
      />,
    );
    await screen.findByText('first');
    view.rerender(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        exportName="Named"
        props={{ value: 'second' }}
      />,
    );
    await screen.findByText('second');
    expect(loadRemote).toHaveBeenCalledTimes(1);
  });
  it('selects Bridge from metadata, keeps each provider isolated and destroys each instance', async () => {
    const providers: { render: jest.Mock; destroy: jest.Mock }[] = [];
    const factory = jest.fn(() => {
      const provider = {
        render: jest.fn(({ dom, value }) => {
          dom.textContent = value;
        }),
        destroy: jest.fn(({ dom }) => {
          dom.textContent = '';
        }),
      };
      providers.push(provider);
      return provider;
    });
    const { instance } = remoteRuntime({ default: factory }, 'bridge');
    const Card = createReactRemote<{ value: string }>({
      remote: 'shop/Card',
      instance,
    });
    const view = render(
      <>
        <Card value="left" />
        <Card value="right" />
      </>,
    );
    await screen.findByText('left');
    await screen.findByText('right');
    expect(factory).toHaveBeenCalledTimes(2);
    view.rerender(
      <>
        <Card value="updated" />
        <Card value="right" />
      </>,
    );
    await screen.findByText('updated');
    expect(factory).toHaveBeenCalledTimes(2);
    view.unmount();
    await waitFor(() =>
      expect(
        providers.every((provider) => provider.destroy.mock.calls.length === 1),
      ).toBe(true),
    );
  });
  it('keeps the final provider alive through StrictMode effect replay', async () => {
    const destroy = jest.fn();
    const factory = jest.fn(() => ({
      render: ({ dom }: { dom: HTMLElement }) => {
        dom.textContent = 'strict';
      },
      destroy,
    }));
    const { instance } = remoteRuntime({ default: factory }, 'bridge');
    const view = render(
      <StrictMode>
        <ReactRemote remote="shop/Card" instance={instance} />
      </StrictMode>,
    );
    await screen.findByText('strict');
    expect(destroy).not.toHaveBeenCalled();
    view.unmount();
    await waitFor(() => expect(destroy).toHaveBeenCalledTimes(1));
  });
  it('supports an explicit legacy Bridge hint', async () => {
    const factory = jest.fn(() => ({
      render: ({ dom }: { dom: HTMLElement }) => {
        dom.textContent = 'legacy';
      },
      destroy() {},
    }));
    const { instance } = remoteRuntime({ default: factory });
    render(
      <ReactRemote remote="shop/Card" instance={instance} render="bridge" />,
    );
    await screen.findByText('legacy');
  });
  it.each([
    ['conflict', 'bridge' as const, false, 'component' as const, /conflicts/],
    ['service', 'bridge' as const, true, undefined, /Service App/],
  ])(
    'reports %s without invoking the module loader',
    async (_name, protocol, service, hint, message) => {
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
      try {
        const { instance, loadRemote, errorLoadRemote } = remoteRuntime(
          { default: () => null },
          protocol,
          service,
        );
        render(
          <ReactRemote
            remote="shop/Card"
            instance={instance}
            render={hint}
            fallback={({ error }) => <span>{error.message}</span>}
          />,
        );
        await screen.findByText(message);
        expect(loadRemote).not.toHaveBeenCalled();
        expect(errorLoadRemote).not.toHaveBeenCalled();
      } finally {
        errors.mockRestore();
      }
    },
  );
  it('retries a failed lazy loader instead of reusing its rejection', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const runtime = remoteRuntime({ default: () => <span>recovered</span> });
      runtime.loadRemote.mockRejectedValueOnce(new Error('offline'));
      render(
        <ReactRemote
          remote="shop/Card"
          instance={runtime.instance}
          fallback={({ error, retry }) => (
            <button onClick={retry}>{error.message}</button>
          )}
        />,
      );
      const button = await screen.findByRole('button');
      act(() => button.click());
      await screen.findByText('recovered');
      expect(runtime.loadRemote).toHaveBeenCalledTimes(2);
    } finally {
      errors.mockRestore();
      warnings.mockRestore();
    }
  });
  it('does not instantiate a provider after its container unmounts', async () => {
    let complete!: (value: any) => void;
    const factory = jest.fn(() => ({ render() {}, destroy() {} }));
    const runtime = remoteRuntime({ default: factory }, 'bridge');
    runtime.loadRemote.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const view = render(
      <ReactRemote
        remote="shop/Card"
        instance={runtime.instance}
        loading={<span>waiting</span>}
      />,
    );
    await waitFor(() => expect(runtime.loadRemote).toHaveBeenCalledTimes(1));
    view.unmount();
    await act(async () => {
      complete({ default: factory });
    });
    expect(factory).not.toHaveBeenCalled();
  });
});

describe('Bridge routing controls', () => {
  it('keeps consumer mount paths and navigation channels independent across application mounts', async () => {
    function App({ label, basename }: { label: string; basename?: string }) {
      const routing = useBridgeRouter();
      return (
        <button
          data-testid={label}
          onClick={() =>
            routing?.navigation?.navigate(`${routing.basename}/detail/43`)
          }
        >
          {basename}:{routing?.navigation?.getLocation()}
        </button>
      );
    }
    const producer = createBridgeComponent({ rootComponent: App });
    const factory = jest.fn(() => producer());
    const { instance } = remoteRuntime({ default: factory }, 'bridge');
    const first = {
      getLocation: () => '/inventory/detail/42?tab=stock#summary',
      subscribe: () => () => {},
      navigate: jest.fn(),
    };
    const second = {
      getLocation: () => '/warehouse/detail/99',
      subscribe: () => () => {},
      navigate: jest.fn(),
    };
    const view = render(
      <>
        <ReactRemote
          remote="shop/Card"
          instance={instance}
          basename="/inventory"
          navigation={first}
          props={{ label: 'inventory' }}
        />
        <ReactRemote
          remote="shop/Card"
          instance={instance}
          basename="/warehouse"
          navigation={second}
          props={{ label: 'warehouse' }}
        />
      </>,
    );
    const inventory = await screen.findByTestId('inventory');
    const warehouse = await screen.findByTestId('warehouse');
    expect(inventory.textContent).toBe(
      '/inventory:/inventory/detail/42?tab=stock#summary',
    );
    expect(warehouse.textContent).toBe('/warehouse:/warehouse/detail/99');
    await act(async () => {
      inventory.click();
    });
    expect(first.navigate).toHaveBeenCalledWith('/inventory/detail/43');
    expect(second.navigate).not.toHaveBeenCalled();
    expect(factory).toHaveBeenCalledTimes(2);
    view.unmount();
  });

  it.each(['factory', 'declarative'] as const)(
    'preserves legacy routing props in the %s API when top-level controls are omitted',
    async (api) => {
      const provider = { render: jest.fn(), destroy: jest.fn() };
      const factory = jest.fn(() => provider);
      const { instance } = remoteRuntime({ default: factory }, 'bridge');
      const options = { remote: 'shop/Card', instance };
      type Props = { basename: string; memoryRoute: { entryPath: string } };
      const Remote =
        api === 'factory'
          ? createReactRemote<Props>(options)
          : (props: Props) => <ReactRemote {...options} props={props} />;
      const memoryRoute = { entryPath: '/product/detail/42' };
      const view = render(
        <Remote basename="/shop" memoryRoute={memoryRoute} />,
      );
      await waitFor(() => expect(provider.render).toHaveBeenCalledTimes(1));
      expect(provider.render.mock.calls[0][0]).toMatchObject({
        basename: '/shop',
        memoryRoute,
      });
      view.rerender(
        <Remote basename="/stores/100" memoryRoute={memoryRoute} />,
      );
      await waitFor(() =>
        expect(provider.render.mock.calls.at(-1)?.[0]).toMatchObject({
          basename: '/stores/100',
          memoryRoute,
        }),
      );
      expect(factory).toHaveBeenCalledTimes(1);
      view.unmount();
      await waitFor(() => expect(provider.destroy).toHaveBeenCalledTimes(1));
    },
  );

  it('gives explicit top-level controls precedence over legacy routing props', async () => {
    const provider = { render: jest.fn(), destroy: jest.fn() };
    const { instance } = remoteRuntime({ default: () => provider }, 'bridge');
    const memoryRoute = { entryPath: '/product/detail/42' };
    const view = render(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        basename="/inventory"
        memoryRoute={memoryRoute}
        props={{ basename: '/legacy', memoryRoute: { entryPath: '/legacy' } }}
      />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledTimes(1));
    expect(provider.render.mock.calls[0][0]).toMatchObject({
      basename: '/inventory',
      memoryRoute,
    });
    view.unmount();
    await waitFor(() => expect(provider.destroy).toHaveBeenCalledTimes(1));
  });

  it('updates basename and the navigation channel without recreating a provider or leaking controls into business props', async () => {
    const received: any[] = [];
    const providers: any[] = [];
    const factory = jest.fn(() => {
      const provider = {
        render: jest.fn((info) => received.push(info)),
        destroy: jest.fn(),
      };
      providers.push(provider);
      return provider;
    });
    const { instance, loadRemote } = remoteRuntime(
      { default: factory },
      'bridge',
    );
    const first = {
      getLocation: () => '/stores/100/app/product',
      subscribe: () => () => {},
      navigate: jest.fn(),
    };
    const second = { ...first, getLocation: () => '/stores/200/app/product' };
    const view = render(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        basename="/stores/100/app"
        navigation={first}
        props={{ label: 'first' }}
      />,
    );
    await waitFor(() => expect(received).toHaveLength(1));
    view.rerender(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        basename="/stores/200/app"
        navigation={second}
        props={{ label: 'second' }}
      />,
    );
    await waitFor(() =>
      expect(received.at(-1)).toMatchObject({
        basename: '/stores/200/app',
        [BRIDGE_ROUTING]: { navigation: second },
        label: 'second',
      }),
    );
    expect(factory).toHaveBeenCalledTimes(1);
    expect(loadRemote).toHaveBeenCalledTimes(1);
    view.unmount();
    await waitFor(() => expect(providers[0].destroy).toHaveBeenCalledTimes(1));
  });

  it('makes navigation available in the producer context and preserves its Root on updates', async () => {
    let business: any;
    let channel: any;
    function App(props: any) {
      business = props;
      channel = useBridgeRouter()?.navigation;
      const [count, setCount] = React.useState(0);
      return (
        <button onClick={() => setCount(count + 1)}>
          {props.label}:{count}
        </button>
      );
    }
    const provider = createBridgeComponent({ rootComponent: App })();
    const dom = document.createElement('div');
    document.body.append(dom);
    const navigation = {
      getLocation: () => '/app',
      subscribe: () => () => {},
      navigate: jest.fn(),
    };
    await act(async () => {
      await provider.render({
        dom,
        basename: '/app',
        [BRIDGE_ROUTING]: { navigation },
        label: 'first',
      });
    });
    expect(channel).toBe(navigation);
    expect(business.navigation).toBeUndefined();
    await act(async () => {
      dom.querySelector('button')!.click();
    });
    await act(async () => {
      await provider.render({
        dom,
        basename: '/other',
        [BRIDGE_ROUTING]: { navigation },
        label: 'updated',
      });
    });
    expect(dom.textContent).toBe('updated:1');
    await act(async () => {
      provider.destroy({ dom, moduleName: 'test' });
    });
    dom.remove();
  });

  it('does not pass Bridge controls to ordinary components', async () => {
    let business: any;
    const { instance } = remoteRuntime({
      default: (props: any) => {
        business = props;
        return <p>ordinary</p>;
      },
    });
    render(
      <ReactRemote
        remote="shop/Card"
        instance={instance}
        basename="/app"
        props={{ label: 'business' }}
      />,
    );
    await screen.findByText('ordinary');
    expect(business).toEqual({ label: 'business' });
  });
});

it('destroys a provider factory that resolves after its consumer unmounts', async () => {
  let complete!: (value: unknown) => void;
  const provider = { render: jest.fn(), destroy: jest.fn() };
  const factory = jest.fn(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const { instance } = remoteRuntime({ default: factory }, 'bridge');
  const view = render(
    <ReactRemote remote="shop/Card" instance={instance} basename="/app" />,
  );
  await waitFor(() => expect(factory).toHaveBeenCalledTimes(1));
  view.unmount();
  await act(async () => {
    complete(provider);
  });
  await waitFor(() => expect(provider.destroy).toHaveBeenCalledTimes(1));
  expect(provider.render).not.toHaveBeenCalled();
});
