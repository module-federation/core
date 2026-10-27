import { createInstance } from '@module-federation/runtime';
import { TreeShakingStatus } from '@module-federation/sdk';
import { init } from '../src/init';
import { getSharedFallbackGetter } from '../src/getSharedFallbackGetter';
import type { Federation, WebpackRequire } from '../src/types';

it.each([false, true])(
  'loads full fallbacks by scope, layer and version (reverse=%s)',
  async (reverse) => {
    const variants = [
      { shareScope: 'default', layer: 'server', version: '1.0.0' },
      { shareScope: 'default', layer: 'client', version: '1.0.0' },
      { shareScope: 'custom', layer: 'client', version: '1.0.0' },
      { shareScope: 'default', layer: undefined, version: '1.0.0' },
      { shareScope: 'default', layer: 'client', version: '2.0.0' },
    ];
    if (reverse) variants.reverse();
    const entries: Federation['sharedFallback'] = {
      pkg: variants.map(({ version, ...identity }, index) => [
        `${index}.js`,
        version,
        `entry${index}`,
        identity,
      ]),
    };
    const loadEntry = jest.fn(async ({ remoteInfo }) => ({
      init: async () => undefined,
      get: () => () => remoteInfo.entry,
    }));
    const localGet = jest.fn(() => () => 'tree-shaken');
    const webpackRequire = {
      p: '/assets/',
      federation: {
        initOptions: {
          name: `full-fallback-${reverse}`,
          shared: {
            pkg: variants.map(({ shareScope, layer, version }) => ({
              version,
              scope: shareScope,
              get: localGet,
              shareConfig: { requiredVersion: false, layer },
              treeShaking: {
                mode: 'server-calc',
                status: TreeShakingStatus.UNKNOWN,
              },
            })),
          },
        },
        sharedFallback: entries,
        runtime: { init: createInstance, getRemoteEntry: loadEntry },
        bundlerRuntime: { getSharedFallbackGetter },
      },
    } as unknown as WebpackRequire;
    const instance = init({ webpackRequire });
    webpackRequire.federation.instance = instance;
    for (const [index, { shareScope, layer, version }] of variants.entries()) {
      const factory = await instance.loadShare('pkg', {
        customShareInfo: {
          scope: [shareScope],
          shareConfig: { layer, requiredVersion: version },
          treeShaking: {
            mode: 'server-calc',
            status: TreeShakingStatus.UNKNOWN,
          },
        },
      });
      expect(factory && factory()).toBe(`/assets/${index}.js`);
    }
    expect(localGet).not.toHaveBeenCalled();
    expect(loadEntry).toHaveBeenCalledTimes(variants.length);
  },
);

it('keeps legacy unlayered fallback tuples executable', async () => {
  const webpackRequire = {
    p: '/',
    federation: {
      sharedFallback: { pkg: [['legacy.js', '1.0.0', 'legacy']] },
      runtime: {
        getRemoteEntry: async () => ({
          init: async () => undefined,
          get: () => () => 'legacy',
        }),
      },
    },
  } as unknown as WebpackRequire;
  const get = getSharedFallbackGetter({
    shareKey: 'pkg',
    version: '1.0.0',
    scope: 'custom',
    factory: () => () => 'local',
    webpackRequire,
  });
  const factory = await get();
  expect(factory()).toBe('legacy');
});

it('keeps a local provider when only another identity has a full fallback', () => {
  const webpackRequire = {
    federation: {
      sharedFallback: {
        pkg: [
          [
            'server.js',
            '1.0.0',
            'server',
            { shareScope: 'default', layer: 'server' },
          ],
        ],
      },
    },
  } as unknown as WebpackRequire;
  const factory = () => () => 'local';
  for (const identity of [
    { scope: 'default' },
    { scope: 'custom', layer: 'server' },
  ]) {
    expect(
      getSharedFallbackGetter({
        shareKey: 'pkg',
        version: '1.0.0',
        factory,
        webpackRequire,
        ...identity,
      }),
    ).toBe(factory);
  }
});
