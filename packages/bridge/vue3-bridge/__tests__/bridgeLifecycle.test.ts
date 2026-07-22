import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import { h, nextTick } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createBridgeComponent } from '../src/provider';

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
  getInstance: () => ({ bridgeHook: { lifecycle: bridgeLifecycle } }),
}));

describe('Vue Bridge operation lifecycle', () => {
  beforeEach(() => {
    rs.stubGlobal('__APP_VERSION__', '2.8.0-test');
    lifecycleEvents.length = 0;
    document.body.innerHTML = '';
  });

  it('records render invocation, real commit, safe payloads, and repeated destroy', async () => {
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
      secretData: 'must-not-leak',
    } as any);
    await nextTick();

    const renderEvents = lifecycleEvents.filter(
      (event) => event.payload.operation === 'render',
    );
    expect(renderEvents.map((event) => event.lifecycle)).toEqual(
      expect.arrayContaining([
        'beforeBridgeOperation',
        'bridgeRenderInvoked',
        'afterBridgeOperation',
        'afterBridgeCommit',
      ]),
    );
    expect(
      new Set(renderEvents.map((event) => event.payload.operationId)).size,
    ).toBe(1);
    expect(JSON.stringify(lifecycleEvents)).not.toContain('must-not-leak');
    expect(JSON.stringify(lifecycleEvents)).not.toContain('token=private');

    bridge.destroy({ dom });
    bridge.destroy({ dom });
    expect(
      lifecycleEvents
        .filter(
          (event) =>
            event.lifecycle === 'afterBridgeOperation' &&
            event.payload.operation === 'destroy',
        )
        .map((event) => event.payload.outcome),
    ).toEqual(['success', 'skipped']);
  });

  it('records render and destroy errors without swallowing them', async () => {
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
      lifecycleEvents.find(
        (event) =>
          event.lifecycle === 'afterBridgeOperation' &&
          event.payload.operation === 'render',
      )?.payload,
    ).toMatchObject({ outcome: 'error' });
    expect(JSON.stringify(lifecycleEvents)).not.toContain('token=secret');

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
      lifecycleEvents.find(
        (event) =>
          event.lifecycle === 'afterBridgeOperation' &&
          event.payload.operation === 'destroy',
      )?.payload.outcome,
    ).toBe('error');
  });

  it('records basename, memory-route, and remote-to-host navigation results', async () => {
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
    await bridgeRouter?.push('/next?token=private#hash');
    await bridgeRouter?.push('/next?token=private#hash');

    const routeResults = lifecycleEvents.filter(
      (event) =>
        event.lifecycle === 'afterBridgeOperation' &&
        event.payload.operation === 'route-sync',
    );
    expect(routeResults.map((event) => event.payload.route.action)).toEqual(
      expect.arrayContaining(['memory-route-init', 'remote-to-host']),
    );
    expect(routeResults.map((event) => event.payload.outcome)).toEqual(
      expect.arrayContaining(['success', 'skipped']),
    );
    expect(JSON.stringify(routeResults)).not.toContain('token=private');
    bridge.destroy({ dom });
  });
});
