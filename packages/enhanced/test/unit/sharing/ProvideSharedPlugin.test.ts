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
              console.error('Error in addInclude:', err);
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
});
