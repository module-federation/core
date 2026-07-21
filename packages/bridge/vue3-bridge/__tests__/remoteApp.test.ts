import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { createApp, defineComponent, h, KeepAlive, nextTick } from 'vue';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import RemoteApp from '../src/remoteApp';

const { dispatchPopstateEnv } = rs.hoisted(() => ({
  dispatchPopstateEnv: rs.fn(),
}));

rs.mock('@module-federation/bridge-shared', () => ({
  dispatchPopstateEnv,
}));

rs.mock('@module-federation/runtime', () => ({
  getInstance: () => ({
    bridgeHook: {
      lifecycle: {
        beforeBridgeRender: { emit: rs.fn(async () => ({})) },
        afterBridgeRender: { emit: rs.fn() },
        beforeBridgeDestroy: { emit: rs.fn() },
        afterBridgeDestroy: { emit: rs.fn() },
      },
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
    dispatchPopstateEnv.mockClear();
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

    await router.push('/');
    await flushBridgeRender();
    expect(providerReturn.destroy).toHaveBeenCalledTimes(1);

    await router.push('/ec');
    await flushBridgeRender();
    expect(providerReturn.render).toHaveBeenCalledTimes(2);

    app.unmount();
  });
});
