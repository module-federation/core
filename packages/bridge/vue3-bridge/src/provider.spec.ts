import { describe, expect, it, rs } from '@rstest/core';
import { defineComponent, h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
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

  it('unmounts the previous app before rendering again into the same DOM node', async () => {
    const provider = createBridgeComponentWithServerRenderer({
      rootComponent: defineComponent({
        props: { label: String },
        setup: (props) => () => h('p', props.label),
      }),
      appOptions: () => undefined,
    })();
    const dom = document.createElement('div');

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
    expect(unmount).toHaveBeenCalledOnce();
    expect(dom.textContent).toBe('second');
    expect((dom as HTMLElement & { __vue_app__?: any }).__vue_app__).not.toBe(
      firstApp,
    );

    provider.destroy({ dom });
  });
});
