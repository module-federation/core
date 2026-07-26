import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { createApp, defineComponent, h, KeepAlive, nextTick } from 'vue';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import RemoteApp from '../src/remoteApp';

const { lifecycleEvents, bridgeLifecycle } = rs.hoisted(() => {
  const lifecycleEvents: Array<{
    lifecycle: string;
    payload: Record<string, any>;
  }> = [];
  const eventHook = (lifecycle: string, result?: Record<string, any>) => ({
    emit: rs.fn(
      (
        payload: Record<string, any>,
        detail?: Record<string, any>,
      ): Record<string, any> | undefined => {
        lifecycleEvents.push({ lifecycle, payload: detail || payload });
        return result;
      },
    ),
  });
  return {
    lifecycleEvents,
    bridgeLifecycle: {
      beforeBridgeRender: eventHook('beforeBridgeRender', {}),
      afterBridgeRender: eventHook('afterBridgeRender'),
      beforeBridgeDestroy: eventHook('beforeBridgeDestroy'),
      afterBridgeDestroy: eventHook('afterBridgeDestroy'),
      afterBridgeCommit: eventHook('afterBridgeCommit'),
      afterBridgeRouteSync: eventHook('afterBridgeRouteSync'),
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

const getContext = (event: { payload: Record<string, any> }) =>
  event.payload.context || event.payload;

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
          event.lifecycle === 'beforeBridgeRender' &&
          getContext(event).operation === 'render' &&
          getContext(event).reason === 'mount',
      ),
    ).toBe(true);

    await router.push('/');
    await flushBridgeRender();
    expect(providerReturn.destroy).toHaveBeenCalledTimes(1);
    expect(
      lifecycleEvents.some(
        (event) =>
          getContext(event).operation === 'destroy' &&
          getContext(event).reason === 'keep-alive-deactivate',
      ),
    ).toBe(true);

    await router.push('/ec');
    await flushBridgeRender();
    expect(providerReturn.render).toHaveBeenCalledTimes(2);
    expect(
      lifecycleEvents.some(
        (event) =>
          getContext(event).operation === 'update' &&
          getContext(event).reason === 'keep-alive-activate',
      ),
    ).toBe(true);

    app.unmount();
  });
});
