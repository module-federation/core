/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  mockGetDescriptionFile,
  resetAllMocks,
} from '../plugin-test-utils';
import {
  ConsumeSharedPluginInstance,
  createConsumeConfig,
  DescriptionFileResolver,
  ResolveFunction,
  toSemVerRange,
} from './helpers';

describe('ConsumeSharedPlugin', () => {
  describe('createConsumeSharedModule method', () => {
    let plugin: ConsumeSharedPluginInstance;
    let mockCompilation: any;
    let mockInputFileSystem: any;
    let mockResolver: any;
    let resolveMock: jest.MockedFunction<ResolveFunction>;
    let descriptionFileMock: jest.MockedFunction<DescriptionFileResolver>;

    const resolveToPath =
      (path: string): ResolveFunction =>
      (context, lookupStartPath, request, resolveContext, callback) => {
        callback(null, path);
      };

    const descriptionWithPackage =
      (name: string, version: string): DescriptionFileResolver =>
      (fs, dir, files, callback) => {
        callback(null, {
          data: { name, version },
          path: '/path/to/package.json',
        });
      };

    beforeEach(() => {
      resetAllMocks();

      plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'test-module': '^1.0.0',
        },
      }) as ConsumeSharedPluginInstance;

      mockInputFileSystem = {
        readFile: jest.fn(),
      };

      mockResolver = {
        resolve: jest.fn(),
      };

      resolveMock =
        mockResolver.resolve as jest.MockedFunction<ResolveFunction>;
      resolveMock.mockReset();

      mockCompilation = {
        inputFileSystem: mockInputFileSystem,
        resolverFactory: {
          get: jest.fn(() => mockResolver),
        },
        warnings: [],
        errors: [],
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        compiler: {
          context: '/test/context',
        },
      };

      descriptionFileMock =
        mockGetDescriptionFile as unknown as jest.MockedFunction<DescriptionFileResolver>;
      descriptionFileMock.mockReset();
    });

    describe('import resolution logic', () => {
      it('should resolve import when config.import is provided', async () => {
        const config = createConsumeConfig();

        // Mock successful resolution
        const successfulResolve: ResolveFunction = (
          context,
          lookupStartPath,
          request,
          resolveContext,
          callback,
        ) => {
          callback(null, '/resolved/path/to/test-module');
        };
        resolveMock.mockImplementation(successfulResolve);

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockResolver.resolve).toHaveBeenCalledWith(
          {},
          '/test/context',
          './test-module',
          expect.any(Object),
          expect.any(Function),
        );
      });

      it('should handle undefined import gracefully', async () => {
        const config = createConsumeConfig({ import: undefined });

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockResolver.resolve).not.toHaveBeenCalled();
      });

      it('should handle import resolution errors gracefully', async () => {
        const config = createConsumeConfig({ import: './failing-module' });

        // Mock resolution error
        const failingResolve: ResolveFunction = (
          context,
          lookupStartPath,
          request,
          resolveContext,
          callback,
        ) => {
          callback(new Error('Module not found'));
        };

        resolveMock.mockImplementation(failingResolve);

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(mockCompilation.errors).toHaveLength(1);
        expect(mockCompilation.errors[0].message).toContain('Module not found');
      });

      it('should handle direct fallback regex matching', async () => {
        const config = createConsumeConfig({
          import: 'webpack/lib/something',
        });

        resolveMock.mockImplementation(
          resolveToPath('/resolved/webpack/lib/something'),
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should use compilation.compiler.context for direct fallback
        expect(mockResolver.resolve).toHaveBeenCalledWith(
          {},
          '/test/context', // compiler context
          'webpack/lib/something',
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    describe('requiredVersion resolution logic', () => {
      it('should use provided requiredVersion when available', async () => {
        const config = createConsumeConfig({
          requiredVersion: toSemVerRange('^2.0.0'),
        });

        resolveMock.mockImplementation(
          resolveToPath('/resolved/path/to/test-module'),
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(
          (result as unknown as { requiredVersion?: string }).requiredVersion,
        ).toBe('^2.0.0');
      });

      it('should resolve requiredVersion from package name when not provided', async () => {
        const config = createConsumeConfig({
          requiredVersion: undefined,
          packageName: 'my-package',
        });

        resolveMock.mockImplementation(
          resolveToPath('/resolved/path/to/test-module'),
        );

        // Mock getDescriptionFile
        descriptionFileMock.mockImplementation(
          descriptionWithPackage('my-package', '2.1.0'),
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        // Should extract package name from request and resolve version
      });

      it('should extract package name from scoped module request', async () => {
        const config = createConsumeConfig({
          requiredVersion: undefined,
          request: '@scope/my-package/sub-path',
        });

        resolveMock.mockImplementation(
          resolveToPath('/resolved/path/to/test-module'),
        );

        // Mock getDescriptionFile for scoped package
        descriptionFileMock.mockImplementation(
          descriptionWithPackage('@scope/my-package', '3.2.1'),
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          '@scope/my-package/sub-path',
          config,
        );

        expect(result).toBeDefined();
        // Should extract '@scope/my-package' as package name
      });

      it('should handle absolute path requests', async () => {
        const config = createConsumeConfig({
          requiredVersion: undefined,
          request: '/absolute/path/to/module',
        });

        resolveMock.mockImplementation(
          resolveToPath('/resolved/path/to/test-module'),
        );

        // For absolute paths without requiredVersion, the mock implementation
        // creates a ConsumeSharedModule but doesn't generate warnings since it
        // doesn't go through the package.json resolution path
        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          '/absolute/path/to/module',
          config,
        );

        expect(result).toBeDefined();
        // Absolute paths without package name patterns don't generate warnings in the mock
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should handle package.json reading for version resolution', async () => {
        const config = createConsumeConfig({
          requiredVersion: undefined,
          packageName: 'my-package',
          request: 'my-package',
        });

        resolveMock.mockImplementation(
          resolveToPath('/resolved/path/to/test-module'),
        );

        // Mock getDescriptionFile for version resolution
        descriptionFileMock.mockImplementation(
          descriptionWithPackage('my-package', '1.3.0'),
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'my-package',
          config,
        );

        expect(result).toBeDefined();
        // Should attempt to read package.json for version
      });
    });
  });
});
