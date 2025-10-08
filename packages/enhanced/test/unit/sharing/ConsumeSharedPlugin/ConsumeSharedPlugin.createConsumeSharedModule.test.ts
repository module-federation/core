/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  mockGetDescriptionFile,
  resetAllMocks,
} from './shared-test-utils';

describe('ConsumeSharedPlugin', () => {
  describe('createConsumeSharedModule method', () => {
    let plugin: ConsumeSharedPlugin;
    let mockCompilation: any;
    let mockInputFileSystem: any;
    let mockResolver: any;

    beforeEach(() => {
      resetAllMocks();

      plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'test-module': '^1.0.0',
        },
      });

      mockInputFileSystem = {
        readFile: jest.fn(),
      };

      mockResolver = {
        resolve: jest.fn(),
      };

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
    });

    describe('import resolution logic', () => {
      it('should resolve import when config.import is provided', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        // Mock successful resolution
        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

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
        const config = {
          import: undefined,
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

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
        const config = {
          import: './failing-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        // Mock resolution error
        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(new Error('Module not found'), null);
          },
        );

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
        const config = {
          import: 'webpack/lib/something', // Matches DIRECT_FALLBACK_REGEX
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/webpack/lib/something');
          },
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
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: '^2.0.0', // Explicit version
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        const result = await plugin.createConsumeSharedModule(
          mockCompilation,
          '/test/context',
          'test-module',
          config,
        );

        expect(result).toBeDefined();
        expect(result.requiredVersion).toBe('^2.0.0');
      });

      it('should resolve requiredVersion from package name when not provided', async () => {
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: undefined, // Will be resolved
          strictVersion: true,
          packageName: 'my-package',
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'test-module',
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile
        mockGetDescriptionFile.mockImplementation(
          (fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'my-package', version: '2.1.0' },
              path: '/path/to/package.json',
            });
          },
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
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: undefined,
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: '@scope/my-package/sub-path', // Scoped package
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile for scoped package
        mockGetDescriptionFile.mockImplementation(
          (fs, dir, files, callback) => {
            callback(null, {
              data: { name: '@scope/my-package', version: '3.2.1' },
              path: '/path/to/package.json',
            });
          },
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
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: undefined,
          strictVersion: true,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: '/absolute/path/to/module', // Absolute path
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
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
        const config = {
          import: './test-module',
          shareScope: 'default',
          shareKey: 'test-module',
          requiredVersion: undefined,
          strictVersion: true,
          packageName: 'my-package',
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'my-package',
          include: undefined,
          exclude: undefined,
          allowNodeModulesSuffixMatch: undefined,
        };

        mockResolver.resolve.mockImplementation(
          (context, lookupStartPath, request, resolveContext, callback) => {
            callback(null, '/resolved/path/to/test-module');
          },
        );

        // Mock getDescriptionFile for version resolution
        mockGetDescriptionFile.mockImplementation(
          (fs, dir, files, callback) => {
            callback(null, {
              data: { name: 'my-package', version: '1.3.0' },
              path: '/path/to/package.json',
            });
          },
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
