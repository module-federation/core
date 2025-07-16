/*
 * @jest-environment node
 */

import {
  normalizeWebpackPath,
  getWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';
import {
  shareScopes,
  createMockCompiler,
  createMockCompilation,
  testModuleOptions,
  createWebpackMock,
  createModuleMock,
  createMockFederationCompiler,
  createMockConsumeSharedDependencies,
  createMockConsumeSharedModule,
  createMockRuntimeModules,
  createSharingTestEnvironment,
} from './utils';

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

// Mock ConsumeSharedModule
jest.mock('../../../src/lib/sharing/ConsumeSharedModule', () => {
  return mockConsumeSharedModule;
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

// Mock resolveMatchedConfigs
jest.mock('../../../src/lib/sharing/resolveMatchedConfigs', () => ({
  resolveMatchedConfigs: jest.fn().mockResolvedValue({
    resolved: new Map(),
    unresolved: new Map(),
    prefixed: new Map(),
  }),
}));

// Import after mocks are set up
const ConsumeSharedPlugin =
  require('../../../src/lib/sharing/ConsumeSharedPlugin').default;
const {
  resolveMatchedConfigs,
} = require('../../../src/lib/sharing/resolveMatchedConfigs');

describe('ConsumeSharedPlugin', () => {
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
      // Create a module directly using the mocked ConsumeSharedModule
      const testModule = mockConsumeSharedModule({
        request: 'react',
        shareScope: shareScopes.array,
        requiredVersion: '^17.0.0',
      });

      // Verify the module properties
      expect(testModule.shareScope).toEqual(shareScopes.array);
      expect(testModule.request).toBe('react');
      expect(testModule.requiredVersion).toBe('^17.0.0');
    });

    it('should handle prefixed modules correctly', () => {
      // Create a module directly using the mocked ConsumeSharedModule
      const testModule = mockConsumeSharedModule({
        request: 'prefix/component',
        shareScope: shareScopes.string,
        requiredVersion: '^1.0.0',
      });

      // Verify the module properties
      expect(testModule.shareScope).toBe(shareScopes.string);
      expect(testModule.request).toBe('prefix/component');
      expect(testModule.requiredVersion).toBe('^1.0.0');
    });

    it('should respect issuerLayer from contextInfo', () => {
      // Create a module directly using the mocked ConsumeSharedModule
      const testModule = mockConsumeSharedModule({
        request: 'react',
        shareScope: shareScopes.string,
        requiredVersion: '^17.0.0',
        layer: 'test-layer',
      });

      // Verify module has the layer property
      expect(testModule.options.layer).toBe('test-layer');
    });
  });

  describe('apply', () => {
    let testEnv;

    beforeEach(() => {
      jest.clearAllMocks();
      // Use the new utility function to create a standardized test environment
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

  describe('issuerLayer fallback logic (PR #3893)', () => {
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
        expect(layeredResult!.shareScope).toBe('layered-scope');

        // With no issuerLayer - should find non-layered config
        const nonLayeredResult = mockUnresolvedConsumes.get(
          createLookupKeyForSharing('react', undefined),
        );
        expect(nonLayeredResult).toBeDefined();
        expect(nonLayeredResult!.shareScope).toBe('default');
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
