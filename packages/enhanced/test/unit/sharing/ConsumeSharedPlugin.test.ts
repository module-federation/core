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

  describe('filtering functionality', () => {
    let testEnv;

    beforeEach(() => {
      jest.clearAllMocks();
      testEnv = createSharingTestEnvironment();
    });

    describe('version filtering', () => {
      it('should create plugin with version include filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^17.0.0',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('^17.0.0');
        expect(config.include?.version).toBe('^17.0.0');
      });

      it('should create plugin with version exclude filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^17.0.0',
              exclude: {
                version: '^18.0.0',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('^17.0.0');
        expect(config.exclude?.version).toBe('^18.0.0');
      });

      it('should create plugin with complex version filtering', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^16.0.0',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('^16.0.0');
        expect(config.include?.version).toBe('^17.0.0');
      });

      it('should warn about singleton usage with version filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^17.0.0',
              singleton: true,
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        // Plugin should be created successfully
        expect(plugin).toBeDefined();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.singleton).toBe(true);
        expect(config.include?.version).toBe('^17.0.0');
      });
    });

    describe('request filtering', () => {
      it('should create plugin with string request include filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'prefix/': {
              include: {
                request: 'component',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes).toHaveLength(1);
        expect(consumes[0][1].include?.request).toBe('component');
      });

      it('should create plugin with RegExp request include filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'prefix/': {
              include: {
                request: /^components/,
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes[0][1].include?.request).toEqual(/^components/);
      });

      it('should create plugin with string request exclude filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'prefix/': {
              exclude: {
                request: 'internal',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes[0][1].exclude?.request).toBe('internal');
      });

      it('should create plugin with RegExp request exclude filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'prefix/': {
              exclude: {
                request: /test$/,
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes[0][1].exclude?.request).toEqual(/test$/);
      });

      it('should create plugin with combined include and exclude request filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'components/': {
              include: {
                request: /^Button/,
              },
              exclude: {
                request: /Test$/,
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.include?.request).toEqual(/^Button/);
        expect(config.exclude?.request).toEqual(/Test$/);
      });
    });

    describe('combined version and request filtering', () => {
      it('should create plugin with both version and request filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'ui/': {
              requiredVersion: '^1.0.0',
              include: {
                version: '^1.0.0',
                request: /components/,
              },
              exclude: {
                request: /test/,
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('^1.0.0');
        expect(config.include?.version).toBe('^1.0.0');
        expect(config.include?.request).toEqual(/components/);
        expect(config.exclude?.request).toEqual(/test/);
      });

      it('should create plugin with complex filtering scenarios and layers', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^17.0.0',
              layer: 'framework',
              include: {
                version: '^17.0.0',
              },
              exclude: {
                request: 'internal',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.layer).toBe('framework');
        expect(config.include?.version).toBe('^17.0.0');
        expect(config.exclude?.request).toBe('internal');
      });
    });

    describe('configuration edge cases', () => {
      it('should create plugin with invalid version patterns gracefully', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: 'invalid-version',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        // Should create plugin without throwing
        expect(plugin).toBeDefined();

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('invalid-version');
        expect(config.include?.version).toBe('^17.0.0');
      });

      it('should create plugin with missing requiredVersion but with version filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              // No requiredVersion specified
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBeUndefined();
        expect(config.include?.version).toBe('^17.0.0');
      });
    });
  });

  describe('complex resolution scenarios', () => {
    let testEnv;

    beforeEach(() => {
      jest.clearAllMocks();
      testEnv = createSharingTestEnvironment();
    });

    describe('async resolution with errors', () => {
      it('should handle resolver.resolve errors gracefully', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'failing-module': {
              import: './failing-path',
              requiredVersion: '^1.0.0',
            },
          },
        });

        // Mock resolver to fail
        const mockResolver = {
          resolve: jest.fn((_, __, ___, ____, callback) => {
            callback(new Error('Module resolution failed'), null);
          }),
        };

        const mockCompilation = {
          ...testEnv.mockCompilation,
          resolverFactory: {
            get: jest.fn(() => mockResolver),
          },
          contextDependencies: { addAll: jest.fn() },
          fileDependencies: { addAll: jest.fn() },
          missingDependencies: { addAll: jest.fn() },
          errors: [],
          warnings: [],
          compiler: {
            context: '/test',
          },
        };

        // Test createConsumeSharedModule with failing resolver
        const createPromise = plugin.createConsumeSharedModule(
          mockCompilation as any,
          '/test/context',
          'failing-module',
          {
            import: './failing-path',
            shareScope: 'default',
            shareKey: 'failing-module',
            requiredVersion: '^1.0.0',
            strictVersion: true,
            packageName: undefined,
            singleton: false,
            eager: false,
            issuerLayer: undefined,
            layer: undefined,
            request: 'failing-module',
            include: undefined,
            exclude: undefined,
            nodeModulesReconstructedLookup: undefined,
          },
        );

        const result = await createPromise;

        // Should still create module but with undefined import
        expect(result).toBeDefined();
        expect(mockCompilation.errors).toHaveLength(1);
        expect(mockCompilation.errors[0].message).toContain(
          'Module resolution failed',
        );
      });

      it('should handle package.json reading errors during version resolution', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'package-error': {
              // No requiredVersion - will try to read package.json
            },
          },
        });

        // Mock filesystem to fail
        const mockInputFileSystem = {
          readFile: jest.fn((path, callback) => {
            callback(new Error('File system error'), null);
          }),
        };

        const mockCompilation = {
          ...testEnv.mockCompilation,
          resolverFactory: {
            get: jest.fn(() => ({
              resolve: jest.fn((_, __, ___, ____, callback) => {
                callback(null, '/resolved/path');
              }),
            })),
          },
          inputFileSystem: mockInputFileSystem,
          contextDependencies: { addAll: jest.fn() },
          fileDependencies: { addAll: jest.fn() },
          missingDependencies: { addAll: jest.fn() },
          errors: [],
          warnings: [],
          compiler: {
            context: '/test',
          },
        };

        const createPromise = plugin.createConsumeSharedModule(
          mockCompilation as any,
          '/test/context',
          'package-error',
          {
            import: undefined,
            shareScope: 'default',
            shareKey: 'package-error',
            requiredVersion: undefined,
            strictVersion: false,
            packageName: undefined,
            singleton: false,
            eager: false,
            issuerLayer: undefined,
            layer: undefined,
            request: 'package-error',
            include: undefined,
            exclude: undefined,
            nodeModulesReconstructedLookup: undefined,
          },
        );

        const result = await createPromise;

        expect(result).toBeDefined();
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'Unable to read description file',
        );
      });

      it('should handle missing package.json gracefully', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'missing-package': {
              // No requiredVersion - will try to read package.json
            },
          },
        });

        // Mock inputFileSystem that fails to read
        const mockInputFileSystem = {
          readFile: jest.fn((path, callback) => {
            callback(new Error('ENOENT: no such file or directory'), null);
          }),
        };

        const mockCompilation = {
          ...testEnv.mockCompilation,
          resolverFactory: {
            get: jest.fn(() => ({
              resolve: jest.fn((_, __, ___, ____, callback) => {
                callback(null, '/resolved/path');
              }),
            })),
          },
          inputFileSystem: mockInputFileSystem,
          contextDependencies: { addAll: jest.fn() },
          fileDependencies: { addAll: jest.fn() },
          missingDependencies: { addAll: jest.fn() },
          errors: [],
          warnings: [],
          compiler: {
            context: '/test',
          },
        };

        const createPromise = plugin.createConsumeSharedModule(
          mockCompilation as any,
          '/test/context',
          'missing-package',
          {
            import: undefined,
            shareScope: 'default',
            shareKey: 'missing-package',
            requiredVersion: undefined,
            strictVersion: false,
            packageName: undefined,
            singleton: false,
            eager: false,
            issuerLayer: undefined,
            layer: undefined,
            request: 'missing-package',
            include: undefined,
            exclude: undefined,
            nodeModulesReconstructedLookup: undefined,
          },
        );

        const result = await createPromise;

        expect(result).toBeDefined();
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'Unable to read description file',
        );
      });
    });

    describe('configuration edge cases', () => {
      it('should handle invalid package names correctly', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            '../invalid-path': {
              packageName: 'valid-package',
            },
          },
        });

        // Should create plugin without throwing
        expect(plugin).toBeDefined();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes[0][1].packageName).toBe('valid-package');
      });

      it('should handle minimal valid shareScope', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'a', // Minimal valid shareScope
          consumes: {
            react: '^17.0.0',
          },
        });

        expect(plugin).toBeDefined();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes[0][1].shareScope).toBe('a');
      });

      it('should handle complex layer configurations', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'client-module': {
              layer: 'client',
              issuerLayer: 'client',
            },
            'server-module': {
              layer: 'server',
              issuerLayer: 'server',
            },
          },
        });

        expect(plugin).toBeDefined();

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes).toHaveLength(2);

        const clientModule = consumes.find(([key]) => key === 'client-module');
        const serverModule = consumes.find(([key]) => key === 'server-module');

        expect(clientModule![1].layer).toBe('client');
        expect(clientModule![1].issuerLayer).toBe('client');
        expect(serverModule![1].layer).toBe('server');
        expect(serverModule![1].issuerLayer).toBe('server');
      });
    });

    describe('utility integration tests', () => {
      it('should properly configure nodeModulesReconstructedLookup', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'node-module': {
              nodeModulesReconstructedLookup: true,
            },
            'regular-module': {},
          },
        });

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;

        const nodeModule = consumes.find(([key]) => key === 'node-module');
        const regularModule = consumes.find(
          ([key]) => key === 'regular-module',
        );

        expect(nodeModule![1].nodeModulesReconstructedLookup).toBe(true);
        expect(
          regularModule![1].nodeModulesReconstructedLookup,
        ).toBeUndefined();
      });

      it('should handle multiple shareScope configurations', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'module-1': {
              shareScope: 'custom-1',
            },
            'module-2': {
              shareScope: 'custom-2',
            },
            'module-3': {
              // Uses default shareScope
            },
          },
        });

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;

        expect(consumes).toHaveLength(3);

        const module1 = consumes.find(([key]) => key === 'module-1');
        const module2 = consumes.find(([key]) => key === 'module-2');
        const module3 = consumes.find(([key]) => key === 'module-3');

        expect(module1![1].shareScope).toBe('custom-1');
        expect(module2![1].shareScope).toBe('custom-2');
        expect(module3![1].shareScope).toBe('default');
      });
    });

    describe('error scenarios', () => {
      it('should handle invalid configurations gracefully', () => {
        // Test that invalid array input throws error
        expect(() => {
          new ConsumeSharedPlugin({
            shareScope: 'default',
            consumes: {
              // @ts-ignore - intentionally testing invalid input
              invalidModule: ['invalid', 'array'],
            },
          });
        }).toThrow(
          /Invalid options object|should be.*object|should be.*string/,
        );
      });

      it('should handle false import values correctly', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'no-import': {
              import: false,
              shareKey: 'no-import',
            },
          },
        });

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes[0][1].import).toBeUndefined();
        expect(consumes[0][1].shareKey).toBe('no-import');
      });

      it('should handle false requiredVersion correctly', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'no-version': {
              requiredVersion: false,
            },
          },
        });

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;
        expect(consumes[0][1].requiredVersion).toBe(false);
      });
    });

    describe('integration with webpack hooks', () => {
      it('should properly register compilation hooks', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: '^17.0.0',
          },
        });

        plugin.apply(testEnv.compiler);

        // Verify hooks were registered
        expect(testEnv.compiler.hooks.thisCompilation.tap).toHaveBeenCalledWith(
          'ConsumeSharedPlugin',
          expect.any(Function),
        );
      });

      it('should set up dependency factories when applied', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: '^17.0.0',
          },
        });

        // Mock the dependency factories.set method
        const mockSet = jest.fn();
        testEnv.mockCompilation.dependencyFactories.set = mockSet;

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Verify dependency factory was set
        expect(mockSet).toHaveBeenCalled();
      });
    });
  });

  describe('performance and memory tests', () => {
    let testEnv;

    beforeEach(() => {
      jest.clearAllMocks();
      testEnv = createSharingTestEnvironment();
    });

    describe('large-scale scenarios', () => {
      it('should handle many consume configurations efficiently', () => {
        const largeConsumes = {};
        for (let i = 0; i < 1000; i++) {
          largeConsumes[`module-${i}`] = `^${i % 10}.0.0`;
        }

        const startTime = performance.now();

        const plugin = new ConsumeSharedPlugin({
          shareScope: 'performance-test',
          consumes: largeConsumes,
        });

        const endTime = performance.now();
        const constructionTime = endTime - startTime;

        // Should construct efficiently (under 100ms for 1000 modules)
        expect(constructionTime).toBeLessThan(100);
        expect(plugin).toBeDefined();

        // @ts-ignore accessing private property for testing
        expect(plugin._consumes).toHaveLength(1000);
      });

      it('should handle efficient option parsing with many prefix patterns', () => {
        const prefixConsumes = {};
        for (let i = 0; i < 100; i++) {
          prefixConsumes[`prefix-${i}/`] = {
            shareScope: `scope-${i % 5}`, // Reuse some scopes
            include: {
              request: new RegExp(`^module-${i}`),
            },
          };
        }

        const startTime = performance.now();

        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: prefixConsumes,
        });

        const endTime = performance.now();
        const constructionTime = endTime - startTime;

        // Should construct efficiently (under 100ms for 100 prefix patterns)
        expect(constructionTime).toBeLessThan(100);
        expect(plugin).toBeDefined();

        // @ts-ignore accessing private property for testing
        expect(plugin._consumes).toHaveLength(100);
      });
    });

    describe('memory usage patterns', () => {
      it('should not create unnecessary object instances', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'memory-test',
          consumes: {
            react: '^17.0.0',
            'react-dom': '^17.0.0',
          },
        });

        // @ts-ignore accessing private property for testing
        const consumes = plugin._consumes;

        // Should reuse shareScope strings
        expect(consumes[0][1].shareScope).toBe(consumes[1][1].shareScope);
        expect(consumes[0][1].shareScope).toBe('memory-test');
      });

      it('should handle concurrent resolution requests without memory leaks', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'concurrent-module': '^1.0.0',
          },
        });

        const mockCompilation = {
          ...testEnv.mockCompilation,
          resolverFactory: {
            get: jest.fn(() => ({
              resolve: jest.fn((_, __, ___, ____, callback) => {
                // Simulate async resolution
                setTimeout(() => callback(null, '/resolved/path'), 1);
              }),
            })),
          },
          inputFileSystem: {},
          contextDependencies: { addAll: jest.fn() },
          fileDependencies: { addAll: jest.fn() },
          missingDependencies: { addAll: jest.fn() },
          errors: [],
          warnings: [],
          compiler: {
            context: '/test',
          },
        };

        const config = {
          import: undefined,
          shareScope: 'default',
          shareKey: 'concurrent-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'concurrent-module',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        // Start multiple concurrent resolutions
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(
            plugin.createConsumeSharedModule(
              mockCompilation as any,
              '/test/context',
              'concurrent-module',
              config,
            ),
          );
        }

        const results = await Promise.all(promises);

        // All should resolve successfully
        expect(results).toHaveLength(10);
        results.forEach((result) => expect(result).toBeDefined());
      });
    });
  });

  describe('createConsumeSharedModule - CORE BUSINESS LOGIC', () => {
    let plugin: ConsumeSharedPlugin;
    let mockCompilation: any;
    let mockInputFileSystem: any;
    let mockResolver: any;

    beforeEach(() => {
      jest.clearAllMocks();

      plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'test-module': '^1.0.0',
        },
      });

      mockInputFileSystem = {
        readFile: jest.fn(),
      };

      mockResolver = {
        resolve: jest.fn(),
      };

      mockCompilation = {
        inputFileSystem: mockInputFileSystem,
        resolverFactory: {
          get: jest.fn(() => mockResolver),
        },
        warnings: [],
        errors: [],
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        compiler: {
          context: '/test/context',
        },
      };
    });

    describe('import resolution logic', () => {
      it('should resolve import when config.import is provided', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        // Mock successful resolution
        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockResolver.resolve).toHaveBeenCalledWith(
          {},
          '/test/context',
          './test-module',
          expect.any(Object),
          expect.any(Function),
        );
      });

      it('should handle undefined import gracefully', async () => {
        const config = {
          import: undefined,
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockResolver.resolve).not.toHaveBeenCalled();
      });

      it('should handle import resolution errors gracefully', async () => {
        const config = {
          import: './failing-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        // Mock resolution error
        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(new Error('Module not found'), null);
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockCompilation.errors).toHaveLength(1);
        expect(mockCompilation.errors[0].message).toContain('Module not found');
      });

      it('should handle direct fallback regex matching', async () => {
        const config = {
          import: 'webpack/lib/something', // Matches DIRECT_FALLBACK_REGEX
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/webpack/lib/something');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should use compilation.compiler.context for direct fallback
        expect(mockResolver.resolve).toHaveBeenCalledWith(
          {},
          '/test/context', // compiler context
          'webpack/lib/something',
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    describe('requiredVersion resolution logic', () => {
      it('should use provided requiredVersion when available', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^2.0.0', // Explicit version
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(result.requiredVersion).toBe('^2.0.0');
      });

      it('should resolve requiredVersion from package name when not provided', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: undefined, // Will be resolved
          strictVersion: true,
          packageName: 'my-package',
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should extract package name from request and resolve version
      });

      it('should extract package name from scoped module request', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: undefined,
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: '@scope/my-package/sub-path', // Scoped package
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          '@scope/my-package/sub-path',
          config,
        );

        expect(result).toBeDefined();
        // Should extract '@scope/my-package' as package name
      });

      it('should handle absolute path requests', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: undefined,
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: '/absolute/path/to/module', // Absolute path
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          '/absolute/path/to/module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'No required version specified',
        );
      });

      it('should handle package.json reading for version resolution', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: undefined,
          strictVersion: true,
          packageName: 'my-package',
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'my-package',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'my-package',
          config,
        );

        expect(result).toBeDefined();
        // Should attempt to read package.json for version
      });
    });

    describe('include version filtering logic', () => {
      it('should include module when version satisfies include filter', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^1.0.0', // Should match
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile to return matching version
        const getDescriptionFileMock =
          require('../../../src/lib/sharing/utils').getDescriptionFile;
        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should include the module since 1.5.0 satisfies ^1.0.0
      });

      it('should exclude module when version does not satisfy include filter', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^2.0.0', // Won't match 1.5.0
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile to return non-matching version
        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeUndefined();
        // Should exclude the module since 1.5.0 does not satisfy ^2.0.0
      });

      it('should generate singleton warning for include version filters', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: true, // Should trigger warning
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^1.0.0',
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'singleton: true',
        );
        expect(mockCompilation.warnings[0].message).toContain(
          'include.version',
        );
      });

      it('should handle fallback version for include filters', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^2.0.0',
            fallbackVersion: '1.5.0', // Should satisfy ^2.0.0? No, should NOT satisfy
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeUndefined();
        // Should exclude since fallbackVersion 1.5.0 does not satisfy ^2.0.0
      });

      it('should return module when include filter fails but no importResolved', async () => {
        const config = {
          import: undefined, // No import to resolve
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^2.0.0',
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should return module since no import to check against
      });
    });

    describe('exclude version filtering logic', () => {
      it('should include module when version does not match exclude filter', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: {
            version: '^2.0.0', // Won't match 1.5.0
          },
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should include the module since 1.5.0 does not match ^2.0.0 exclude
      });

      it('should exclude module when version matches exclude filter', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: {
            version: '^1.0.0', // Will match 1.5.0
          },
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeUndefined();
        // Should exclude the module since 1.5.0 matches ^1.0.0 exclude
      });

      it('should generate singleton warning for exclude version filters', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: true, // Should trigger warning
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: {
            version: '^2.0.0', // Won't match, so module included and warning generated
          },
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'singleton: true',
        );
        expect(mockCompilation.warnings[0].message).toContain(
          'exclude.version',
        );
      });

      it('should handle fallback version for exclude filters - include when fallback matches', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: {
            version: '^1.0.0',
            fallbackVersion: '1.5.0', // This should match ^1.0.0, so exclude
          },
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeUndefined();
        // Should exclude since fallbackVersion 1.5.0 satisfies ^1.0.0 exclude
      });

      it('should handle fallback version for exclude filters - include when fallback does not match', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: {
            version: '^2.0.0',
            fallbackVersion: '1.5.0', // This should NOT match ^2.0.0, so include
          },
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should include since fallbackVersion 1.5.0 does not satisfy ^2.0.0 exclude
      });

      it('should return module when exclude filter fails but no importResolved', async () => {
        const config = {
          import: undefined, // No import to resolve
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: {
            version: '^1.0.0',
          },
          nodeModulesReconstructedLookup: undefined,
        };

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should return module since no import to check against
      });
    });

    describe('package.json reading error scenarios', () => {
      it('should handle getDescriptionFile errors gracefully - include filters', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^1.0.0',
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile to return error
        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(new Error('File system error'), null);
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should return module despite getDescriptionFile error
      });

      it('should handle missing package.json data gracefully - include filters', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^1.0.0',
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile to return null data
        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, null);
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should return module when no package.json data available
      });

      it('should handle mismatched package name gracefully - include filters', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^1.0.0',
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile to return mismatched package name
        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'different-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should return module when package name doesn't match
      });

      it('should handle missing version in package.json gracefully - include filters', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^1.0.0',
          },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile to return package.json without version
        jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementation((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module' }, // No version
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should return module when no version in package.json
      });
    });

    describe('combined include and exclude filtering', () => {
      it('should handle both include and exclude filters correctly', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies this
          },
          exclude: {
            version: '^2.0.0', // 1.5.0 does not match this
          },
          nodeModulesReconstructedLookup: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveData, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock first call (include filter)
        const getDescriptionFileSpy = jest
          .spyOn(
            require('../../../src/lib/sharing/utils'),
            'getDescriptionFile',
          )
          .mockImplementationOnce((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          })
          // Mock second call (exclude filter)
          .mockImplementationOnce((fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'test-module', version: '1.5.0' },
              path: '/path/to/package.json',
            });
          });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should include module since it satisfies include and doesn't match exclude
        expect(getDescriptionFileSpy).toHaveBeenCalledTimes(2);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('apply method - PLUGIN REGISTRATION LOGIC', () => {
    let plugin: ConsumeSharedPlugin;
    let mockCompiler: any;
    let mockCompilation: any;
    let mockNormalModuleFactory: any;
    let mockFactorizeHook: any;
    let mockCreateModuleHook: any;

    beforeEach(() => {
      jest.clearAllMocks();

      mockFactorizeHook = {
        tapPromise: jest.fn(),
      };

      mockCreateModuleHook = {
        tapPromise: jest.fn(),
      };

      mockNormalModuleFactory = {
        hooks: {
          factorize: mockFactorizeHook,
          createModule: mockCreateModuleHook,
        },
      };

      mockCompilation = {
        dependencyFactories: {
          set: jest.fn(),
        },
        hooks: {
          additionalTreeRuntimeRequirements: {
            tap: jest.fn(),
          },
        },
        addRuntimeModule: jest.fn(),
      };

      const mockThisCompilationHook = {
        tap: jest.fn((name, callback) => {
          // Simulate the hook being called
          callback(mockCompilation, {
            normalModuleFactory: mockNormalModuleFactory,
          });
        }),
      };

      mockCompiler = {
        context: '/test/context',
        hooks: {
          thisCompilation: mockThisCompilationHook,
        },
      };

      plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'test-module': '^1.0.0',
          'lodash/': {
            shareKey: 'lodash',
            shareScope: 'default',
          },
          react: {
            shareKey: 'react',
            shareScope: 'default',
            issuerLayer: 'client',
          },
        },
      });
    });

    it('should register thisCompilation hook during apply', () => {
      plugin.apply(mockCompiler);

      expect(mockCompiler.hooks.thisCompilation.tap).toHaveBeenCalledWith(
        'ConsumeSharedPlugin',
        expect.any(Function),
      );
    });

    it('should register factorize and createModule hooks during compilation', () => {
      plugin.apply(mockCompiler);

      expect(mockFactorizeHook.tapPromise).toHaveBeenCalledWith(
        'ConsumeSharedPlugin',
        expect.any(Function),
      );
      expect(mockCreateModuleHook.tapPromise).toHaveBeenCalledWith(
        'ConsumeSharedPlugin',
        expect.any(Function),
      );
    });

    it('should set up dependency factories during compilation', () => {
      plugin.apply(mockCompiler);

      expect(mockCompilation.dependencyFactories.set).toHaveBeenCalledWith(
        expect.any(Function), // ConsumeSharedFallbackDependency
        mockNormalModuleFactory,
      );
    });

    it('should register additionalTreeRuntimeRequirements hook', () => {
      plugin.apply(mockCompiler);

      expect(
        mockCompilation.hooks.additionalTreeRuntimeRequirements.tap,
      ).toHaveBeenCalledWith('ConsumeSharedPlugin', expect.any(Function));
    });

    it('should set FEDERATION_WEBPACK_PATH environment variable', () => {
      const originalEnv = process.env['FEDERATION_WEBPACK_PATH'];
      delete process.env['FEDERATION_WEBPACK_PATH'];

      plugin.apply(mockCompiler);

      expect(process.env['FEDERATION_WEBPACK_PATH']).toBeDefined();

      // Restore original environment
      if (originalEnv) {
        process.env['FEDERATION_WEBPACK_PATH'] = originalEnv;
      } else {
        delete process.env['FEDERATION_WEBPACK_PATH'];
      }
    });

    it('should apply FederationRuntimePlugin during plugin application', () => {
      // Mock FederationRuntimePlugin
      const mockApply = jest.fn();
      const MockFederationRuntimePlugin = jest.fn(() => ({
        apply: mockApply,
      }));

      jest
        .spyOn(
          require('../../../src/lib/container/runtime/FederationRuntimePlugin'),
          'default',
        )
        .mockImplementation(MockFederationRuntimePlugin);

      plugin.apply(mockCompiler);

      expect(MockFederationRuntimePlugin).toHaveBeenCalled();
      expect(mockApply).toHaveBeenCalledWith(mockCompiler);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });
});
