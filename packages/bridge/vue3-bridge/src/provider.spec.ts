import { describe, expect, it, rs } from '@rstest/core';
import { defineComponent, h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { getBridgeSSRContainerAttrs } from '@module-federation/bridge-shared';
import { createBridgeComponentWithServerRenderer } from './provider';

describe('Vue Bridge server provider', () => {
  it('creates a request-local app and returns the thin V1 result', async () => {
    const serverRenderer = rs.fn(async () => '<p>vue remote</p>');
    const factory = createBridgeComponentWithServerRenderer(
      {
        rootComponent: defineComponent(() => () => h('p', 'vue remote')),
        appOptions: () => ({
          router: createRouter({
            history: createMemoryHistory(),
            routes: [
              {
                path: '/detail',
                component: defineComponent(() => () => h('p')),
              },
            ],
          }),
        }),
        ssr: true,
      },
      serverRenderer,
    );
    const provider = factory();
    const request = new Request('http://bridge.test/detail');
    await expect(
      provider.renderServer!({
        moduleName: 'vue/remote',
        instanceId: 'vue-1',
        request,
        signal: request.signal,
        props: {},
      }),
    ).resolves.toEqual({
      protocolVersion: 1,
      moduleName: 'vue/remote',
      instanceId: 'vue-1',
      html: '<p>vue remote</p>',
      dehydratedState: undefined,
    });
    expect(serverRenderer).toHaveBeenCalledOnce();
  });

  it('updates application props without remounting the app', async () => {
    const provider = createBridgeComponentWithServerRenderer({
      rootComponent: defineComponent({
        props: { label: String },
        setup: (props) => () => h('p', props.label),
      }),
      appOptions: () => undefined,
    })();
    const dom = document.createElement('div');
    document.body.appendChild(dom);

    await provider.render({
      dom,
      moduleName: 'vue/remote',
      label: 'first',
    } as any);
    const firstApp = (dom as HTMLElement & { __vue_app__?: any }).__vue_app__;
    const unmount = rs.spyOn(firstApp, 'unmount');

    await provider.render({
      dom,
      moduleName: 'vue/remote',
      label: 'second',
    } as any);
    await Promise.resolve();
    expect(unmount).not.toHaveBeenCalled();
    expect(dom.textContent).toBe('second');
    expect((dom as HTMLElement & { __vue_app__?: any }).__vue_app__).toBe(
      firstApp,
    );

    await provider.render({ dom, moduleName: 'vue/remote' } as any);
    await Promise.resolve();
    expect(dom.textContent).toBe('');

    provider.destroy({ dom });
    expect(unmount).toHaveBeenCalledOnce();
  });

  it('remounts when routing configuration changes', async () => {
    const provider = createBridgeComponentWithServerRenderer({
      rootComponent: defineComponent(() => () => h('p', 'remote')),
      appOptions: () => undefined,
    })();
    const dom = document.createElement('div');
    document.body.appendChild(dom);
    await provider.render({
      dom,
      moduleName: 'vue/remote',
      basename: '/first',
    });
    const firstApp = (dom as HTMLElement & { __vue_app__?: any }).__vue_app__;
    const unmount = rs.spyOn(firstApp, 'unmount');

    await provider.render({
      dom,
      moduleName: 'vue/remote',
      basename: '/second',
    });
    expect(unmount).toHaveBeenCalledOnce();
    expect((dom as HTMLElement & { __vue_app__?: any }).__vue_app__).not.toBe(
      firstApp,
    );
  });

  it('applies dehydrated state only during the initial hydration mount', async () => {
    const hydrate = rs.fn(() => ({ label: 'hydrated' }));
    const provider = createBridgeComponentWithServerRenderer({
      rootComponent: defineComponent({
        props: { label: String },
        setup: (props) => () => h('p', props.label),
      }),
      appOptions: () => undefined,
      ssr: { hydrate },
    })();
    const dom = document.createElement('div');
    for (const [name, value] of Object.entries(
      getBridgeSSRContainerAttrs({
        moduleName: 'vue/remote',
        instanceId: 'vue-1',
      }),
    )) {
      dom.setAttribute(name, value);
    }
    dom.innerHTML = '<p>hydrated</p>';
    document.body.appendChild(dom);

    await provider.render({
      dom,
      moduleName: 'vue/remote',
      instanceId: 'vue-1',
      ssrState: { label: 'server' },
    });
    await provider.render({
      dom,
      moduleName: 'vue/remote',
      instanceId: 'vue-1',
      label: 'updated',
    } as any);

    expect(hydrate).toHaveBeenCalledOnce();
    expect(dom.textContent).toBe('updated');
    provider.destroy({ dom });
  });

  it('ignores apps created before an aborted client mount', async () => {
    const controller = new AbortController();
    const provider = createBridgeComponentWithServerRenderer({
      rootComponent: defineComponent(() => () => h('p', 'remote')),
      appOptions: () => {
        queueMicrotask(() => controller.abort(new Error('cancelled')));
        return {
          router: createRouter({
            history: createMemoryHistory(),
            routes: [
              {
                path: '/',
                component: defineComponent(() => () => h('p')),
              },
            ],
          }),
        };
      },
    })();
    const dom = document.createElement('div');
    document.body.appendChild(dom);
    await expect(
      provider.render({
        dom,
        moduleName: 'vue/remote',
        memoryRoute: { entryPath: '/' },
        signal: controller.signal,
      }),
    ).resolves.toBeUndefined();
    expect(
      (dom as HTMLElement & { __vue_app__?: any }).__vue_app__,
    ).toBeUndefined();
  });
});
