/*
 * @rstest-environment node
 */

/*
 * Comprehensive tests for resolveMatchedConfigs.ts
 * Testing all resolution paths: relative, absolute, prefix, and regular module requests
 */

import { rs, Mock } from '@rstest/core';
import type { Compilation } from 'webpack';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import ModuleNotFoundError from 'webpack/lib/ModuleNotFoundError';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import LazySet from 'webpack/lib/util/LazySet';
import type { ResolveOptionsWithDependencyType } from 'webpack/lib/ResolverFactory';

import { resolveMatchedConfigs } from '../../../src/lib/sharing/resolveMatchedConfigs';
import type { ConsumeOptions } from '../../../src/declarations/plugins/sharing/ConsumeSharedModule';

let vol: any;
try {
  vol = require('memfs').vol;
} catch {
  vol = {
    reset: rs.fn(),
    fromJSON: rs.fn(),
  };
}

type PartialConsumeOptions = Partial<ConsumeOptions> &
  Pick<ConsumeOptions, 'shareScope'>;

const toConsumeOptionsArray = (
  configs: [string, PartialConsumeOptions][],
): [string, ConsumeOptions][] =>
  configs as unknown as [string, ConsumeOptions][];

type ResolveCallback = (error: Error | null, result?: string | false) => void;
type ResolverFunction = (
  context: string,
  basePath: string,
  request: string,
  resolveContext: unknown,
  callback: ResolveCallback,
) => void;
interface CompilationError {
  message: string;
}

interface MockResolver {
  resolve: Mock<ResolverFunction>;
}

interface MockCompilation {
  resolverFactory: {
    get: Mock<
      (type: string, options?: ResolveOptionsWithDependencyType) => MockResolver
    >;
  };
  compiler: { context: string };
  errors: CompilationError[];
  contextDependencies: {
    addAll: Mock<(iterable: Iterable<string>) => void>;
  };
  fileDependencies: { addAll: Mock<(iterable: Iterable<string>) => void> };
  missingDependencies: {
    addAll: Mock<(iterable: Iterable<string>) => void>;
  };
}

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => ({
  mockNormalizeWebpackPath: rs.fn((path: string) => path),
  mockGetWebpackPath: rs.fn(() => 'webpack'),
}));

rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: mocks.mockNormalizeWebpackPath,
  getWebpackPath: mocks.mockGetWebpackPath,
}));

rs.mock('fs', () => require('memfs').fs);
rs.mock('fs/promises', () => require('memfs').fs.promises);

rs.mock('webpack/lib/util/fs', () => ({
  join: (fs: unknown, ...paths: string[]) => require('path').join(...paths),
  dirname: (fs: unknown, filePath: string) => require('path').dirname(filePath),
  readJson: (
    fs: unknown,
    filePath: string,
    callback: (error: Error | null, data?: unknown) => void,
  ) => {
    const memfs = require('memfs').fs;
    memfs.readFile(filePath, 'utf8', (err: Error | null, content: string) => {
      if (err) return callback(err);
      try {
        const data = JSON.parse(content);
        callback(null, data);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        callback(error);
      }
    });
  },
}));

describe('resolveMatchedConfigs', () => {
  let mockCompilation: MockCompilation;
  let mockResolver: MockResolver;
  let compilation: Compilation;

  beforeEach(() => {
    rs.clearAllMocks();

    mockResolver = {
      resolve: rs.fn<ResolverFunction>(),
    };

    mockCompilation = {
      resolverFactory: {
        get: rs.fn().mockReturnValue(mockResolver),
      },
      compiler: {
        context: '/test/context',
      },
      errors: [],
      contextDependencies: { addAll: rs.fn() },
      fileDependencies: { addAll: rs.fn() },
      missingDependencies: { addAll: rs.fn() },
    };

    compilation = mockCompilation as unknown as Compilation;
  });

  describe('relative path resolution', () => {
    it('should resolve relative paths successfully', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['./relative-module', { shareScope: 'default' }],
      ];

      mockResolver.resolve.mockImplementation(
        (
          context: string,
          basePath: string,
          request: string,
          resolveContext: unknown,
          callback: ResolveCallback,
        ) => {
          expect(request).toBe('./relative-module');
          callback(null, '/resolved/path/relative-module');
        },
      );

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.has('/resolved/path/relative-module')).toBe(true);
      expect(result.resolved.get('/resolved/path/relative-module')).toEqual({
        shareScope: 'default',
      });
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
    });

    it('should handle relative path resolution with parent directory references', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['../parent-module', { shareScope: 'custom' }],
        ['../../grandparent-module', { shareScope: 'test' }],
      ];

      mockResolver.resolve
        .mockImplementationOnce(
          (
            context: string,
            basePath: string,
            request: string,
            resolveContext: unknown,
            callback: ResolveCallback,
          ) => {
            callback(null, '/resolved/parent-module');
          },
        )
        .mockImplementationOnce(
          (
            context: string,
            basePath: string,
            request: string,
            resolveContext: unknown,
            callback: ResolveCallback,
          ) => {
            callback(null, '/resolved/grandparent-module');
          },
        );

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.size).toBe(2);
      expect(result.resolved.has('/resolved/parent-module')).toBe(true);
      expect(result.resolved.has('/resolved/grandparent-module')).toBe(true);
    });

    it('should handle relative path resolution errors', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['./missing-module', { shareScope: 'default' }],
      ];

      const resolveError = new Error('Module not found');
      mockResolver.resolve.mockImplementation(
        (
          context: string,
          basePath: string,
          request: string,
          resolveContext: unknown,
          callback: ResolveCallback,
        ) => {
          callback(resolveError, false);
        },
      );

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
      expect(mockCompilation.errors).toHaveLength(1);
      const error = mockCompilation.errors[0] as InstanceType<
        typeof ModuleNotFoundError
      >;
      expect(error).toBeInstanceOf(ModuleNotFoundError);
      expect(error.module).toBeNull();
      expect(error.error).toBe(resolveError);
      expect(error.loc).toEqual({
        name: 'shared module ./missing-module',
      });
    });

    it('should handle resolver returning false', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['./invalid-module', { shareScope: 'default' }],
      ];

      mockResolver.resolve.mockImplementation(
        (
          context: string,
          basePath: string,
          request: string,
          resolveContext: unknown,
          callback: ResolveCallback,
        ) => {
          callback(null, false);
        },
      );

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.size).toBe(0);
      expect(mockCompilation.errors).toHaveLength(1);
      const error = mockCompilation.errors[0] as InstanceType<
        typeof ModuleNotFoundError
      >;
      expect(error).toBeInstanceOf(ModuleNotFoundError);
      expect(error.module).toBeNull();
      expect(error.error).toBeInstanceOf(Error);
      expect(error.error.message).toContain("Can't resolve ./invalid-module");
      expect(error.loc).toEqual({
        name: 'shared module ./invalid-module',
      });
    });

    it('should handle relative path resolution with custom request', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        [
          'module-alias',
          { shareScope: 'default', request: './actual-relative-module' },
        ],
      ];

      mockResolver.resolve.mockImplementation(
        (
          context: string,
          basePath: string,
          request: string,
          resolveContext: unknown,
          callback: ResolveCallback,
        ) => {
          expect(request).toBe('./actual-relative-module');
          callback(null, '/resolved/actual-module');
        },
      );

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.has('/resolved/actual-module')).toBe(true);
    });
  });

  describe('absolute path resolution', () => {
    it('should handle absolute Unix paths', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['/absolute/unix/path', { shareScope: 'default' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.has('/absolute/unix/path')).toBe(true);
      expect(result.resolved.get('/absolute/unix/path')).toEqual({
        shareScope: 'default',
      });
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle absolute Windows paths', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['C:\\Windows\\Path', { shareScope: 'windows' }],
        ['D:\\Drive\\Module', { shareScope: 'test' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.size).toBe(2);
      expect(result.resolved.has('C:\\Windows\\Path')).toBe(true);
      expect(result.resolved.has('D:\\Drive\\Module')).toBe(true);
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle UNC paths', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['\\\\server\\share\\module', { shareScope: 'unc' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.has('\\\\server\\share\\module')).toBe(true);
      expect(result.resolved.get('\\\\server\\share\\module')).toEqual({
        shareScope: 'unc',
      });
    });

    it('should handle absolute paths with custom request override', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        [
          'module-name',
          { shareScope: 'default', request: '/absolute/override/path' },
        ],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.has('/absolute/override/path')).toBe(true);
      expect(result.resolved.get('/absolute/override/path')).toEqual({
        shareScope: 'default',
        request: '/absolute/override/path',
      });
    });
  });

  describe('prefix resolution', () => {
    it('should handle module prefix patterns', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['@company/', { shareScope: 'default' }],
        ['utils/', { shareScope: 'utilities' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

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
      const configs: [string, PartialConsumeOptions][] = [
        ['@scoped/', { shareScope: 'default', issuerLayer: 'client' }],
        ['components/', { shareScope: 'ui', issuerLayer: 'server' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.prefixed.size).toBe(2);
      expect(result.prefixed.has('(client)@scoped/')).toBe(true);
      expect(result.prefixed.has('(server)components/')).toBe(true);
      expect(result.prefixed.get('(client)@scoped/')).toEqual({
        shareScope: 'default',
        issuerLayer: 'client',
      });
    });

    it('should handle prefix patterns with custom request', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['alias/', { shareScope: 'default', request: '@actual-scope/' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.prefixed.has('@actual-scope/')).toBe(true);
      expect(result.prefixed.get('@actual-scope/')).toEqual({
        shareScope: 'default',
        request: '@actual-scope/',
      });
    });
  });

  describe('regular module resolution', () => {
    it('should handle regular module requests', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['react', { shareScope: 'default' }],
        ['lodash', { shareScope: 'utilities' }],
        ['@babel/core', { shareScope: 'build' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.unresolved.size).toBe(3);
      expect(result.unresolved.has('react')).toBe(true);
      expect(result.unresolved.has('lodash')).toBe(true);
      expect(result.unresolved.has('@babel/core')).toBe(true);
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle regular modules with layers', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['react', { shareScope: 'default', issuerLayer: 'client' }],
        ['express', { shareScope: 'server', issuerLayer: 'server' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.unresolved.size).toBe(2);
      expect(result.unresolved.has('(client)react')).toBe(true);
      expect(result.unresolved.has('(server)express')).toBe(true);
      expect(result.unresolved.get('(client)react')).toEqual({
        shareScope: 'default',
        issuerLayer: 'client',
      });
    });

    it('should handle regular modules with custom requests', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['alias', { shareScope: 'default', request: 'actual-module' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.unresolved.has('actual-module')).toBe(true);
      expect(result.unresolved.get('actual-module')).toEqual({
        shareScope: 'default',
        request: 'actual-module',
      });
    });
  });

  describe('mixed configuration scenarios', () => {
    it('should handle mixed configuration types', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['./relative', { shareScope: 'default' }],
        ['/absolute/path', { shareScope: 'abs' }],
        ['prefix/', { shareScope: 'prefix' }],
        ['regular-module', { shareScope: 'regular' }],
      ];

      mockResolver.resolve.mockImplementation(
        (
          context: string,
          basePath: string,
          request: string,
          resolveContext: unknown,
          callback: ResolveCallback,
        ) => {
          callback(null, '/resolved/relative');
        },
      );

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.size).toBe(2); // relative + absolute
      expect(result.prefixed.size).toBe(1);
      expect(result.unresolved.size).toBe(1);

      expect(result.resolved.has('/resolved/relative')).toBe(true);
      expect(result.resolved.has('/absolute/path')).toBe(true);
      expect(result.prefixed.has('prefix/')).toBe(true);
      expect(result.unresolved.has('regular-module')).toBe(true);
    });

    it('should handle concurrent resolution with some failures', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['./success', { shareScope: 'default' }],
        ['./failure', { shareScope: 'default' }],
        ['/absolute', { shareScope: 'abs' }],
      ];

      mockResolver.resolve
        .mockImplementationOnce(
          (
            context: string,
            basePath: string,
            request: string,
            resolveContext: unknown,
            callback: ResolveCallback,
          ) => {
            callback(null, '/resolved/success');
          },
        )
        .mockImplementationOnce(
          (
            context: string,
            basePath: string,
            request: string,
            resolveContext: unknown,
            callback: ResolveCallback,
          ) => {
            callback(new Error('Resolution failed'), false);
          },
        );

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.size).toBe(2); // success + absolute
      expect(result.resolved.has('/resolved/success')).toBe(true);
      expect(result.resolved.has('/absolute')).toBe(true);
      expect(mockCompilation.errors).toHaveLength(1);
    });
  });

  describe('layer handling and composite keys', () => {
    it('should create composite keys without layers', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['react', { shareScope: 'default' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.unresolved.has('react')).toBe(true);
    });

    it('should create composite keys with issuerLayer', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['react', { shareScope: 'default', issuerLayer: 'client' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.unresolved.has('(client)react')).toBe(true);
      expect(result.unresolved.has('react')).toBe(false);
    });

    it('should handle complex layer scenarios', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['module', { shareScope: 'default' }],
        ['module', { shareScope: 'layered', issuerLayer: 'layer1' }],
        ['module', { shareScope: 'layered2', issuerLayer: 'layer2' }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.unresolved.size).toBe(3);
      expect(result.unresolved.has('module')).toBe(true);
      expect(result.unresolved.has('(layer1)module')).toBe(true);
      expect(result.unresolved.has('(layer2)module')).toBe(true);
    });
  });

  describe('dependency tracking', () => {
    it('should track file dependencies from resolution', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['./relative', { shareScope: 'default' }],
      ];

      mockResolver.resolve.mockImplementation(
        (
          context: string,
          basePath: string,
          request: string,
          resolveContext: unknown,
          callback: ResolveCallback,
        ) => {
          // Simulate adding dependencies during resolution
          const typedContext = resolveContext as {
            fileDependencies: Set<string>;
            contextDependencies: Set<string>;
            missingDependencies: Set<string>;
          };
          typedContext.fileDependencies.add('/some/file.js');
          typedContext.contextDependencies.add('/some/context');
          typedContext.missingDependencies.add('/missing/file');
          callback(null, '/resolved/relative');
        },
      );

      await resolveMatchedConfigs(compilation, toConsumeOptionsArray(configs));

      expect(mockCompilation.contextDependencies.addAll).toHaveBeenCalledTimes(
        1,
      );
      expect(mockCompilation.fileDependencies.addAll).toHaveBeenCalledTimes(1);
      expect(mockCompilation.missingDependencies.addAll).toHaveBeenCalledTimes(
        1,
      );

      const [contextDeps] =
        mockCompilation.contextDependencies.addAll.mock.calls[0];
      const [fileDeps] = mockCompilation.fileDependencies.addAll.mock.calls[0];
      const [missingDeps] =
        mockCompilation.missingDependencies.addAll.mock.calls[0];

      expect(contextDeps).toBeInstanceOf(LazySet);
      expect(fileDeps).toBeInstanceOf(LazySet);
      expect(missingDeps).toBeInstanceOf(LazySet);

      expect((contextDeps as Set<string>).has('/some/context')).toBe(true);
      expect((fileDeps as Set<string>).has('/some/file.js')).toBe(true);
      expect((missingDeps as Set<string>).has('/missing/file')).toBe(true);
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty configuration array', async () => {
      const configs: [string, PartialConsumeOptions][] = [];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
      expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    it('should handle resolver factory errors', async () => {
      mockCompilation.resolverFactory.get.mockImplementation(() => {
        throw new Error('Resolver factory error');
      });

      const configs: [string, PartialConsumeOptions][] = [
        ['./relative', { shareScope: 'default' }],
      ];

      await expect(
        resolveMatchedConfigs(compilation, toConsumeOptionsArray(configs)),
      ).rejects.toThrow('Resolver factory error');
    });

    it('should handle configurations with undefined request', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['module-name', { shareScope: 'default', request: undefined }],
      ];

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.unresolved.has('module-name')).toBe(true);
    });

    it('should handle edge case path patterns', async () => {
      const configs: [string, PartialConsumeOptions][] = [
        ['utils/', { shareScope: 'root' }], // Prefix ending with /
        ['./', { shareScope: 'current' }], // Current directory relative
        ['regular-module', { shareScope: 'regular' }], // Regular module
      ];

      mockResolver.resolve.mockImplementation(
        (
          context: string,
          basePath: string,
          request: string,
          resolveContext: unknown,
          callback: ResolveCallback,
        ) => {
          callback(null, `/resolved/${request}`);
        },
      );

      const result = await resolveMatchedConfigs(
        compilation,
        toConsumeOptionsArray(configs),
      );

      expect(result.prefixed.has('utils/')).toBe(true);
      expect(result.resolved.has('/resolved/./')).toBe(true);
      expect(result.unresolved.has('regular-module')).toBe(true);
    });
  });

  describe('integration scenarios with memfs', () => {
    // Capture memfs at module level to use directly in resolver callbacks
    // rs.mock only works at module load time, not for dynamic require() calls
    const memfs = require('memfs');
    const path = require('path');

    beforeEach(() => {
      vol.reset();
      rs.clearAllMocks();
    });

    describe('real module resolution scenarios', () => {
      it('should resolve relative paths using memfs-backed file system', async () => {
        vol.fromJSON({
          '/test-project/src/components/Button.js':
            'export const Button = () => {};',
          '/test-project/src/utils/helpers.js':
            'export const helper = () => {};',
          '/test-project/lib/external.js': 'module.exports = {};',
        });

        const configs: [string, PartialConsumeOptions][] = [
          ['./src/components/Button', { shareScope: 'default' }],
          ['./src/utils/helpers', { shareScope: 'utilities' }],
          ['./lib/external', { shareScope: 'external' }],
        ];

        const mockCompilation = {
          resolverFactory: {
            get: () => ({
              resolve: (
                context: string,
                basePath: string,
                request: string,
                resolveContext: unknown,
                callback: ResolveCallback,
              ) => {
                const fullPath = path.resolve(basePath, request);

                memfs.fs.access(
                  fullPath + '.js',
                  memfs.fs.constants.F_OK,
                  (err: any) => {
                    if (err) {
                      callback(
                        new Error(`Module not found: ${request}`),
                        false,
                      );
                    } else {
                      callback(null, fullPath + '.js');
                    }
                  },
                );
              },
            }),
          },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [] as CompilationError[],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.resolved.size).toBe(3);
        expect(
          result.resolved.has('/test-project/src/components/Button.js'),
        ).toBe(true);
        expect(result.resolved.has('/test-project/src/utils/helpers.js')).toBe(
          true,
        );
        expect(result.resolved.has('/test-project/lib/external.js')).toBe(true);

        expect(
          result.resolved.get('/test-project/src/components/Button.js')
            ?.shareScope,
        ).toBe('default');
        expect(
          result.resolved.get('/test-project/src/utils/helpers.js')?.shareScope,
        ).toBe('utilities');
        expect(
          result.resolved.get('/test-project/lib/external.js')?.shareScope,
        ).toBe('external');

        expect(result.unresolved.size).toBe(0);
        expect(result.prefixed.size).toBe(0);
        expect(mockCompilation.errors).toHaveLength(0);
      });

      it('should surface missing files via compilation errors when using memfs', async () => {
        vol.fromJSON({
          '/test-project/src/existing.js': 'export default {};',
        });

        const configs: [string, PartialConsumeOptions][] = [
          ['./src/existing', { shareScope: 'default' }],
          ['./src/missing', { shareScope: 'default' }],
        ];

        const mockCompilation = {
          resolverFactory: {
            get: () => ({
              resolve: (
                context: string,
                basePath: string,
                request: string,
                resolveContext: unknown,
                callback: ResolveCallback,
              ) => {
                const fullPath = path.resolve(basePath, request);

                memfs.fs.access(
                  fullPath + '.js',
                  memfs.fs.constants.F_OK,
                  (err: any) => {
                    if (err) {
                      callback(
                        new Error(`Module not found: ${request}`),
                        false,
                      );
                    } else {
                      callback(null, fullPath + '.js');
                    }
                  },
                );
              },
            }),
          },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [] as CompilationError[],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.resolved.size).toBe(1);
        expect(result.resolved.has('/test-project/src/existing.js')).toBe(true);
        expect(mockCompilation.errors).toHaveLength(1);
        expect(mockCompilation.errors[0].message).toContain('Module not found');
      });

      it('should accept absolute paths without resolver when using memfs', async () => {
        vol.fromJSON({
          '/absolute/path/module.js': 'module.exports = {};',
          '/another/absolute/lib.js': 'export default {};',
        });

        const configs: [string, PartialConsumeOptions][] = [
          ['/absolute/path/module.js', { shareScope: 'absolute1' }],
          ['/another/absolute/lib.js', { shareScope: 'absolute2' }],
          ['/nonexistent/path.js', { shareScope: 'missing' }],
        ];

        const mockCompilation = {
          resolverFactory: { get: () => ({}) },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [] as CompilationError[],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.resolved.size).toBe(3);
        expect(result.resolved.has('/absolute/path/module.js')).toBe(true);
        expect(result.resolved.has('/another/absolute/lib.js')).toBe(true);
        expect(result.resolved.has('/nonexistent/path.js')).toBe(true);

        expect(
          result.resolved.get('/absolute/path/module.js')?.shareScope,
        ).toBe('absolute1');
        expect(
          result.resolved.get('/another/absolute/lib.js')?.shareScope,
        ).toBe('absolute2');
      });

      it('should treat prefix patterns as prefixed entries under memfs', async () => {
        const configs: [string, PartialConsumeOptions][] = [
          ['@company/', { shareScope: 'company' }],
          ['utils/', { shareScope: 'utilities' }],
          ['components/', { shareScope: 'ui', issuerLayer: 'client' }],
        ];

        const mockCompilation = {
          resolverFactory: { get: () => ({}) },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [] as CompilationError[],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.prefixed.size).toBe(3);
        expect(result.prefixed.has('@company/')).toBe(true);
        expect(result.prefixed.has('utils/')).toBe(true);
        expect(result.prefixed.has('(client)components/')).toBe(true);

        expect(result.prefixed.get('@company/')?.shareScope).toBe('company');
        expect(result.prefixed.get('utils/')?.shareScope).toBe('utilities');
        expect(result.prefixed.get('(client)components/')?.shareScope).toBe(
          'ui',
        );
        expect(result.prefixed.get('(client)components/')?.issuerLayer).toBe(
          'client',
        );
      });

      it('should record regular module names as unresolved under memfs setup', async () => {
        const configs: [string, PartialConsumeOptions][] = [
          ['react', { shareScope: 'default' }],
          ['lodash', { shareScope: 'utilities' }],
          ['@babel/core', { shareScope: 'build', issuerLayer: 'build' }],
        ];

        const mockCompilation = {
          resolverFactory: { get: () => ({}) },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.unresolved.size).toBe(3);
        expect(result.unresolved.has('react')).toBe(true);
        expect(result.unresolved.has('lodash')).toBe(true);
        expect(result.unresolved.has('(build)@babel/core')).toBe(true);

        expect(result.unresolved.get('react')?.shareScope).toBe('default');
        expect(result.unresolved.get('lodash')?.shareScope).toBe('utilities');
        expect(result.unresolved.get('(build)@babel/core')?.shareScope).toBe(
          'build',
        );
        expect(result.unresolved.get('(build)@babel/core')?.issuerLayer).toBe(
          'build',
        );
      });
    });

    describe('complex resolution scenarios', () => {
      it('should handle mixed configuration types with realistic resolution', async () => {
        vol.fromJSON({
          '/test-project/src/local.js': 'export default {};',
          '/absolute/file.js': 'module.exports = {};',
        });

        const configs: [string, PartialConsumeOptions][] = [
          ['./src/local', { shareScope: 'local' }],
          ['/absolute/file.js', { shareScope: 'absolute' }],
          ['@scoped/', { shareScope: 'scoped' }],
          ['regular-module', { shareScope: 'regular' }],
        ];

        const mockCompilation = {
          resolverFactory: {
            get: () => ({
              resolve: (
                context: string,
                basePath: string,
                request: string,
                resolveContext: unknown,
                callback: ResolveCallback,
              ) => {
                const fullPath = path.resolve(basePath, request);

                memfs.fs.access(
                  fullPath + '.js',
                  memfs.fs.constants.F_OK,
                  (err: any) => {
                    if (err) {
                      callback(
                        new Error(`Module not found: ${request}`),
                        false,
                      );
                    } else {
                      callback(null, fullPath + '.js');
                    }
                  },
                );
              },
            }),
          },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [] as CompilationError[],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.resolved.size).toBe(2);
        expect(result.prefixed.size).toBe(1);
        expect(result.unresolved.size).toBe(1);

        expect(result.resolved.has('/test-project/src/local.js')).toBe(true);
        expect(result.resolved.has('/absolute/file.js')).toBe(true);
        expect(result.prefixed.has('@scoped/')).toBe(true);
        expect(result.unresolved.has('regular-module')).toBe(true);
      });

      it('should respect custom request overrides during resolution', async () => {
        vol.fromJSON({
          '/test-project/src/actual-file.js': 'export default {};',
        });

        const configs: [string, PartialConsumeOptions][] = [
          [
            'alias-name',
            {
              shareScope: 'default',
              request: './src/actual-file',
            },
          ],
          [
            'absolute-alias',
            {
              shareScope: 'absolute',
              request: '/test-project/src/actual-file.js',
            },
          ],
          [
            'prefix-alias',
            {
              shareScope: 'prefix',
              request: 'utils/',
            },
          ],
        ];

        const mockCompilation = {
          resolverFactory: {
            get: () => ({
              resolve: (
                context: string,
                basePath: string,
                request: string,
                resolveContext: unknown,
                callback: ResolveCallback,
              ) => {
                const fullPath = path.resolve(basePath, request);

                memfs.fs.access(
                  fullPath + '.js',
                  memfs.fs.constants.F_OK,
                  (err: any) => {
                    if (err) {
                      callback(
                        new Error(`Module not found: ${request}`),
                        false,
                      );
                    } else {
                      callback(null, fullPath + '.js');
                    }
                  },
                );
              },
            }),
          },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [] as CompilationError[],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.resolved.size).toBe(1);
        expect(result.prefixed.size).toBe(1);
        expect(result.unresolved.size).toBe(0);

        expect(result.resolved.has('/test-project/src/actual-file.js')).toBe(
          true,
        );
        expect(result.prefixed.has('utils/')).toBe(true);

        const resolvedConfig = result.resolved.get(
          '/test-project/src/actual-file.js',
        );
        expect(resolvedConfig).toBeDefined();
        expect(resolvedConfig?.request).toBeDefined();
      });
    });

    describe('layer handling with memfs', () => {
      it('should build composite keys for layered modules and prefixes', async () => {
        const configs: [string, PartialConsumeOptions][] = [
          ['react', { shareScope: 'default' }],
          ['react', { shareScope: 'client', issuerLayer: 'client' }],
          ['express', { shareScope: 'server', issuerLayer: 'server' }],
          ['utils/', { shareScope: 'utilities', issuerLayer: 'shared' }],
        ];

        const mockCompilation = {
          resolverFactory: { get: () => ({}) },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.unresolved.size).toBe(3);
        expect(result.prefixed.size).toBe(1);

        expect(result.unresolved.has('react')).toBe(true);
        expect(result.unresolved.has('(client)react')).toBe(true);
        expect(result.unresolved.has('(server)express')).toBe(true);
        expect(result.prefixed.has('(shared)utils/')).toBe(true);

        expect(result.unresolved.get('react')?.issuerLayer).toBeUndefined();
        expect(result.unresolved.get('(client)react')?.issuerLayer).toBe(
          'client',
        );
        expect(result.unresolved.get('(server)express')?.issuerLayer).toBe(
          'server',
        );
        expect(result.prefixed.get('(shared)utils/')?.issuerLayer).toBe(
          'shared',
        );
      });
    });

    describe('dependency tracking with memfs', () => {
      it('should forward resolver dependency sets to the compilation', async () => {
        vol.fromJSON({
          '/test-project/src/component.js': 'export default {};',
        });

        const configs: [string, PartialConsumeOptions][] = [
          ['./src/component', { shareScope: 'default' }],
        ];

        const mockDependencies = {
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
        };

        const mockCompilation = {
          resolverFactory: {
            get: () => ({
              resolve: (
                context: string,
                basePath: string,
                request: string,
                resolveContext: unknown,
                callback: ResolveCallback,
              ) => {
                const typedContext = resolveContext as {
                  fileDependencies: LazySet<string>;
                  contextDependencies: LazySet<string>;
                };
                typedContext.fileDependencies.add(
                  '/test-project/src/component.js',
                );
                typedContext.contextDependencies.add('/test-project/src');

                const fullPath = path.resolve(basePath, request);

                memfs.fs.access(
                  fullPath + '.js',
                  memfs.fs.constants.F_OK,
                  (err: any) => {
                    if (err) {
                      callback(
                        new Error(`Module not found: ${request}`),
                        false,
                      );
                    } else {
                      callback(null, fullPath + '.js');
                    }
                  },
                );
              },
            }),
          },
          compiler: { context: '/test-project' },
          ...mockDependencies,
          errors: [] as CompilationError[],
        };

        await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(mockDependencies.contextDependencies.addAll).toHaveBeenCalled();
        expect(mockDependencies.fileDependencies.addAll).toHaveBeenCalled();
        expect(mockDependencies.missingDependencies.addAll).toHaveBeenCalled();
      });
    });

    describe('edge cases and concurrency with memfs', () => {
      it('should handle an empty configuration array with memfs mocks', async () => {
        const configs: [string, PartialConsumeOptions][] = [];

        const mockCompilation = {
          resolverFactory: { get: () => ({}) },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.resolved.size).toBe(0);
        expect(result.unresolved.size).toBe(0);
        expect(result.prefixed.size).toBe(0);
        expect(mockCompilation.errors).toHaveLength(0);
      });

      it('should propagate resolver factory failures when using memfs', async () => {
        const configs: [string, PartialConsumeOptions][] = [
          ['./src/component', { shareScope: 'default' }],
        ];

        const mockCompilation = {
          resolverFactory: {
            get: () => {
              throw new Error('Resolver factory error');
            },
          },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [] as CompilationError[],
        };

        await expect(
          resolveMatchedConfigs(
            mockCompilation as any,
            toConsumeOptionsArray(configs),
          ),
        ).rejects.toThrow('Resolver factory error');
      });

      it('should resolve multiple files concurrently without errors', async () => {
        vol.fromJSON({
          '/test-project/src/a.js': 'export default "a";',
          '/test-project/src/b.js': 'export default "b";',
          '/test-project/src/c.js': 'export default "c";',
          '/test-project/src/d.js': 'export default "d";',
          '/test-project/src/e.js': 'export default "e";',
        });

        const configs: [string, PartialConsumeOptions][] = [
          ['./src/a', { shareScope: 'a' }],
          ['./src/b', { shareScope: 'b' }],
          ['./src/c', { shareScope: 'c' }],
          ['./src/d', { shareScope: 'd' }],
          ['./src/e', { shareScope: 'e' }],
        ];

        const mockCompilation = {
          resolverFactory: {
            get: () => ({
              resolve: (
                context: string,
                basePath: string,
                request: string,
                resolveContext: unknown,
                callback: ResolveCallback,
              ) => {
                const fullPath = path.resolve(basePath, request);

                setTimeout(() => {
                  memfs.fs.access(
                    fullPath + '.js',
                    memfs.fs.constants.F_OK,
                    (err: any) => {
                      if (err) {
                        callback(
                          new Error(`Module not found: ${request}`),
                          false,
                        );
                      } else {
                        callback(null, fullPath + '.js');
                      }
                    },
                  );
                }, Math.random() * 10);
              },
            }),
          },
          compiler: { context: '/test-project' },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [] as CompilationError[],
        };

        const result = await resolveMatchedConfigs(
          mockCompilation as any,
          toConsumeOptionsArray(configs),
        );

        expect(result.resolved.size).toBe(5);
        expect(mockCompilation.errors).toHaveLength(0);

        ['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
          expect(result.resolved.has(`/test-project/src/${letter}.js`)).toBe(
            true,
          );
          expect(
            result.resolved.get(`/test-project/src/${letter}.js`)?.shareScope,
          ).toBe(letter);
        });
      });
    });
  });
});
