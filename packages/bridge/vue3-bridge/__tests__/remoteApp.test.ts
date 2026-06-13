import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, KeepAlive, nextTick } from 'vue';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import RemoteApp from '../src/remoteApp';

const { dispatchPopstateEnv } = vi.hoisted(() => ({
  dispatchPopstateEnv: vi.fn(),
}));

vi.mock('@module-federation/bridge-shared', () => ({
  dispatchPopstateEnv,
}));

vi.mock('@module-federation/runtime', () => ({
  getInstance: () => ({
    bridgeHook: {
      lifecycle: {
        beforeBridgeRender: { emit: vi.fn(async () => ({})) },
        afterBridgeRender: { emit: vi.fn() },
        beforeBridgeDestroy: { emit: vi.fn() },
        afterBridgeDestroy: { emit: vi.fn() },
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
      render: vi.fn(),
      destroy: vi.fn(),
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
