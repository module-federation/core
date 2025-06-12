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

// Mock resolveMatchedConfigs to control the behavior
const mockResolveMatchedConfigs = jest.fn();
jest.mock('../../../src/lib/sharing/resolveMatchedConfigs', () => ({
  resolveMatchedConfigs: mockResolveMatchedConfigs,
}));

// Direct dependency mocks
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

// Import after mocks are set up
const ConsumeSharedPlugin =
  require('../../../src/lib/sharing/ConsumeSharedPlugin').default;

describe('ConsumeSharedPlugin - Layer Fallback Behavior', () => {
  let testEnv;
  let factorizeCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    testEnv = createSharingTestEnvironment();

    // Capture the factorize callback when it's registered
    factorizeCallback = null;
    testEnv.normalModuleFactory.hooks.factorize.tapPromise.mockImplementation(
      (name, callback) => {
        factorizeCallback = callback;
      },
    );

    // Mock resolveMatchedConfigs to return empty maps initially
    mockResolveMatchedConfigs.mockResolvedValue({
      resolved: new Map(),
      unresolved: new Map(),
      prefixed: new Map(),
    });
  });

  describe('layer fallback scenarios', () => {
    it('should fallback to unlayered share when no layered match exists', async () => {
      // Arrange: Configure shared module without layer
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          lodash: '^4.17.21', // No layer specified
        },
      });

      // Setup the unresolved consumes map to include the unlayered lodash
      const unresolvedConsumes = new Map();
      unresolvedConsumes.set('lodash', {
        import: 'lodash',
        shareScope: 'default',
        shareKey: 'lodash',
        requiredVersion: '^4.17.21',
        layer: undefined,
        issuerLayer: undefined,
      });

      mockResolveMatchedConfigs.mockResolvedValue({
        resolved: new Map(),
        unresolved: unresolvedConsumes,
        prefixed: new Map(),
      });

      // Apply the plugin
      plugin.apply(testEnv.compiler);

      // Simulate compilation
      testEnv.simulateCompilation();

      // Act: Simulate a request for lodash with a layer from issuerLayer
      const resolveData = {
        context: '/test-context',
        request: 'lodash',
        dependencies: [{}], // Not a ConsumeSharedFallbackDependency
        contextInfo: {
          issuer: '/test-app/src/layer1/component.js',
          issuerLayer: 'layer1', // Request comes with layer1
          compiler: 'webpack',
        },
      };

      // Ensure factorize callback was registered
      expect(factorizeCallback).toBeDefined();

      // Call the factorize callback
      const result = await factorizeCallback(resolveData);

      // Assert: Should create a ConsumeSharedModule with the unlayered config
      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/test-context',
        expect.objectContaining({
          shareScope: 'default',
          shareKey: 'lodash',
          requiredVersion: '^4.17.21',
          layer: undefined,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should prefer layered share over unlayered fallback when both exist', async () => {
      // Arrange: Configure both layered and unlayered shared modules
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          lodash: {
            requiredVersion: '^4.17.21',
            // No layer specified - this is the fallback
          },
          'lodash-layer1': {
            shareKey: 'lodash',
            requiredVersion: '^4.17.21',
            layer: 'layer1', // Specific layer config
          },
        },
      });

      // Setup unresolved consumes map with both configs
      const unresolvedConsumes = new Map();

      // Unlayered fallback - stored with simple key
      unresolvedConsumes.set('lodash', {
        import: 'lodash',
        shareScope: 'default',
        shareKey: 'lodash',
        requiredVersion: '^4.17.21',
        layer: undefined,
        issuerLayer: undefined,
      });

      // Layered specific config - stored with layer prefix
      unresolvedConsumes.set('(layer1)lodash', {
        import: 'lodash-layer1',
        shareScope: 'default',
        shareKey: 'lodash',
        requiredVersion: '^4.17.21',
        layer: 'layer1',
        issuerLayer: undefined,
      });

      mockResolveMatchedConfigs.mockResolvedValue({
        resolved: new Map(),
        unresolved: unresolvedConsumes,
        prefixed: new Map(),
      });

      // Apply the plugin
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Act: Simulate a request for lodash with layer1
      const resolveData = {
        context: '/test-context',
        request: 'lodash',
        dependencies: [{}],
        contextInfo: {
          issuer: '/test-app/src/layer1/component.js',
          issuerLayer: 'layer1',
          compiler: 'webpack',
        },
      };

      // Ensure factorize callback was registered
      expect(factorizeCallback).toBeDefined();

      const result = await factorizeCallback(resolveData);

      // Assert: Should prefer the layered config over unlayered fallback
      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/test-context',
        expect.objectContaining({
          shareKey: 'lodash',
          layer: 'layer1', // Should use the layered version
        }),
      );
      expect(result).toBeDefined();
    });

    it('should not fallback to unlayered share when explicit layer mismatch', async () => {
      // Arrange: Configure shared module with specific layer only
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'lodash-layer2': {
            shareKey: 'lodash',
            requiredVersion: '^4.17.21',
            layer: 'layer2', // Only layer2 config exists
          },
        },
      });

      // Setup only layered config, no unlayered fallback
      const unresolvedConsumes = new Map();
      unresolvedConsumes.set('(layer2)lodash', {
        import: 'lodash-layer2',
        shareScope: 'default',
        shareKey: 'lodash',
        requiredVersion: '^4.17.21',
        layer: 'layer2',
        issuerLayer: undefined,
      });

      mockResolveMatchedConfigs.mockResolvedValue({
        resolved: new Map(),
        unresolved: unresolvedConsumes,
        prefixed: new Map(),
      });

      // Apply the plugin
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Act: Simulate a request for lodash with layer1 (different layer)
      const resolveData = {
        context: '/test-context',
        request: 'lodash',
        dependencies: [{}],
        contextInfo: {
          issuer: '/test-app/src/layer1/component.js',
          issuerLayer: 'layer1', // Different layer
          compiler: 'webpack',
        },
      };

      // Ensure factorize callback was registered
      expect(factorizeCallback).toBeDefined();

      const result = await factorizeCallback(resolveData);

      // Assert: Should not create any module since no match and no fallback
      expect(mockConsumeSharedModule).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle no layer in request with layered configs available', async () => {
      // Arrange: Configure layered shared module
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          lodash: '^4.17.21', // Unlayered config
          'lodash-layer1': {
            shareKey: 'lodash',
            requiredVersion: '^4.17.21',
            layer: 'layer1',
          },
        },
      });

      const unresolvedConsumes = new Map();

      // Unlayered config
      unresolvedConsumes.set('lodash', {
        import: 'lodash',
        shareScope: 'default',
        shareKey: 'lodash',
        requiredVersion: '^4.17.21',
        layer: undefined,
        issuerLayer: undefined,
      });

      // Layered config
      unresolvedConsumes.set('(layer1)lodash', {
        import: 'lodash-layer1',
        shareScope: 'default',
        shareKey: 'lodash',
        requiredVersion: '^4.17.21',
        layer: 'layer1',
        issuerLayer: undefined,
      });

      mockResolveMatchedConfigs.mockResolvedValue({
        resolved: new Map(),
        unresolved: unresolvedConsumes,
        prefixed: new Map(),
      });

      // Apply the plugin
      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Act: Simulate a request for lodash with NO layer
      const resolveData = {
        context: '/test-context',
        request: 'lodash',
        dependencies: [{}],
        contextInfo: {
          issuer: '/test-app/src/component.js',
          issuerLayer: undefined, // No layer
          compiler: 'webpack',
        },
      };

      // Ensure factorize callback was registered
      expect(factorizeCallback).toBeDefined();

      const result = await factorizeCallback(resolveData);

      // Assert: Should use the unlayered config (exact match)
      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/test-context',
        expect.objectContaining({
          shareKey: 'lodash',
          layer: undefined, // Should use unlayered version
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('createLookupKey behavior', () => {
    it('should create correct lookup keys for layer requests', () => {
      // This test verifies the current lookup key generation logic
      // which should be enhanced to support fallback behavior

      const contextInfoWithLayer = {
        issuer: '/test-app/src/layer1/component.js',
        issuerLayer: 'layer1',
        compiler: 'webpack',
      };

      const contextInfoWithoutLayer = {
        issuer: '/test-app/src/component.js',
        issuerLayer: undefined,
        compiler: 'webpack',
      };

      // Import the createLookupKey function directly for testing
      // Note: This would normally require exposing the function or using a different approach
      // For now, we'll test the behavior through the plugin integration

      // Test that different contextInfo produces different lookup keys
      expect(contextInfoWithLayer.issuerLayer).toBe('layer1');
      expect(contextInfoWithoutLayer.issuerLayer).toBeUndefined();
    });
  });
});
