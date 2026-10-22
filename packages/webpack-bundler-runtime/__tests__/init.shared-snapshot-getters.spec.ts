import { getRemoteEntry } from '@module-federation/runtime';
import helpers from '@module-federation/runtime/helpers';
import type { ShareArgs } from '@module-federation/runtime/types';
import { TreeShakingStatus } from '@module-federation/sdk';
import { getSharedFallbackGetter } from '../src/getSharedFallbackGetter';
import { init } from '../src/init';
import type { WebpackRequire } from '../src/types';

jest.mock('@module-federation/runtime', () => ({
  getRemoteEntry: jest.fn(),
}));

jest.mock('@module-federation/runtime/helpers', () => ({
  __esModule: true,
  default: { global: { getGlobalSnapshotInfoByModuleInfo: jest.fn() } },
}));

const runtimeGlobal = globalThis as typeof globalThis & {
  __webpack_require__?: WebpackRequire;
};

afterEach(() => {
  delete runtimeGlobal.__webpack_require__;
});

describe('unlayered snapshot fallback execution', () => {
  it.each([
    ['matching identity', '1.0.0', 'custom', true],
    ['different version', '2.0.0', 'custom', false],
    ['different scope', '1.0.0', 'other', false],
  ] as const)('%s', async (_name, version, shareScope, matches) => {
    const localValue = { from: 'local' };
    const fullValue = { from: 'full fallback entry' };
    const secondaryValue = { from: 'secondary entry' };
    const localGet = jest.fn(() => () => localValue);
    const previousGet = jest.fn(() => () => ({ from: 'previous' }));
    const shared: ShareArgs = {
      version: '1.0.0',
      scope: 'custom',
      get: localGet,
      shareConfig: { requiredVersion: false },
      treeShaking: { status: TreeShakingStatus.NO_USE, get: previousGet },
    };
    const fullEntry = {
      init: jest.fn(async () => undefined),
      get: jest.fn(() => () => fullValue),
    };
    const secondaryEntry = {
      init: jest.fn(async () => undefined),
      get: jest.fn(() => () => secondaryValue),
    };
    const loadFullEntry = jest.fn(async () => fullEntry);
    jest.mocked(getRemoteEntry).mockResolvedValue(secondaryEntry);
    jest
      .mocked(helpers.global.getGlobalSnapshotInfoByModuleInfo)
      .mockReturnValue({
        shared: [
          {
            sharedName: 'pkg',
            version,
            shareScope,
            treeShakingStatus: TreeShakingStatus.CALCULATED,
            secondarySharedTreeShakingName: 'pkg_secondary',
            secondarySharedTreeShakingEntry: '/secondary.js',
          },
        ],
      } as ReturnType<typeof helpers.global.getGlobalSnapshotInfoByModuleInfo>);
    const origin = { name: 'snapshot-host' };
    const webpackRequire = {
      p: '/assets/',
      federation: {
        instance: origin,
        libraryType: 'global',
        initOptions: { name: origin.name, shared: { pkg: shared } },
        sharedFallback: {
          pkg: [['pkg-full.js', '1.0.0', 'pkg_full']],
        },
        bundlerRuntime: { getSharedFallbackGetter },
        runtime: {
          getRemoteEntry: loadFullEntry,
          init(options: {
            plugins: Array<{ beforeInit(args: unknown): void }>;
          }) {
            options.plugins[0].beforeInit({
              userOptions: options,
              options: { shared: {} },
              origin,
            });
          },
        },
      },
    } as unknown as WebpackRequire;
    runtimeGlobal.__webpack_require__ = webpackRequire;

    init({ webpackRequire });

    const treeShakenFactory = await shared.treeShaking!.get!();
    expect(treeShakenFactory()).toBe(matches ? secondaryValue : localValue);
    expect(shared.treeShaking!.status).toBe(
      matches ? TreeShakingStatus.CALCULATED : TreeShakingStatus.NO_USE,
    );
    expect(previousGet).not.toHaveBeenCalled();
    expect(loadFullEntry).not.toHaveBeenCalled();
    if (matches) {
      expect(getRemoteEntry).toHaveBeenCalledWith({
        origin,
        remoteInfo: {
          name: 'pkg_secondary',
          entry: '/secondary.js',
          type: 'global',
          entryGlobalName: 'pkg_secondary',
          shareScope: 'default',
        },
      });
      expect(secondaryEntry.init).toHaveBeenCalledWith(
        origin,
        webpackRequire.federation.bundlerRuntime,
      );
      expect(secondaryEntry.get).toHaveBeenCalledTimes(1);
      expect(localGet).not.toHaveBeenCalled();
    } else {
      expect(getRemoteEntry).not.toHaveBeenCalled();
      expect(localGet).toHaveBeenCalledTimes(1);
    }

    const fullFactory = await shared.get!();
    expect(fullFactory()).toBe(fullValue);
    expect(loadFullEntry).toHaveBeenCalledWith({
      origin,
      remoteInfo: {
        name: 'pkg_full',
        entry: '/assets/pkg-full.js',
        type: 'global',
        entryGlobalName: 'pkg_full',
        shareScope: 'default',
      },
    });
    expect(fullEntry.init).toHaveBeenCalledWith(
      origin,
      webpackRequire.federation.bundlerRuntime,
    );
    expect(fullEntry.get).toHaveBeenCalledTimes(1);
  });
});
