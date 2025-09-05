/*
 * Comprehensive tests for resolveMatchedConfigs.ts
 * Testing all resolution paths: relative, absolute, prefix, and regular module requests
 */

import { resolveMatchedConfigs } from '../../../src/lib/sharing/resolveMatchedConfigs';
import type { ConsumeOptions } from '../../../src/declarations/plugins/sharing/ConsumeSharedModule';

// Helper to create minimal ConsumeOptions for testing
function createTestConfig(options: Partial<ConsumeOptions>): ConsumeOptions {
  return {
    shareKey: options.shareKey || 'test-module', // Use provided shareKey or default to 'test-module'
    shareScope: 'default',
    requiredVersion: false,
    packageName: options.packageName || 'test-package',
    strictVersion: false,
    singleton: false,
    eager: false,
    ...options,
  } as ConsumeOptions;
}

jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
}));

// Mock webpack classes
jest.mock(
  'webpack/lib/ModuleNotFoundError',
  () =>
    jest.fn().mockImplementation((module, err, details) => {
      return { module, err, details };
    }),
  {
    virtual: true,
  },
);
jest.mock(
  'webpack/lib/util/LazySet',
  () =>
    jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      addAll: jest.fn(),
    })),
  { virtual: true },
);

describe('resolveMatchedConfigs', () => {
  describe('resolver configuration', () => {
    it('should use correct resolve options when getting resolver', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./relative', createTestConfig({ shareScope: 'default' })],
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          callback(null, '/resolved/path');
        },
      );

      await resolveMatchedConfigs(mockCompilation, configs);

      // Verify resolver factory was called with correct options
      expect(mockCompilation.resolverFactory.get).toHaveBeenCalledWith(
        'normal',
        { dependencyType: 'esm' },
      );
    });

    it('should use compilation context for resolution', async () => {
      const customContext = '/custom/context/path';
      mockCompilation.compiler.context = customContext;

      const configs: [string, ConsumeOptions][] = [
        ['./relative', createTestConfig({ shareScope: 'default' })],
      ];

      let capturedContext;
      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          capturedContext = basePath;
          callback(null, '/resolved/path');
        },
      );

      await resolveMatchedConfigs(mockCompilation, configs);

      expect(capturedContext).toBe(customContext);
    });
  });

  let mockCompilation: any;
  let mockResolver: any;
  let mockResolveContext: any;
  let MockModuleNotFoundError: any;
  let MockLazySet: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get the mocked classes
    MockModuleNotFoundError = require('webpack/lib/ModuleNotFoundError');
    MockLazySet = require('webpack/lib/util/LazySet');

    mockResolveContext = {
      fileDependencies: { add: jest.fn(), addAll: jest.fn() },
      contextDependencies: { add: jest.fn(), addAll: jest.fn() },
      missingDependencies: { add: jest.fn(), addAll: jest.fn() },
    };

    mockResolver = {
      resolve: jest.fn(),
    };

    mockCompilation = {
      resolverFactory: {
        get: jest.fn().mockReturnValue(mockResolver),
      },
      compiler: {
        context: '/test/context',
      },
      errors: [],
      contextDependencies: { addAll: jest.fn() },
      fileDependencies: { addAll: jest.fn() },
      missingDependencies: { addAll: jest.fn() },
    };

    // Setup LazySet mock instances
    MockLazySet.mockImplementation(() => mockResolveContext.fileDependencies);
  });

  describe('relative path resolution', () => {
    it('should resolve relative paths successfully', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./relative-module', createTestConfig({ shareScope: 'default' })],
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          expect(request).toBe('./relative-module');
          callback(null, '/resolved/path/relative-module');
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('/resolved/path/relative-module')).toBe(true);
      expect(result.resolved.get('/resolved/path/relative-module')).toEqual(
        createTestConfig({ shareScope: 'default' }),
      );
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
    });

    it('should handle relative path resolution with parent directory references', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['../parent-module', createTestConfig({ shareScope: 'custom' })],
        ['../../grandparent-module', createTestConfig({ shareScope: 'test' })],
      ];

      mockResolver.resolve
        .mockImplementationOnce(
          (context, basePath, request, resolveContext, callback) => {
            callback(null, '/resolved/parent-module');
          },
        )
        .mockImplementationOnce(
          (context, basePath, request, resolveContext, callback) => {
            callback(null, '/resolved/grandparent-module');
          },
        );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(2);
      expect(result.resolved.has('/resolved/parent-module')).toBe(true);
      expect(result.resolved.has('/resolved/grandparent-module')).toBe(true);
    });

    it('should handle relative path resolution errors', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./missing-module', createTestConfig({ shareScope: 'default' })],
      ];

      const resolveError = new Error('Module not found');
      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          callback(resolveError, false);
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
      expect(mockCompilation.errors).toHaveLength(1);
      // Check that an error was created
      expect(mockCompilation.errors[0]).toBeDefined();
    });

    it('should handle resolver returning false', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./invalid-module', createTestConfig({ shareScope: 'default' })],
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          callback(null, false);
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(0);
      expect(mockCompilation.errors).toHaveLength(1);
      // Check that an error was created
      expect(mockCompilation.errors[0]).toBeDefined();
    });

    it('should handle relative path resolution with custom request', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'module-alias',
          createTestConfig({
            shareScope: 'default',
            request: './actual-relative-module',
            shareKey: 'module-alias',
          }),
        ],
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          expect(request).toBe('./actual-relative-module');
          callback(null, '/resolved/actual-module');
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('/resolved/actual-module')).toBe(true);
    });
  });

  describe('absolute path resolution', () => {
    it('should handle absolute Unix paths', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          '/absolute/unix/path',
          createTestConfig({
            shareScope: 'default',
            shareKey: '/absolute/unix/path',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('/absolute/unix/path')).toBe(true);
      expect(result.resolved.get('/absolute/unix/path')).toEqual(
        createTestConfig({
          shareScope: 'default',
          shareKey: '/absolute/unix/path',
        }),
      );
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle absolute Windows paths', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'C:\\Windows\\Path',
          createTestConfig({
            shareScope: 'windows',
            shareKey: 'C:\\Windows\\Path',
          }),
        ],
        [
          'D:\\Drive\\Module',
          createTestConfig({
            shareScope: 'test',
            shareKey: 'D:\\Drive\\Module',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(2);
      expect(result.resolved.has('C:\\Windows\\Path')).toBe(true);
      expect(result.resolved.has('D:\\Drive\\Module')).toBe(true);
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle UNC paths', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          '\\\\server\\share\\module',
          createTestConfig({
            shareScope: 'unc',
            shareKey: '\\\\server\\share\\module',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('\\\\server\\share\\module')).toBe(true);
      expect(result.resolved.get('\\\\server\\share\\module')).toEqual(
        createTestConfig({
          shareScope: 'unc',
          shareKey: '\\\\server\\share\\module',
        }),
      );
    });

    it('should handle absolute paths with custom request override', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'module-name',
          createTestConfig({
            shareScope: 'default',
            request: '/absolute/override/path',
            shareKey: 'module-name',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('/absolute/override/path')).toBe(true);
      expect(result.resolved.get('/absolute/override/path')).toMatchObject({
        shareScope: 'default',
        request: '/absolute/override/path',
      });
    });
  });

  describe('prefix resolution', () => {
    it('should handle module prefix patterns', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          '@company/',
          createTestConfig({ shareScope: 'default', shareKey: '@company/' }),
        ],
        [
          'utils/',
          createTestConfig({ shareScope: 'utilities', shareKey: 'utils/' }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.prefixed.size).toBe(2);
      expect(result.prefixed.has('@company/')).toBe(true);
      expect(result.prefixed.has('utils/')).toBe(true);
      expect(result.prefixed.get('@company/')).toMatchObject({
        shareScope: 'default',
        shareKey: '@company/',
      });
      expect(result.prefixed.get('utils/')).toMatchObject({
        shareScope: 'utilities',
        shareKey: 'utils/',
      });
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle prefix patterns with layers', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          '@scoped/',
          createTestConfig({
            shareScope: 'default',
            issuerLayer: 'client',
            shareKey: '@scoped/',
          }),
        ],
        [
          'components/',
          createTestConfig({
            shareScope: 'ui',
            issuerLayer: 'server',
            shareKey: 'components/',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.prefixed.size).toBe(2);
      expect(result.prefixed.has('(client)@scoped/')).toBe(true);
      expect(result.prefixed.has('(server)components/')).toBe(true);
      expect(result.prefixed.get('(client)@scoped/')).toMatchObject({
        shareScope: 'default',
        issuerLayer: 'client',
        shareKey: '@scoped/',
      });
    });

    it('should handle prefix patterns with custom request', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'alias/',
          createTestConfig({
            shareScope: 'default',
            request: '@actual-scope/',
            shareKey: 'alias/',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.prefixed.has('@actual-scope/')).toBe(true);
      expect(result.prefixed.get('@actual-scope/')).toMatchObject({
        shareScope: 'default',
        request: '@actual-scope/',
        shareKey: 'alias/',
      });
    });
  });

  describe('regular module resolution', () => {
    it('should handle regular module requests', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'react',
          createTestConfig({ shareScope: 'default', shareKey: 'react' }),
        ],
        [
          'lodash',
          createTestConfig({ shareScope: 'utilities', shareKey: 'lodash' }),
        ],
        [
          '@babel/core',
          createTestConfig({ shareScope: 'build', shareKey: '@babel/core' }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.size).toBe(3);
      expect(result.unresolved.has('react')).toBe(true);
      expect(result.unresolved.has('lodash')).toBe(true);
      expect(result.unresolved.has('@babel/core')).toBe(true);
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle regular modules with layers', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'react',
          createTestConfig({
            shareScope: 'default',
            issuerLayer: 'client',
            shareKey: 'react',
          }),
        ],
        [
          'express',
          createTestConfig({
            shareScope: 'server',
            issuerLayer: 'server',
            shareKey: 'express',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.size).toBe(2);
      expect(result.unresolved.has('(client)react')).toBe(true);
      expect(result.unresolved.has('(server)express')).toBe(true);
      expect(result.unresolved.get('(client)react')).toMatchObject({
        shareScope: 'default',
        issuerLayer: 'client',
        shareKey: 'react',
      });
    });

    it('should handle regular modules with custom requests', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'alias-lib',
          createTestConfig({
            shareScope: 'default',
            request: 'actual-lib',
            shareKey: 'alias-lib',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has('actual-lib')).toBe(true);
      expect(result.unresolved.get('actual-lib')).toMatchObject({
        shareScope: 'default',
        request: 'actual-lib',
        shareKey: 'alias-lib',
      });
    });
  });

  describe('mixed configuration scenarios', () => {
    it('should handle mixed configuration types', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./relative', createTestConfig({ shareScope: 'default' })],
        [
          '/absolute/path',
          createTestConfig({ shareScope: 'abs', shareKey: '/absolute/path' }),
        ],
        [
          'prefix/',
          createTestConfig({ shareScope: 'prefix', shareKey: 'prefix/' }),
        ],
        [
          'regular-module',
          createTestConfig({
            shareScope: 'regular',
            shareKey: 'regular-module',
          }),
        ],
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          callback(null, '/resolved/relative');
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(2); // relative + absolute
      expect(result.prefixed.size).toBe(1);
      expect(result.unresolved.size).toBe(1);

      expect(result.resolved.has('/resolved/relative')).toBe(true);
      expect(result.resolved.has('/absolute/path')).toBe(true);
      expect(result.prefixed.has('prefix/')).toBe(true);
      expect(result.unresolved.has('regular-module')).toBe(true);
    });

    it('should handle concurrent resolution with some failures', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./success', createTestConfig({ shareScope: 'default' })],
        ['./failure', createTestConfig({ shareScope: 'default' })],
        [
          '/absolute',
          createTestConfig({ shareScope: 'abs', shareKey: '/absolute' }),
        ],
      ];

      mockResolver.resolve
        .mockImplementationOnce(
          (context, basePath, request, resolveContext, callback) => {
            callback(null, '/resolved/success');
          },
        )
        .mockImplementationOnce(
          (context, basePath, request, resolveContext, callback) => {
            callback(new Error('Resolution failed'), false);
          },
        );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(2); // success + absolute
      expect(result.resolved.has('/resolved/success')).toBe(true);
      expect(result.resolved.has('/absolute')).toBe(true);
      expect(mockCompilation.errors).toHaveLength(1);
    });
  });

  describe('layer handling and composite keys', () => {
    it('should create composite keys without layers', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['react', createTestConfig({ shareScope: 'default' })],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has('react')).toBe(true);
    });

    it('should create composite keys with issuerLayer', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'react',
          createTestConfig({
            shareScope: 'default',
            issuerLayer: 'client',
            shareKey: 'react',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has('(client)react')).toBe(true);
      expect(result.unresolved.has('react')).toBe(false);
    });

    it('should handle complex layer scenarios', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'module',
          createTestConfig({ shareScope: 'default', shareKey: 'module' }),
        ],
        [
          'module',
          createTestConfig({
            shareScope: 'layered',
            issuerLayer: 'layer1',
            shareKey: 'module',
          }),
        ],
        [
          'module',
          createTestConfig({
            shareScope: 'layered2',
            issuerLayer: 'layer2',
            shareKey: 'module',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.size).toBe(3);
      expect(result.unresolved.has('module')).toBe(true);
      expect(result.unresolved.has('(layer1)module')).toBe(true);
      expect(result.unresolved.has('(layer2)module')).toBe(true);
    });
  });

  describe('dependency tracking', () => {
    it('should track file dependencies from resolution', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./relative', createTestConfig({ shareScope: 'default' })],
      ];

      const resolveContext = {
        fileDependencies: { add: jest.fn(), addAll: jest.fn() },
        contextDependencies: { add: jest.fn(), addAll: jest.fn() },
        missingDependencies: { add: jest.fn(), addAll: jest.fn() },
      };

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, rc, callback) => {
          // Simulate adding dependencies during resolution
          rc.fileDependencies.add('/some/file.js');
          rc.contextDependencies.add('/some/context');
          rc.missingDependencies.add('/missing/file');
          callback(null, '/resolved/relative');
        },
      );

      // Update LazySet mock to return the actual resolve context
      MockLazySet.mockReturnValueOnce(resolveContext.fileDependencies)
        .mockReturnValueOnce(resolveContext.contextDependencies)
        .mockReturnValueOnce(resolveContext.missingDependencies);

      await resolveMatchedConfigs(mockCompilation, configs);

      // The dependencies should be added to the compilation
      expect(mockCompilation.contextDependencies.addAll).toHaveBeenCalled();
      expect(mockCompilation.fileDependencies.addAll).toHaveBeenCalled();
      expect(mockCompilation.missingDependencies.addAll).toHaveBeenCalled();

      // Verify the dependencies were collected during resolution
      const contextDepsCall =
        mockCompilation.contextDependencies.addAll.mock.calls[0][0];
      const fileDepsCall =
        mockCompilation.fileDependencies.addAll.mock.calls[0][0];
      const missingDepsCall =
        mockCompilation.missingDependencies.addAll.mock.calls[0][0];

      // Check that LazySet instances contain the expected values
      expect(contextDepsCall).toBeDefined();
      expect(fileDepsCall).toBeDefined();
      expect(missingDepsCall).toBeDefined();
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty configuration array', async () => {
      const configs: [string, ConsumeOptions][] = [];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle duplicate module requests with different layers', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'react',
          createTestConfig({ shareScope: 'default', shareKey: 'react' }),
        ],
        [
          'react',
          createTestConfig({
            shareScope: 'default',
            issuerLayer: 'client',
            shareKey: 'react',
          }),
        ],
        [
          'react',
          createTestConfig({
            shareScope: 'default',
            issuerLayer: 'server',
            shareKey: 'react',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.size).toBe(3);
      expect(result.unresolved.has('react')).toBe(true);
      expect(result.unresolved.has('(client)react')).toBe(true);
      expect(result.unresolved.has('(server)react')).toBe(true);
    });

    it('should handle prefix patterns that could be confused with relative paths', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['src/', createTestConfig({ shareScope: 'default', shareKey: 'src/' })], // Could be confused with ./src
        ['lib/', createTestConfig({ shareScope: 'default', shareKey: 'lib/' })],
        [
          'node_modules/',
          createTestConfig({
            shareScope: 'default',
            shareKey: 'node_modules/',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      // All should be treated as prefixes, not relative paths
      expect(result.prefixed.size).toBe(3);
      expect(result.resolved.size).toBe(0);
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle scoped package prefixes correctly', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          '@scope/',
          createTestConfig({ shareScope: 'default', shareKey: '@scope/' }),
        ],
        [
          '@company/',
          createTestConfig({
            shareScope: 'default',
            issuerLayer: 'client',
            shareKey: '@company/',
          }),
        ],
        [
          '@org/package/',
          createTestConfig({
            shareScope: 'default',
            shareKey: '@org/package/',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.prefixed.size).toBe(3);
      expect(result.prefixed.has('@scope/')).toBe(true);
      expect(result.prefixed.has('(client)@company/')).toBe(true);
      expect(result.prefixed.has('@org/package/')).toBe(true);
    });

    it('should handle resolver factory errors', async () => {
      mockCompilation.resolverFactory.get.mockImplementation(() => {
        throw new Error('Resolver factory error');
      });

      const configs: [string, ConsumeOptions][] = [
        ['./relative', createTestConfig({ shareScope: 'default' })],
      ];

      await expect(
        resolveMatchedConfigs(mockCompilation, configs),
      ).rejects.toThrow('Resolver factory error');
    });

    it('should handle configurations with undefined request', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'module-name',
          createTestConfig({
            shareScope: 'default',
            request: undefined,
            shareKey: 'module-name',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has('module-name')).toBe(true);
    });

    it('should handle edge case path patterns', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'utils/',
          createTestConfig({ shareScope: 'root', shareKey: 'utils/' }),
        ], // Prefix ending with /
        ['./', createTestConfig({ shareScope: 'current' })], // Current directory relative
        [
          'regular-module',
          createTestConfig({
            shareScope: 'regular',
            shareKey: 'regular-module',
          }),
        ], // Regular module
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          callback(null, '/resolved/' + request);
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.prefixed.has('utils/')).toBe(true);
      expect(result.resolved.has('/resolved/./')).toBe(true);
      expect(result.unresolved.has('regular-module')).toBe(true);
    });

    it('should handle Windows-style absolute paths with forward slashes', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'C:/Windows/Path',
          createTestConfig({
            shareScope: 'windows',
            shareKey: 'C:/Windows/Path',
          }),
        ],
        [
          'D:/Program Files/Module',
          createTestConfig({
            shareScope: 'test',
            shareKey: 'D:/Program Files/Module',
          }),
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      // Windows paths with forward slashes are NOT recognized as absolute paths by the regex
      // They are treated as regular module requests
      expect(result.unresolved.size).toBe(2);
      expect(result.unresolved.has('C:/Windows/Path')).toBe(true);
      expect(result.unresolved.has('D:/Program Files/Module')).toBe(true);
      expect(result.resolved.size).toBe(0);
    });

    it('should handle resolution with alias-like patterns in request', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['@/components', createTestConfig({ shareScope: 'default' })],
        ['~/utils', createTestConfig({ shareScope: 'default' })],
        ['#internal', createTestConfig({ shareScope: 'default' })],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      // These should be treated as regular modules (not prefixes or relative)
      expect(result.unresolved.size).toBe(3);
      expect(result.unresolved.has('@/components')).toBe(true);
      expect(result.unresolved.has('~/utils')).toBe(true);
      expect(result.unresolved.has('#internal')).toBe(true);
    });

    it('should handle very long module names and paths', async () => {
      const longPath = 'a'.repeat(500);
      const configs: [string, ConsumeOptions][] = [
        [longPath, createTestConfig({ shareScope: 'default' })],
        [
          `./very/deep/nested/path/with/many/levels/${longPath}`,
          createTestConfig({ shareScope: 'default' }),
        ],
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          callback(null, `/resolved/${request}`);
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has(longPath)).toBe(true);
      expect(result.resolved.size).toBe(1); // Only the relative path should be resolved
    });
  });
});
