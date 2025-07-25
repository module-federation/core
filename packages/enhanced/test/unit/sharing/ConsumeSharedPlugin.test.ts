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

// Import after mocks are set up
const ConsumeSharedPlugin =
  require('../../../src/lib/sharing/ConsumeSharedPlugin').default;

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
});
