const mockGetRemoteEntry = jest.fn();
const mockGetGlobalSnapshotInfoByModuleInfo = jest.fn();
const mockGetWebpackRequire = jest.fn();

jest.mock('@module-federation/runtime', () => ({
  getRemoteEntry: (...args: unknown[]) => mockGetRemoteEntry(...args),
}));

jest.mock('@module-federation/runtime/helpers', () => ({
  __esModule: true,
  default: {
    global: {
      getGlobalSnapshotInfoByModuleInfo: (...args: unknown[]) =>
        mockGetGlobalSnapshotInfoByModuleInfo(...args),
    },
  },
}));

jest.mock('@module-federation/sdk/bundler', () => ({
  getWebpackRequire: (...args: unknown[]) => mockGetWebpackRequire(...args),
}));

import type { WebpackRequire } from '../src/types';
import { init } from '../src/init';

describe('init', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('falls back to provided webpackRequire bundlerRuntime when sdk accessor is unavailable', async () => {
    const shareEntry = {
      init: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockReturnValue('remote-getter'),
    };
    mockGetRemoteEntry.mockResolvedValue(shareEntry);
    mockGetWebpackRequire.mockReturnValue(undefined);
    mockGetGlobalSnapshotInfoByModuleInfo.mockReturnValue({
      shared: [
        {
          sharedName: 'react',
          secondarySharedTreeShakingName: 'react-secondary',
          secondarySharedTreeShakingEntry:
            'https://example.com/react-secondary.js',
          treeShakingStatus: 'loaded',
        },
      ],
    });

    const runtimeInit = jest.fn();
    const fallbackBundlerRuntime = {
      marker: 'fallback-runtime',
      getSharedFallbackGetter: jest.fn(
        ({ factory }: { factory: () => unknown }) => factory,
      ),
    };
    const initOptions = {
      plugins: [] as Array<{ beforeInit: (...args: any[]) => any }>,
    };

    const webpackRequire = {
      federation: {
        initOptions,
        runtime: { init: runtimeInit },
        sharedFallback: true,
        bundlerRuntime: fallbackBundlerRuntime,
        libraryType: 'module',
      },
    } as unknown as WebpackRequire;

    init({ webpackRequire });

    const plugin = initOptions.plugins[0];
    expect(plugin).toBeDefined();

    const sharedArg = {
      version: '18.2.0',
      get: jest.fn(),
      treeShaking: { status: 'stale' },
    };
    const origin = { name: 'host-app' };

    plugin.beforeInit({
      origin,
      userOptions: {
        version: '1.0.0',
        shared: {
          react: sharedArg,
        },
      },
      options: {
        version: '1.0.0',
        shared: {},
      },
    });

    const treeShakingGetter = sharedArg.treeShaking
      .get as () => Promise<unknown>;
    const getter = await treeShakingGetter();

    expect(getter).toBe('remote-getter');
    expect(shareEntry.init).toHaveBeenCalledWith(
      origin,
      fallbackBundlerRuntime,
    );
    expect(runtimeInit).toHaveBeenCalledWith(initOptions);
  });
});
