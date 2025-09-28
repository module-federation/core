/*
 * Comprehensive tests for resolveMatchedConfigs.ts
 * Testing all resolution paths: relative, absolute, prefix, and regular module requests
 */

// Defer loading the module under test until after jest.mock() calls
// to ensure our mocks for webpack internals are applied consistently
// even when other suites import the module first in the same worker.
let resolveMatchedConfigs: typeof import('../../../src/lib/sharing/resolveMatchedConfigs').resolveMatchedConfigs;
import type { ConsumeOptions } from '../../../src/declarations/plugins/sharing/ConsumeSharedModule';

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
  let mockCompilation: any;
  let mockResolver: any;
  let mockResolveContext: any;
  let MockModuleNotFoundError: any;
  let MockLazySet: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Load the module after mocks are in place in isolated module context
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      resolveMatchedConfigs =
        require('../../../src/lib/sharing/resolveMatchedConfigs').resolveMatchedConfigs;
    });

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
        ['./relative-module', { shareScope: 'default' }],
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          expect(request).toBe('./relative-module');
          callback(null, '/resolved/path/relative-module');
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('/resolved/path/relative-module')).toBe(true);
      expect(result.resolved.get('/resolved/path/relative-module')).toEqual({
        shareScope: 'default',
      });
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
    });

    it('should handle relative path resolution with parent directory references', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['../parent-module', { shareScope: 'custom' }],
        ['../../grandparent-module', { shareScope: 'test' }],
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
        ['./missing-module', { shareScope: 'default' }],
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
      // Assert on the pushed error shape instead of constructor call tracking
      expect(mockCompilation.errors[0]).toEqual({
        module: null,
        err: resolveError,
        details: { name: 'shared module ./missing-module' },
      });
    });

    it('should handle resolver returning false', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./invalid-module', { shareScope: 'default' }],
      ];

      mockResolver.resolve.mockImplementation(
        (context, basePath, request, resolveContext, callback) => {
          callback(null, false);
        },
      );

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(0);
      expect(mockCompilation.errors).toHaveLength(1);
      // Assert on the pushed error shape instead of constructor call tracking
      expect(mockCompilation.errors[0]).toEqual({
        module: null,
        err: expect.objectContaining({
          message: "Can't resolve ./invalid-module",
        }),
        details: { name: 'shared module ./invalid-module' },
      });
    });

    it('should handle relative path resolution with custom request', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'module-alias',
          { shareScope: 'default', request: './actual-relative-module' },
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
        ['/absolute/unix/path', { shareScope: 'default' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('/absolute/unix/path')).toBe(true);
      expect(result.resolved.get('/absolute/unix/path')).toEqual({
        shareScope: 'default',
      });
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle absolute Windows paths', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['C:\\Windows\\Path', { shareScope: 'windows' }],
        ['D:\\Drive\\Module', { shareScope: 'test' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.size).toBe(2);
      expect(result.resolved.has('C:\\Windows\\Path')).toBe(true);
      expect(result.resolved.has('D:\\Drive\\Module')).toBe(true);
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle UNC paths', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['\\\\server\\share\\module', { shareScope: 'unc' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('\\\\server\\share\\module')).toBe(true);
      expect(result.resolved.get('\\\\server\\share\\module')).toEqual({
        shareScope: 'unc',
      });
    });

    it('should handle absolute paths with custom request override', async () => {
      const configs: [string, ConsumeOptions][] = [
        [
          'module-name',
          { shareScope: 'default', request: '/absolute/override/path' },
        ],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.resolved.has('/absolute/override/path')).toBe(true);
      expect(result.resolved.get('/absolute/override/path')).toEqual({
        shareScope: 'default',
        request: '/absolute/override/path',
      });
    });
  });

  describe('prefix resolution', () => {
    it('should handle module prefix patterns', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['@company/', { shareScope: 'default' }],
        ['utils/', { shareScope: 'utilities' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.prefixed.size).toBe(2);
      expect(result.prefixed.has('@company/')).toBe(true);
      expect(result.prefixed.has('utils/')).toBe(true);
      expect(result.prefixed.get('@company/')).toEqual({
        shareScope: 'default',
      });
      expect(result.prefixed.get('utils/')).toEqual({
        shareScope: 'utilities',
      });
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle prefix patterns with layers', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['@scoped/', { shareScope: 'default', issuerLayer: 'client' }],
        ['components/', { shareScope: 'ui', issuerLayer: 'server' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.prefixed.size).toBe(2);
      expect(result.prefixed.has('(client)@scoped/')).toBe(true);
      expect(result.prefixed.has('(server)components/')).toBe(true);
      expect(result.prefixed.get('(client)@scoped/')).toEqual({
        shareScope: 'default',
        issuerLayer: 'client',
      });
    });

    it('should handle prefix patterns with custom request', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['alias/', { shareScope: 'default', request: '@actual-scope/' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.prefixed.has('@actual-scope/')).toBe(true);
      expect(result.prefixed.get('@actual-scope/')).toEqual({
        shareScope: 'default',
        request: '@actual-scope/',
      });
    });
  });

  describe('regular module resolution', () => {
    it('should handle regular module requests', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['react', { shareScope: 'default' }],
        ['lodash', { shareScope: 'utilities' }],
        ['@babel/core', { shareScope: 'build' }],
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
        ['react', { shareScope: 'default', issuerLayer: 'client' }],
        ['express', { shareScope: 'server', issuerLayer: 'server' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.size).toBe(2);
      expect(result.unresolved.has('(client)react')).toBe(true);
      expect(result.unresolved.has('(server)express')).toBe(true);
      expect(result.unresolved.get('(client)react')).toEqual({
        shareScope: 'default',
        issuerLayer: 'client',
      });
    });

    it('should handle regular modules with custom requests', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['alias', { shareScope: 'default', request: 'actual-module' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has('actual-module')).toBe(true);
      expect(result.unresolved.get('actual-module')).toEqual({
        shareScope: 'default',
        request: 'actual-module',
      });
    });
  });

  describe('mixed configuration scenarios', () => {
    it('should handle mixed configuration types', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./relative', { shareScope: 'default' }],
        ['/absolute/path', { shareScope: 'abs' }],
        ['prefix/', { shareScope: 'prefix' }],
        ['regular-module', { shareScope: 'regular' }],
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
        ['./success', { shareScope: 'default' }],
        ['./failure', { shareScope: 'default' }],
        ['/absolute', { shareScope: 'abs' }],
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
        ['react', { shareScope: 'default' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has('react')).toBe(true);
    });

    it('should create composite keys with issuerLayer', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['react', { shareScope: 'default', issuerLayer: 'client' }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has('(client)react')).toBe(true);
      expect(result.unresolved.has('react')).toBe(false);
    });

    it('should handle complex layer scenarios', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['module', { shareScope: 'default' }],
        ['module', { shareScope: 'layered', issuerLayer: 'layer1' }],
        ['module', { shareScope: 'layered2', issuerLayer: 'layer2' }],
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
        ['./relative', { shareScope: 'default' }],
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

      expect(mockCompilation.contextDependencies.addAll).toHaveBeenCalledWith(
        expect.objectContaining({
          add: expect.any(Function),
          addAll: expect.any(Function),
        }),
      );
      expect(mockCompilation.fileDependencies.addAll).toHaveBeenCalledWith(
        expect.objectContaining({
          add: expect.any(Function),
          addAll: expect.any(Function),
        }),
      );
      expect(mockCompilation.missingDependencies.addAll).toHaveBeenCalledWith(
        expect.objectContaining({
          add: expect.any(Function),
          addAll: expect.any(Function),
        }),
      );
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

    it('should handle resolver factory errors', async () => {
      mockCompilation.resolverFactory.get.mockImplementation(() => {
        throw new Error('Resolver factory error');
      });

      const configs: [string, ConsumeOptions][] = [
        ['./relative', { shareScope: 'default' }],
      ];

      await expect(
        resolveMatchedConfigs(mockCompilation, configs),
      ).rejects.toThrow('Resolver factory error');
    });

    it('should handle configurations with undefined request', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['module-name', { shareScope: 'default', request: undefined }],
      ];

      const result = await resolveMatchedConfigs(mockCompilation, configs);

      expect(result.unresolved.has('module-name')).toBe(true);
    });

    it('should handle edge case path patterns', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['utils/', { shareScope: 'root' }], // Prefix ending with /
        ['./', { shareScope: 'current' }], // Current directory relative
        ['regular-module', { shareScope: 'regular' }], // Regular module
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
  });
});
