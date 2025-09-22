/*
 * @jest-environment node
 */

import SharePlugin from '../../../src/lib/sharing/SharePlugin';

// Mock FederationRuntimePlugin to avoid complex dependencies
jest.mock('../../../src/lib/container/runtime/FederationRuntimePlugin', () => {
  return jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
});

// Create a simple webpack compiler mock for testing real behavior
const createRealWebpackCompiler = () => {
  const { SyncHook, AsyncSeriesHook } = require('tapable');

  return {
    hooks: {
      thisCompilation: new SyncHook(['compilation', 'params']),
      compilation: new SyncHook(['compilation', 'params']),
      finishMake: new AsyncSeriesHook(['compilation']),
      make: new AsyncSeriesHook(['compilation']),
      environment: new SyncHook([]),
      afterEnvironment: new SyncHook([]),
      afterPlugins: new SyncHook(['compiler']),
      afterResolvers: new SyncHook(['compiler']),
    },
    context: '/test-project',
    options: {
      context: '/test-project',
      output: {
        path: '/test-project/dist',
        uniqueName: 'test-app',
      },
      plugins: [],
      resolve: {
        alias: {},
      },
    },
    webpack: {
      javascript: {
        JavascriptModulesPlugin: {
          getCompilationHooks: jest.fn(() => ({
            renderChunk: new SyncHook(['source', 'renderContext']),
            render: new SyncHook(['source', 'renderContext']),
            chunkHash: new SyncHook(['chunk', 'hash', 'context']),
            renderStartup: new SyncHook(['source', 'module', 'renderContext']),
          })),
        },
      },
    },
  };
};

const createMockCompilation = () => {
  const { SyncHook, HookMap } = require('tapable');
  const runtimeRequirementInTreeHookMap = new HookMap(
    () => new SyncHook(['chunk', 'set', 'context']),
  );

  return {
    context: '/test-project',
    compiler: {
      context: '/test-project',
    },
    dependencyFactories: new Map(),
    hooks: {
      additionalTreeRuntimeRequirements: { tap: jest.fn() },
      runtimeRequirementInTree: runtimeRequirementInTreeHookMap,
      finishModules: { tap: jest.fn(), tapAsync: jest.fn() },
      seal: { tap: jest.fn() },
    },
    addRuntimeModule: jest.fn(),
    contextDependencies: { addAll: jest.fn() },
    fileDependencies: { addAll: jest.fn() },
    missingDependencies: { addAll: jest.fn() },
    warnings: [],
    errors: [],
    addInclude: jest.fn(),
    resolverFactory: {
      get: jest.fn(() => ({
        resolve: jest.fn((context, path, request, resolveContext, callback) => {
          callback(null, path);
        }),
      })),
    },
  };
};

const createMockNormalModuleFactory = () => ({
  hooks: {
    module: { tap: jest.fn() },
    factorize: { tapPromise: jest.fn() },
    createModule: { tapPromise: jest.fn() },
    afterResolve: { tapPromise: jest.fn() },
  },
});

describe('SharePlugin Real Behavior', () => {
  describe('plugin integration', () => {
    it('should integrate with webpack compiler for shared modules', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
          lodash: {
            requiredVersion: '^4.17.21',
            singleton: true,
            eager: false,
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Verify hooks are registered for both consuming and providing
      expect(compiler.hooks.thisCompilation.taps.length).toBeGreaterThan(0);
      expect(compiler.hooks.compilation.taps.length).toBeGreaterThan(0);
      expect(compiler.hooks.finishMake.taps.length).toBeGreaterThan(0);
    });

    it('should handle array shareScope configuration', () => {
      const plugin = new SharePlugin({
        shareScope: ['default', 'custom'],
        shared: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Should register hooks successfully
      expect(compiler.hooks.thisCompilation.taps.length).toBeGreaterThan(0);
    });

    it('should handle separate consumes and provides configurations', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
          'external-lib': {
            requiredVersion: '^1.0.0',
            singleton: true,
          },
          'my-utils': {
            version: '1.0.0',
            shareKey: 'utils',
            import: 'my-utils',
          },
          'my-components': {
            version: '2.1.0',
            import: 'my-components',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Should register hooks for both consuming and providing
      expect(compiler.hooks.thisCompilation.taps.length).toBeGreaterThan(0);
      expect(compiler.hooks.compilation.taps.length).toBeGreaterThan(0);
    });
  });

  describe('webpack compilation integration', () => {
    it('should execute compilation hooks without errors', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
          lodash: '^4.17.21',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createMockCompilation();
      const normalModuleFactory = createMockNormalModuleFactory();

      // Test thisCompilation hook execution
      compiler.hooks.thisCompilation.taps.forEach((tap) => {
        expect(() => {
          tap.fn(compilation, { normalModuleFactory });
        }).not.toThrow();
      });

      // Test compilation hook execution
      compiler.hooks.compilation.taps.forEach((tap) => {
        expect(() => {
          tap.fn(compilation, { normalModuleFactory });
        }).not.toThrow();
      });
    });

    it('should handle finishMake hook execution', async () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createMockCompilation();

      // Test finishMake hook execution
      for (const tap of compiler.hooks.finishMake.taps) {
        await expect(tap.fn(compilation)).resolves.not.toThrow();
      }
    });
  });

  describe('configuration handling', () => {
    it('should handle consumes-only configuration', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
          lodash: {
            requiredVersion: '^4.17.21',
            singleton: true,
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Should register consume-related hooks
      expect(compiler.hooks.thisCompilation.taps.length).toBeGreaterThan(0);
    });

    it('should handle provides-only configuration', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          'my-utils': {
            version: '1.0.0',
            import: 'my-utils',
          },
          'my-components': {
            version: '2.0.0',
            shareKey: 'components',
            import: 'my-components',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Should register provide-related hooks
      expect(compiler.hooks.compilation.taps.length).toBeGreaterThan(0);
    });

    it('should handle complex shared module configurations', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: {
            requiredVersion: '^17.0.0',
            version: '17.0.2',
            singleton: true,
            eager: false,
            shareKey: 'react',
            shareScope: 'framework',
          },
          lodash: '^4.17.21',
          '@types/react': {
            version: '^17.0.0',
            singleton: false,
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Should handle complex configurations without errors
      expect(compiler.hooks.thisCompilation.taps.length).toBeGreaterThan(0);
      expect(compiler.hooks.compilation.taps.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty shared configuration', () => {
      expect(() => {
        new SharePlugin({
          shareScope: 'default',
          shared: {},
        });
      }).not.toThrow();
    });

    it('should handle missing shareScope with default fallback', () => {
      const plugin = new SharePlugin({
        shared: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
    });

    it('should validate and apply comprehensive configuration', () => {
      // Test a comprehensive configuration that would be used in a real project
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          lodash: '^4.17.21',
          'external-utils': {
            shareScope: 'utils',
            requiredVersion: '^1.0.0',
          },
          'internal-components': {
            version: '2.0.0',
            shareKey: 'components',
            import: 'internal-components',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Verify comprehensive configuration is handled properly
      expect(compiler.hooks.thisCompilation.taps.length).toBeGreaterThan(0);
      expect(compiler.hooks.compilation.taps.length).toBeGreaterThan(0);
      expect(compiler.hooks.finishMake.taps.length).toBeGreaterThan(0);
    });
  });

  describe('real-world usage scenarios', () => {
    it('should support micro-frontend sharing patterns', () => {
      const plugin = new SharePlugin({
        shareScope: 'mf',
        shared: {
          // Core libraries - singleton to avoid conflicts
          react: {
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          // Utilities - allow multiple versions
          lodash: {
            singleton: false,
            requiredVersion: '^4.17.0',
          },
          // Provide internal components to other micro-frontends
          'design-system': {
            version: '1.5.0',
            shareKey: 'ds',
            import: 'design-system',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      const compilation = createMockCompilation();
      const normalModuleFactory = createMockNormalModuleFactory();

      // Test that the micro-frontend pattern works without errors
      compiler.hooks.thisCompilation.taps.forEach((tap) => {
        expect(() => {
          tap.fn(compilation, { normalModuleFactory });
        }).not.toThrow();
      });
    });

    it('should support development vs production sharing strategies', () => {
      const isProduction = false; // Simulate development mode

      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^17.0.0',
            // In development, be more lenient with versions
            strictVersion: !isProduction,
          },
          'dev-tools': {
            // Only share dev tools in development
            ...(isProduction
              ? {}
              : {
                  version: '1.0.0',
                }),
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
    });
  });
});
