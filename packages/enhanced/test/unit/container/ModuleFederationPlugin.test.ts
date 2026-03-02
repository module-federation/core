import { rs, type Mock } from '@rstest/core';
import { createMockCompiler, createWebpackMock } from './utils';

const webpack = {
  ...createWebpackMock(),
  DefinePlugin: class DefinePlugin {
    apply = rs.fn();
    constructor(_options: Record<string, string | boolean>) {}
  },
};

const mocks = rs.hoisted(() => {
  const captured = {
    containerReferenceOptions: null as null | { remoteType?: string },
  };

  const mockContainerReferenceApply = rs.fn();

  return {
    captured,
    mockBindLoggerToCompiler: rs.fn(),
    mockComposeKeyWithSeparator: rs.fn(
      (name: string, version: string) => `${name}-${version}`,
    ),
    mockInfrastructureLogger: {
      warn: rs.fn(),
      info: rs.fn(),
      log: rs.fn(),
    },
    mockGetBuildVersion: rs.fn(() => 'build'),
    mockContainerManager: rs.fn().mockImplementation(() => ({
      init: rs.fn(),
      containerPluginExposesOptions: {},
    })),
    mockRemoteEntryPlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
    mockFederationRuntimePlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
    mockFederationModulesPlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
    mockContainerPlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
    mockContainerReferenceApply,
    mockContainerReferencePlugin: rs
      .fn()
      .mockImplementation((options: { remoteType?: string }) => {
        captured.containerReferenceOptions = options;
        return {
          apply: mockContainerReferenceApply,
        };
      }),
    mockSharePlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
    mockTreeShakingSharedPlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
    mockStartupChunkDependenciesPlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
    mockStatsPlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
    mockDtsPlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
      addRuntimePlugins: rs.fn(),
    })),
    mockPrefetchPlugin: rs.fn().mockImplementation(() => ({
      apply: rs.fn(),
    })),
  };
});

rs.mock('webpack', () => webpack);

rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: (path: string) => path,
}));

rs.mock('@module-federation/sdk', () => ({
  bindLoggerToCompiler: mocks.mockBindLoggerToCompiler,
  composeKeyWithSeparator: mocks.mockComposeKeyWithSeparator,
  infrastructureLogger: mocks.mockInfrastructureLogger,
}));

rs.mock('@module-federation/managers', () => ({
  ContainerManager: mocks.mockContainerManager,
  utils: {
    getBuildVersion: mocks.mockGetBuildVersion,
  },
}));

rs.mock('@module-federation/manifest', () => ({
  StatsPlugin: mocks.mockStatsPlugin,
}));

rs.mock('@module-federation/dts-plugin', () => ({
  DtsPlugin: mocks.mockDtsPlugin,
}));

rs.mock('@module-federation/data-prefetch/cli', () => ({
  PrefetchPlugin: mocks.mockPrefetchPlugin,
}));

rs.mock('@module-federation/rspack/remote-entry-plugin', () => ({
  RemoteEntryPlugin: mocks.mockRemoteEntryPlugin,
}));

rs.mock('../../../src/utils', () => ({
  createSchemaValidation: () => () => undefined,
}));

rs.mock('../../../src/lib/container/runtime/FederationRuntimePlugin', () => ({
  __esModule: true,
  default: mocks.mockFederationRuntimePlugin,
}));

rs.mock('../../../src/lib/container/runtime/FederationModulesPlugin', () => ({
  __esModule: true,
  default: mocks.mockFederationModulesPlugin,
}));

rs.mock('../../../src/lib/container/ContainerPlugin', () => ({
  __esModule: true,
  default: mocks.mockContainerPlugin,
}));

rs.mock('../../../src/lib/container/ContainerReferencePlugin', () => ({
  __esModule: true,
  default: mocks.mockContainerReferencePlugin,
}));

rs.mock('../../../src/lib/sharing/SharePlugin', () => ({
  __esModule: true,
  default: mocks.mockSharePlugin,
}));

rs.mock(
  '../../../src/lib/sharing/tree-shaking/TreeShakingSharedPlugin',
  () => ({
    __esModule: true,
    default: mocks.mockTreeShakingSharedPlugin,
  }),
);

rs.mock('../../../src/lib/startup/MfStartupChunkDependenciesPlugin', () => ({
  __esModule: true,
  default: mocks.mockStartupChunkDependenciesPlugin,
}));

const ModuleFederationPlugin =
  require('../../../src/lib/container/ModuleFederationPlugin').default;

const getTap = <Args extends unknown[]>(
  tapMock: Mock,
  name: string,
): ((...args: Args) => unknown) | undefined => {
  const entry = tapMock.mock.calls.find((call: unknown[]) => call[0] === name);
  return entry ? (entry[1] as (...args: Args) => unknown) : undefined;
};

describe('ModuleFederationPlugin remoteType defaults', () => {
  let mockCompiler: ReturnType<typeof createMockCompiler>;

  beforeEach(() => {
    rs.clearAllMocks();
    mocks.captured.containerReferenceOptions = null;
    mockCompiler = createMockCompiler();
    mockCompiler.hooks.afterPlugins = { tap: rs.fn() };
    mockCompiler.options.output = {
      ...mockCompiler.options.output,
      enabledLibraryTypes: [],
    };
    mockCompiler.options.plugins = [];
    mockCompiler.webpack = {
      ...mockCompiler.webpack,
      DefinePlugin: webpack.DefinePlugin,
    } as any;
  });

  it('defaults remoteType to script for manifest remotes (umd library)', () => {
    const plugin = new ModuleFederationPlugin({
      name: 'host',
      library: { type: 'umd', name: 'host' },
      remotes: {
        hostapp: 'hostapp@http://localhost:3000/mf-manifest.json',
      },
      manifest: false,
      dts: false,
    });

    plugin.apply(mockCompiler as any);

    const afterPluginsTap = getTap(
      mockCompiler.hooks.afterPlugins.tap as unknown as Mock,
      'ModuleFederationPlugin',
    );
    afterPluginsTap?.();

    expect(mocks.captured.containerReferenceOptions?.remoteType).toBe('script');
  });

  it('defaults remoteType to library type for non-manifest remotes', () => {
    const plugin = new ModuleFederationPlugin({
      name: 'host',
      library: { type: 'var', name: 'host' },
      remotes: {
        // Non-manifest remote: should not force "script"
        remoteA: 'remoteA@http://localhost:3001/remoteEntry.js',
      },
      manifest: false,
      dts: false,
    });

    plugin.apply(mockCompiler as any);

    const afterPluginsTap = getTap(
      mockCompiler.hooks.afterPlugins.tap as unknown as Mock,
      'ModuleFederationPlugin',
    );
    afterPluginsTap?.();

    expect(mocks.captured.containerReferenceOptions?.remoteType).toBe('var');
  });

  it('respects explicit remoteType', () => {
    const plugin = new ModuleFederationPlugin({
      name: 'host',
      library: { type: 'umd', name: 'host' },
      remotes: {
        hostapp: 'hostapp@http://localhost:3000/mf-manifest.json',
      },
      remoteType: 'umd',
      manifest: false,
      dts: false,
    });

    plugin.apply(mockCompiler as any);

    const afterPluginsTap = getTap(
      mockCompiler.hooks.afterPlugins.tap as unknown as Mock,
      'ModuleFederationPlugin',
    );
    afterPluginsTap?.();

    expect(mocks.captured.containerReferenceOptions?.remoteType).toBe('umd');
  });
});
