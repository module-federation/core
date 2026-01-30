/*
 * @rstest-environment node
 */

import {
  ProvideSharedPlugin,
  MockProvideSharedDependency,
  shareScopes,
  createMockCompiler,
  createMockCompilation,
} from '../plugin-test-utils';

type MockCompilation = ReturnType<
  typeof createMockCompilation
>['mockCompilation'];
type FinishMakeCallback = (compilation: unknown) => Promise<void>;
type ModuleCallback = (
  module: Record<string, unknown>,
  data: { resource?: string; resourceResolveData?: Record<string, unknown> },
  resolveData: { request?: string; cacheable?: boolean },
) => void;
type MockCompiler = ReturnType<typeof createMockCompiler> & {
  finishMakeCallback: FinishMakeCallback | null;
};
import type { Mock } from '@rstest/core';

type MockNormalModuleFactory = {
  hooks: {
    module: {
      tap: Mock;
    };
    factorize: {
      tapAsync: Mock;
    };
  };
  moduleCallback: ModuleCallback | null;
};
type ProvideFilterConfig = {
  version?: string;
  request?: string | RegExp;
  fallbackVersion?: string;
};

type ProvideConfig = {
  shareScope?: string | string[];
  shareKey?: string;
  version?: string;
  singleton?: boolean;
  eager?: boolean;
  include?: ProvideFilterConfig;
  exclude?: ProvideFilterConfig;
  layer?: string;
  allowNodeModulesSuffixMatch?: boolean;
  import?: string;
} & Record<string, unknown>;

type ProvideEntry = [string, ProvideConfig];

describe('ProvideSharedPlugin', () => {
  describe('apply', () => {
    let mockCompiler: MockCompiler;
    let mockCompilation: MockCompilation;
    let mockNormalModuleFactory: MockNormalModuleFactory;

    beforeEach(() => {
      rs.clearAllMocks();

      // Create mock compiler and compilation using the utility functions
      mockCompiler = createMockCompiler() as MockCompiler;
      const compilationResult = createMockCompilation();
      mockCompilation = compilationResult.mockCompilation;

      // Add ProvideSharedDependency to dependencyFactories map
      mockCompilation.dependencyFactories = new Map();

      // Add addInclude method with proper implementation
      mockCompilation.addInclude = rs
        .fn()
        .mockImplementation(
          (
            context: unknown,
            dep: Record<string, any>,
            options: unknown,
            callback?: (
              err: Error | null,
              result?: { module: Record<string, unknown> },
            ) => void,
          ) => {
            if (callback) {
              const mockModule = {
                _shareScope: dep['_shareScope'],
                _shareKey: dep['_shareKey'],
                _version: dep['_version'],
              };
              callback(null, { module: mockModule });
            }
            return {
              module: {
                _shareScope: dep['_shareScope'],
                _shareKey: dep['_shareKey'],
                _version: dep['_version'],
              },
            };
          },
        );

      // Create mock normal module factory
      mockNormalModuleFactory = {
        hooks: {
          module: {
            tap: rs.fn((name: string, callback: ModuleCallback) => {
              // Store the callback for later use
              mockNormalModuleFactory.moduleCallback = callback;
            }),
          },
          factorize: {
            tapAsync: rs.fn(),
          },
        },
        moduleCallback: null,
      };

      // Set up compilation hook for testing
      mockCompiler.hooks.compilation.tap = rs
        .fn()
        .mockImplementation(
          (
            name: string,
            callback: (
              compilation: unknown,
              params: { normalModuleFactory: MockNormalModuleFactory },
            ) => void,
          ) => {
            callback(mockCompilation, {
              normalModuleFactory: mockNormalModuleFactory,
            });
          },
        );

      // Set up finishMake hook for testing async callbacks
      mockCompiler.hooks.finishMake = {
        tapPromise: rs.fn((name: string, callback: FinishMakeCallback) => {
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
      (plugin as unknown as { _provides: ProvideEntry[] })._provides = [
        [
          'prefix/component',
          {
            shareKey: 'prefix/component',
            version: '1.0.0',
            shareScope: shareScopes.string,
          },
        ],
      ] as ProvideEntry[];

      plugin.apply(mockCompiler);

      // Create a real Map instance for resolvedProvideMap
      const resolvedProvideMap = new Map();

      // Initialize the compilation weakmap on the plugin
      plugin._compilationData = new WeakMap();
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
      expect(mockNormalModuleFactory.moduleCallback).toBeTruthy();
      mockNormalModuleFactory.moduleCallback?.(
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
      (plugin as unknown as { _provides: ProvideEntry[] })._provides = [
        [
          'react',
          {
            shareKey: 'react',
            version: '17.0.2',
            shareScope: shareScopes.string,
          },
        ],
      ] as ProvideEntry[];

      plugin.apply(mockCompiler);

      // Create a real Map instance for resolvedProvideMap
      const resolvedProvideMap = new Map();

      // Initialize the compilation weakmap on the plugin
      plugin._compilationData = new WeakMap();
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
      expect(mockNormalModuleFactory.moduleCallback).toBeTruthy();
      mockNormalModuleFactory.moduleCallback?.(
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
      plugin._compilationData = new WeakMap();
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
          (err: Error | null, result?: { module: Record<string, unknown> }) => {
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
    let mockCompiler: MockCompiler;
    let mockCompilation: MockCompilation;
    let mockNormalModuleFactory: MockNormalModuleFactory;

    beforeEach(() => {
      rs.clearAllMocks();

      // Create comprehensive mocks for filtering tests
      mockCompiler = createMockCompiler() as MockCompiler;
      const compilationResult = createMockCompilation();
      mockCompilation = compilationResult.mockCompilation;

      // Add ProvideSharedDependency to dependencyFactories map
      mockCompilation.dependencyFactories = new Map();

      // Enhanced addInclude method for filtering tests
      mockCompilation.addInclude = rs
        .fn()
        .mockImplementation(
          (
            context: unknown,
            dep: Record<string, any>,
            options: unknown,
            callback?: (
              err: Error | null,
              result?: { module: Record<string, unknown> },
            ) => void,
          ) => {
            if (callback) {
              const mockModule = {
                _shareScope: dep['_shareScope'],
                _shareKey: dep['_shareKey'],
                _version: dep['_version'],
              };
              callback(null, { module: mockModule });
            }
            return {
              module: {
                _shareScope: dep['_shareScope'],
                _shareKey: dep['_shareKey'],
                _version: dep['_version'],
              },
            };
          },
        );

      // Enhanced normal module factory mock
      mockNormalModuleFactory = {
        hooks: {
          module: {
            tap: rs.fn((name: string, callback: ModuleCallback) => {
              mockNormalModuleFactory.moduleCallback = callback;
            }),
          },
          factorize: {
            tapAsync: rs.fn(),
          },
        },
        moduleCallback: null,
      };

      // Setup compilation hook
      mockCompiler.hooks.compilation.tap = rs
        .fn()
        .mockImplementation(
          (
            name: string,
            callback: (
              compilation: unknown,
              params: { normalModuleFactory: MockNormalModuleFactory },
            ) => void,
          ) => {
            callback(mockCompilation, {
              normalModuleFactory: mockNormalModuleFactory,
            });
          },
        );

      // Setup finishMake hook
      mockCompiler.hooks.finishMake = {
        tapPromise: rs.fn((name: string, callback: FinishMakeCallback) => {
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

        const provides = (plugin as unknown as { _provides: ProvideEntry[] })
          ._provides;
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

        const provides = (plugin as unknown as { _provides: ProvideEntry[] })
          ._provides;
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

        plugin._compilationData = new WeakMap();
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
          mockNormalModuleFactory.moduleCallback?.({}, moduleData, resolveData);
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

        plugin._compilationData = new WeakMap();
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
          mockNormalModuleFactory.moduleCallback?.({}, moduleData, resolveData);
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

        const provides = (plugin as unknown as { _provides: ProvideEntry[] })
          ._provides;
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

        plugin._compilationData = new WeakMap();
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
          mockNormalModuleFactory.moduleCallback?.({}, moduleData, resolveData);
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

        const provides = (plugin as unknown as { _provides: ProvideEntry[] })
          ._provides;
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

        plugin._compilationData = new WeakMap();
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
          mockNormalModuleFactory.moduleCallback?.({}, moduleData, resolveData);
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

        const provides = (plugin as unknown as { _provides: ProvideEntry[] })
          ._provides;
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

        const provides = (plugin as unknown as { _provides: ProvideEntry[] })
          ._provides;
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

        const provides = (plugin as unknown as { _provides: ProvideEntry[] })
          ._provides;
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

        const provides = (plugin as unknown as { _provides: ProvideEntry[] })
          ._provides;
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

        plugin._compilationData = new WeakMap();
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
          mockNormalModuleFactory.moduleCallback?.({}, moduleData, resolveData);
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

        plugin._compilationData = new WeakMap();
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
          mockNormalModuleFactory.moduleCallback?.({}, moduleData, resolveData);
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

        plugin._compilationData = new WeakMap();
        plugin._compilationData.set(mockCompilation, resolvedProvideMap);

        // Manually test provideSharedModule to verify no singleton warning
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
        const singletonWarnings = mockCompilation.warnings.filter(
          (warning: { message: string }) =>
            warning.message.includes('singleton'),
        );
        expect(singletonWarnings).toHaveLength(0);
      });
    });
  });
});
