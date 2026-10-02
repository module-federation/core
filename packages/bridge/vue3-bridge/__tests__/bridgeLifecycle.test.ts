import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import { h, nextTick } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createBridgeComponent } from '../src/provider';

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
      afterBridgeRouteSync: eventHook('afterBridgeRouteSync'),
    },
  };
});

rs.mock('@module-federation/runtime', () => ({
  getInstance: () => ({ bridgeHook: { lifecycle: bridgeLifecycle } }),
}));

const getContext = (event: { payload: Record<string, any> }) =>
  event.payload.context || event.payload;

describe('Vue Bridge operation lifecycle', () => {
  beforeEach(() => {
    rs.stubGlobal('__APP_VERSION__', '2.8.0-test');
    lifecycleEvents.length = 0;
    document.body.innerHTML = '';
  });

  it('records render and destroy', async () => {
    const dom = document.createElement('div');
    document.body.appendChild(dom);
    const bridge = createBridgeComponent({
      rootComponent: { render: () => h('div', 'committed') },
      appOptions: () => undefined,
    })();

    await bridge.render({
      dom,
      moduleName: 'remote/App',
      basename: '/safe?token=private#hash',
    } as any);
    await nextTick();

    const renderEvents = lifecycleEvents.filter(
      (event) => getContext(event).operation === 'render',
    );
    expect(renderEvents.map((event) => event.lifecycle)).toEqual([
      'beforeBridgeRender',
      'afterBridgeRender',
    ]);
    expect(new Set(renderEvents.map((event) => getContext(event))).size).toBe(
      1,
    );

    bridge.destroy({ dom });
    expect(
      lifecycleEvents.filter(
        (event) =>
          event.lifecycle === 'afterBridgeDestroy' &&
          getContext(event).operation === 'destroy',
      ).length,
    ).toBe(1);
  });

  it('preserves render and destroy errors without reporting completion', async () => {
    const renderDom = document.createElement('div');
    const renderBridge = createBridgeComponent({
      rootComponent: { render: () => h('div') },
      appOptions: () => {
        throw new Error('vue render failed token=secret');
      },
    })();
    await expect(
      renderBridge.render({ dom: renderDom, moduleName: 'remote/App' }),
    ).rejects.toThrow('vue render failed');
    expect(
      lifecycleEvents.some(
        (event) =>
          event.lifecycle === 'afterBridgeRender' &&
          getContext(event).operation === 'render',
      ),
    ).toBe(false);

    lifecycleEvents.length = 0;
    const destroyDom = document.createElement('div');
    const destroyBridge = createBridgeComponent({
      rootComponent: { render: () => h('div') },
      appOptions: ({ app }) => {
        app.unmount = () => {
          throw new Error('vue destroy failed');
        };
      },
    })();
    await destroyBridge.render({
      dom: destroyDom,
      moduleName: 'remote/App',
    });
    expect(() => destroyBridge.destroy({ dom: destroyDom })).toThrow(
      'vue destroy failed',
    );
    expect(
      lifecycleEvents.some(
        (event) =>
          event.lifecycle === 'afterBridgeDestroy' &&
          getContext(event).operation === 'destroy',
      ),
    ).toBe(false);
  });

  it('records the Bridge-managed memory-route navigation', async () => {
    const dom = document.createElement('div');
    let bridgeRouter: ReturnType<typeof createRouter> | undefined;
    const sourceRouter = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/start', component: { render: () => h('div', 'start') } },
        { path: '/next', component: { render: () => h('div', 'next') } },
      ],
    });
    const bridge = createBridgeComponent({
      rootComponent: { render: () => h('div') },
      appOptions: () => ({
        router: sourceRouter,
        afterRouterCreate(router) {
          bridgeRouter = router;
        },
      }),
    })();

    await bridge.render({
      dom,
      moduleName: 'remote/App',
      basename: '/remote',
      memoryRoute: { entryPath: '/start?token=private#hash' },
    });
    expect(bridgeRouter).toBeDefined();

    const routeResults = lifecycleEvents.filter(
      (event) =>
        event.lifecycle === 'afterBridgeRouteSync' &&
        getContext(event).operation === 'route-sync',
    );
    expect(routeResults.map((event) => getContext(event).route.action)).toEqual(
      ['memory-route-init'],
    );
    expect(routeResults[0]?.payload.error).toBeUndefined();
    expect(JSON.stringify(routeResults)).toContain('token=private');
    bridge.destroy({ dom });
  });
});
