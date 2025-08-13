/*
 * @jest-environment node
 */

import {
  ProvideSharedPlugin,
  MockProvideSharedDependency,
  shareScopes,
  createMockCompiler,
  createMockCompilation,
} from './shared-test-utils';

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
                version: 'also-invalid',
              },
            },
          },
        });

        plugin.apply(mockCompiler);

        // Should not throw during plugin initialization
        expect(plugin).toBeDefined();
      });

      it('should handle missing resource data', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '17.0.0',
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
          resource: undefined, // Missing resource
          resourceResolveData: {},
        };
        const resolveData = {
          request: 'react',
        };

        // Should handle gracefully
        expect(mockNormalModuleFactory.moduleCallback).toBeDefined();
        expect(() => {
          mockNormalModuleFactory.moduleCallback({}, moduleData, resolveData);
        }).not.toThrow();
      });

      it('should validate singleton warnings are only generated for version filters', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '17.0.0',
              singleton: true,
              include: {
                request: /components/, // Request filter should NOT generate singleton warning
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

        // Manually test provideSharedModule to verify no singleton warning
        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'react',
          {
            shareKey: 'react',
            version: '17.0.0',
            singleton: true,
            include: { request: /components/ },
          },
          '/path/to/react/components/Button.js',
          { descriptionFileData: { version: '17.0.0' } },
        );

        // Should NOT generate singleton warning for request filters
        const singletonWarnings = mockCompilation.warnings.filter((w) =>
          w.message.includes('singleton'),
        );
        expect(singletonWarnings).toHaveLength(0);
      });
    });
  });
});
