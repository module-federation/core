import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { createApp, defineComponent, h, KeepAlive, nextTick } from 'vue';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import RemoteApp from '../src/remoteApp';

const { lifecycleEvents, bridgeLifecycle } = rs.hoisted(() => {
  const lifecycleEvents: Array<{
    lifecycle: string;
    payload: Record<string, any>;
  }> = [];
  const eventHook = (lifecycle: string) => ({
    emit: rs.fn((payload: Record<string, any>) => {
      lifecycleEvents.push({ lifecycle, payload });
    }),
  });
  return {
    lifecycleEvents,
    bridgeLifecycle: {
      beforeBridgeRender: { emit: rs.fn(async () => ({})) },
      afterBridgeRender: { emit: rs.fn() },
      beforeBridgeDestroy: { emit: rs.fn() },
      afterBridgeDestroy: { emit: rs.fn() },
      beforeBridgeOperation: eventHook('beforeBridgeOperation'),
      bridgeRenderInvoked: eventHook('bridgeRenderInvoked'),
      afterBridgeOperation: eventHook('afterBridgeOperation'),
      afterBridgeCommit: eventHook('afterBridgeCommit'),
    },
  };
});

rs.mock('@module-federation/runtime', () => ({
  getInstance: () => ({
    bridgeHook: {
      lifecycle: bridgeLifecycle,
    },
  }),
}));

const flushBridgeRender = async () => {
  await nextTick();
  await Promise.resolve();
  await nextTick();
};

describe('RemoteApp', () => {
  let root: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
    lifecycleEvents.length = 0;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('destroys and re-renders the remote app when used under KeepAlive', async () => {
    const providerReturn = {
      render: rs.fn(),
      destroy: rs.fn(),
    };
    const RemoteRoute = defineComponent({
      setup() {
        return () =>
          h(RemoteApp, {
            moduleName: 'ecApp',
            basename: '/ec',
            providerInfo: () => providerReturn,
          });
      },
    });

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>home</div>' } },
        { path: '/ec/:pathMatch(.*)*', component: RemoteRoute },
      ],
    });

    const App = defineComponent({
      setup() {
        return () =>
          h(RouterView, null, {
            default: ({ Component }) =>
              h(KeepAlive, null, () => (Component ? h(Component) : null)),
          });
      },
    });

    const app = createApp(App);
    app.use(router);

    await router.push('/ec');
    await router.isReady();
    app.mount(root);
    await flushBridgeRender();
    expect(providerReturn.render).toHaveBeenCalledTimes(1);
    expect(
      lifecycleEvents.some(
        (event) =>
          event.lifecycle === 'beforeBridgeOperation' &&
          event.payload.operation === 'render' &&
          event.payload.reason === 'mount',
      ),
    ).toBe(true);

    await router.push('/');
    await flushBridgeRender();
    expect(providerReturn.destroy).toHaveBeenCalledTimes(1);
    expect(
      lifecycleEvents.some(
        (event) =>
          event.payload.operation === 'destroy' &&
          event.payload.reason === 'keep-alive-deactivate',
      ),
    ).toBe(true);

    await router.push('/ec');
    await flushBridgeRender();
    expect(providerReturn.render).toHaveBeenCalledTimes(2);
    expect(
      lifecycleEvents.some(
        (event) =>
          event.payload.operation === 'update' &&
          event.payload.reason === 'keep-alive-activate',
      ),
    ).toBe(true);

    app.unmount();
  });
});
