/*
 * @rstest-environment node
 */

import {
  ConsumeSharedPlugin,
  shareScopes,
  createSharingTestEnvironment,
  mockGetDescriptionFile,
  resetAllMocks,
} from '../plugin-test-utils';
import { getConsumes } from './helpers';
import type { DescriptionFileResolver, ResolveFunction } from './helpers';
import type { Mock } from '@rstest/core';

const descriptionFileMock =
  mockGetDescriptionFile as Mock<DescriptionFileResolver>;

const createResolveMock = () => rs.fn<ResolveFunction>();

type SharingTestEnvironment = ReturnType<typeof createSharingTestEnvironment>;

describe('ConsumeSharedPlugin', () => {
  describe('complex resolution scenarios', () => {
    let testEnv: SharingTestEnvironment;

    beforeEach(() => {
      resetAllMocks();
      testEnv = createSharingTestEnvironment();
    });

    describe('async resolution with errors', () => {
      it('should handle resolver.resolve errors gracefully', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'failing-module': {
              import: './failing-path',
              requiredVersion: '^1.0.0',
            },
          },
        });

        // Mock resolver to fail
        const resolveMock = createResolveMock();
        resolveMock.mockImplementation(
          (_context, _lookupStartPath, _request, _resolveContext, callback) => {
            callback(new Error('Module resolution failed'), undefined);
          },
        );
        const mockResolver = { resolve: resolveMock };

        const mockCompilation = {
          ...testEnv.mockCompilation,
          resolverFactory: {
            get: rs.fn(() => mockResolver),
          },
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [],
          warnings: [],
          compiler: {
            context: '/test',
          },
        };

        // Test createConsumeSharedModule with failing resolver
        const createPromise = plugin.createConsumeSharedModule(
          mockCompilation as any,
          '/test/context',
          'failing-module',
          {
            import: './failing-path',
            shareScope: 'default',
            shareKey: 'failing-module',
            requiredVersion: '^1.0.0',
            strictVersion: true,
            packageName: undefined,
            singleton: false,
            eager: false,
            issuerLayer: undefined,
            layer: undefined,
            request: 'failing-module',
            include: undefined,
            exclude: undefined,
            allowNodeModulesSuffixMatch: undefined,
          },
        );

        const result = await createPromise;

        // Should still create module but with undefined import
        expect(result).toBeDefined();
        expect(mockCompilation.errors).toHaveLength(1);
        expect(mockCompilation.errors[0].message).toContain(
          'Module resolution failed',
        );
      });

      it('should handle package.json reading errors during version resolution', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'package-error': {
              // No requiredVersion - will try to read package.json
            },
          },
        });

        // Mock getDescriptionFile to fail
        descriptionFileMock.mockImplementation(
          (_fs, _dir, _files, callback) => {
            callback(new Error('File system error'), undefined);
          },
        );

        // Mock filesystem to fail
        const mockInputFileSystem = {
          readFile: rs.fn(
            (
              _path: string,
              callback: (error: Error | null, data?: string) => void,
            ) => {
              callback(new Error('File system error'), undefined);
            },
          ),
        };

        const mockCompilation = {
          ...testEnv.mockCompilation,
          resolverFactory: {
            get: rs.fn(() => {
              const resolveMock = createResolveMock();
              resolveMock.mockImplementation(
                (
                  _context,
                  _lookupStartPath,
                  _request,
                  _resolveContext,
                  callback,
                ) => {
                  callback(null, '/resolved/path');
                },
              );
              return { resolve: resolveMock };
            }),
          },
          inputFileSystem: mockInputFileSystem,
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [],
          warnings: [],
          compiler: {
            context: '/test',
          },
        };

        const createPromise = plugin.createConsumeSharedModule(
          mockCompilation as any,
          '/test/context',
          'package-error',
          {
            import: undefined,
            shareScope: 'default',
            shareKey: 'package-error',
            requiredVersion: undefined,
            strictVersion: false,
            packageName: undefined,
            singleton: false,
            eager: false,
            issuerLayer: undefined,
            layer: undefined,
            request: 'package-error',
            include: undefined,
            exclude: undefined,
            allowNodeModulesSuffixMatch: undefined,
          },
        );

        const result = await createPromise;

        expect(result).toBeDefined();
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'Unable to read description file',
        );
      });

      it('should handle missing package.json gracefully', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'missing-package': {
              // No requiredVersion - will try to read package.json
            },
          },
        });

        // Mock getDescriptionFile to return null result (no package.json found)
        descriptionFileMock.mockImplementation(
          (_fs, _dir, _files, callback) => {
            callback(null, undefined);
          },
        );

        // Mock inputFileSystem that fails to read
        const mockInputFileSystem = {
          readFile: rs.fn(
            (
              _path: string,
              callback: (error: Error | null, data?: string) => void,
            ) => {
              callback(
                new Error('ENOENT: no such file or directory'),
                undefined,
              );
            },
          ),
        };

        const mockCompilation = {
          ...testEnv.mockCompilation,
          resolverFactory: {
            get: rs.fn(() => {
              const resolveMock = createResolveMock();
              resolveMock.mockImplementation(
                (
                  _context,
                  _lookupStartPath,
                  _request,
                  _resolveContext,
                  callback,
                ) => {
                  callback(null, '/resolved/path');
                },
              );
              return { resolve: resolveMock };
            }),
          },
          inputFileSystem: mockInputFileSystem,
          contextDependencies: { addAll: rs.fn() },
          fileDependencies: { addAll: rs.fn() },
          missingDependencies: { addAll: rs.fn() },
          errors: [],
          warnings: [],
          compiler: {
            context: '/test',
          },
        };

        const createPromise = plugin.createConsumeSharedModule(
          mockCompilation as any,
          '/test/context',
          'missing-package',
          {
            import: undefined,
            shareScope: 'default',
            shareKey: 'missing-package',
            requiredVersion: undefined,
            strictVersion: false,
            packageName: undefined,
            singleton: false,
            eager: false,
            issuerLayer: undefined,
            layer: undefined,
            request: 'missing-package',
            include: undefined,
            exclude: undefined,
            allowNodeModulesSuffixMatch: undefined,
          },
        );

        const result = await createPromise;

        expect(result).toBeDefined();
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'Unable to find description file',
        );
      });
    });

    describe('configuration edge cases', () => {
      it('should handle invalid package names correctly', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            '../invalid-path': {
              packageName: 'valid-package',
            },
          },
        });

        // Should create plugin without throwing
        expect(plugin).toBeDefined();

        const consumes = getConsumes(plugin);
        expect(consumes[0][1].packageName).toBe('valid-package');
      });

      it('should handle minimal valid shareScope', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'a', // Minimal valid shareScope
          consumes: {
            react: '^17.0.0',
          },
        });

        expect(plugin).toBeDefined();

        const consumes = getConsumes(plugin);
        expect(consumes[0][1].shareScope).toBe('a');
      });

      it('should handle complex layer configurations', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'client-module': {
              layer: 'client',
              issuerLayer: 'client',
            },
            'server-module': {
              layer: 'server',
              issuerLayer: 'server',
            },
          },
        });

        expect(plugin).toBeDefined();

        const consumes = getConsumes(plugin);
        expect(consumes).toHaveLength(2);

        const clientModule = consumes.find(([key]) => key === 'client-module');
        const serverModule = consumes.find(([key]) => key === 'server-module');

        expect(clientModule![1].layer).toBe('client');
        expect(clientModule![1].issuerLayer).toBe('client');
        expect(serverModule![1].layer).toBe('server');
        expect(serverModule![1].issuerLayer).toBe('server');
      });
    });

    describe('utility integration tests', () => {
      it('should properly configure allowNodeModulesSuffixMatch', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'node-module': {
              allowNodeModulesSuffixMatch: true,
            },
            'regular-module': {},
          },
        });

        const consumes = getConsumes(plugin);

        const nodeModule = consumes.find(([key]) => key === 'node-module');
        const regularModule = consumes.find(
          ([key]) => key === 'regular-module',
        );

        expect(nodeModule![1].allowNodeModulesSuffixMatch).toBe(true);
        expect(regularModule![1].allowNodeModulesSuffixMatch).toBeUndefined();
      });

      it('should handle multiple shareScope configurations', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'module-1': {
              shareScope: 'custom-1',
            },
            'module-2': {
              shareScope: 'custom-2',
            },
            'module-3': {
              // Uses default shareScope
            },
          },
        });

        const consumes = getConsumes(plugin);

        expect(consumes).toHaveLength(3);

        const module1 = consumes.find(([key]) => key === 'module-1');
        const module2 = consumes.find(([key]) => key === 'module-2');
        const module3 = consumes.find(([key]) => key === 'module-3');

        expect(module1![1].shareScope).toBe('custom-1');
        expect(module2![1].shareScope).toBe('custom-2');
        expect(module3![1].shareScope).toBe('default');
      });
    });

    describe('error scenarios', () => {
      it('should handle invalid configurations gracefully', () => {
        // Test that invalid array input throws error
        expect(() => {
          new ConsumeSharedPlugin({
            shareScope: 'default',
            consumes: {
              // @ts-ignore - intentionally testing invalid input
              invalidModule: ['invalid', 'array'],
            },
          });
        }).toThrow(
          /Invalid options object|should be.*object|should be.*string/,
        );
      });

      it('should handle false import values correctly', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'no-import': {
              import: false,
              shareKey: 'no-import',
            },
          },
        });

        const consumes = getConsumes(plugin);
        expect(consumes[0][1].import).toBeUndefined();
        expect(consumes[0][1].shareKey).toBe('no-import');
      });

      it('should handle false requiredVersion correctly', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'no-version': {
              requiredVersion: false,
            },
          },
        });

        const consumes = getConsumes(plugin);
        expect(consumes[0][1].requiredVersion).toBe(false);
      });
    });

    describe('integration with webpack hooks', () => {
      it('should properly register compilation hooks', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: '^17.0.0',
          },
        });

        plugin.apply(testEnv.compiler);

        // Verify hooks were registered
        expect(testEnv.compiler.hooks.thisCompilation.tap).toHaveBeenCalledWith(
          'ConsumeSharedPlugin',
          expect.any(Function),
        );
      });

      it('should set up dependency factories when applied', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: '^17.0.0',
          },
        });

        // Mock the dependency factories.set method
        const mockSet = rs.fn();
        testEnv.mockCompilation.dependencyFactories.set = mockSet;

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Verify dependency factory was set
        expect(mockSet).toHaveBeenCalled();
      });
    });
  });

  describe('performance and memory tests', () => {
    let testEnv: SharingTestEnvironment;

    beforeEach(() => {
      resetAllMocks();
      testEnv = createSharingTestEnvironment();
    });

    describe('large-scale scenarios', () => {
      it('should handle many consume configurations efficiently', () => {
        const largeConsumes: Record<string, string> = {};
        for (let i = 0; i < 1000; i += 1) {
          largeConsumes[`module-${i}`] = `^${i % 10}.0.0`;
        }

        const startTime = performance.now();

        const plugin = new ConsumeSharedPlugin({
          shareScope: 'performance-test',
          consumes: largeConsumes,
        });

        const endTime = performance.now();
        const constructionTime = endTime - startTime;

        // Should construct efficiently (under 100ms for 1000 modules)
        expect(constructionTime).toBeLessThan(100);
        expect(plugin).toBeDefined();

        // @ts-ignore accessing private property for testing
        expect(getConsumes(plugin)).toHaveLength(1000);
      });

      it('should handle efficient option parsing with many prefix patterns', () => {
        const prefixConsumes: Record<
          string,
          {
            shareScope?: string;
            include?: { request?: RegExp };
          }
        > = {};
        for (let i = 0; i < 100; i += 1) {
          prefixConsumes[`prefix-${i}/`] = {
            shareScope: `scope-${i % 5}`, // Reuse some scopes
            include: {
              request: new RegExp(`^module-${i}`),
            },
          };
        }

        const startTime = performance.now();

        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: prefixConsumes,
        });

        const endTime = performance.now();
        const constructionTime = endTime - startTime;

        // Should construct efficiently (under 100ms for 100 prefix patterns)
        expect(constructionTime).toBeLessThan(100);
        expect(plugin).toBeDefined();

        // @ts-ignore accessing private property for testing
        expect(getConsumes(plugin)).toHaveLength(100);
      });
    });

    describe('memory usage patterns', () => {
      it('should not create unnecessary object instances', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'memory-test',
          consumes: {
            react: '^17.0.0',
            'react-dom': '^17.0.0',
          },
        });

        const consumes = getConsumes(plugin);

        // Should reuse shareScope strings
        expect(consumes[0][1].shareScope).toBe(consumes[1][1].shareScope);
        expect(consumes[0][1].shareScope).toBe('memory-test');
      });

      it('should handle concurrent resolution requests without memory leaks', async () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'concurrent-module': '^1.0.0',
          },
        });

        const compilation = testEnv.mockCompilation;
        const asyncResolveMock = createResolveMock();
        asyncResolveMock.mockImplementation(
          (_context, _lookupStartPath, _request, _resolveContext, callback) => {
            setTimeout(() => callback(null, '/resolved/path'), 1);
          },
        );

        compilation.resolverFactory = {
          get: rs.fn(() => ({ resolve: asyncResolveMock })),
        };
        compilation.inputFileSystem = {} as typeof compilation.inputFileSystem;
        compilation.contextDependencies = { addAll: rs.fn() };
        compilation.fileDependencies = { addAll: rs.fn() };
        compilation.missingDependencies = { addAll: rs.fn() };
        compilation.errors = [];
        compilation.warnings = [];
        compilation.compiler = {
          context: '/test',
        } as typeof compilation.compiler;

        const config = {
          import: undefined,
          shareScope: 'default',
          shareKey: 'concurrent-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'concurrent-module',
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        // Start multiple concurrent resolutions
        const promises: Array<Promise<unknown>> = [];
        for (let i = 0; i < 10; i += 1) {
          promises.push(
            plugin.createConsumeSharedModule(
              compilation,
              '/test/context',
              'concurrent-module',
              config,
            ),
          );
        }

        const results = await Promise.all(promises);

        // All should resolve successfully
        expect(results).toHaveLength(10);
        results.forEach((result) => expect(result).toBeDefined());
      });
    });
  });
});
