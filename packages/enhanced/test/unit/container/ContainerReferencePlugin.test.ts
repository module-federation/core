/*
 * @rstest-environment node
 */

import { rs, type Mock } from '@rstest/core';
import {
  normalizeWebpackPath,
  getWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';
import {
  createMockCompiler,
  createWebpackMock,
  createMockRemoteModule,
  MockModuleDependency,
  createMockCompilation,
  createMockFallbackDependency,
  createMockRemoteToExternalDependency,
  MockCompiler,
} from './utils';

// Create webpack mock
const webpack = createWebpackMock();

// Create plain mock functions inside rs.hoisted() - NO self-references allowed
const mocks = rs.hoisted(() => {
  const mockContextReplacementPluginApply = rs.fn();
  const mockApply = rs.fn();
  const mockCompilationHookTap = rs.fn();
  const mockExternalsPluginApply = rs.fn();

  return {
    mockContextReplacementPluginApply,
    // Configure implementations inline without referencing the return object
    mockContextReplacementPlugin: rs.fn().mockImplementation(() => ({
      apply: mockContextReplacementPluginApply,
    })),
    mockNormalizeWebpackPath: rs.fn((path: string) => path),
    mockGetWebpackPath: rs.fn(() => 'mocked-webpack-path'),
    MockRemoteModule: null as any,
    mockApply,
    mockFederationRuntimePlugin: rs.fn().mockImplementation(() => ({
      apply: mockApply,
    })),
    mockCompilationHookTap,
    mockGetCompilationHooks: rs.fn().mockReturnValue({
      addContainerEntryDependency: { tap: mockCompilationHookTap },
      addFederationRuntimeDependency: { tap: mockCompilationHookTap },
      addRemoteDependency: { tap: mockCompilationHookTap },
    }),
    mockExternalsPluginApply,
    mockExternalsPlugin: rs.fn().mockImplementation(() => ({
      apply: mockExternalsPluginApply,
    })),
  };
});

// Initialize MockRemoteModule after hoisted but before mocks
mocks.MockRemoteModule = createMockRemoteModule();

// Mock webpack
rs.mock('webpack', () => {
  return {
    ...webpack,
    dependencies: {
      ModuleDependency: MockModuleDependency,
    },
    Dependency: class MockDependency {},
    ContextReplacementPlugin: mocks.mockContextReplacementPlugin,
  };
});

// Mock dependencies
rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: mocks.mockNormalizeWebpackPath,
  getWebpackPath: mocks.mockGetWebpackPath,
}));

// Mock RemoteModule
rs.mock(
  '../../../src/lib/container/RemoteModule',
  () => mocks.MockRemoteModule,
);

// Mock FederationRuntimePlugin
rs.mock('../../../src/lib/container/runtime/FederationRuntimePlugin.ts', () => {
  return {
    __esModule: true,
    default: mocks.mockFederationRuntimePlugin,
  };
});

// Mock FederationModulesPlugin
rs.mock('../../../src/lib/container/runtime/FederationModulesPlugin', () => {
  return {
    __esModule: true,
    default: {
      getCompilationHooks: mocks.mockGetCompilationHooks,
    },
  };
});

// Mock FallbackModuleFactory
rs.mock('../../../src/lib/container/FallbackModuleFactory', () => {
  return {
    __esModule: true,
    default: class MockFallbackModuleFactory {
      constructor() {
        // Empty constructor with comment to avoid linter warning
      }

      create(
        _data: unknown,
        callback: (err: Error | null, result?: unknown) => void,
      ) {
        callback(null, { fallback: true });
      }
    },
  };
});

// Mock RemoteRuntimeModule
rs.mock('../../../src/lib/container/RemoteRuntimeModule', () => {
  return {
    __esModule: true,
    default: class MockRemoteRuntimeModule {
      constructor() {
        // Empty constructor with comment to avoid linter warning
      }
    },
  };
});

// Note: webpack.ExternalsPlugin is set inside beforeEach when mockCompiler.webpack is configured

// Import container reference plugin after mocks
const ContainerReferencePlugin =
  require('../../../src/lib/container/ContainerReferencePlugin').default;

const getTap = <Args extends unknown[]>(
  tapMock: Mock,
  name: string,
): ((...args: Args) => unknown) | undefined => {
  const entry = tapMock.mock.calls.find((call: unknown[]) => call[0] === name);
  return entry ? (entry[1] as (...args: Args) => unknown) : undefined;
};

describe('ContainerReferencePlugin', () => {
  let mockCompiler: MockCompiler;

  beforeEach(() => {
    rs.clearAllMocks();
    mockCompiler = createMockCompiler();

    // Configure mock compiler with webpack.RuntimeGlobals
    mockCompiler.webpack = {
      ...mockCompiler.webpack,
      RuntimeGlobals: {
        ensureChunkHandlers: 'ensureChunkHandlers',
        module: 'module',
        moduleFactoriesAddOnly: 'moduleFactoriesAddOnly',
        hasOwnProperty: 'hasOwnProperty',
        initializeSharing: 'initializeSharing',
        shareScopeMap: 'shareScopeMap',
      },
      ExternalsPlugin: mocks.mockExternalsPlugin,
    } as any;
  });

  describe('constructor', () => {
    it('should initialize with basic options', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      // Check that _remotes and _remoteType are set correctly
      expect(plugin['_remoteType']).toBe('script');

      // _remotes is an array of [key, config] tuples
      expect(plugin['_remotes']).toBeInstanceOf(Array);
      expect(plugin['_remotes'].length).toBe(1);
      expect(plugin['_remotes'][0][0]).toBe('remote-app');
      expect(plugin['_remotes'][0][1]).toEqual({
        external: ['remote-app@http://localhost:3001/remoteEntry.js'],
        shareScope: 'default',
      });
    });

    it('should handle remotes with array externals', () => {
      const options = {
        remotes: {
          'remote-app': [
            'remote-app@http://localhost:3001/remoteEntry.js',
            'fallback@http://localhost:3002/remoteEntry.js',
          ],
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      expect(plugin['_remotes'][0][0]).toBe('remote-app');
      expect(plugin['_remotes'][0][1].external).toEqual([
        'remote-app@http://localhost:3001/remoteEntry.js',
        'fallback@http://localhost:3002/remoteEntry.js',
      ]);
      expect(plugin['_remoteType']).toBe('script');
    });

    it('should handle remotes with explicit options', () => {
      const options = {
        remotes: {
          'remote-app': {
            external: 'remote-app@http://localhost:3001/remoteEntry.js',
            shareScope: 'custom',
          },
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      expect(plugin['_remotes'][0][0]).toBe('remote-app');
      expect(plugin['_remotes'][0][1]).toEqual({
        external: ['remote-app@http://localhost:3001/remoteEntry.js'],
        shareScope: 'custom',
      });
      expect(plugin['_remoteType']).toBe('script');
    });

    it('should handle remotes with custom array shareScope', () => {
      const options = {
        remotes: {
          'remote-app': {
            external: 'remote-app@http://localhost:3001/remoteEntry.js',
            shareScope: ['default', 'custom'],
          },
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      expect(plugin['_remotes'][0][0]).toBe('remote-app');
      expect(plugin['_remotes'][0][1].shareScope).toEqual([
        'default',
        'custom',
      ]);
      expect(plugin['_remoteType']).toBe('script');
    });
  });

  describe('apply', () => {
    it('should register compilation factory hook', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);
      plugin.apply(mockCompiler);

      const compilationTap = getTap(
        mockCompiler.hooks.compilation.tap as unknown as Mock,
        'ContainerReferencePlugin',
      );
      expect(compilationTap).toBeDefined();
    });

    it('should process remote modules during compilation', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      plugin.apply(mockCompiler);

      // Use createMockCompilation to get a properly structured mock compilation
      const { mockCompilation } = createMockCompilation();

      // Create a runtime hook that has a for method
      const runtimeRequirementInTree = {
        tap: rs.fn(),
        for: rs.fn().mockReturnValue({ tap: rs.fn() }),
      } as any;
      Object.assign(mockCompilation.hooks, {
        runtimeRequirementInTree,
        additionalTreeRuntimeRequirements: { tap: rs.fn() },
      });

      // Create mock params
      const mockParams = {
        normalModuleFactory: {
          hooks: {
            factorize: {
              tap: rs.fn(),
              tapAsync: rs.fn(),
            },
          },
        },
      };

      const compilationTap = getTap(
        mockCompiler.hooks.compilation.tap as unknown as Mock,
        'ContainerReferencePlugin',
      );
      compilationTap?.(mockCompilation, mockParams);

      // Verify dependency factories were set up
      expect(mockCompilation.dependencyFactories.size).toBeGreaterThan(0);
    });

    it('should apply FederationRuntimePlugin', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      // Reset mocks
      mocks.mockFederationRuntimePlugin.mockClear();
      mocks.mockApply.mockClear();

      const plugin = new ContainerReferencePlugin(options);
      plugin.apply(mockCompiler);

      // Verify FederationRuntimePlugin was created and applied
      expect(mocks.mockFederationRuntimePlugin).toHaveBeenCalled();
      expect(mocks.mockApply).toHaveBeenCalledWith(mockCompiler);
    });

    it('should create and apply ExternalsPlugin with correct remote externals', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      // Reset mocks
      mocks.mockExternalsPlugin.mockClear();

      const plugin = new ContainerReferencePlugin(options);
      plugin.apply(mockCompiler);

      // Verify ExternalsPlugin was created with correct externals
      expect(mocks.mockExternalsPlugin).toHaveBeenCalled();
      expect(mocks.mockExternalsPlugin.mock.calls[0][0]).toBe('script'); // remoteType
      expect(typeof mocks.mockExternalsPlugin.mock.calls[0][1]).toBe('object'); // remoteExternals
    });

    it('should register RemoteRuntimeModule', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      plugin.apply(mockCompiler);

      // Use createMockCompilation to get a properly structured mock compilation
      const { mockCompilation } = createMockCompilation();

      // Create a runtime hook that has a for method
      const runtimeRequirementInTree = {
        tap: rs.fn(),
        for: rs.fn().mockReturnValue({ tap: rs.fn() }),
      } as any;
      Object.assign(mockCompilation.hooks, {
        runtimeRequirementInTree,
        additionalTreeRuntimeRequirements: { tap: rs.fn() },
      });

      // Mock normalModuleFactory
      const mockParams = {
        normalModuleFactory: {
          hooks: {
            factorize: {
              tap: rs.fn(),
              tapAsync: rs.fn(),
            },
          },
        },
      };

      const compilationTap = getTap(
        mockCompiler.hooks.compilation.tap as unknown as Mock,
        'ContainerReferencePlugin',
      );
      compilationTap?.(mockCompilation, mockParams);

      expect(runtimeRequirementInTree.for).toHaveBeenCalled();
    });

    it('should hook into NormalModuleFactory factorize', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      // Mock the compilation callback
      plugin.apply(mockCompiler);

      // Use createMockCompilation to get a properly structured mock compilation
      const { mockCompilation } = createMockCompilation();

      // Create a runtime hook that has a for method
      const runtimeRequirementInTree = {
        tap: rs.fn(),
        for: rs.fn().mockReturnValue({ tap: rs.fn() }),
      } as any;
      Object.assign(mockCompilation.hooks, {
        runtimeRequirementInTree,
        additionalTreeRuntimeRequirements: { tap: rs.fn() },
      });

      // Mock normalModuleFactory with factorize hook
      const mockFactorizeHook = {
        tap: rs.fn(),
        tapAsync: rs.fn(),
      };

      const mockParams = {
        normalModuleFactory: {
          hooks: {
            factorize: mockFactorizeHook,
          },
        },
      };

      const compilationTap = getTap(
        mockCompiler.hooks.compilation.tap as unknown as Mock,
        'ContainerReferencePlugin',
      );
      compilationTap?.(mockCompilation, mockParams);

      // Verify factorize hook was tapped
      expect(mockFactorizeHook.tap).toHaveBeenCalledWith(
        'ContainerReferencePlugin',
        expect.any(Function),
      );
    });

    it('should handle array externals correctly', () => {
      const options = {
        remotes: {
          'remote-app': [
            'remote-app@http://localhost:3001/remoteEntry.js',
            'fallback@http://localhost:3002/remoteEntry.js',
          ],
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      // Check that remotes are correctly parsed
      expect(plugin['_remotes'][0][0]).toBe('remote-app');
      expect(plugin['_remotes'][0][1].external).toEqual([
        'remote-app@http://localhost:3001/remoteEntry.js',
        'fallback@http://localhost:3002/remoteEntry.js',
      ]);
    });

    it('should handle custom share scopes', () => {
      const options = {
        remotes: {
          'remote-app': {
            external: 'remote-app@http://localhost:3001/remoteEntry.js',
            shareScope: 'custom',
          },
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      // Check that shareScope is correctly set
      expect(plugin['_remotes'][0][0]).toBe('remote-app');
      expect(plugin['_remotes'][0][1].shareScope).toBe('custom');
    });

    describe('invalid configs', () => {
      it('handles invalid remote spec gracefully and registers hooks', () => {
        const options = {
          remotes: {
            bad: 'invalid-remote-spec',
          },
          remoteType: 'script',
        };

        const plugin = new ContainerReferencePlugin(options);
        expect(() => plugin.apply(mockCompiler)).not.toThrow();

        const compilationTap = getTap(
          mockCompiler.hooks.compilation.tap as unknown as Mock,
          'ContainerReferencePlugin',
        );
        expect(compilationTap).toBeDefined();
      });

      it('handles mixed array remotes with malformed entries', () => {
        const options = {
          remotes: {
            r1: ['app@http://localhost:3001/remoteEntry.js', 'still-bad'],
          },
          remoteType: 'script',
        };

        const plugin = new ContainerReferencePlugin(options);
        expect(() => plugin.apply(mockCompiler)).not.toThrow();

        // ExternalsPlugin should still be applied for the declared remoteType
        expect(mocks.mockExternalsPlugin).toHaveBeenCalled();
      });
    });
  });
});
