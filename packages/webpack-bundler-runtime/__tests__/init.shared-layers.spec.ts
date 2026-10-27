import { TreeShakingStatus } from '@module-federation/sdk';
import { init } from '../src/init';
import type { WebpackRequire } from '../src/types';
import type { ShareArgs } from '@module-federation/runtime/types';
import helpers from '@module-federation/runtime/helpers';
import { createInstance } from '@module-federation/runtime';

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

describe('unlayered tree-shaking snapshot matching', () => {
  it.each([
    [
      'matching version and scope',
      { version: '1.0.0', shareScope: 'default' },
      true,
    ],
    ['different version', { version: '2.0.0', shareScope: 'default' }, false],
    ['different scope', { version: '1.0.0', shareScope: 'other' }, false],
    [
      'ordered scopes',
      { version: '1.0.0', shareScope: ['other', 'default'] },
      true,
    ],
    ['legacy omitted scope', { version: '1.0.0' }, true],
    ['legacy omitted version', { shareScope: 'default' }, true],
    ['legacy omitted metadata', {}, true],
    ['layered snapshot', { version: '1.0.0', layer: 'server' }, false],
  ])(
    'handles %s without confusing fallback identities',
    (_name, metadata, matches) => {
      const localFactory = () => 'local';
      const localGet = () => localFactory;
      const shared: ShareArgs = {
        version: '1.0.0',
        get: localGet,
        shareConfig: { requiredVersion: false },
      };
      jest
        .mocked(helpers.global.getGlobalSnapshotInfoByModuleInfo)
        .mockReturnValue({
          shared: [
            {
              sharedName: 'pkg',
              ...metadata,
              treeShakingStatus: TreeShakingStatus.NO_USE,
            },
          ],
        } as any);
      const webpackRequire = {
        federation: {
          initOptions: { name: 'unlayered-host', shared: { pkg: shared } },
          sharedFallback: { pkg: 'fallback' },
          bundlerRuntime: {
            getSharedFallbackGetter: ({ factory }: { factory: any }) => factory,
          },
          runtime: {
            init(options: any) {
              options.plugins[0].beforeInit({
                userOptions: options,
                options: { shared: {} },
                origin: { name: options.name },
              });
            },
          },
        },
      } as unknown as WebpackRequire;

      init({ webpackRequire });

      expect(shared.treeShaking?.status).toBe(
        matches ? TreeShakingStatus.NO_USE : undefined,
      );
      expect(shared.treeShaking?.get).toBe(localGet);
      expect(shared.get).toBe(localGet);
    },
  );

  it.each([
    ['1.0.0', 'default'],
    ['2.0.0', 'default'],
    ['1.0.0', 'custom'],
    ['2.0.0', 'custom'],
  ])(
    'keeps provider selection independent of snapshot version %s in scope %s',
    async (snapshotVersion, scope) => {
      const providerValue = { from: 'provider', version: '2.0.0' };
      const provider = createInstance({
        name: `snapshot-provider-${snapshotVersion}-${scope}`,
        shared: {
          pkg: {
            version: '2.0.0',
            scope,
            lib: () => providerValue,
            shareConfig: { singleton: true, requiredVersion: false },
          },
        },
      });
      await provider.loadShare('pkg');
      const localGet = jest.fn(() => () => ({
        from: 'fallback',
        version: '1.0.0',
      }));
      const local: ShareArgs = {
        version: '1.0.0',
        scope,
        get: localGet,
        shareConfig: { singleton: true, requiredVersion: false },
      };
      jest
        .mocked(helpers.global.getGlobalSnapshotInfoByModuleInfo)
        .mockReturnValue({
          shared: [
            {
              sharedName: 'pkg',
              version: snapshotVersion,
              shareScope: scope,
              treeShakingStatus: TreeShakingStatus.NO_USE,
            },
          ],
        } as any);
      const webpackRequire = {
        federation: {
          initOptions: {
            name: `snapshot-host-${snapshotVersion}-${scope}`,
            shared: { pkg: local },
          },
          sharedFallback: { pkg: 'fallback' },
          bundlerRuntime: {
            getSharedFallbackGetter: ({ factory }: { factory: any }) => factory,
          },
          runtime: { init: createInstance },
        },
      } as unknown as WebpackRequire;
      const host = init({ webpackRequire });
      host.initShareScopeMap(scope, provider.shareScopeMap[scope]);

      const factory = await host.loadShare('pkg');

      expect(factory && factory()).toBe(providerValue);
      expect(localGet).not.toHaveBeenCalled();
      expect(local.treeShaking?.status).toBe(
        snapshotVersion === '1.0.0' ? TreeShakingStatus.NO_USE : undefined,
      );
    },
  );
});
