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
});
