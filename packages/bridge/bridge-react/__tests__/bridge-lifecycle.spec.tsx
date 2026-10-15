import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import {
  createBridgeComponent as createLegacyBridgeComponent,
  createRemoteAppComponent,
} from '../src';
import { createBridgeComponent as createReact18BridgeComponent } from '../src/v18';
import { createBridgeComponent as createReact19BridgeComponent } from '../src/v19';
import { federationRuntime } from '../src/provider/plugin';
import { createContainer } from './util';

const createLifecycleFixture = () => {
  const events: Array<{ lifecycle: string; payload: Record<string, any> }> = [];
  const eventHook = (lifecycle: string, result?: Record<string, any>) => ({
    emit: jest.fn(
      (
        payload: Record<string, any>,
        detail?: Record<string, any>,
      ): Record<string, any> | undefined => {
        events.push({ lifecycle, payload: detail || payload });
        return result;
      },
    ),
  });
  const lifecycle = {
    beforeBridgeRender: eventHook('beforeBridgeRender', {}),
    afterBridgeRender: eventHook('afterBridgeRender'),
    beforeBridgeDestroy: eventHook('beforeBridgeDestroy'),
    afterBridgeDestroy: eventHook('afterBridgeDestroy'),
    afterBridgeRouteSync: eventHook('afterBridgeRouteSync'),
  };
  federationRuntime.instance = { bridgeHook: { lifecycle } } as any;
  return { events, lifecycle };
};

const getContext = (event: { payload: Record<string, any> }) =>
  event.payload.context || event.payload;

describe('React Bridge operation lifecycle', () => {
  afterEach(() => {
    federationRuntime.instance = null;
    document.body.innerHTML = '';
  });

  it.each([
    ['legacy', createLegacyBridgeComponent],
    ['react18', createReact18BridgeComponent],
    ['react19', createReact19BridgeComponent],
  ])(
    'records render and destroy for the %s provider path',
    async (_, factory) => {
      const { events } = createLifecycleFixture();
      const containerInfo = createContainer();
      const bridge = factory({
        rootComponent: () => <div>committed</div>,
      })();

      await act(async () => {
        await bridge.render({
          dom: containerInfo.container,
          moduleName: 'remote/App',
          basename: '/safe?token=private#hash',
        });
      });

      const renderEvents = events.filter(
        (event) => getContext(event).operation === 'render',
      );
      expect(renderEvents.map((event) => event.lifecycle)).toEqual([
        'beforeBridgeRender',
        'afterBridgeRender',
      ]);
      expect(new Set(renderEvents.map((event) => getContext(event))).size).toBe(
        1,
      );

      bridge.destroy({
        dom: containerInfo.container,
        moduleName: 'remote/App',
      });
      bridge.destroy({
        dom: containerInfo.container,
        moduleName: 'remote/App',
      });
      const destroyResults = events.filter(
        (event) =>
          event.lifecycle === 'afterBridgeDestroy' &&
          getContext(event).operation === 'destroy',
      );
      expect(destroyResults).toHaveLength(2);
      containerInfo.clean();
    },
  );

  it('distinguishes updates and correlates consumer and producer operations', async () => {
    const { events } = createLifecycleFixture();
    const BridgeProvider = createReact18BridgeComponent({
      rootComponent: ({ value }: { value?: string }) => <div>{value}</div>,
    });
    const remoteModule: Record<PropertyKey, unknown> = {
      default: BridgeProvider,
    };
    remoteModule[Symbol.for('mf_module_id')] = 'remote/App';
    const RemoteComponent = createRemoteAppComponent({
      loader: async () => remoteModule,
      fallback: () => null,
      loading: null,
    });
    const result = render(<RemoteComponent value="first" />);

    await waitFor(() =>
      expect(result.container.textContent).toContain('first'),
    );
    const firstStarts = events.filter(
      (event) =>
        event.lifecycle === 'beforeBridgeRender' &&
        getContext(event).operation === 'render',
    );
    expect(firstStarts.map((event) => getContext(event).side).sort()).toEqual([
      'consumer',
      'producer',
    ]);

    result.rerender(<RemoteComponent value="second" />);
    await waitFor(() =>
      expect(result.container.textContent).toContain('second'),
    );
    expect(
      events.some(
        (event) =>
          event.lifecycle === 'beforeBridgeRender' &&
          getContext(event).operation === 'update' &&
          getContext(event).side === 'producer' &&
          getContext(event).reason === 'direct',
      ),
    ).toBe(true);
    result.unmount();
  });

  it.each([
    [
      'throw',
      () => {
        throw new Error('sync render failed token=secret');
      },
    ],
    [
      'reject',
      () => Promise.reject(new Error('async render failed token=secret')),
    ],
  ])(
    'preserves a custom render %s without reporting a completion',
    async (_, customRender) => {
      const { events } = createLifecycleFixture();
      const containerInfo = createContainer();
      const bridge = createLegacyBridgeComponent({
        rootComponent: () => <div />,
        render: customRender as any,
      })();

      await expect(
        bridge.render({
          dom: containerInfo.container,
          moduleName: 'remote/App',
        }),
      ).rejects.toThrow('render failed');
      expect(
        events.some(
          (event) =>
            event.lifecycle === 'afterBridgeRender' &&
            getContext(event).operation === 'render',
        ),
      ).toBe(false);
      containerInfo.clean();
    },
  );

  it('preserves destroy errors without reporting a completion', async () => {
    const { events } = createLifecycleFixture();
    const containerInfo = createContainer();
    const bridge = createLegacyBridgeComponent({
      rootComponent: () => <div />,
      createRoot: () => ({
        render: jest.fn(),
        unmount: () => {
          throw new Error('destroy failed');
        },
      }),
    })();
    await bridge.render({
      dom: containerInfo.container,
      moduleName: 'remote/App',
    });
    expect(() =>
      bridge.destroy({
        dom: containerInfo.container,
        moduleName: 'remote/App',
      }),
    ).toThrow('destroy failed');
    expect(
      events.some(
        (event) =>
          event.lifecycle === 'afterBridgeDestroy' &&
          getContext(event).operation === 'destroy',
      ),
    ).toBe(false);
    containerInfo.clean();
  });

  it('records host-to-remote popstate route synchronization', async () => {
    const { events } = createLifecycleFixture();
    const BridgeProvider = createReact18BridgeComponent({
      rootComponent: () => <div>remote</div>,
    });
    const remoteModule: Record<PropertyKey, unknown> = {
      default: BridgeProvider,
    };
    remoteModule[Symbol.for('mf_module_id')] = 'remote/App';
    const RemoteComponent = createRemoteAppComponent({
      loader: async () => remoteModule,
      fallback: () => null,
      loading: null,
    });
    let navigate!: ReturnType<typeof useNavigate>;
    const Host = () => {
      navigate = useNavigate();
      return <RemoteComponent />;
    };
    const result = render(
      <MemoryRouter initialEntries={['/first']}>
        <Host />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(result.container.textContent).toContain('remote'),
    );

    act(() => navigate('/second'));
    await waitFor(() => {
      expect(
        events.some(
          (event) =>
            event.lifecycle === 'afterBridgeRouteSync' &&
            getContext(event).operation === 'route-sync' &&
            getContext(event).side === 'consumer' &&
            getContext(event).route.action === 'host-to-remote' &&
            getContext(event).route.mechanism === 'popstate' &&
            event.payload.error === undefined,
        ),
      ).toBe(true);
    });
    result.unmount();
  });
});
