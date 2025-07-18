/*
 * @jest-environment node
 */

import {
  shareScopes,
  createWebpackMock,
  createModuleMock,
  createMockConsumeSharedDependencies,
  createMockConsumeSharedModule,
  createMockRuntimeModules,
  createSharingTestEnvironment,
} from './utils';
import { satisfy } from '@module-federation/runtime-tools/runtime-core';

// Create webpack mock
const webpack = createWebpackMock();
// Create Module mock - Module class is created but not directly used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Module = createModuleMock(webpack);
// Create ConsumeShared dependencies
const { MockConsumeSharedDependency, MockConsumeSharedFallbackDependency } =
  createMockConsumeSharedDependencies();
// Create mock modules
const mockConsumeSharedModule = createMockConsumeSharedModule();
// Create mock runtime modules
const { mockConsumeSharedRuntimeModule, mockShareRuntimeModule } =
  createMockRuntimeModules();

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

// Mock ProvideForSharedDependency
jest.mock('../../../src/lib/sharing/ProvideForSharedDependency', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

// Mock FederationRuntimePlugin
jest.mock('../../../src/lib/container/runtime/FederationRuntimePlugin', () => {
  return jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
});

// Mock ConsumeSharedRuntimeModule
jest.mock('../../../src/lib/sharing/ConsumeSharedRuntimeModule', () => {
  return mockConsumeSharedRuntimeModule;
});

// Mock ShareRuntimeModule
jest.mock('../../../src/lib/sharing/ShareRuntimeModule', () => {
  return mockShareRuntimeModule;
});

// Direct dependency mocks - these don't require actual file paths
jest.mock(
  '../../../src/lib/sharing/ConsumeSharedDependency',
  () => {
    return function (request, shareScope, requiredVersion) {
      return new MockConsumeSharedDependency(
        request,
        shareScope,
        requiredVersion,
      );
    };
  },
  { virtual: true },
);

jest.mock(
  '../../../src/lib/sharing/ConsumeSharedFallbackDependency',
  () => {
    return function (fallbackRequest, shareScope, requiredVersion) {
      return new MockConsumeSharedFallbackDependency(
        fallbackRequest,
        shareScope,
        requiredVersion,
      );
    };
  },
  { virtual: true },
);

// Mock ProvideForSharedDependency
jest.mock(
  '../../../src/lib/sharing/ProvideForSharedDependency',
  () => {
    return class ProvideForSharedDependency {
      // Empty class to satisfy instanceof checks
    };
  },
  { virtual: true },
);

// Mock resolveMatchedConfigs module
jest.mock('../../../src/lib/sharing/resolveMatchedConfigs');

// Mock utils module - only mock specific functions
jest.mock('../../../src/lib/sharing/utils', () => {
  const actual = jest.requireActual('../../../src/lib/sharing/utils');
  return {
    ...actual,
    getDescriptionFile: jest.fn(),
    addSingletonFilterWarning: jest.fn(),
    extractPathAfterNodeModules: jest.fn(),
    testRequestFilters: jest.fn(),
  };
});

// Mock ConsumeSharedModule (Restore)
jest.mock('../../../src/lib/sharing/ConsumeSharedModule', () => {
  return mockConsumeSharedModule; // Use the factory mock
});

// Mock ConsumeSharedRuntimeModule
jest.mock('../../../src/lib/sharing/ConsumeSharedRuntimeModule', () => {
  return mockConsumeSharedRuntimeModule;
});

// Mock satisfy function (Restore)
jest.mock('@module-federation/runtime-tools/runtime-core', () => ({
  satisfy: jest.fn(),
}));

// Import after mocks are set up
const ConsumeSharedPlugin =
  require('../../../src/lib/sharing/ConsumeSharedPlugin').default;

// Import the MOCKED functions HERE
const {
  resolveMatchedConfigs,
} = require('../../../src/lib/sharing/resolveMatchedConfigs');
const {
  getDescriptionFile,
  addSingletonFilterWarning,
  extractPathAfterNodeModules,
  testRequestFilters,
} = require('../../../src/lib/sharing/utils');
// These dependencies are used internally by the plugin through mocks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProvideForSharedDependency = require('../../../src/lib/sharing/ProvideForSharedDependency');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ConsumeSharedFallbackDependency = MockConsumeSharedFallbackDependency;

describe('ConsumeSharedPlugin', () => {
  // --- Global beforeEach for default mocks ---
  beforeEach(() => {
    // Clear mocks but maintain default implementation strategy
    jest.clearAllMocks();
    // Reset specific mocks to clear implementations/resolved values
    (resolveMatchedConfigs as jest.Mock).mockReset();
    (getDescriptionFile as jest.Mock).mockReset();

    // Set a default implementation for resolveMatchedConfigs that returns a promise
    (resolveMatchedConfigs as jest.Mock).mockImplementation(async () => ({
      resolved: new Map(),
      unresolved: new Map(),
      prefixed: new Map(),
    }));
    // Default mock for getDescriptionFile
    (getDescriptionFile as jest.Mock).mockImplementation(
      (fs, context, files, callback) => {
        callback(null, { data: { version: '0.0.0' } }, []); // Default successful callback
      },
    );
  });
  // -------------------------------------------

  describe('constructor', () => {
    it('should initialize with string shareScope', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      });

      // Test private property is set correctly
      const consumes = plugin._consumes;

      expect(consumes.length).toBe(1);
      expect(consumes[0][0]).toBe('react');
      expect(consumes[0][1].shareScope).toBe(shareScopes.string);
      expect(consumes[0][1].requiredVersion).toBe('^17.0.0');
    });

    it('should initialize with array shareScope', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.array,
        consumes: {
          react: '^17.0.0',
        },
      });

      const consumes = plugin._consumes;
      const [, config] = consumes[0];

      expect(config.shareScope).toEqual(shareScopes.array);
    });

    it('should handle consumes with explicit options', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            strictVersion: true,
            singleton: true,
            eager: false,
          },
        },
      });

      const consumes = plugin._consumes;
      const [, config] = consumes[0];

      expect(config.shareScope).toBe(shareScopes.string);
      expect(config.requiredVersion).toBe('^17.0.0');
      expect(config.strictVersion).toBe(true);
      expect(config.singleton).toBe(true);
      expect(config.eager).toBe(false);
    });

    it('should handle consumes with custom shareScope', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            shareScope: 'custom-scope',
            requiredVersion: '^17.0.0',
          },
        },
      });

      const consumes = plugin._consumes;
      const [, config] = consumes[0];

      expect(config.shareScope).toBe('custom-scope');
    });
  });

  describe('module creation', () => {
    it('should create ConsumeSharedModule with correct options', () => {
      const options = {
        request: 'react',
        shareScope: shareScopes.array,
        requiredVersion: '^17.0.0',
      };
      const testModule = mockConsumeSharedModule(null, options); // Pass null context
      expect(testModule.shareScope).toEqual(shareScopes.array);
      expect(testModule.request).toBe('react');
      expect(testModule.requiredVersion).toBe('^17.0.0');
    });

    it('should handle prefixed modules correctly', () => {
      const options = {
        request: 'prefix/component',
        shareScope: shareScopes.string,
        requiredVersion: '^1.0.0',
      };
      const testModule = mockConsumeSharedModule(null, options); // Pass null context
      expect(testModule.shareScope).toBe(shareScopes.string);
      expect(testModule.request).toBe('prefix/component');
      expect(testModule.requiredVersion).toBe('^1.0.0');
    });

    it('should respect issuerLayer from contextInfo', () => {
      const options = {
        request: 'react',
        shareScope: shareScopes.string,
        requiredVersion: '^17.0.0',
        layer: 'test-layer',
      };
      const testModule = mockConsumeSharedModule(null, options); // Pass null context
      expect(testModule.options.layer).toBe('test-layer');
    });
  });

  describe('apply', () => {
    let testEnv;

    beforeEach(() => {
      jest.clearAllMocks();
      testEnv = createSharingTestEnvironment();
    });

    it('should register hooks when plugin is applied', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      });

      // Apply the plugin
      plugin.apply(testEnv.compiler);

      // Simulate the compilation phase
      testEnv.simulateCompilation();

      // Check that thisCompilation and compilation hooks were tapped
      expect(testEnv.compiler.hooks.thisCompilation.tap).toHaveBeenCalled();
      expect(
        testEnv.mockCompilation.hooks.additionalTreeRuntimeRequirements.tap,
      ).toHaveBeenCalled();
    });

    it('should add runtime modules when runtimeRequirements callback is called', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      });

      // Apply the plugin
      plugin.apply(testEnv.compiler);

      // Simulate the compilation phase
      testEnv.simulateCompilation();

      // Simulate runtime requirements
      const runtimeRequirements = testEnv.simulateRuntimeRequirements();

      // Verify runtime requirement was added
      expect(runtimeRequirements.has('__webpack_share_scopes__')).toBe(true);

      // Verify runtime modules were added
      expect(testEnv.mockCompilation.addRuntimeModule).toHaveBeenCalled();
    });
  });

  describe('exclude functionality', () => {
    let testEnv;

    beforeEach(() => {
      testEnv = createSharingTestEnvironment();
      mockConsumeSharedModule.mockClear();
      (getDescriptionFile as jest.Mock).mockReset();

      // Make resolveMatchedConfigs return a Promise directly
      (resolveMatchedConfigs as jest.Mock).mockReturnValue(
        Promise.resolve({
          resolved: new Map(),
          unresolved: new Map(),
          prefixed: new Map(),
        }),
      );
    });

    describe('version-based exclusion', () => {
      // Add beforeEach to reset satisfy mock
      beforeEach(() => {
        (satisfy as jest.Mock).mockReset();
      });

      it('should exclude module when package version matches exclude.version', async () => {
        const plugin = new ConsumeSharedPlugin({
          consumes: {
            react: {
              import: './react-fallback',
              requiredVersion: '^17.0.0',
              exclude: { version: '^17.0.0' },
              shareScope: 'test-scope',
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        (resolveMatchedConfigs as jest.Mock).mockResolvedValueOnce({
          resolved: new Map(),
          unresolved: new Map([['react', plugin._consumes[0][1]]]),
          prefixed: new Map(),
        });

        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: '17.0.2' } }, [
              'package.json',
            ]);
          },
        );

        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        // Explicitly mock satisfy for this test
        (satisfy as jest.Mock).mockImplementationOnce(() => true); // Should exclude

        // We don't need the factorize hook, but need resolver for createConsumeSharedModule internal call
        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        // Directly call createConsumeSharedModule
        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          plugin._consumes[0][1],
        );

        expect(result).toBeUndefined(); // Module should be undefined since version matches exclude
      });

      it('should not exclude module when package version does not match exclude.version', async () => {
        const testConfig = {
          import: './react-fallback',
          shareScope: 'test-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
          exclude: {
            version: '^16.0.0',
          },
          request: 'react',
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock resolveMatchedConfigs to return our config
        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['react', testConfig]]),
            prefixed: new Map(),
          }),
        );

        // Mock resolver to return a valid path
        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        // Mock getDescriptionFile to return a version that shouldn't match exclude
        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: '17.0.2' } }, [
              'package.json',
            ]);
          },
        );

        // Mock satisfy to return false (version doesn't match exclude)
        (satisfy as jest.Mock).mockImplementationOnce(() => false);

        // Directly call createConsumeSharedModule
        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeDefined();
        expect(satisfy).toHaveBeenCalledWith('17.0.2', '^16.0.0');
        expect(result).toHaveProperty('options', {
          ...testConfig,
          importResolved: '/mock/fallback/react',
        });
      });

      it('should handle fallbackVersion in exclude configuration', async () => {
        const testConfig = {
          import: './react-fallback',
          shareScope: 'test-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
          exclude: {
            version: '^16.0.0',
            fallbackVersion: '17.0.2',
          },
          request: 'react',
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock resolveMatchedConfigs to return our config
        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['react', testConfig]]),
            prefixed: new Map(),
          }),
        );

        // Mock satisfy to return true for fallbackVersion matching exclude version
        (satisfy as jest.Mock).mockImplementationOnce(() => true);

        // Directly call createConsumeSharedModule
        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeUndefined();
        expect(satisfy).toHaveBeenCalledWith('17.0.2', '^16.0.0');
      });

      it('should not exclude module when fallbackVersion does not match exclude version', async () => {
        const testConfig = {
          import: './react-fallback',
          shareScope: 'test-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
          exclude: {
            version: '^16.0.0',
            fallbackVersion: '17.0.2',
          },
          request: 'react',
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock resolveMatchedConfigs to return our config
        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['react', testConfig]]),
            prefixed: new Map(),
          }),
        );

        // Mock resolver to return a valid path
        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        // Mock satisfy to return false (fallbackVersion doesn't match exclude version)
        (satisfy as jest.Mock).mockImplementationOnce(() => false);

        // Directly call createConsumeSharedModule
        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeDefined();
        expect(satisfy).toHaveBeenCalledWith('17.0.2', '^16.0.0');
        expect(result).toHaveProperty('options', {
          ...testConfig,
          importResolved: '/mock/fallback/react',
        });
      });
    });

    describe('request-based exclusion', () => {
      beforeEach(() => {
        (satisfy as jest.Mock).mockReset(); // Keep satisfy reset here if needed
      });

      it('should exclude module when request matches exclude.request pattern', async () => {
        const testConfig = {
          import: './base-path', // No trailing slash
          shareScope: 'test-scope',
          shareKey: '@scope/prefix', // No trailing slash
          requiredVersion: '^1.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
          exclude: {
            request: /excluded-path$/, // Match remainder without leading slash
          },
          request: '@scope/prefix/', // Add trailing slash only to request
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { '@scope/prefix/': testConfig }, // Add trailing slash to prefix key
        });

        // Apply the plugin and simulate compilation
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock resolveMatchedConfigs to return our config in prefixed map
        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map(),
            prefixed: new Map([['@scope/prefix/', testConfig]]), // Add trailing slash to prefix key
          }),
        );

        // Mock resolver to return a path that should match our exclude pattern
        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/base-path/excluded-path');
          },
        );

        // Call the factorize hook through the normalModuleFactory
        const result = await testEnv.normalModuleFactory.factorize({
          context: '/mock/context',
          request: '@scope/prefix/excluded-path', // Full request path
          dependencies: [{}],
          contextInfo: {},
        });

        expect(result).toBeUndefined();
      });

      it('should not exclude module when request does not match exclude.request pattern', async () => {
        const testConfig = {
          import: './react-fallback',
          shareScope: 'test-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
          exclude: {
            request: /^@scoped\//, // Example pattern that won't match 'react'
          },
          request: 'react',
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock resolveMatchedConfigs to return our config
        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['react', testConfig]]),
            prefixed: new Map(),
          }),
        );

        // Mock resolver to return a valid path
        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        // Mock getDescriptionFile to return a version
        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: '17.0.2' } }, [
              'package.json',
            ]);
          },
        );

        // Directly call createConsumeSharedModule
        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('options', {
          ...testConfig,
          importResolved: '/mock/fallback/react',
        });
      });
    });
  });

  describe('include functionality', () => {
    let testEnv: any;

    beforeEach(() => {
      testEnv = createSharingTestEnvironment();
      mockConsumeSharedModule.mockClear();
      (getDescriptionFile as jest.Mock).mockReset();
      (satisfy as jest.Mock).mockReset();

      (resolveMatchedConfigs as jest.Mock).mockReturnValue(
        Promise.resolve({
          resolved: new Map(),
          unresolved: new Map(),
          prefixed: new Map(),
        }),
      );
    });

    describe('version-based inclusion', () => {
      it('should include module when package version matches include.version', async () => {
        const testConfig = {
          import: './react-fallback',
          shareScope: 'test-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          include: {
            version: '^17.0.0',
          },
          request: 'react',
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['react', testConfig]]),
            prefixed: new Map(),
          }),
        );

        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: '17.0.2' } }, [
              'package.json',
            ]);
          },
        );

        (satisfy as jest.Mock).mockImplementationOnce(() => true);

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeDefined();
        expect(satisfy).toHaveBeenCalledWith('17.0.2', '^17.0.0');
        expect(result).toHaveProperty('options', {
          ...testConfig,
          importResolved: '/mock/fallback/react',
        });
      });

      it('should exclude module when package version does not match include.version', async () => {
        const testConfig = {
          import: './react-fallback',
          shareScope: 'test-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          include: {
            version: '^16.0.0',
          },
          request: 'react',
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['react', testConfig]]),
            prefixed: new Map(),
          }),
        );

        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: '17.0.2' } }, [
              'package.json',
            ]);
          },
        );

        (satisfy as jest.Mock).mockImplementationOnce(() => false);

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeUndefined();
        expect(satisfy).toHaveBeenCalledWith('17.0.2', '^16.0.0');
      });

      it('should handle fallbackVersion in include configuration', async () => {
        const testConfig = {
          import: './react-fallback',
          shareScope: 'test-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          include: {
            version: '^16.0.0',
            fallbackVersion: '17.0.2',
          },
          request: 'react',
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['react', testConfig]]),
            prefixed: new Map(),
          }),
        );

        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        // Mock getDescriptionFile to return version that doesn't match include
        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: '18.0.0' } }, [
              'package.json',
            ]);
          },
        );

        // First satisfy call returns false (version doesn't match include)
        // Second satisfy call returns true (fallbackVersion matches include)
        (satisfy as jest.Mock)
          .mockImplementationOnce(() => false)
          .mockImplementationOnce(() => true);

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeDefined();
        expect(satisfy).toHaveBeenCalledWith('18.0.0', '^16.0.0');
        expect(satisfy).toHaveBeenCalledWith('17.0.2', '^16.0.0');
      });

      it('should add singleton filter warning when using include.version with singleton', async () => {
        const testConfig = {
          import: './react-fallback',
          shareScope: 'test-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          singleton: true,
          include: {
            version: '^17.0.0',
          },
          request: 'react',
        };
        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });
        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['react', testConfig]]),
            prefixed: new Map(),
          }),
        );

        testEnv.mockResolver.resolve.mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/mock/fallback/react');
          },
        );

        // Mock getDescriptionFile to return package.json - need to mock twice
        // Once for checking include.version, second for any other check
        (getDescriptionFile as jest.Mock)
          .mockImplementationOnce((fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: '17.0.2' } }, [
              'package.json',
            ]);
          })
          .mockImplementationOnce((fs, context, files, callback) => {
            callback(
              null,
              { data: { name: 'my-app', dependencies: { react: '^17.0.0' } } },
              ['package.json'],
            );
          });

        (satisfy as jest.Mock).mockImplementationOnce(() => true);

        // Mock addSingletonFilterWarning to add a warning
        (addSingletonFilterWarning as jest.Mock).mockImplementationOnce(
          (compilation) => {
            compilation.warnings.push({
              message:
                'The module "react" using singleton constraint might not work as expected with include.version filter "^17.0.0".',
            });
          },
        );

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeDefined();
        // Check that a warning was added to compilation
        expect(testEnv.mockCompilation.warnings).toHaveLength(1);
        expect(testEnv.mockCompilation.warnings[0].message).toContain(
          'singleton constraint',
        );
      });
    });
  });

  describe('required version resolution', () => {
    let testEnv: any;

    beforeEach(() => {
      testEnv = createSharingTestEnvironment();
      jest.clearAllMocks();
      (getDescriptionFile as jest.Mock).mockReset();
      (resolveMatchedConfigs as jest.Mock).mockReturnValue(
        Promise.resolve({
          resolved: new Map(),
          unresolved: new Map(),
          prefixed: new Map(),
        }),
      );
    });

    it('should automatically detect required version from package.json dependencies', async () => {
      const plugin = new ConsumeSharedPlugin({
        consumes: {
          react: {
            import: './react-fallback',
            shareScope: 'test-scope',
          },
        },
      });
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      const testConfig = plugin._consumes[0][1];

      testEnv.mockResolver.resolve.mockImplementationOnce(
        (ctx, context, request, resolveContext, callback) => {
          callback(null, '/mock/fallback/react');
        },
      );

      // Need to mock getDescriptionFile twice - once for required version resolution,
      // once for any other potential check
      (getDescriptionFile as jest.Mock)
        .mockImplementationOnce((fs, context, files, callback) => {
          callback(
            null,
            {
              data: {
                name: 'my-app',
                dependencies: { react: '^17.0.2' },
              },
            },
            ['package.json'],
          );
        })
        .mockImplementationOnce((fs, context, files, callback) => {
          callback(
            null,
            {
              data: {
                name: 'my-app',
                dependencies: { react: '^17.0.2' },
              },
            },
            ['package.json'],
          );
        });

      const result = await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        'react',
        testConfig,
      );

      expect(result).toBeDefined();
      expect(result.options.requiredVersion).toBe('^17.0.2');
    });

    it('should handle package self-referencing', async () => {
      const plugin = new ConsumeSharedPlugin({
        consumes: {
          'my-package': {
            import: './my-package-fallback',
            shareScope: 'test-scope',
          },
        },
      });
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      const testConfig = plugin._consumes[0][1];

      testEnv.mockResolver.resolve.mockImplementationOnce(
        (ctx, context, request, resolveContext, callback) => {
          callback(null, '/mock/fallback/my-package');
        },
      );

      // Mock getDescriptionFile to return package.json with same name
      (getDescriptionFile as jest.Mock).mockImplementationOnce(
        (fs, context, files, callback) => {
          callback(
            null,
            {
              data: {
                name: 'my-package',
                version: '1.0.0',
              },
            },
            ['package.json'],
          );
        },
      );

      const result = await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        'my-package',
        testConfig,
      );

      expect(result).toBeDefined();
      expect(result.options.requiredVersion).toBeUndefined();
    });

    it('should warn when unable to determine required version', async () => {
      const plugin = new ConsumeSharedPlugin({
        consumes: {
          react: {
            import: './react-fallback',
            shareScope: 'test-scope',
          },
        },
      });
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      const testConfig = plugin._consumes[0][1];

      testEnv.mockResolver.resolve.mockImplementationOnce(
        (ctx, context, request, resolveContext, callback) => {
          callback(null, '/mock/fallback/react');
        },
      );

      // Mock getDescriptionFile to return error
      (getDescriptionFile as jest.Mock).mockImplementationOnce(
        (fs, context, files, callback) => {
          callback(new Error('File not found'), null, null);
        },
      );

      const result = await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        'react',
        testConfig,
      );

      expect(result).toBeDefined();
      expect(result.options.requiredVersion).toBeUndefined();
      expect(testEnv.mockCompilation.warnings).toHaveLength(1);
      expect(testEnv.mockCompilation.warnings[0].message).toContain(
        'Unable to read description file',
      );
    });

    it('should extract package name from scoped packages', async () => {
      const plugin = new ConsumeSharedPlugin({
        consumes: {
          '@scope/package': {
            import: './@scope/package-fallback',
            shareScope: 'test-scope',
          },
        },
      });
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      const testConfig = plugin._consumes[0][1];

      testEnv.mockResolver.resolve.mockImplementationOnce(
        (ctx, context, request, resolveContext, callback) => {
          callback(null, '/mock/fallback/@scope/package');
        },
      );

      (getDescriptionFile as jest.Mock)
        .mockImplementationOnce((fs, context, files, callback) => {
          callback(
            null,
            {
              data: {
                name: 'my-app',
                dependencies: { '@scope/package': '^2.0.0' },
              },
            },
            ['package.json'],
          );
        })
        .mockImplementationOnce((fs, context, files, callback) => {
          callback(
            null,
            {
              data: {
                name: 'my-app',
                dependencies: { '@scope/package': '^2.0.0' },
              },
            },
            ['package.json'],
          );
        });

      const result = await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        '@scope/package',
        testConfig,
      );

      expect(result).toBeDefined();
      expect(result.options.requiredVersion).toBe('^2.0.0');
    });
  });

  describe('node modules path reconstruction', () => {
    let testEnv: any;

    beforeEach(() => {
      testEnv = createSharingTestEnvironment();
      jest.clearAllMocks();
      // Set up the default mock implementation
      (resolveMatchedConfigs as jest.Mock).mockImplementation(async () => ({
        resolved: new Map(),
        unresolved: new Map(),
        prefixed: new Map(),
      }));
    });

    it('should handle relative path requests with node_modules reconstruction', async () => {
      const plugin = new ConsumeSharedPlugin({
        consumes: {
          react: {
            import: 'react',
            shareScope: 'test-scope',
            nodeModulesReconstructedLookup: true,
          },
        },
      });

      // Mock extractPathAfterNodeModules to return the module name
      (extractPathAfterNodeModules as jest.Mock).mockImplementation((path) => {
        if (path.includes('node_modules/react')) {
          return 'react';
        }
        return null;
      });

      // createLookupKeyForSharing is not mocked, so it should work correctly

      // Mock resolveMatchedConfigs to return config in unresolved map
      // This must be done BEFORE simulateCompilation
      (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(async () => ({
        resolved: new Map(),
        unresolved: new Map([['react', plugin._consumes[0][1]]]),
        prefixed: new Map(),
      }));

      // Add mock for resolver to resolve the import
      testEnv.mockResolver.resolve.mockImplementationOnce(
        (
          _ctx: any,
          _context: any,
          _request: any,
          _resolveContext: any,
          callback: any,
        ) => {
          callback(null, '/mock/node_modules/react');
        },
      );

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Mock the factorize hook call with a relative path that resolves to node_modules
      const result = await testEnv.normalModuleFactory.factorize({
        context: '/mock/src/components',
        request: '../../node_modules/react',
        dependencies: [{}],
        contextInfo: {},
      });

      // Verify the result is a ConsumeSharedModule
      expect(result).toBeDefined();
      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        expect.any(String), // context
        expect.objectContaining({
          request: 'react',
          shareScope: 'test-scope',
          nodeModulesReconstructedLookup: true,
        }),
      );
    });

    it('should match prefixed consumes with node_modules paths', async () => {
      const prefixConfig = {
        import: 'react-components/',
        shareScope: 'test-scope',
        shareKey: 'react-components/',
        nodeModulesReconstructedLookup: true,
        request: 'react-components/',
      };

      // Mock resolveMatchedConfigs to return config in prefixed map
      // This must be done BEFORE creating the plugin
      (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(async () => ({
        resolved: new Map(),
        unresolved: new Map(),
        prefixed: new Map([['react-components/', prefixConfig]]),
      }));

      const plugin = new ConsumeSharedPlugin({
        consumes: {
          'react-components/': prefixConfig,
        },
      });

      // Mock extractPathAfterNodeModules to return the module path
      (extractPathAfterNodeModules as jest.Mock).mockImplementation((path) => {
        if (path.includes('node_modules/react-components/')) {
          return path.split('node_modules/')[1];
        }
        return null;
      });

      // Mock testRequestFilters to allow all requests
      (testRequestFilters as jest.Mock).mockImplementation(() => true);

      // Add mock for resolver to resolve the import
      testEnv.mockResolver.resolve.mockImplementationOnce(
        (
          _ctx: any,
          _context: any,
          _request: any,
          _resolveContext: any,
          callback: any,
        ) => {
          callback(null, '/mock/node_modules/react-components/button');
        },
      );

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Mock the factorize hook call with a relative path that resolves to node_modules
      await testEnv.normalModuleFactory.factorize({
        context: '/mock/src/components',
        request: '../../node_modules/react-components/button',
        dependencies: [{}],
        contextInfo: {},
      });

      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/mock/src/components',
        expect.objectContaining({
          shareKey: 'react-components/button',
          import: 'react-components/button',
        }),
      );
    });
  });

  describe('error handling', () => {
    let testEnv: any;

    beforeEach(() => {
      testEnv = createSharingTestEnvironment();
      jest.clearAllMocks();
    });

    it('should handle import resolution failure', async () => {
      const plugin = new ConsumeSharedPlugin({
        consumes: {
          react: {
            import: './non-existent-fallback',
            shareScope: 'test-scope',
            requiredVersion: '^17.0.0',
          },
        },
      });
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      const testConfig = plugin._consumes[0][1];

      // Mock resolver to return error
      testEnv.mockResolver.resolve.mockImplementationOnce(
        (ctx, context, request, resolveContext, callback) => {
          callback(new Error('Module not found'), null);
        },
      );

      const result = await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        'react',
        testConfig,
      );

      expect(result).toBeDefined();
      expect(result.options.importResolved).toBeUndefined();
      expect(testEnv.mockCompilation.errors).toHaveLength(1);
      // The error is a ModuleNotFoundError instance
      const error = testEnv.mockCompilation.errors[0];
      expect(error).toBeDefined();
    });

    it('should add dependencies to compilation when resolving', async () => {
      const plugin = new ConsumeSharedPlugin({
        consumes: {
          react: {
            import: './react-fallback',
            shareScope: 'test-scope',
            requiredVersion: '^17.0.0',
          },
        },
      });
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      const testConfig = plugin._consumes[0][1];

      const mockFileDeps = new Set(['file1.js']);
      const mockContextDeps = new Set(['dir1']);
      const mockMissingDeps = new Set(['missing1.js']);

      testEnv.mockResolver.resolve.mockImplementationOnce(
        (ctx, context, request, resolveContext, callback) => {
          // Simulate resolver adding dependencies
          resolveContext.fileDependencies = mockFileDeps;
          resolveContext.contextDependencies = mockContextDeps;
          resolveContext.missingDependencies = mockMissingDeps;
          callback(null, '/mock/fallback/react');
        },
      );

      await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        'react',
        testConfig,
      );

      expect(
        testEnv.mockCompilation.contextDependencies.addAll,
      ).toHaveBeenCalledWith(mockContextDeps);
      expect(
        testEnv.mockCompilation.fileDependencies.addAll,
      ).toHaveBeenCalledWith(mockFileDeps);
      expect(
        testEnv.mockCompilation.missingDependencies.addAll,
      ).toHaveBeenCalledWith(mockMissingDeps);
    });
  });

  describe('prefixed consumes with filters', () => {
    let testEnv: any;

    beforeEach(() => {
      testEnv = createSharingTestEnvironment();
      jest.clearAllMocks();
    });

    it('should apply include and exclude filters to prefixed consumes', async () => {
      const prefixConfig = {
        import: '@scope/components/',
        shareScope: 'test-scope',
        shareKey: '@scope/components/',
        include: {
          request: /^button|input$/,
        },
        exclude: {
          request: /deprecated/,
        },
        request: '@scope/components/',
      };

      // Mock resolveMatchedConfigs BEFORE creating the plugin
      (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(async () => ({
        resolved: new Map(),
        unresolved: new Map(),
        prefixed: new Map([['@scope/components/', prefixConfig]]),
      }));

      const plugin = new ConsumeSharedPlugin({
        consumes: {
          '@scope/components/': prefixConfig,
        },
      });

      // Mock testRequestFilters
      (testRequestFilters as jest.Mock).mockImplementation(
        (remainder, include, exclude) => {
          // Check if remainder matches include pattern and doesn't match exclude
          if (include && !include.test(remainder)) return false;
          if (exclude && exclude.test(remainder)) return false;
          return true;
        },
      );

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Test included path
      await testEnv.normalModuleFactory.factorize({
        context: '/mock/context',
        request: '@scope/components/button',
        dependencies: [{}],
        contextInfo: {},
      });

      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/mock/context',
        expect.objectContaining({
          shareKey: '@scope/components/button',
        }),
      );

      // Test excluded path
      mockConsumeSharedModule.mockClear();
      await testEnv.normalModuleFactory.factorize({
        context: '/mock/context',
        request: '@scope/components/deprecated-button',
        dependencies: [{}],
        contextInfo: {},
      });

      expect(mockConsumeSharedModule).not.toHaveBeenCalled();
    });

    it('should handle issuerLayer matching in prefixed consumes', async () => {
      const layeredPrefixConfig = {
        import: '@ui/',
        shareScope: 'layered-scope',
        shareKey: '@ui/',
        issuerLayer: 'client',
        request: '@ui/',
      };

      const nonLayeredPrefixConfig = {
        import: '@ui/',
        shareScope: 'default-scope',
        shareKey: '@ui/',
        request: '@ui/',
      };

      // Mock resolveMatchedConfigs BEFORE creating the plugin
      (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(async () => ({
        resolved: new Map(),
        unresolved: new Map(),
        prefixed: new Map([
          ['@ui/layered/', layeredPrefixConfig],
          ['@ui/', nonLayeredPrefixConfig],
        ]),
      }));

      const plugin = new ConsumeSharedPlugin({
        consumes: {
          '@ui/layered/': layeredPrefixConfig,
          '@ui/': nonLayeredPrefixConfig,
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Test with issuerLayer='client' - should match layered config
      await testEnv.normalModuleFactory.factorize({
        context: '/mock/context',
        request: '@ui/layered/button',
        dependencies: [{}],
        contextInfo: { issuerLayer: 'client' },
      });

      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/mock/context',
        expect.objectContaining({
          shareScope: 'layered-scope',
        }),
      );

      // Test without issuerLayer - should match non-layered config
      mockConsumeSharedModule.mockClear();
      await testEnv.normalModuleFactory.factorize({
        context: '/mock/context',
        request: '@ui/button',
        dependencies: [{}],
        contextInfo: {},
      });

      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/mock/context',
        expect.objectContaining({
          shareScope: 'default-scope',
        }),
      );
    });
  });

  describe('FederationRuntimePlugin integration', () => {
    it('should apply FederationRuntimePlugin and set environment variable', () => {
      const testEnv = createSharingTestEnvironment();
      const plugin = new ConsumeSharedPlugin({
        consumes: { react: '^17.0.0' },
      });

      // Clear environment variable before test
      delete process.env['FEDERATION_WEBPACK_PATH'];

      plugin.apply(testEnv.compiler);

      // Check that FederationRuntimePlugin was applied
      const FederationRuntimePlugin = require('../../../src/lib/container/runtime/FederationRuntimePlugin');
      expect(FederationRuntimePlugin).toHaveBeenCalled();

      // Check that environment variable was set
      expect(process.env['FEDERATION_WEBPACK_PATH']).toBe(
        'mocked-webpack-path',
      );
    });
  });

  describe('layer-specific shareScope patterns', () => {
    let testEnv: any;

    beforeEach(() => {
      testEnv = createSharingTestEnvironment();
      jest.clearAllMocks();
    });

    it('should handle layer-specific shareScope like Next.js app directory', async () => {
      // Similar to Next.js app directory pattern where shareScope matches layer
      const appLayerConfig = {
        request: 'react',
        singleton: true,
        shareKey: 'react',
        import: 'next/dist/compiled/react',
        layer: 'appPagesBrowser',
        issuerLayer: 'appPagesBrowser',
        shareScope: 'appPagesBrowser', // shareScope matches layer
        requiredVersion: '^18.2.0',
      };

      const plugin = new ConsumeSharedPlugin({
        consumes: {
          'react-app': appLayerConfig,
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(async () => ({
        resolved: new Map(),
        unresolved: new Map([['(appPagesBrowser)react', appLayerConfig]]),
        prefixed: new Map(),
      }));

      const result = await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        'react',
        appLayerConfig,
      );

      expect(result).toBeDefined();
      expect(result.options.shareScope).toBe('appPagesBrowser');
      expect(result.options.layer).toBe('appPagesBrowser');
    });

    it('should handle multiple layers with different shareScopes', async () => {
      const pagesDirConfig = {
        request: 'react',
        singleton: true,
        shareKey: 'react',
        import: 'next/dist/compiled/react',
        layer: 'pagesDirBrowser',
        issuerLayer: 'pagesDirBrowser',
        shareScope: 'default',
        requiredVersion: '^18.2.0',
      };

      const appDirConfig = {
        request: 'react',
        singleton: true,
        shareKey: 'react',
        import: 'next/dist/compiled/react',
        layer: 'appPagesBrowser',
        issuerLayer: 'appPagesBrowser',
        shareScope: 'appPagesBrowser',
        requiredVersion: '^18.2.0',
      };

      const plugin = new ConsumeSharedPlugin({
        consumes: {
          'react-pages': pagesDirConfig,
          'react-app': appDirConfig,
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Test pages directory layer
      (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(async () => ({
        resolved: new Map(),
        unresolved: new Map([['(pagesDirBrowser)react', pagesDirConfig]]),
        prefixed: new Map(),
      }));

      const pagesResult = await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        'react',
        pagesDirConfig,
      );

      expect(pagesResult).toBeDefined();
      expect(pagesResult.options.shareScope).toBe('default');

      // Test app directory layer
      (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(async () => ({
        resolved: new Map(),
        unresolved: new Map([['(appPagesBrowser)react', appDirConfig]]),
        prefixed: new Map(),
      }));

      const appResult = await plugin.createConsumeSharedModule(
        testEnv.mockCompilation,
        '/mock/context',
        'react',
        appDirConfig,
      );

      expect(appResult).toBeDefined();
      expect(appResult.options.shareScope).toBe('appPagesBrowser');
    });

    it('should handle prefixed paths with nodeModulesReconstructedLookup flag', async () => {
      const prefixConfig = {
        request: 'next/dist/shared/',
        shareKey: 'next/dist/shared/',
        import: 'next/dist/shared/',
        layer: 'appPagesBrowser',
        issuerLayer: 'appPagesBrowser',
        shareScope: 'appPagesBrowser',
        singleton: true,
        requiredVersion: '^14.0.0',
        nodeModulesReconstructedLookup: true,
        include: {
          request: /shared-runtime/,
        },
      };

      // Mock resolveMatchedConfigs BEFORE creating the plugin
      (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(async () => ({
        resolved: new Map(),
        unresolved: new Map(),
        prefixed: new Map([['next/dist/shared/', prefixConfig]]),
      }));

      const plugin = new ConsumeSharedPlugin({
        consumes: {
          'next/dist/shared/': prefixConfig,
        },
      });

      // Mock testRequestFilters for include filter
      (testRequestFilters as jest.Mock).mockImplementation(
        (remainder, include, exclude) => {
          if (include && !include.test(remainder)) return false;
          if (exclude && exclude.test(remainder)) return false;
          return true;
        },
      );

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Test with a path that should match the include filter
      await testEnv.normalModuleFactory.factorize({
        context: '/mock/src',
        request: 'next/dist/shared/lib/shared-runtime',
        dependencies: [{}],
        contextInfo: { issuerLayer: 'appPagesBrowser' },
      });

      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/mock/src',
        expect.objectContaining({
          shareKey: 'next/dist/shared/lib/shared-runtime',
          shareScope: 'appPagesBrowser',
          nodeModulesReconstructedLookup: true,
        }),
      );
    });
  });

  describe('issuerLayer fallback logic (PR #3893)', () => {
    let testEnv: any;
    let plugin: any;

    beforeEach(() => {
      testEnv = createSharingTestEnvironment();
      jest.clearAllMocks();
    });

    describe('main match fallback', () => {
      it('should fallback to non-layered match when issuerLayer match fails', async () => {
        const layeredConfig = {
          import: 'react',
          shareScope: 'layered-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          issuerLayer: 'client',
          request: 'react',
        };

        const nonLayeredConfig = {
          import: 'react',
          shareScope: 'default',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          request: 'react',
        };

        plugin = new ConsumeSharedPlugin({
          consumes: {
            'react-layered': layeredConfig,
            react: nonLayeredConfig,
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock resolveMatchedConfigs to return both configs
        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([
              ['(client)react', layeredConfig],
              ['react', nonLayeredConfig],
            ]),
            prefixed: new Map(),
          }),
        );

        // Directly call createConsumeSharedModule with non-layered config
        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          nonLayeredConfig,
        );

        expect(result).toBeDefined();
        expect(result.options.shareScope).toBe('default');
      });

      it('should use layered match when issuerLayer matches', async () => {
        const layeredConfig = {
          import: 'react',
          shareScope: 'layered-scope',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          issuerLayer: 'client',
          request: 'react',
        };

        plugin = new ConsumeSharedPlugin({
          consumes: {
            'react-layered': layeredConfig,
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock resolveMatchedConfigs to return layered config
        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map([['(client)react', layeredConfig]]),
            prefixed: new Map(),
          }),
        );

        // Directly call createConsumeSharedModule with layered config
        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          layeredConfig,
        );

        expect(result).toBeDefined();
        expect(result.options.shareScope).toBe('layered-scope');
      });
    });

    describe('fallback behavior verification', () => {
      it('should demonstrate fallback logic pattern exists in code', () => {
        // This test documents the expected fallback pattern that PR #3893 introduced
        // The actual implementation should use this pattern:
        // unresolvedConsumes.get(createLookupKeyForSharing(request, contextInfo.issuerLayer)) ||
        // unresolvedConsumes.get(createLookupKeyForSharing(request, undefined))

        const mockUnresolvedConsumes = new Map([
          ['(client)react', { shareScope: 'layered-scope' }],
          ['react', { shareScope: 'default' }],
        ]);

        const { createLookupKeyForSharing } = jest.requireActual(
          '../../../src/lib/sharing/utils',
        );

        // Test fallback pattern for layered context
        const layeredLookup = createLookupKeyForSharing('react', 'client');
        const nonLayeredLookup = createLookupKeyForSharing('react', undefined);

        // With issuerLayer='client' - should find layered config
        const layeredResult =
          mockUnresolvedConsumes.get(layeredLookup) ||
          mockUnresolvedConsumes.get(nonLayeredLookup);
        expect(layeredResult).toBeDefined();
        expect(layeredResult?.shareScope).toBe('layered-scope');

        // With no issuerLayer - should find non-layered config
        const nonLayeredResult = mockUnresolvedConsumes.get(
          createLookupKeyForSharing('react', undefined),
        );
        expect(nonLayeredResult).toBeDefined();
        expect(nonLayeredResult?.shareScope).toBe('default');
      });
    });

    describe('createLookupKeyForSharing fallback behavior', () => {
      it('should verify fallback logic uses correct lookup keys', () => {
        // Import the real function (not mocked) directly to test the logic
        const utils = jest.requireActual('../../../src/lib/sharing/utils');
        const { createLookupKeyForSharing } = utils;

        // Test the utility function directly
        expect(createLookupKeyForSharing('react', 'client')).toBe(
          '(client)react',
        );
        expect(createLookupKeyForSharing('react', undefined)).toBe('react');
        expect(createLookupKeyForSharing('react', null)).toBe('react');
        expect(createLookupKeyForSharing('react', '')).toBe('react');
      });
    });
  });
});
