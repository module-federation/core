/*
 * @jest-environment node
 */

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
} from './utils';

// Create webpack mock
const webpack = createWebpackMock();

// Mock webpack
jest.mock(
  'webpack',
  () => {
    return {
      ...webpack,
      dependencies: {
        ModuleDependency: MockModuleDependency,
      },
      Dependency: class MockDependency {},
      ContextReplacementPlugin: jest.fn().mockImplementation(() => ({
        apply: jest.fn(),
      })),
    };
  },
  { virtual: true },
);

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

// Mock RemoteModule
const MockRemoteModule = createMockRemoteModule();
jest.mock('../../../src/lib/container/RemoteModule', () => MockRemoteModule, {
  virtual: true,
});

// Mock FederationRuntimePlugin
const mockApply = jest.fn();
const mockFederationRuntimePlugin = jest.fn().mockImplementation(() => ({
  apply: mockApply,
}));
jest.mock('../../../src/lib/container/runtime/FederationRuntimePlugin', () => {
  return mockFederationRuntimePlugin;
});

// Mock FallbackModuleFactory
jest.mock(
  '../../../src/lib/container/FallbackModuleFactory',
  () => {
    return class MockFallbackModuleFactory {
      constructor() {
        // Empty constructor with comment to avoid linter warning
      }

      create(data, callback) {
        callback(null, { fallback: true });
      }
    };
  },
  { virtual: true },
);

// Mock RemoteRuntimeModule
jest.mock(
  '../../../src/lib/container/RemoteRuntimeModule',
  () => {
    return class MockRemoteRuntimeModule {
      constructor() {
        // Empty constructor with comment to avoid linter warning
      }
    };
  },
  { virtual: true },
);

// Mock ExternalsPlugin
const mockExternalsPlugin = jest.fn().mockImplementation(() => ({
  apply: jest.fn(),
}));

webpack.ExternalsPlugin = mockExternalsPlugin;

// Import container reference plugin after mocks
const ContainerReferencePlugin =
  require('../../../src/lib/container/ContainerReferencePlugin').default;

// Define hook type
type HookMock = {
  tap: jest.Mock;
  tapAsync?: jest.Mock;
  tapPromise?: jest.Mock;
  call?: jest.Mock;
  for?: jest.Mock;
};

type RuntimeHookMock = HookMock & {
  for: jest.Mock;
};

describe('ContainerReferencePlugin', () => {
  let mockCompiler;

  beforeEach(() => {
    jest.clearAllMocks();
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
      ExternalsPlugin: mockExternalsPlugin,
    };
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

      // Verify compilation hook was tapped
      expect(mockCompiler.hooks.compilation.tap).toHaveBeenCalledWith(
        'ContainerReferencePlugin',
        expect.any(Function),
      );
    });

    it('should process remote modules during compilation', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      // Mock the factorize hook to avoid "tap is not a function" error
      mockCompiler.hooks.compilation.tap.mockImplementation(
        (name, callback) => {
          // Store the callback so we can call it with mocked params
          mockCompiler.hooks.compilation._callback = callback;
        },
      );

      plugin.apply(mockCompiler);

      // Use createMockCompilation to get a properly structured mock compilation
      const { mockCompilation } = createMockCompilation();

      // Create a runtime hook that has a for method
      const runtimeHook: RuntimeHookMock = {
        tap: jest.fn(),
        for: jest.fn(),
      };

      // Make for return an object with tap method
      runtimeHook.for.mockReturnValue({ tap: jest.fn() });

      // Add the hooks to the mockCompilation
      mockCompilation.hooks = {
        ...mockCompilation.hooks,
        runtimeRequirementInTree: runtimeHook,
        additionalTreeRuntimeRequirements: { tap: jest.fn() },
      };

      // Create mock params
      const mockParams = {
        normalModuleFactory: {
          hooks: {
            factorize: {
              tap: jest.fn(),
              tapAsync: jest.fn(),
            },
          },
        },
      };

      // Call the stored compilation callback
      if (mockCompiler.hooks.compilation._callback) {
        mockCompiler.hooks.compilation._callback(mockCompilation, mockParams);
      }

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
      mockFederationRuntimePlugin.mockClear();
      mockApply.mockClear();

      const plugin = new ContainerReferencePlugin(options);
      plugin.apply(mockCompiler);

      // Verify FederationRuntimePlugin was created and applied
      expect(mockFederationRuntimePlugin).toHaveBeenCalled();
      expect(mockApply).toHaveBeenCalledWith(mockCompiler);
    });

    it('should create and apply ExternalsPlugin with correct remote externals', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      // Reset mocks
      mockExternalsPlugin.mockClear();

      const plugin = new ContainerReferencePlugin(options);
      plugin.apply(mockCompiler);

      // Verify ExternalsPlugin was created with correct externals
      expect(mockExternalsPlugin).toHaveBeenCalled();
      expect(mockExternalsPlugin.mock.calls[0][0]).toBe('script'); // remoteType
      expect(typeof mockExternalsPlugin.mock.calls[0][1]).toBe('object'); // remoteExternals
    });

    it('should register RemoteRuntimeModule', () => {
      const options = {
        remotes: {
          'remote-app': 'remote-app@http://localhost:3001/remoteEntry.js',
        },
        remoteType: 'script',
      };

      const plugin = new ContainerReferencePlugin(options);

      // Mock the compilation hook
      mockCompiler.hooks.compilation.tap.mockImplementation(
        (name, callback) => {
          mockCompiler.hooks.compilation._callback = callback;
        },
      );

      plugin.apply(mockCompiler);

      // Use createMockCompilation to get a properly structured mock compilation
      const { mockCompilation } = createMockCompilation();

      // Create a runtime hook that has a for method
      const runtimeHook: RuntimeHookMock = {
        tap: jest.fn(),
        for: jest.fn(),
      };

      // Make for return an object with tap method
      runtimeHook.for.mockReturnValue({ tap: jest.fn() });

      // Add the hooks to the mockCompilation
      mockCompilation.hooks = {
        ...mockCompilation.hooks,
        runtimeRequirementInTree: runtimeHook,
        additionalTreeRuntimeRequirements: { tap: jest.fn() },
      };

      // Mock normalModuleFactory
      const mockParams = {
        normalModuleFactory: {
          hooks: {
            factorize: {
              tap: jest.fn(),
              tapAsync: jest.fn(),
            },
          },
        },
      };

      // Call the compilation callback
      if (mockCompiler.hooks.compilation._callback) {
        mockCompiler.hooks.compilation._callback(mockCompilation, mockParams);
      }

      // Verify runtime hooks were set up
      expect(
        (mockCompilation.hooks.runtimeRequirementInTree as RuntimeHookMock).for,
      ).toHaveBeenCalled();
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
      mockCompiler.hooks.compilation.tap.mockImplementation(
        (name, callback) => {
          mockCompiler.hooks.compilation._callback = callback;
        },
      );

      plugin.apply(mockCompiler);

      // Use createMockCompilation to get a properly structured mock compilation
      const { mockCompilation } = createMockCompilation();

      // Create a runtime hook that has a for method
      const runtimeHook: RuntimeHookMock = {
        tap: jest.fn(),
        for: jest.fn(),
      };

      // Make for return an object with tap method
      runtimeHook.for.mockReturnValue({ tap: jest.fn() });

      // Add the hooks to the mockCompilation
      mockCompilation.hooks = {
        ...mockCompilation.hooks,
        runtimeRequirementInTree: runtimeHook,
        additionalTreeRuntimeRequirements: { tap: jest.fn() },
      };

      // Mock normalModuleFactory with factorize hook
      const mockFactorizeHook = {
        tap: jest.fn(),
        tapAsync: jest.fn(),
      };

      const mockParams = {
        normalModuleFactory: {
          hooks: {
            factorize: mockFactorizeHook,
          },
        },
      };

      // Call the compilation callback
      if (mockCompiler.hooks.compilation._callback) {
        mockCompiler.hooks.compilation._callback(mockCompilation, mockParams);
      }

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
  });
});
