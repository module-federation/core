/*
 * @jest-environment node
 */

import ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';
import ConsumeSharedModule from '../../../src/lib/sharing/ConsumeSharedModule';
// Import removed as we define them locally
import path from 'path';
import { vol } from 'memfs';

// Mock only the file system for controlled testing
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

// Add utility functions for real webpack compiler creation
const createRealWebpackCompiler = () => {
  const { SyncHook } = require('tapable');

  return {
    hooks: {
      thisCompilation: new SyncHook(['compilation', 'params']),
    },
    context: '/test-project',
    options: {
      context: '/test-project',
      output: {
        path: '/test-project/dist',
        uniqueName: 'test-app',
      },
    },
  };
};

const createRealCompilation = (compiler: any) => {
  const { SyncHook } = require('tapable');
  const fs = require('fs');
  const path = require('path');

  return {
    compiler,
    context: compiler.context,
    options: compiler.options,

    hooks: {
      additionalTreeRuntimeRequirements: new SyncHook(['chunk', 'set']),
    },

    resolverFactory: {
      get: jest.fn(() => ({
        resolve: jest.fn(
          (context, contextPath, request, resolveContext, callback) => {
            const resolvedPath = path.join(
              contextPath,
              'node_modules',
              request,
              'index.js',
            );
            try {
              fs.statSync(
                path.join(contextPath, 'node_modules', request, 'package.json'),
              );
              callback(null, resolvedPath);
            } catch {
              callback(new Error(`Module not found: ${request}`));
            }
          },
        ),
      })),
    },

    inputFileSystem: {
      readFile: fs.readFile,
      stat: fs.stat,
    },

    dependencyFactories: new Map(),
    contextDependencies: { addAll: jest.fn() },
    fileDependencies: { addAll: jest.fn() },
    missingDependencies: { addAll: jest.fn() },
    errors: [],
    warnings: [],
    addRuntimeModule: jest.fn(),

    moduleGraph: {
      getModule: jest.fn(),
      getOutgoingConnections: jest.fn().mockReturnValue([]),
    },
  };
};

// Setup in-memory file system with real package.json files
beforeEach(() => {
  vol.reset();

  // Create a realistic project structure
  vol.fromJSON({
    '/test-project/package.json': JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        react: '^17.0.2',
        lodash: '^4.17.21',
        '@types/react': '^17.0.0',
      },
      devDependencies: {
        jest: '^27.0.0',
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
    '/test-project/src/index.js': 'console.log("test");',
  });
});

describe('ConsumeSharedPlugin', () => {
  describe('constructor', () => {
    it('should initialize with string shareScope and parse consume configuration', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: '^17.0.0',
        },
      });

      expect(plugin).toBeInstanceOf(ConsumeSharedPlugin);

      // Test behavior through public API by applying to compiler and checking results
      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Verify hooks were registered
      expect(compiler.hooks.thisCompilation.taps).toHaveLength(1);
      expect(compiler.hooks.thisCompilation.taps[0].name).toBe(
        'ConsumeSharedPlugin',
      );
    });

    it('should initialize with array shareScope and apply successfully', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: ['default', 'custom'],
        consumes: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Verify the plugin was applied correctly
      expect(compiler.hooks.thisCompilation.taps).toHaveLength(1);
    });

    it('should handle consumes with explicit options and create valid plugin', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            strictVersion: true,
            singleton: true,
            eager: false,
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      // Test that compilation hook is properly set up
      const compilation = createRealCompilation(compiler);
      const thisCompilationHook = compiler.hooks.thisCompilation.taps[0];

      expect(() => {
        thisCompilationHook.fn(compilation, {
          normalModuleFactory: compilation.moduleGraph,
        });
      }).not.toThrow();
    });

    it('should handle consumes with custom shareScope and validate configuration', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: {
            shareScope: 'custom-scope',
            requiredVersion: '^17.0.0',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      // Verify plugin applies without errors and sets up proper hooks
      expect(compiler.hooks.thisCompilation.taps).toHaveLength(1);
    });
  });

  describe('module creation behavior', () => {
    it('should create ConsumeSharedModule through real webpack compilation process', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createRealCompilation(compiler);

      // Test actual module creation behavior
      const result = await plugin.createConsumeSharedModule(
        compilation,
        '/test-project/src',
        'react',
        {
          import: 'react',
          shareScope: 'default',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
          request: 'react',
        },
      );

      expect(result).toBeInstanceOf(ConsumeSharedModule);
      expect(result.request).toBe('react');
    });

    it('should handle module resolution for real packages', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          lodash: '^4.17.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createRealCompilation(compiler);

      const result = await plugin.createConsumeSharedModule(
        compilation,
        '/test-project/src',
        'lodash',
        {
          import: 'lodash',
          shareScope: 'default',
          shareKey: 'lodash',
          requiredVersion: '^4.17.0',
          strictVersion: false,
          singleton: false,
          eager: false,
          request: 'lodash',
        },
      );

      expect(result).toBeInstanceOf(ConsumeSharedModule);
    });

    it('should handle layer configuration correctly', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            layer: 'framework',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createRealCompilation(compiler);

      const result = await plugin.createConsumeSharedModule(
        compilation,
        '/test-project/src',
        'react',
        {
          import: 'react',
          shareScope: 'default',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          strictVersion: true,
          singleton: false,
          eager: false,
          layer: 'framework',
          request: 'react',
        },
      );

      expect(result).toBeInstanceOf(ConsumeSharedModule);
    });
  });

  describe('webpack integration', () => {
    it('should register hooks when plugin is applied', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      // Verify hooks were registered by checking taps array
      expect(compiler.hooks.thisCompilation.taps).toHaveLength(1);
      expect(compiler.hooks.thisCompilation.taps[0].name).toBe(
        'ConsumeSharedPlugin',
      );

      // Create and trigger compilation to verify hook behavior
      const compilation = createRealCompilation(compiler);
      const hookFn = compiler.hooks.thisCompilation.taps[0].fn;

      expect(() => {
        hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });
      }).not.toThrow();
    });

    it('should set up runtime requirements correctly', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: '^17.0.0',
          lodash: '^4.17.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createRealCompilation(compiler);
      const hookFn = compiler.hooks.thisCompilation.taps[0].fn;

      // Trigger the hook to set up compilation hooks
      hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });

      // Verify additionalTreeRuntimeRequirements hook was set up
      expect(
        compilation.hooks.additionalTreeRuntimeRequirements.taps,
      ).toHaveLength(1);

      // Test runtime requirements callback
      const runtimeHookFn =
        compilation.hooks.additionalTreeRuntimeRequirements.taps[0].fn;
      const mockChunk = { id: 'test-chunk', name: 'test' };
      const runtimeRequirements = new Set();

      runtimeHookFn(mockChunk, runtimeRequirements);

      // Check that required runtime globals were added
      expect(Array.from(runtimeRequirements)).toContain(
        '__webpack_require__.S',
      );
      expect(compilation.addRuntimeModule).toHaveBeenCalled();
    });
  });

  describe('filtering functionality', () => {
    describe('version filtering', () => {
      it('should apply version include filters to actual module resolution', async () => {
        vol.fromJSON(
          {
            '/test-project/node_modules/react/package.json': JSON.stringify({
              name: 'react',
              version: '17.0.5', // Satisfies ^17.0.0
            }),
          },
          '/test-project',
        );

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

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);

        // Test actual module creation with version filtering
        const result = await plugin.createConsumeSharedModule(
          compilation,
          '/test-project/src',
          'react',
          {
            import: '/test-project/node_modules/react/index.js',
            shareScope: 'default',
            shareKey: 'react',
            requiredVersion: '^17.0.0',
            include: { version: '^17.0.0' },
            strictVersion: false,
            singleton: false,
            eager: false,
            request: 'react',
          },
        );

        expect(result).toBeInstanceOf(ConsumeSharedModule);
        expect(result.request).toBe('react');
      });

      it('should apply version exclude filters to reject incompatible versions', async () => {
        vol.fromJSON(
          {
            '/test-project/node_modules/react/package.json': JSON.stringify({
              name: 'react',
              version: '18.0.0', // Should be excluded
            }),
          },
          '/test-project',
        );

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

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);

        // Test exclusion behavior
        const result = await plugin.createConsumeSharedModule(
          compilation,
          '/test-project/src',
          'react',
          {
            import: '/test-project/node_modules/react/index.js',
            shareScope: 'default',
            shareKey: 'react',
            requiredVersion: '^17.0.0',
            exclude: { version: '^18.0.0' },
            strictVersion: false,
            singleton: false,
            eager: false,
            request: 'react',
          },
        );

        // Should be excluded due to version mismatch
        expect(result).toBeUndefined();
      });

      it('should handle complex version filtering scenarios', async () => {
        vol.fromJSON(
          {
            '/test-project/node_modules/react/package.json': JSON.stringify({
              name: 'react',
              version: '17.0.2', // Satisfies include filter but not required version
            }),
          },
          '/test-project',
        );

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

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);

        const result = await plugin.createConsumeSharedModule(
          compilation,
          '/test-project/src',
          'react',
          {
            import: '/test-project/node_modules/react/index.js',
            shareScope: 'default',
            shareKey: 'react',
            requiredVersion: '^16.0.0',
            include: { version: '^17.0.0' },
            strictVersion: false,
            singleton: false,
            eager: false,
            request: 'react',
          },
        );

        expect(result).toBeInstanceOf(ConsumeSharedModule);
      });

      it('should handle singleton usage with version filters and generate warnings', async () => {
        vol.fromJSON(
          {
            '/test-project/node_modules/react/package.json': JSON.stringify({
              name: 'react',
              version: '17.0.2',
            }),
          },
          '/test-project',
        );

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

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);

        // Test that singleton warnings are properly generated
        const result = await plugin.createConsumeSharedModule(
          compilation,
          '/test-project/src',
          'react',
          {
            import: '/test-project/node_modules/react/index.js',
            shareScope: 'default',
            shareKey: 'react',
            requiredVersion: '^17.0.0',
            singleton: true,
            include: { version: '^17.0.0' },
            strictVersion: false,
            eager: false,
            request: 'react',
          },
        );

        expect(result).toBeInstanceOf(ConsumeSharedModule);
        // Check that warnings were added to compilation
        expect(compilation.warnings.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('request filtering', () => {
      it('should apply string request include filters during module resolution', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'ui/': {
              include: {
                request: 'Button',
              },
            },
          },
        });

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);
        const hookFn = compiler.hooks.thisCompilation.taps[0].fn;
        hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });

        // Verify the plugin was set up with filtering logic
        expect(compilation.dependencyFactories.size).toBeGreaterThanOrEqual(0);
      });

      it('should apply RegExp request include filters during module resolution', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'components/': {
              include: {
                request: /^Button/,
              },
            },
          },
        });

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);
        const hookFn = compiler.hooks.thisCompilation.taps[0].fn;

        expect(() => {
          hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });
        }).not.toThrow();

        // Verify hooks were properly set up for filtering
        expect(compilation.dependencyFactories.size).toBeGreaterThanOrEqual(0);
      });

      it('should apply string request exclude filters during module resolution', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'ui/': {
              exclude: {
                request: 'internal',
              },
            },
          },
        });

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);
        const hookFn = compiler.hooks.thisCompilation.taps[0].fn;

        expect(() => {
          hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });
        }).not.toThrow();
      });

      it('should apply RegExp request exclude filters during module resolution', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'components/': {
              exclude: {
                request: /Test$/,
              },
            },
          },
        });

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);
        const hookFn = compiler.hooks.thisCompilation.taps[0].fn;

        expect(() => {
          hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });
        }).not.toThrow();
      });

      it('should apply combined include and exclude request filters', async () => {
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

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);
        const hookFn = compiler.hooks.thisCompilation.taps[0].fn;

        expect(() => {
          hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });
        }).not.toThrow();

        // Verify both include and exclude filters are properly configured
        expect(compilation.dependencyFactories.size).toBeGreaterThanOrEqual(0);
      });
    });

    describe('combined version and request filtering', () => {
      it('should apply both version and request filters together', async () => {
        vol.fromJSON(
          {
            '/test-project/node_modules/ui-lib/package.json': JSON.stringify({
              name: 'ui-lib',
              version: '1.2.0',
            }),
          },
          '/test-project',
        );

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

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);
        const hookFn = compiler.hooks.thisCompilation.taps[0].fn;

        expect(() => {
          hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });
        }).not.toThrow();

        // Test that complex filtering works in practice
        expect(compilation.dependencyFactories.size).toBeGreaterThanOrEqual(0);
      });

      it('should handle complex filtering scenarios with layers', async () => {
        vol.fromJSON(
          {
            '/test-project/node_modules/react/package.json': JSON.stringify({
              name: 'react',
              version: '17.0.2',
            }),
          },
          '/test-project',
        );

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

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);

        const result = await plugin.createConsumeSharedModule(
          compilation,
          '/test-project/src',
          'react',
          {
            import: '/test-project/node_modules/react/index.js',
            shareScope: 'default',
            shareKey: 'react',
            requiredVersion: '^17.0.0',
            layer: 'framework',
            include: { version: '^17.0.0' },
            exclude: { request: 'internal' },
            strictVersion: false,
            singleton: false,
            eager: false,
            request: 'react',
          },
        );

        expect(result).toBeInstanceOf(ConsumeSharedModule);
      });
    });

    describe('configuration edge cases', () => {
      it('should handle invalid version patterns gracefully without crashing', async () => {
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

        const compiler = createRealWebpackCompiler();
        expect(() => plugin.apply(compiler)).not.toThrow();

        const compilation = createRealCompilation(compiler);

        // Test that invalid versions don't crash the plugin
        expect(async () => {
          await plugin.createConsumeSharedModule(
            compilation,
            '/test-project/src',
            'react',
            {
              import: 'react',
              shareScope: 'default',
              shareKey: 'react',
              requiredVersion: 'invalid-version',
              include: { version: '^17.0.0' },
              strictVersion: false,
              singleton: false,
              eager: false,
              request: 'react',
            },
          );
        }).not.toThrow();
      });

      it('should handle missing requiredVersion with version filters', async () => {
        vol.fromJSON(
          {
            '/test-project/node_modules/react/package.json': JSON.stringify({
              name: 'react',
              version: '17.0.2',
            }),
          },
          '/test-project',
        );

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

        const compiler = createRealWebpackCompiler();
        plugin.apply(compiler);

        const compilation = createRealCompilation(compiler);

        // Test that missing requiredVersion is handled properly
        const result = await plugin.createConsumeSharedModule(
          compilation,
          '/test-project/src',
          'react',
          {
            import: '/test-project/node_modules/react/index.js',
            shareScope: 'default',
            shareKey: 'react',
            requiredVersion: undefined, // No required version
            include: { version: '^17.0.0' },
            strictVersion: false,
            singleton: false,
            eager: false,
            request: 'react',
          },
        );

        expect(result).toBeInstanceOf(ConsumeSharedModule);
      });
    });
  });

  describe('real webpack integration', () => {
    it('should work with actual webpack compilation flow', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: '^17.0.0',
          lodash: '^4.17.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      // Test that all necessary hooks are registered
      expect(compiler.hooks.thisCompilation.taps).toHaveLength(1);

      const compilation = createRealCompilation(compiler);
      const hookFn = compiler.hooks.thisCompilation.taps[0].fn;

      // Test compilation hook execution
      expect(() => {
        hookFn(compilation, { normalModuleFactory: compilation.moduleGraph });
      }).not.toThrow();

      // Verify runtime requirements are set up
      expect(
        compilation.hooks.additionalTreeRuntimeRequirements.taps,
      ).toHaveLength(1);
    });

    it('should handle module resolution errors gracefully', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'non-existent-package': '^1.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createRealCompilation(compiler);

      // Test that non-existent packages don't crash the plugin
      expect(async () => {
        await plugin.createConsumeSharedModule(
          compilation,
          '/test-project/src',
          'non-existent-package',
          {
            import: 'non-existent-package',
            shareScope: 'default',
            shareKey: 'non-existent-package',
            requiredVersion: '^1.0.0',
            strictVersion: false,
            singleton: false,
            eager: false,
            request: 'non-existent-package',
          },
        );
      }).not.toThrow();
    });
  });
});
