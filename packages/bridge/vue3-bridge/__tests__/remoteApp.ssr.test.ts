import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import {
  createApp,
  defineComponent,
  h,
  KeepAlive,
  nextTick,
  reactive,
} from 'vue';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  createBridgeHydrationRegistry,
  MF_BRIDGE_SSR_ATTR,
  toBridgeSSRReference,
} from '@module-federation/bridge-shared';
import RemoteApp from '../src/remoteApp';
import { provideBridgeHydrationRegistry } from '../src/hydration';

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

const installSlot = () => {
  document.body.innerHTML =
    '<div data-mf-bridge-slot="true" data-mf-bridge-version="1" data-mf-bridge-module="ecApp" data-mf-bridge-instance="ec:1">' +
    '<div data-mf-bridge-ssr="true" data-mf-bridge-mount="true" data-mf-bridge-version="1" data-mf-bridge-module="ecApp" data-mf-bridge-instance="ec:1"><p>server remote</p></div>' +
    '<script type="application/json" data-mf-bridge-state="true">{"protocolVersion":1,"moduleName":"ecApp","instanceId":"ec:1","state":{"ready":true}}</script>' +
    '</div>';
};

describe('RemoteApp SSR lifecycle', () => {
  let root: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const mountApp = (app: ReturnType<typeof createApp>) => {
    document.body.appendChild(root);
    app.mount(root);
  };

  it('claims the registry snapshot before provider render', async () => {
    const result = {
      protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
      moduleName: 'ecApp',
      instanceId: 'ec:1',
      html: '<p>server remote</p>',
      dehydratedState: { ready: true },
    };
    installSlot();
    const registry = createBridgeHydrationRegistry(document);
    expect(registry.peek('ecApp', 'ec:1')).toBeDefined();

    const providerReturn = {
      render: rs.fn(),
      destroy: rs.fn(),
    };
    const App = defineComponent({
      setup: () => () =>
        h(RemoteApp, {
          moduleName: 'ecApp',
          instanceId: 'ec:1',
          ssr: toBridgeSSRReference(result),
          providerInfo: () => providerReturn,
        }),
    });
    const app = createApp(App);
    provideBridgeHydrationRegistry(app, registry);
    // RemoteApp calls useRoute(); give it a router even for the non-route case.
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    });
    app.use(router);
    await router.isReady();
    mountApp(app);
    await flushBridgeRender();

    expect(providerReturn.render).toHaveBeenCalledTimes(1);
    expect(providerReturn.render.mock.calls[0][0].ssrState).toEqual({
      ready: true,
    });
    expect(registry.peek('ecApp', 'ec:1')).toBeUndefined();
    app.unmount();
  });

  it('claims SSR once under KeepAlive and reactivates through CSR', async () => {
    const result = {
      protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
      moduleName: 'ecApp',
      instanceId: 'ec:1',
      html: '<p>server remote</p>',
      dehydratedState: { ready: true },
    };
    installSlot();
    const registry = createBridgeHydrationRegistry(document);
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
            instanceId: 'ec:1',
            ssr: toBridgeSSRReference(result),
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
    provideBridgeHydrationRegistry(app, registry);
    app.use(router);

    await router.push('/ec');
    await router.isReady();
    mountApp(app);
    await flushBridgeRender();

    expect(providerReturn.render).toHaveBeenCalledTimes(1);
    expect(providerReturn.render.mock.calls[0][0].ssrState).toEqual({
      ready: true,
    });
    expect(registry.peek('ecApp', 'ec:1')).toBeUndefined();

    await router.push('/');
    await flushBridgeRender();
    expect(providerReturn.destroy).toHaveBeenCalledTimes(1);

    await router.push('/ec');
    await flushBridgeRender();
    expect(providerReturn.render).toHaveBeenCalledTimes(2);
    expect(providerReturn.render.mock.calls[1][0].ssrState).toBeUndefined();
    const remountDom = providerReturn.render.mock.calls[1][0]
      .dom as HTMLElement;
    expect(remountDom.getAttribute(MF_BRIDGE_SSR_ATTR)).toBeNull();

    app.unmount();
  });

  it('releases an unclaimed SSR snapshot when unmounted before render settles', async () => {
    const result = {
      protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
      moduleName: 'ecApp',
      instanceId: 'ec:1',
      html: '<p>server remote</p>',
      dehydratedState: { ready: true },
    };
    installSlot();
    const registry = createBridgeHydrationRegistry(document);
    expect(registry.peek('ecApp', 'ec:1')).toBeDefined();

    const providerReturn = {
      render: rs.fn(
        () =>
          new Promise<void>(() => {
            /* never settles */
          }),
      ),
      destroy: rs.fn(),
    };
    const App = defineComponent({
      setup: () => () =>
        h(RemoteApp, {
          moduleName: 'ecApp',
          instanceId: 'ec:1',
          ssr: toBridgeSSRReference(result),
          providerInfo: () => providerReturn,
        }),
    });
    const app = createApp(App);
    provideBridgeHydrationRegistry(app, registry);
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    });
    app.use(router);
    await router.isReady();
    mountApp(app);
    // Unmount before the render queue microtask claims the snapshot.
    app.unmount();
    await flushBridgeRender();
    expect(registry.peek('ecApp', 'ec:1')).toBeUndefined();
  });

  it('drops SSR slot markup when ssr props clear without remount', async () => {
    const result = {
      protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
      moduleName: 'ecApp',
      instanceId: 'ec:1',
      html: '<p>server remote</p>',
      dehydratedState: { ready: true },
    };
    const providerReturn = {
      render: rs.fn(async () => undefined),
      destroy: rs.fn(),
    };
    const state = reactive<{
      ssr: typeof result | undefined;
    }>({ ssr: result });
    const App = defineComponent({
      setup: () => () =>
        h(RemoteApp, {
          moduleName: 'ecApp',
          instanceId: 'ec:1',
          ssr: state.ssr,
          providerInfo: () => providerReturn,
        }),
    });
    const app = createApp(App);
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    });
    app.use(router);
    await router.isReady();
    mountApp(app);
    await flushBridgeRender();

    expect(root.querySelector('[data-mf-bridge-slot="true"]')).not.toBeNull();
    expect(root.innerHTML).toContain('server remote');
    expect(providerReturn.render).toHaveBeenCalledTimes(1);
    expect(providerReturn.destroy).not.toHaveBeenCalled();

    state.ssr = undefined;
    await nextTick();
    await flushBridgeRender();

    expect(root.querySelector('[data-mf-bridge-slot="true"]')).toBeNull();
    expect(root.querySelector(`[${MF_BRIDGE_SSR_ATTR}="true"]`)).toBeNull();
    expect(providerReturn.destroy).toHaveBeenCalledTimes(1);
    expect(providerReturn.render).toHaveBeenCalledTimes(2);
    expect(providerReturn.render.mock.calls[1][0].ssrState).toBeUndefined();
    expect(providerReturn.render.mock.calls[1][0].dom?.isConnected).toBe(true);
    app.unmount();
  });
});
