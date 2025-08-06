/*
 * @jest-environment node
 */

import ProvideSharedPlugin from '../../../src/lib/sharing/ProvideSharedPlugin';
import { vol } from 'memfs';
import { SyncHook, AsyncSeriesHook } from 'tapable';

// Mock file system only for controlled testing
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

// Mock webpack internals minimally
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  getWebpackPath: jest.fn((p) => p),
  normalizeWebpackPath: jest.fn((p) => p),
}));

describe('ProvideSharedPlugin - Improved Quality Tests', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  describe('Real webpack integration', () => {
    it('should apply plugin and handle module provision correctly', () => {
      // Setup realistic file system
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({
          name: 'provider-app',
          version: '1.0.0',
          dependencies: {
            react: '^17.0.2',
            lodash: '^4.17.21',
          },
        }),
        '/test-project/node_modules/react/package.json': JSON.stringify({
          name: 'react',
          version: '17.0.2',
        }),
        '/test-project/node_modules/lodash/package.json': JSON.stringify({
          name: 'lodash',
          version: '4.17.21',
        }),
        '/test-project/src/custom-lib.js': 'export default "custom library";',
      });

      const plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {
          react: '^17.0.0',
          lodash: { version: '^4.17.0', singleton: true },
          './src/custom-lib': { shareKey: 'custom-lib' }, // Relative path
          '/test-project/src/custom-lib.js': { shareKey: 'absolute-lib' }, // Absolute path
        },
      });

      // Create realistic compiler and compilation
      const compilationHook = new SyncHook(['compilation', 'params']);
      const finishMakeHook = new AsyncSeriesHook(['compilation']);

      const compiler = {
        hooks: {
          compilation: compilationHook,
          finishMake: finishMakeHook,
          make: new AsyncSeriesHook(['compilation']),
          thisCompilation: new SyncHook(['compilation', 'params']),
          environment: new SyncHook([]),
          afterEnvironment: new SyncHook([]),
          afterPlugins: new SyncHook(['compiler']),
          afterResolvers: new SyncHook(['compiler']),
        },
        context: '/test-project',
        options: {
          plugins: [],
          resolve: {
            alias: {},
          },
        },
      };

      let compilationCallback: Function | null = null;
      let finishMakeCallback: Function | null = null;

      const originalCompilationTap = compilationHook.tap;
      compilationHook.tap = jest.fn((name, callback) => {
        if (name === 'ProvideSharedPlugin') {
          compilationCallback = callback;
        }
        return originalCompilationTap.call(compilationHook, name, callback);
      });

      const originalFinishMakeTap = finishMakeHook.tapPromise;
      finishMakeHook.tapPromise = jest.fn((name, callback) => {
        if (name === 'ProvideSharedPlugin') {
          finishMakeCallback = callback;
        }
        return originalFinishMakeTap.call(finishMakeHook, name, callback);
      });

      // Apply plugin
      plugin.apply(compiler as any);

      expect(compilationHook.tap).toHaveBeenCalledWith(
        'ProvideSharedPlugin',
        expect.any(Function),
      );
      expect(finishMakeHook.tapPromise).toHaveBeenCalledWith(
        'ProvideSharedPlugin',
        expect.any(Function),
      );

      // Test compilation hook execution
      expect(compilationCallback).not.toBeNull();
      if (compilationCallback) {
        const moduleHook = new SyncHook(['module', 'data', 'resolveData']);
        const mockNormalModuleFactory = {
          hooks: { module: moduleHook },
        };

        const mockCompilation = {
          dependencyFactories: new Map(),
        };

        expect(() => {
          compilationCallback(mockCompilation, {
            normalModuleFactory: mockNormalModuleFactory,
          });
        }).not.toThrow();

        expect(mockCompilation.dependencyFactories.size).toBeGreaterThan(0);
      }
    });

    it('should handle real module matching scenarios', () => {
      vol.fromJSON({
        '/test-project/src/components/Button.js':
          'export const Button = () => {};',
        '/test-project/src/utils/helpers.js': 'export const helper = () => {};',
        '/test-project/node_modules/lodash/index.js':
          'module.exports = require("./lodash");',
      });

      const plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {
          './src/components/': { shareKey: 'components' }, // Prefix match
          'lodash/': { shareKey: 'lodash' }, // Module prefix match
          './src/utils/helpers': { shareKey: 'helpers' }, // Direct match
        },
      });

      const compiler = {
        hooks: {
          compilation: new SyncHook(['compilation', 'params']),
          finishMake: new AsyncSeriesHook(['compilation']),
          make: new AsyncSeriesHook(['compilation']),
          thisCompilation: new SyncHook(['compilation', 'params']),
          environment: new SyncHook([]),
          afterEnvironment: new SyncHook([]),
          afterPlugins: new SyncHook(['compiler']),
          afterResolvers: new SyncHook(['compiler']),
        },
        context: '/test-project',
        options: {
          plugins: [],
          resolve: {
            alias: {},
          },
        },
      };

      // Track compilation callback
      let compilationCallback: Function | null = null;
      const originalTap = compiler.hooks.compilation.tap;
      compiler.hooks.compilation.tap = jest.fn((name, callback) => {
        if (name === 'ProvideSharedPlugin') {
          compilationCallback = callback;
        }
        return originalTap.call(compiler.hooks.compilation, name, callback);
      });

      plugin.apply(compiler as any);

      // Test module hook behavior
      if (compilationCallback) {
        const moduleHook = new SyncHook(['module', 'data', 'resolveData']);
        let moduleCallback: Function | null = null;

        const originalModuleTap = moduleHook.tap;
        moduleHook.tap = jest.fn((name, callback) => {
          if (name === 'ProvideSharedPlugin') {
            moduleCallback = callback;
          }
          return originalModuleTap.call(moduleHook, name, callback);
        });

        const mockNormalModuleFactory = {
          hooks: { module: moduleHook },
        };

        const mockCompilation = {
          dependencyFactories: new Map(),
        };

        compilationCallback(mockCompilation, {
          normalModuleFactory: mockNormalModuleFactory,
        });

        // Test different module matching scenarios
        if (moduleCallback) {
          const testModule = (
            request: string,
            resource: string,
            expectMatched: boolean,
          ) => {
            const mockModule = { layer: undefined };
            const mockData = { resource };
            const mockResolveData = { request };

            const result = moduleCallback(
              mockModule,
              mockData,
              mockResolveData,
            );

            if (expectMatched) {
              // Should modify the module or take some action
              expect(result).toBeDefined();
            }
          };

          // Test prefix matching
          testModule(
            './src/components/Button',
            '/test-project/src/components/Button.js',
            true,
          );

          // Test direct matching
          testModule(
            './src/utils/helpers',
            '/test-project/src/utils/helpers.js',
            true,
          );

          // Test non-matching
          testModule(
            './src/other/file',
            '/test-project/src/other/file.js',
            false,
          );
        }
      }
    });

    it('should handle version filtering correctly', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({
          name: 'provider-app',
          dependencies: {
            'old-lib': '^1.0.0',
            'new-lib': '^2.0.0',
          },
        }),
        '/test-project/node_modules/old-lib/package.json': JSON.stringify({
          name: 'old-lib',
          version: '1.5.0',
        }),
        '/test-project/node_modules/new-lib/package.json': JSON.stringify({
          name: 'new-lib',
          version: '2.1.0',
        }),
      });

      const plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {
          'old-lib': {
            version: '^1.0.0',
            include: { version: '^1.0.0' }, // Should include
          },
          'new-lib': {
            version: '^2.0.0',
            exclude: { version: '^1.0.0' }, // Should not exclude (version is 2.x)
          },
          'filtered-lib': {
            version: '^1.0.0',
            exclude: { version: '^1.0.0' }, // Should exclude (version matches exclude)
          },
        },
      });

      const compiler = {
        hooks: {
          compilation: new SyncHook(['compilation', 'params']),
          finishMake: new AsyncSeriesHook(['compilation']),
          make: new AsyncSeriesHook(['compilation']),
          thisCompilation: new SyncHook(['compilation', 'params']),
          environment: new SyncHook([]),
          afterEnvironment: new SyncHook([]),
          afterPlugins: new SyncHook(['compiler']),
          afterResolvers: new SyncHook(['compiler']),
        },
        context: '/test-project',
        options: {
          plugins: [],
          resolve: {
            alias: {},
          },
        },
      };

      let finishMakeCallback: Function | null = null;
      const originalTap = compiler.hooks.finishMake.tapPromise;
      compiler.hooks.finishMake.tapPromise = jest.fn((name, callback) => {
        if (name === 'ProvideSharedPlugin') {
          finishMakeCallback = callback;
        }
        return originalTap.call(compiler.hooks.finishMake, name, callback);
      });

      plugin.apply(compiler as any);

      // Test finishMake hook with version filtering
      if (finishMakeCallback) {
        const mockCompilation = {
          addInclude: jest.fn((context, dependency, options, callback) => {
            callback(); // Success callback
          }),
          warnings: [],
          errors: [],
        };

        await finishMakeCallback(mockCompilation);

        // Should have added includes for libraries that pass filters
        expect(mockCompilation.addInclude).toHaveBeenCalled();

        // Check that filtering worked correctly
        const addIncludeCalls = mockCompilation.addInclude.mock.calls;
        const includedModules = addIncludeCalls.map((call) => call[1].shareKey);

        expect(includedModules).toContain('old-lib');
        expect(includedModules).toContain('new-lib');
        expect(includedModules).not.toContain('filtered-lib');
      }
    });
  });

  describe('Configuration parsing behavior', () => {
    it('should parse different provide configuration formats correctly', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {
          // String format (package name with version)
          react: '^17.0.0',

          // Object format with full configuration
          lodash: {
            version: '^4.17.0',
            singleton: true,
            eager: true,
            shareKey: 'lodash-utils',
          },

          // Relative path
          './src/components/Button': {
            shareKey: 'button-component',
            version: '1.0.0',
          },

          // Absolute path
          '/project/src/lib': {
            shareKey: 'project-lib',
          },

          // Prefix pattern
          'utils/': {
            shareKey: 'utilities',
          },

          // With filtering
          'filtered-lib': {
            version: '^2.0.0',
            include: { version: '^2.0.0' },
            exclude: { request: /test/ },
          },
        },
      });

      const provides = (plugin as any)._provides;
      expect(provides).toHaveLength(6);

      // Verify string format parsing
      const reactConfig = provides.find(
        ([key]: [string, any]) => key === 'react',
      );
      expect(reactConfig).toBeDefined();
      expect(reactConfig[1].version).toBe('^17.0.0');
      expect(reactConfig[1].shareKey).toBe('react');

      // Verify object format parsing
      const lodashConfig = provides.find(
        ([key]: [string, any]) => key === 'lodash',
      );
      expect(lodashConfig).toBeDefined();
      expect(lodashConfig[1].singleton).toBe(true);
      expect(lodashConfig[1].eager).toBe(true);
      expect(lodashConfig[1].shareKey).toBe('lodash-utils');

      // Verify relative path
      const buttonConfig = provides.find(
        ([key]: [string, any]) => key === './src/components/Button',
      );
      expect(buttonConfig).toBeDefined();
      expect(buttonConfig[1].shareKey).toBe('button-component');

      // Verify filtering configuration
      const filteredConfig = provides.find(
        ([key]: [string, any]) => key === 'filtered-lib',
      );
      expect(filteredConfig).toBeDefined();
      expect(filteredConfig[1].include?.version).toBe('^2.0.0');
      expect(filteredConfig[1].exclude?.request).toBeInstanceOf(RegExp);
    });

    it('should handle edge cases in configuration', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {
          'empty-config': {}, // Minimal configuration
          'false-version': { version: false }, // Explicit false version
          'no-share-key': { version: '1.0.0' }, // Should use key as shareKey
        },
      });

      const provides = (plugin as any)._provides;

      const emptyConfig = provides.find(
        ([key]: [string, any]) => key === 'empty-config',
      );
      expect(emptyConfig[1].shareKey).toBe('empty-config');
      expect(emptyConfig[1].version).toBeUndefined();

      const falseVersionConfig = provides.find(
        ([key]: [string, any]) => key === 'false-version',
      );
      expect(falseVersionConfig[1].version).toBe(false);

      const noShareKeyConfig = provides.find(
        ([key]: [string, any]) => key === 'no-share-key',
      );
      expect(noShareKeyConfig[1].shareKey).toBe('no-share-key');
    });
  });

  describe('shouldProvideSharedModule behavior', () => {
    it('should correctly filter modules based on version constraints', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {
          'include-test': {
            version: '2.0.0',
            include: { version: '^2.0.0' },
          },
          'exclude-test': {
            version: '1.0.0',
            exclude: { version: '^1.0.0' },
          },
          'no-version': {}, // No version specified
        },
      });

      const provides = (plugin as any)._provides;

      // Test include filter - should pass
      const includeConfig = provides.find(
        ([key]: [string, any]) => key === 'include-test',
      )[1];
      const shouldInclude = (plugin as any).shouldProvideSharedModule(
        includeConfig,
      );
      expect(shouldInclude).toBe(true);

      // Test exclude filter - should not pass
      const excludeConfig = provides.find(
        ([key]: [string, any]) => key === 'exclude-test',
      )[1];
      const shouldExclude = (plugin as any).shouldProvideSharedModule(
        excludeConfig,
      );
      expect(shouldExclude).toBe(false);

      // Test no version - should pass (deferred to runtime)
      const noVersionConfig = provides.find(
        ([key]: [string, any]) => key === 'no-version',
      )[1];
      const shouldProvideNoVersion = (plugin as any).shouldProvideSharedModule(
        noVersionConfig,
      );
      expect(shouldProvideNoVersion).toBe(true);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle missing package.json gracefully', () => {
      vol.fromJSON({
        '/test-project/src/lib.js': 'export default "lib";',
        // No package.json files
      });

      const plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {
          './src/lib': { shareKey: 'lib' },
        },
      });

      const compiler = {
        hooks: {
          compilation: new SyncHook(['compilation', 'params']),
          finishMake: new AsyncSeriesHook(['compilation']),
          make: new AsyncSeriesHook(['compilation']),
          thisCompilation: new SyncHook(['compilation', 'params']),
          environment: new SyncHook([]),
          afterEnvironment: new SyncHook([]),
          afterPlugins: new SyncHook(['compiler']),
          afterResolvers: new SyncHook(['compiler']),
        },
        context: '/test-project',
        options: {
          plugins: [],
          resolve: {
            alias: {},
          },
        },
      };

      // Should not throw when applied
      expect(() => {
        plugin.apply(compiler as any);
      }).not.toThrow();
    });

    it('should handle invalid provide configurations', () => {
      expect(() => {
        new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            // @ts-ignore - intentionally testing invalid config
            invalid: ['array', 'not', 'supported'],
          },
        });
      }).toThrow('Unexpected array of provides');
    });
  });
});
