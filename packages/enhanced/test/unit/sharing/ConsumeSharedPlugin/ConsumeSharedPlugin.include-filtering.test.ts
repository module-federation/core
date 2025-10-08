/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  mockGetDescriptionFile,
  resetAllMocks,
} from './shared-test-utils';

describe('ConsumeSharedPlugin', () => {
  describe('include version filtering logic', () => {
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

    it('should include module when version satisfies include filter', async () => {
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
        include: {
          version: '^1.0.0', // Should match
        },
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      };

      mockResolver.resolve.mockImplementation(
        (context, lookupStartPath, request, resolveContext, callback) => {
          callback(null, '/resolved/path/to/test-module');
        },
      );

      // Mock getDescriptionFile to return matching version
      mockGetDescriptionFile.mockImplementation((fs, dir, files, callback) => {
        callback(null, {
          data: { name: 'test-module', version: '1.5.0' },
          path: '/path/to/package.json',
        });
      });

      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
      // Should include the module since 1.5.0 satisfies ^1.0.0
    });

    it('should exclude module when version does not satisfy include filter', async () => {
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
        include: {
          version: '^2.0.0', // Won't match 1.5.0
        },
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      };

      mockResolver.resolve.mockImplementation(
        (context, lookupStartPath, request, resolveContext, callback) => {
          callback(null, '/resolved/path/to/test-module');
        },
      );

      // Mock getDescriptionFile to return non-matching version
      mockGetDescriptionFile.mockImplementation((fs, dir, files, callback) => {
        callback(null, {
          data: { name: 'test-module', version: '1.5.0' },
          path: '/path/to/package.json',
        });
      });

      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeUndefined();
      // Should exclude the module since 1.5.0 does not satisfy ^2.0.0
    });

    it('should generate singleton warning for include version filters', async () => {
      const config = {
        import: './test-module',
        shareScope: 'default',
        shareKey: 'test-module',
        requiredVersion: '^1.0.0',
        strictVersion: true,
        packageName: undefined,
        singleton: true, // Should trigger warning
        eager: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'test-module',
        include: {
          version: '^1.0.0',
        },
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      };

      mockResolver.resolve.mockImplementation(
        (context, lookupStartPath, request, resolveContext, callback) => {
          callback(null, '/resolved/path/to/test-module');
        },
      );

      mockGetDescriptionFile.mockImplementation((fs, dir, files, callback) => {
        callback(null, {
          data: { name: 'test-module', version: '1.5.0' },
          path: '/path/to/package.json',
        });
      });

      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
      expect(mockCompilation.warnings).toHaveLength(1);
      expect(mockCompilation.warnings[0].message).toContain('singleton: true');
      expect(mockCompilation.warnings[0].message).toContain('include.version');
    });

    it('should handle fallback version for include filters', async () => {
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
        include: {
          version: '^2.0.0',
          fallbackVersion: '1.5.0', // Should satisfy ^2.0.0? No, should NOT satisfy
        },
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      };

      mockResolver.resolve.mockImplementation(
        (context, lookupStartPath, request, resolveContext, callback) => {
          callback(null, '/resolved/path/to/test-module');
        },
      );

      mockGetDescriptionFile.mockImplementation((fs, dir, files, callback) => {
        callback(null, {
          data: { name: 'test-module', version: '1.5.0' },
          path: '/path/to/package.json',
        });
      });

      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeUndefined();
      // Should exclude since fallbackVersion 1.5.0 does not satisfy ^2.0.0
    });

    it('should return module when include filter fails but no importResolved', async () => {
      const config = {
        import: undefined, // No import to resolve
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
        include: {
          version: '^2.0.0',
        },
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
      // Should return module since no import to check against
    });
  });
});
