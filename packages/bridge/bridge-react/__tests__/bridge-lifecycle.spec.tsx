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
  const eventHook = (lifecycle: string) => ({
    emit: jest.fn((payload: Record<string, any>) => {
      events.push({ lifecycle, payload });
    }),
  });
  const lifecycle = {
    beforeBridgeRender: { emit: jest.fn(() => ({})) },
    afterBridgeRender: { emit: jest.fn() },
    beforeBridgeDestroy: { emit: jest.fn() },
    afterBridgeDestroy: { emit: jest.fn() },
    beforeBridgeOperation: eventHook('beforeBridgeOperation'),
    bridgeRenderInvoked: eventHook('bridgeRenderInvoked'),
    afterBridgeOperation: eventHook('afterBridgeOperation'),
    afterBridgeCommit: eventHook('afterBridgeCommit'),
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
  ])('confirms a real commit for the %s provider path', async (_, factory) => {
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

    await waitFor(() => {
      expect(
        events.some((event) => event.lifecycle === 'afterBridgeCommit'),
      ).toBe(true);
    });
    const renderEvents = events.filter(
      (event) => getContext(event).operation === 'render',
    );
    expect(renderEvents.map((event) => event.lifecycle)).toEqual(
      expect.arrayContaining([
        'beforeBridgeOperation',
        'bridgeRenderInvoked',
        'afterBridgeOperation',
        'afterBridgeCommit',
      ]),
    );
    expect(new Set(renderEvents.map((event) => getContext(event))).size).toBe(
      1,
    );

    bridge.destroy({ dom: containerInfo.container, moduleName: 'remote/App' });
    bridge.destroy({ dom: containerInfo.container, moduleName: 'remote/App' });
    const destroyResults = events.filter(
      (event) =>
        event.lifecycle === 'afterBridgeOperation' &&
        getContext(event).operation === 'destroy',
    );
    expect(destroyResults.map((event) => event.payload.result)).toEqual([
      true,
      false,
    ]);
    containerInfo.clean();
  });

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
        event.lifecycle === 'beforeBridgeOperation' &&
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
          event.lifecycle === 'beforeBridgeOperation' &&
          getContext(event).operation === 'update' &&
          getContext(event).reason === 'props-update',
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
    'records a custom render %s and preserves the error',
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
      const result = events.find(
        (event) =>
          event.lifecycle === 'afterBridgeOperation' &&
          getContext(event).operation === 'render',
      );
      expect(result?.payload.error).toBeInstanceOf(Error);
      expect((result?.payload.error as Error).message).toContain(
        'token=secret',
      );
      containerInfo.clean();
    },
  );

  it('records destroy errors without swallowing them', async () => {
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
    expect(
      events.some((event) => event.lifecycle === 'afterBridgeCommit'),
    ).toBe(false);

    expect(() =>
      bridge.destroy({
        dom: containerInfo.container,
        moduleName: 'remote/App',
      }),
    ).toThrow('destroy failed');
    expect(
      events.find(
        (event) =>
          event.lifecycle === 'afterBridgeOperation' &&
          getContext(event).operation === 'destroy',
      )?.payload.error,
    ).toBeInstanceOf(Error);
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
            event.lifecycle === 'afterBridgeOperation' &&
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
