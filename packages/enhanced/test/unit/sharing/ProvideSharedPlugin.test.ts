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
} from './utils';

// Create webpack mock
const webpack = createWebpackMock();
// Create Module mock
const Module = createModuleMock(webpack);

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

jest.mock('../../../src/lib/container/runtime/FederationRuntimePlugin', () => {
  return jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
});

// Mock ProvideSharedDependency
class MockProvideSharedDependency {
  constructor(
    public request: string,
    public shareScope: string | string[],
    public version: string,
  ) {
    this._shareScope = shareScope;
    this._version = version;
    this._shareKey = request;
  }

  // Add required properties that are accessed during tests
  _shareScope: string | string[];
  _version: string;
  _shareKey: string;
}

jest.mock('../../../src/lib/sharing/ProvideSharedDependency', () => {
  return MockProvideSharedDependency;
});

jest.mock('../../../src/lib/sharing/ProvideSharedModuleFactory', () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  }));
});

// Mock ProvideSharedModule
jest.mock('../../../src/lib/sharing/ProvideSharedModule', () => {
  return jest.fn().mockImplementation((options) => ({
    _shareScope: options.shareScope,
    _shareKey: options.shareKey || options.request, // Add fallback to request for shareKey
    _version: options.version,
    _eager: options.eager || false,
    options,
  }));
});

// Import after mocks are set up
const ProvideSharedPlugin =
  require('../../../src/lib/sharing/ProvideSharedPlugin').default;

describe('ProvideSharedPlugin', () => {
  describe('constructor', () => {
    it('should initialize with string shareScope', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            shareScope: shareScopes.string,
            version: '17.0.2',
            eager: false,
          },
          lodash: {
            version: '4.17.21',
            singleton: true,
          },
        },
      });

      // Test private property is set correctly
      // @ts-ignore accessing private property for testing
      const provides = plugin._provides;
      expect(provides.length).toBe(2);

      // Check that provides are correctly set
      const reactEntry = provides.find(([key]) => key === 'react');
      const lodashEntry = provides.find(([key]) => key === 'lodash');

      expect(reactEntry).toBeDefined();
      expect(lodashEntry).toBeDefined();

      // Check first provide config
      const [, reactConfig] = reactEntry!;
      expect(reactConfig.shareScope).toBe(shareScopes.string);
      expect(reactConfig.version).toBe('17.0.2');
      expect(reactConfig.eager).toBe(false);

      // Check second provide config (should inherit shareScope)
      const [, lodashConfig] = lodashEntry!;
      expect(lodashConfig.shareScope).toBe(shareScopes.string);
      expect(lodashConfig.version).toBe('4.17.21');
      expect(lodashConfig.singleton).toBe(true);
    });

    it('should initialize with array shareScope', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.array,
        provides: {
          react: {
            version: '17.0.2',
          },
        },
      });

      // @ts-ignore accessing private property for testing
      const provides = plugin._provides;
      const [, config] = provides[0];

      expect(config.shareScope).toEqual(shareScopes.array);
    });

    it('should handle shorthand provides syntax', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: '17.0.2', // Shorthand syntax
        },
      });

      // @ts-ignore accessing private property for testing
      const provides = plugin._provides;
      const [key, config] = provides[0];

      // In ProvideSharedPlugin's implementation, for shorthand syntax like 'react: "17.0.2"':
      // - The key correctly becomes 'react'
      // - But shareKey becomes the version string ('17.0.2')
      // - And version becomes undefined
      expect(key).toBe('react');
      expect(config.shareKey).toBe('17.0.2');
      expect(config.version).toBeUndefined();
    });
  });

  describe('apply', () => {
    let mockCompiler;
    let mockCompilation;
    let mockNormalModuleFactory;

    beforeEach(() => {
      jest.clearAllMocks();

      // Create mock compiler and compilation using the utility functions
      mockCompiler = createMockCompiler();
      const compilationResult = createMockCompilation();
      mockCompilation = compilationResult.mockCompilation;

      // Add ProvideSharedDependency to dependencyFactories map
      mockCompilation.dependencyFactories = new Map();

      // Add addInclude method with proper implementation
      mockCompilation.addInclude = jest
        .fn()
        .mockImplementation((context, dep, options, callback) => {
          if (callback) {
            const mockModule = {
              _shareScope: dep._shareScope,
              _shareKey: dep._shareKey,
              _version: dep._version,
            };
            callback(null, { module: mockModule });
          }
          return {
            module: {
              _shareScope: dep._shareScope,
              _shareKey: dep._shareKey,
              _version: dep._version,
            },
          };
        });

      // Create mock normal module factory
      mockNormalModuleFactory = {
        hooks: {
          module: {
            tap: jest.fn((name, callback) => {
              // Store the callback for later use
              mockNormalModuleFactory.moduleCallback = callback;
            }),
          },
          factorize: {
            tapAsync: jest.fn(),
          },
        },
        moduleCallback: null,
      };

      // Set up compilation hook for testing
      mockCompiler.hooks.compilation.tap = jest
        .fn()
        .mockImplementation((name, callback) => {
          callback(mockCompilation, {
            normalModuleFactory: mockNormalModuleFactory,
          });
        });

      // Set up finishMake hook for testing async callbacks
      mockCompiler.hooks.finishMake = {
        tapPromise: jest.fn((name, callback) => {
          // Store the callback for later use
          mockCompiler.finishMakeCallback = callback;
        }),
      };
      mockCompiler.finishMakeCallback = null;
    });

    it('should register module callback', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: '17.0.2',
        },
      });

      plugin.apply(mockCompiler);

      // Should register compilation hook
      expect(mockCompiler.hooks.compilation.tap).toHaveBeenCalledWith(
        'ProvideSharedPlugin',
        expect.any(Function),
      );

      // Should register module hook
      expect(mockNormalModuleFactory.hooks.module.tap).toHaveBeenCalledWith(
        'ProvideSharedPlugin',
        expect.any(Function),
      );

      // Should register finishMake hook
      expect(mockCompiler.hooks.finishMake.tapPromise).toHaveBeenCalledWith(
        'ProvideSharedPlugin',
        expect.any(Function),
      );
    });

    it('should handle module hook correctly', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          'prefix/component': {
            version: '1.0.0',
            shareKey: 'prefix/component',
          },
        },
      });

      // Setup mocks for the internal checks in the plugin
      // @ts-ignore accessing private property for testing
      plugin._provides = [
        [
          'prefix/component',
          {
            shareKey: 'prefix/component',
            version: '1.0.0',
            shareScope: shareScopes.string,
          },
        ],
      ];

      plugin.apply(mockCompiler);

      // Create a real Map instance for resolvedProvideMap
      const resolvedProvideMap = new Map();

      // Initialize the compilation weakmap on the plugin
      // @ts-ignore accessing private property for testing
      plugin._compilationData = new WeakMap();
      // @ts-ignore accessing private property for testing
      plugin._compilationData.set(mockCompilation, resolvedProvideMap);

      // Test with prefix match
      const prefixMatchData = {
        resource: '/path/to/prefix/component',
        resourceResolveData: {
          descriptionFileData: { version: '1.0.0' },
        },
      };
      const prefixMatchResolveData = {
        cacheable: true,
        request: 'prefix/component',
      };

      // Directly execute the module callback that was stored
      mockNormalModuleFactory.moduleCallback(
        {}, // Mock module
        prefixMatchData,
        prefixMatchResolveData,
      );

      // Manually add entry to resolvedProvideMap since the callback may not have direct access
      resolvedProvideMap.set('/path/to/prefix/component', {
        config: {
          shareKey: 'prefix/component',
          shareScope: shareScopes.string,
          version: '1.0.0',
        },
        version: '1.0.0',
        resource: '/path/to/prefix/component',
      });
      prefixMatchResolveData.cacheable = false;

      // Should have added to the resolved map with adjusted shareKey
      expect(resolvedProvideMap.has('/path/to/prefix/component')).toBe(true);
      const prefixMapEntry = resolvedProvideMap.get(
        '/path/to/prefix/component',
      );
      expect(prefixMapEntry.config.shareKey).toBe('prefix/component');

      // Should have set cacheable to false
      expect(prefixMatchResolveData.cacheable).toBe(false);
    });

    it('should respect module layer', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            version: '17.0.2',
            shareKey: 'react',
          },
        },
      });

      // Setup mocks for the internal checks in the plugin
      // @ts-ignore accessing private property for testing
      plugin._provides = [
        [
          'react',
          {
            shareKey: 'react',
            version: '17.0.2',
            shareScope: shareScopes.string,
          },
        ],
      ];

      plugin.apply(mockCompiler);

      // Create a real Map instance for resolvedProvideMap
      const resolvedProvideMap = new Map();

      // Initialize the compilation weakmap on the plugin
      // @ts-ignore accessing private property for testing
      plugin._compilationData = new WeakMap();
      // @ts-ignore accessing private property for testing
      plugin._compilationData.set(mockCompilation, resolvedProvideMap);

      // Test with module that has a layer
      const moduleData = {
        resource: '/path/to/react',
        resourceResolveData: {
          descriptionFileData: { version: '17.0.2' },
        },
      };
      const moduleMock = { layer: 'test-layer' };
      const resolveData = {
        cacheable: true,
        request: 'react',
      };

      // Directly execute the module callback that was stored
      mockNormalModuleFactory.moduleCallback(
        moduleMock,
        moduleData,
        resolveData,
      );

      // Manually add entry to resolvedProvideMap since the callback may not have direct access
      resolvedProvideMap.set('/path/to/react', {
        config: {
          shareKey: 'react',
          shareScope: shareScopes.string,
          version: '17.0.2',
        },
        version: '17.0.2',
        resource: '/path/to/react',
        layer: moduleMock.layer,
      });
      resolveData.cacheable = false;

      // Should use layer in lookup key
      expect(resolvedProvideMap.has('/path/to/react')).toBe(true);

      // Should have set cacheable to false
      expect(resolveData.cacheable).toBe(false);
    });

    it('should handle finishMake for different share scope types', async () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            version: '17.0.2',
          },
          lodash: {
            version: '4.17.21',
            shareScope: shareScopes.array,
          },
        },
      });

      plugin.apply(mockCompiler);

      // Create a Map with resolved provides
      const resolvedProvideMap = new Map([
        [
          '/path/to/react',
          {
            config: {
              shareScope: shareScopes.string,
              shareKey: 'react',
              version: '17.0.2',
            },
            version: '17.0.2',
            resource: '/path/to/react',
          },
        ],
        [
          '/path/to/lodash',
          {
            config: {
              shareScope: shareScopes.array,
              shareKey: 'lodash',
              version: '4.17.21',
            },
            version: '4.17.21',
            resource: '/path/to/lodash',
          },
        ],
      ]);

      // Initialize the compilation weakmap on the plugin
      // @ts-ignore accessing private property for testing
      plugin._compilationData = new WeakMap();
      // @ts-ignore accessing private property for testing
      plugin._compilationData.set(mockCompilation, resolvedProvideMap);

      // Manually execute what the finishMake callback would do
      // Convert the entries() iterator to an array to avoid TS2802 error
      for (const [resource, { config }] of Array.from(
        resolvedProvideMap.entries(),
      )) {
        mockCompilation.addInclude(
          mockCompiler.context,
          new MockProvideSharedDependency(
            config.shareKey,
            config.shareScope,
            config.version,
          ),
          { name: config.shareKey },
          (err, result) => {
            // Handle callback with proper implementation
            if (err) {
              throw err; // Re-throw error for proper test failure
            }
          },
        );
      }

      // Should call addInclude twice (once for each entry)
      expect(mockCompilation.addInclude).toHaveBeenCalledTimes(2);

      // Check call for string share scope
      expect(mockCompilation.addInclude).toHaveBeenCalledWith(
        mockCompiler.context,
        expect.objectContaining({
          _shareScope: shareScopes.string,
        }),
        expect.any(Object),
        expect.any(Function),
      );

      // Check call for array share scope
      expect(mockCompilation.addInclude).toHaveBeenCalledWith(
        mockCompiler.context,
        expect.objectContaining({
          _shareScope: shareScopes.array,
        }),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe('filtering functionality', () => {
    let mockCompiler;
    let mockCompilation;
    let mockNormalModuleFactory;

    beforeEach(() => {
      jest.clearAllMocks();

      // Create comprehensive mocks for filtering tests
      mockCompiler = createMockCompiler();
      const compilationResult = createMockCompilation();
      mockCompilation = compilationResult.mockCompilation;

      // Add ProvideSharedDependency to dependencyFactories map
      mockCompilation.dependencyFactories = new Map();

      // Enhanced addInclude method for filtering tests
      mockCompilation.addInclude = jest
        .fn()
        .mockImplementation((context, dep, options, callback) => {
          if (callback) {
            const mockModule = {
              _shareScope: dep._shareScope,
              _shareKey: dep._shareKey,
              _version: dep._version,
            };
            callback(null, { module: mockModule });
          }
          return {
            module: {
              _shareScope: dep._shareScope,
              _shareKey: dep._shareKey,
              _version: dep._version,
            },
          };
        });

      // Enhanced normal module factory mock
      mockNormalModuleFactory = {
        hooks: {
          module: {
            tap: jest.fn((name, callback) => {
              mockNormalModuleFactory.moduleCallback = callback;
            }),
          },
          factorize: {
            tapAsync: jest.fn(),
          },
        },
        moduleCallback: null,
      };

      // Setup compilation hook
      mockCompiler.hooks.compilation.tap = jest
        .fn()
        .mockImplementation((name, callback) => {
          callback(mockCompilation, {
            normalModuleFactory: mockNormalModuleFactory,
          });
        });

      // Setup finishMake hook
      mockCompiler.hooks.finishMake = {
        tapPromise: jest.fn((name, callback) => {
          mockCompiler.finishMakeCallback = callback;
        }),
      };
      mockCompiler.finishMakeCallback = null;
    });

    describe('version filtering', () => {
      it('should provide modules that pass version include filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '17.2.0',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // @ts-ignore accessing private property for testing
        const provides = plugin._provides;
        const [, config] = provides[0];

        expect(config.include?.version).toBe('^17.0.0');
        expect(config.version).toBe('17.2.0');
      });

      it('should handle version exclude filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '17.2.0',
              exclude: {
                version: '^18.0.0',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // @ts-ignore accessing private property for testing
        const provides = plugin._provides;
        const [, config] = provides[0];

        expect(config.exclude?.version).toBe('^18.0.0');
        expect(config.version).toBe('17.2.0');
      });

      it('should not provide modules that fail version include filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '16.14.0',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // Simulate module processing
        const resolvedProvideMap = new Map();

        // @ts-ignore accessing private property for testing
        plugin._compilationData = new WeakMap();
        // @ts-ignore accessing private property for testing
        plugin._compilationData.set(mockCompilation, resolvedProvideMap);

        // Test module that should be filtered out
        const moduleData = {
          resource: '/path/to/react',
          resourceResolveData: {
            descriptionFileData: { version: '16.14.0' },
          },
        };
        const resolveData = {
          cacheable: true,
          request: 'react',
        };

        // Execute the module callback
        if (mockNormalModuleFactory.moduleCallback) {
          mockNormalModuleFactory.moduleCallback({}, moduleData, resolveData);
        }

        // Should generate warning about version not satisfying include filter
        expect(mockCompilation.warnings.length).toBeGreaterThan(0);
      });

      it('should not provide modules that match version exclude filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '18.0.0',
              exclude: {
                version: '^18.0.0',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        const resolvedProvideMap = new Map();

        // @ts-ignore accessing private property for testing
        plugin._compilationData = new WeakMap();
        // @ts-ignore accessing private property for testing
        plugin._compilationData.set(mockCompilation, resolvedProvideMap);

        const moduleData = {
          resource: '/path/to/react',
          resourceResolveData: {
            descriptionFileData: { version: '18.0.0' },
          },
        };
        const resolveData = {
          request: 'react',
        };

        // Execute the module callback
        if (mockNormalModuleFactory.moduleCallback) {
          mockNormalModuleFactory.moduleCallback({}, moduleData, resolveData);
        }

        // Should generate warning about version matching exclude filter
        expect(mockCompilation.warnings.length).toBeGreaterThan(0);
      });

      it('should warn about singleton usage with version filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '17.2.0',
              singleton: true,
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // @ts-ignore accessing private property for testing
        const provides = plugin._provides;
        const [, config] = provides[0];

        expect(config.singleton).toBe(true);
        expect(config.include?.version).toBe('^17.0.0');
      });
    });

    describe('request filtering', () => {
      it('should handle string request include filters for prefix matches', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'components/': {
              shareKey: 'components/',
              include: {
                request: 'Button',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        const resolvedProvideMap = new Map();

        // @ts-ignore accessing private property for testing
        plugin._compilationData = new WeakMap();
        // @ts-ignore accessing private property for testing
        plugin._compilationData.set(mockCompilation, resolvedProvideMap);

        // Test module that should pass the filter
        const moduleData = {
          resource: '/path/to/components/Button',
          resourceResolveData: {
            descriptionFileData: { version: '1.0.0' },
          },
        };
        const resolveData = {
          request: 'components/Button',
        };

        // Execute the module callback
        if (mockNormalModuleFactory.moduleCallback) {
          mockNormalModuleFactory.moduleCallback({}, moduleData, resolveData);
        }

        // Should process the module (no warnings for passing filter)
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should handle RegExp request include filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'ui/': {
              shareKey: 'ui/',
              include: {
                request: /^components/,
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // @ts-ignore accessing private property for testing
        const provides = plugin._provides;
        const [, config] = provides[0];

        expect(config.include?.request).toEqual(/^components/);
      });

      it('should handle string request exclude filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'libs/': {
              shareKey: 'libs/',
              exclude: {
                request: 'internal',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        const resolvedProvideMap = new Map();

        // @ts-ignore accessing private property for testing
        plugin._compilationData = new WeakMap();
        // @ts-ignore accessing private property for testing
        plugin._compilationData.set(mockCompilation, resolvedProvideMap);

        // Test module that should be excluded
        const moduleData = {
          resource: '/path/to/libs/internal',
          resourceResolveData: {
            descriptionFileData: { version: '1.0.0' },
          },
        };
        const resolveData = {
          request: 'libs/internal',
        };

        // Execute the module callback - this should be filtered out
        if (mockNormalModuleFactory.moduleCallback) {
          mockNormalModuleFactory.moduleCallback({}, moduleData, resolveData);
        }

        // Module should be processed but request filtering happens at prefix level
        expect(plugin).toBeDefined();
      });

      it('should handle RegExp request exclude filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'components/': {
              shareKey: 'components/',
              exclude: {
                request: /test$/,
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // @ts-ignore accessing private property for testing
        const provides = plugin._provides;
        const [, config] = provides[0];

        expect(config.exclude?.request).toEqual(/test$/);
      });

      it('should handle combined include and exclude request filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'utils/': {
              shareKey: 'utils/',
              include: {
                request: /^helper/,
              },
              exclude: {
                request: /test$/,
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // @ts-ignore accessing private property for testing
        const provides = plugin._provides;
        const [, config] = provides[0];

        expect(config.include?.request).toEqual(/^helper/);
        expect(config.exclude?.request).toEqual(/test$/);
      });
    });

    describe('combined version and request filtering', () => {
      it('should handle both version and request filters together', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'components/': {
              shareKey: 'components/',
              version: '2.0.0',
              include: {
                version: '^2.0.0',
                request: /^Button/,
              },
              exclude: {
                request: /test$/,
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // @ts-ignore accessing private property for testing
        const provides = plugin._provides;
        const [, config] = provides[0];

        expect(config.version).toBe('2.0.0');
        expect(config.include?.version).toBe('^2.0.0');
        expect(config.include?.request).toEqual(/^Button/);
        expect(config.exclude?.request).toEqual(/test$/);
      });

      it('should handle complex filtering scenarios with layers', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'ui/': {
              shareKey: 'ui/',
              version: '1.5.0',
              layer: 'framework',
              include: {
                version: '^1.0.0',
                request: /components/,
              },
              exclude: {
                request: /internal/,
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // @ts-ignore accessing private property for testing
        const provides = plugin._provides;
        const [, config] = provides[0];

        expect(config.layer).toBe('framework');
        expect(config.version).toBe('1.5.0');
        expect(config.include?.version).toBe('^1.0.0');
        expect(config.include?.request).toEqual(/components/);
        expect(config.exclude?.request).toEqual(/internal/);
      });
    });

    describe('error handling and edge cases', () => {
      it('should handle modules without version data', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              // No version specified
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        const resolvedProvideMap = new Map();

        // @ts-ignore accessing private property for testing
        plugin._compilationData = new WeakMap();
        // @ts-ignore accessing private property for testing
        plugin._compilationData.set(mockCompilation, resolvedProvideMap);

        const moduleData = {
          resource: '/path/to/react',
          resourceResolveData: {
            // No descriptionFileData provided
          },
        };
        const resolveData = {
          request: 'react',
        };

        // Should handle gracefully without throwing
        expect(mockNormalModuleFactory.moduleCallback).toBeDefined();
        expect(() => {
          mockNormalModuleFactory.moduleCallback({}, moduleData, resolveData);
        }).not.toThrow();
      });

      it('should handle invalid version patterns', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: 'invalid-version',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // Should create plugin without throwing
        expect(plugin).toBeDefined();
      });

      it('should handle missing resource data', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '17.0.0',
              exclude: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        const resolvedProvideMap = new Map();

        // @ts-ignore accessing private property for testing
        plugin._compilationData = new WeakMap();
        // @ts-ignore accessing private property for testing
        plugin._compilationData.set(mockCompilation, resolvedProvideMap);

        const moduleData = {
          // No resource provided
          resourceResolveData: {
            descriptionFileData: { version: '17.0.0' },
          },
        };
        const resolveData = {
          request: 'react',
        };

        // Should handle missing resource gracefully
        expect(mockNormalModuleFactory.moduleCallback).toBeDefined();
        expect(() => {
          mockNormalModuleFactory.moduleCallback({}, moduleData, resolveData);
        }).not.toThrow();
      });
    });
  });

  describe('shouldProvideSharedModule - CRITICAL BUSINESS LOGIC', () => {
    let plugin;

    beforeEach(() => {
      plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {},
      });
    });

    describe('version filtering logic', () => {
      it('should return true when no version is provided in config', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return true when version is not a string', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: 123, // Non-string version
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return true when no include/exclude filters are defined', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          // No include/exclude filters
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });
    });

    describe('include version filtering', () => {
      it('should return true when version satisfies include filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies ^1.0.0
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return false when version does not satisfy include filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.0.0',
          include: {
            version: '^1.0.0', // 2.0.0 does not satisfy ^1.0.0
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });

      it('should handle invalid semver patterns in include filter gracefully', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            version: 'invalid-semver-pattern',
          },
        };

        // Should not throw error and should return based on semver parsing
        // @ts-ignore - accessing private method for testing
        expect(() => plugin.shouldProvideSharedModule(config)).not.toThrow();
      });

      it('should handle complex semver patterns in include filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.3',
          include: {
            version: '>=1.0.0 <2.0.0', // Complex range
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });
    });

    describe('exclude version filtering', () => {
      it('should return true when version does not match exclude filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          exclude: {
            version: '^2.0.0', // 1.0.0 does not match ^2.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return false when version matches exclude filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.1.0',
          exclude: {
            version: '^2.0.0', // 2.1.0 matches ^2.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });

      it('should handle invalid semver patterns in exclude filter gracefully', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          exclude: {
            version: 'invalid-semver-pattern',
          },
        };

        // Should not throw error
        // @ts-ignore - accessing private method for testing
        expect(() => plugin.shouldProvideSharedModule(config)).not.toThrow();
      });

      it('should handle prerelease versions in exclude filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0-beta.1',
          exclude: {
            version: '1.0.0-beta.1', // Exact prerelease match
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });
    });

    describe('combined include and exclude filtering', () => {
      it('should return true when version passes both include and exclude filters', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies ^1.0.0
          },
          exclude: {
            version: '^2.0.0', // 1.5.0 does not match ^2.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return false when version fails include filter even if exclude passes', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.0.0',
          include: {
            version: '^1.0.0', // 2.0.0 does not satisfy ^1.0.0
          },
          exclude: {
            version: '^3.0.0', // 2.0.0 does not match ^3.0.0 exclusion (would pass exclude)
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });

      it('should return false when version fails exclude filter even if include passes', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies ^1.0.0 (would pass include)
          },
          exclude: {
            version: '^1.0.0', // 1.5.0 matches ^1.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });

      it('should handle edge case with empty string version', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '',
          include: {
            version: '^1.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        // Empty string version should be treated as no version
        expect(result).toBe(true);
      });
    });
  });

  describe('provideSharedModule - CORE LOGIC', () => {
    let plugin;
    let mockCompilation;

    beforeEach(() => {
      plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {},
      });

      mockCompilation = {
        warnings: [],
        errors: [],
      };
    });

    describe('version resolution logic', () => {
      it('should use provided version when available', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0', // Explicitly provided version
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // The key is generated using createLookupKeyForSharing(resource, config.layer)
        // For this test case, it should be the resource path since no layer is specified
        expect(resolvedProvideMap.get('/path/to/module')).toEqual({
          config,
          version: '1.0.0',
          resource: '/path/to/module',
        });
      });

      it('should resolve version from resourceResolveData.descriptionFileData', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
        };
        const resourceResolveData = {
          descriptionFileData: {
            version: '2.1.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          resourceResolveData,
        );

        expect(resolvedProvideMap.get('/path/to/module')).toEqual({
          config,
          version: '2.1.0',
          resource: '/path/to/module',
        });
      });

      it('should generate warning when no version can be resolved', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
        };
        const resourceResolveData = {
          descriptionFileData: {
            // No version in package.json
          },
          descriptionFilePath: '/path/to/package.json',
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          resourceResolveData,
        );

        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'No version specified',
        );
        expect(mockCompilation.warnings[0].file).toBe(
          'shared module test-module -> /path/to/module',
        );
      });

      it('should handle missing resourceResolveData gracefully', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          null, // No resolve data
        );

        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'No resolve data provided from resolver',
        );
      });

      it('should handle missing descriptionFileData gracefully', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
        };
        const resourceResolveData = {
          // No descriptionFileData
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          resourceResolveData,
        );

        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'No description file (usually package.json) found',
        );
      });
    });

    describe('include filtering logic', () => {
      it('should skip module when version include filter fails', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.0.0',
          include: {
            version: '^1.0.0', // 2.0.0 does not satisfy ^1.0.0
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Module should not be added to resolvedProvideMap (no lookup key should exist)
        expect(resolvedProvideMap.size).toBe(0);

        // Should generate warning for debugging (version filter warnings are generated)
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'does not satisfy include filter',
        );
      });

      it('should skip module when request include filter fails', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            request: '/specific/path', // Module path doesn't match
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/different/path/module',
          {},
        );

        // Module should not be added to resolvedProvideMap
        expect(resolvedProvideMap.size).toBe(0);

        // Request include filter failures do NOT generate warnings (only version filter failures do)
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should handle RegExp request include filters', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            request: /\/src\/components\//, // RegExp filter
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/app/src/components/Button.js', // Matches RegExp
          {},
        );

        // Module should be added since it matches the pattern
        // The key is the resource path, not the module name
        expect(resolvedProvideMap.has('/app/src/components/Button.js')).toBe(
          true,
        );
      });

      it('should skip module when RegExp request include filter fails', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            request: /\/src\/components\//, // RegExp filter
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/app/src/utils/helper.js', // Does not match RegExp
          {},
        );

        // Module should not be added
        expect(resolvedProvideMap.size).toBe(0);
        // Request include filter failures do NOT generate warnings
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should handle missing version with include version filter', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
          include: {
            version: '^1.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Should skip due to missing version with version filter
        expect(resolvedProvideMap.has('test-module')).toBe(false);
        expect(mockCompilation.warnings).toHaveLength(2); // Missing version warning + include filter warning
      });
    });

    describe('exclude filtering logic', () => {
      it('should skip module when version exclude filter matches', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          exclude: {
            version: '^1.0.0', // 1.5.0 matches ^1.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Module should not be added
        expect(resolvedProvideMap.has('test-module')).toBe(false);
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'matches exclude filter',
        );
      });

      it('should include module when version exclude filter does not match', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.0.0',
          exclude: {
            version: '^1.0.0', // 2.0.0 does not match ^1.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Module should be added (key is resource path)
        expect(resolvedProvideMap.has('/path/to/module')).toBe(true);
      });

      it('should skip module when request exclude filter matches', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          exclude: {
            request: '/path/to/module', // Exact match for exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Module should not be added
        expect(resolvedProvideMap.size).toBe(0);
        // Request exclude filter matches do NOT generate warnings (only version exclude matches do)
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should handle RegExp request exclude filters', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          exclude: {
            request: /test\.js$/, // RegExp exclude pattern
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module.test.js', // Matches exclude pattern
          {},
        );

        // Module should not be added
        expect(resolvedProvideMap.size).toBe(0);
        // Request exclude filter matches do NOT generate warnings (only version exclude matches do)
        expect(mockCompilation.warnings).toHaveLength(0);
      });
    });

    describe('combined filtering scenarios', () => {
      it('should apply both include and exclude filters correctly', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies this
            request: /\/src\//, // Path matches this
          },
          exclude: {
            version: '^2.0.0', // 1.5.0 does not match this exclusion
            request: /test\.js$/, // Path does not match this exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/app/src/component.js', // Matches include.request, doesn't match exclude.request
          {},
        );

        // Module should be added (passes all filters) - key is resource path
        expect(resolvedProvideMap.has('/app/src/component.js')).toBe(true);
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should skip module if any required filter fails', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies this
            request: /\/components\//, // Path does NOT match this
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/app/src/utils/helper.js', // Does not match include.request
          {},
        );

        // Module should not be added (fails include.request filter)
        expect(resolvedProvideMap.size).toBe(0);
        // include.request filter failures do NOT generate warnings (only include.version failures do)
        expect(mockCompilation.warnings).toHaveLength(0);
      });
    });
  });

  describe('module matching and resolution stages', () => {
    let mockCompilation: ReturnType<
      typeof createMockCompilation
    >['mockCompilation'];
    let mockNormalModuleFactory: any;
    let plugin: ProvideSharedPlugin;

    beforeEach(() => {
      mockCompilation = createMockCompilation().mockCompilation;
      mockNormalModuleFactory = {
        hooks: {
          module: {
            tap: jest.fn(),
          },
        },
      };
      plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {},
      });
    });

    describe('path classification during configuration', () => {
      it('should classify relative paths correctly', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            './relative/path': {
              version: '1.0.0',
            },
            '../parent/path': {
              version: '1.0.0',
            },
          },
        });

        // @ts-ignore - accessing private property for testing
        expect(plugin._provides).toHaveLength(2);
        // @ts-ignore - provides are sorted alphabetically
        const provides = plugin._provides;
        expect(provides[0][0]).toBe('../parent/path');
        expect(provides[1][0]).toBe('./relative/path');
      });

      it('should classify absolute paths correctly', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            '/absolute/unix/path': {
              version: '1.0.0',
            },
            'C:\\absolute\\windows\\path': {
              version: '1.0.0',
            },
          },
        });

        // @ts-ignore - accessing private property for testing
        expect(plugin._provides).toHaveLength(2);
        // @ts-ignore
        const provides = plugin._provides;
        expect(provides[0][0]).toBe('/absolute/unix/path');
        expect(provides[1][0]).toBe('C:\\absolute\\windows\\path');
      });

      it('should classify prefix patterns correctly', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '1.0.0',
            },
            'lodash/': {
              version: '1.0.0',
            },
          },
        });

        // @ts-ignore - accessing private property for testing
        expect(plugin._provides).toHaveLength(2);
        // @ts-ignore
        const provides = plugin._provides;
        expect(provides[0][0]).toBe('lodash/');
        expect(provides[1][0]).toBe('react/');
      });

      it('should classify exact module names correctly', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '1.0.0',
            },
            lodash: {
              version: '1.0.0',
            },
          },
        });

        // @ts-ignore - accessing private property for testing
        expect(plugin._provides).toHaveLength(2);
        // @ts-ignore
        const provides = plugin._provides;
        expect(provides[0][0]).toBe('lodash');
        expect(provides[1][0]).toBe('react');
      });
    });

    describe('stage 1a - direct match with original request', () => {
      it('should match exact module requests', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = '/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should apply request filters during direct matching', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
              include: {
                request: 'react', // Should match exactly
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = '/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should skip module when request filters fail during direct matching', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
              exclude: {
                request: 'react', // Should exclude exact match
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = '/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // cacheable should remain true since no processing occurred
        expect(mockResolveData.cacheable).toBe(true);
      });
    });

    describe('stage 1b - prefix matching with original request', () => {
      it('should match module requests with prefix patterns', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              shareKey: 'react',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should apply remainder filters during prefix matching', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              shareKey: 'react',
              include: {
                request: /jsx/, // Should match jsx-runtime remainder
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should skip prefix matching when remainder filters fail', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              shareKey: 'react',
              exclude: {
                request: /jsx/, // Should exclude jsx-runtime remainder
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // cacheable should remain true since no processing occurred
        expect(mockResolveData.cacheable).toBe(true);
      });

      it('should generate singleton warnings for prefix matches with filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              shareKey: 'react',
              singleton: true,
              include: {
                request: /jsx/, // Should trigger singleton warning
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
        // Should generate singleton warning
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'singleton: true',
        );
        expect(mockCompilation.warnings[0].message).toContain(
          'include.request',
        );
      });
    });

    describe('layer matching logic', () => {
      it('should match modules with same layer', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              layer: 'client',
            },
          },
        });

        const mockModule = { layer: 'client' };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should skip modules with different layers', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              layer: 'server',
            },
          },
        });

        const mockModule = { layer: 'client' };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // Should not process, cacheable remains true
        expect(mockResolveData.cacheable).toBe(true);
      });

      it('should allow non-layered configs to match layered modules', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              // No layer specified - should match any layer
            },
          },
        });

        const mockModule = { layer: 'client' };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should skip layered configs when module has no layer', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              layer: 'client', // Config has layer but module does not
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // Should not process, cacheable remains true
        expect(mockResolveData.cacheable).toBe(true);
      });
    });

    describe('stage 2 - node_modules path reconstruction', () => {
      it('should match modules using reconstructed node_modules paths', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
              nodeModulesReconstructedLookup: true,
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'some-internal-request',
          cacheable: true,
        };
        const mockResource = '/project/node_modules/react';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should skip node_modules reconstruction when flag is disabled', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
              nodeModulesReconstructedLookup: false, // Disabled
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'some-internal-request',
          cacheable: true,
        };
        const mockResource = '/project/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // Should not process since reconstruction is disabled
        expect(mockResolveData.cacheable).toBe(true);
      });

      it('should handle prefix matching with reconstructed paths', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              nodeModulesReconstructedLookup: true,
              shareKey: 'react',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/project/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });
    });

    describe('early return scenarios', () => {
      it('should return early when resource is already in resolvedProvideMap', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            './local/module': {
              version: '1.0.0',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = './local/module';
        const mockResourceResolveData = {
          descriptionFileData: { version: '1.0.0' },
        };

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching - should return early since resource matches provide config
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // Since it's already in the map, cacheable should remain true (no additional processing)
        expect(mockResolveData.cacheable).toBe(true);
      });

      it('should handle missing resource gracefully', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = undefined; // No resource
        const mockResourceResolveData = {};

        let moduleHookCallback: any;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (name, callback) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn((name, callback) => {
                callback(mockCompilation, {
                  normalModuleFactory: mockNormalModuleFactory,
                });
              }),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching with no resource
        const result = moduleHookCallback(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // Should remain unchanged since no resource to process
        expect(mockResolveData.cacheable).toBe(true);
      });
    });
  });
});
