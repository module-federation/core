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
// Create Module mock
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

// Mock resolveMatchedConfigs module
jest.mock('../../../src/lib/sharing/resolveMatchedConfigs');

// Mock utils module
jest.mock('../../../src/lib/sharing/utils');

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
const { getDescriptionFile } = require('../../../src/lib/sharing/utils');

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
      // @ts-ignore accessing private property for testing
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

      // @ts-ignore accessing private property for testing
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

      // @ts-ignore accessing private property for testing
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

      // @ts-ignore accessing private property for testing
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
});
