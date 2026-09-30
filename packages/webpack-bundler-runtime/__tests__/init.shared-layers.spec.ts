import { TreeShakingStatus } from '@module-federation/sdk';
import { init } from '../src/init';
import type { WebpackRequire } from '../src/types';
import type { ShareArgs } from '@module-federation/runtime/types';
import helpers from '@module-federation/runtime/helpers';

jest.mock('@module-federation/runtime/helpers', () => ({
  __esModule: true,
  default: { global: { getGlobalSnapshotInfoByModuleInfo: jest.fn() } },
}));

describe('layered tree-shaking snapshot matching', () => {
  it('matches the scope, layer and version before replacing a fallback getter', () => {
    const configs: ShareArgs[] = [
      {
        version: '1.0.0',
        scope: 'default',
        shareConfig: { layer: 'server', requiredVersion: false },
        get: () => () => 'server',
      },
      {
        version: '1.0.0',
        scope: 'default',
        shareConfig: { layer: 'client', requiredVersion: false },
        get: () => () => 'client',
      },
    ];
    jest
      .mocked(helpers.global.getGlobalSnapshotInfoByModuleInfo)
      .mockReturnValue({
        shared: [
          {
            sharedName: 'pkg',
            version: '2.0.0',
            layer: 'server',
            shareScope: 'default',
            treeShakingStatus: TreeShakingStatus.NO_USE,
          },
          {
            sharedName: 'pkg',
            version: '1.0.0',
            layer: 'server',
            shareScope: 'other',
            treeShakingStatus: TreeShakingStatus.NO_USE,
          },
          {
            sharedName: 'pkg',
            version: '1.0.0',
            layer: 'server',
            shareScope: 'default',
            treeShakingStatus: TreeShakingStatus.CALCULATED,
          },
          {
            sharedName: 'pkg',
            version: '1.0.0',
            layer: 'client',
            shareScope: 'default',
            treeShakingStatus: TreeShakingStatus.NO_USE,
          },
        ],
      } as any);
    const initOptions = { name: 'host', shared: { pkg: configs } };
    const webpackRequire = {
      federation: {
        initOptions,
        sharedFallback: { pkg: 'fallback' },
        bundlerRuntime: {
          getSharedFallbackGetter: ({ factory }: { factory: any }) => factory,
        },
        runtime: {
          init(options: any) {
            options.plugins[0].beforeInit({
              userOptions: options,
              options: { shared: {} },
              origin: { name: 'host' },
            });
          },
        },
      },
    } as unknown as WebpackRequire;
    init({ webpackRequire });
    expect(configs[0].treeShaking?.status).toBe(TreeShakingStatus.CALCULATED);
    expect(configs[1].treeShaking?.status).toBe(TreeShakingStatus.NO_USE);
    expect(configs[0].treeShaking?.get?.()).toBeInstanceOf(Function);
    expect(configs[1].treeShaking?.get?.()).toBeInstanceOf(Function);
  });
});
