/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  mockGetDescriptionFile,
  resetAllMocks,
} from './shared-test-utils';

describe('ConsumeSharedPlugin', () => {
  describe('exclude version filtering logic', () => {
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

    it('should include module when version does not match exclude filter', async () => {
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
        exclude: {
          version: '^2.0.0', // Won't match 1.5.0
        },
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
      // Should include the module since 1.5.0 does not match ^2.0.0 exclude
    });

    it('should exclude module when version matches exclude filter', async () => {
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
        exclude: {
          version: '^1.0.0', // Will match 1.5.0
        },
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
      // Should exclude the module since 1.5.0 matches ^1.0.0 exclude
    });

    it('should generate singleton warning for exclude version filters', async () => {
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
        include: undefined,
        exclude: {
          version: '^2.0.0', // Won't match, so module included and warning generated
        },
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
      expect(mockCompilation.warnings[0].message).toContain('exclude.version');
    });

    it('should handle fallback version for exclude filters - include when fallback matches', async () => {
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
        exclude: {
          version: '^1.0.0',
          fallbackVersion: '1.5.0', // This should match ^1.0.0, so exclude
        },
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

      expect(result).toBeUndefined();
      // Should exclude since fallbackVersion 1.5.0 satisfies ^1.0.0 exclude
    });

    it('should handle fallback version for exclude filters - include when fallback does not match', async () => {
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
        exclude: {
          version: '^2.0.0',
          fallbackVersion: '1.5.0', // This should NOT match ^2.0.0, so include
        },
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
      // Should include since fallbackVersion 1.5.0 does not satisfy ^2.0.0 exclude
    });

    it('should return module when exclude filter fails but no importResolved', async () => {
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
        include: undefined,
        exclude: {
          version: '^1.0.0',
        },
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

  describe('package.json reading error scenarios', () => {
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

    it('should handle getDescriptionFile errors gracefully - include filters', async () => {
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

      // Mock getDescriptionFile to return error
      mockGetDescriptionFile.mockImplementation((fs, dir, files, callback) => {
        callback(new Error('File system error'), null);
      });

      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
      // Should return module despite getDescriptionFile error
    });

    it('should handle missing package.json data gracefully - include filters', async () => {
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

      // Mock getDescriptionFile to return null data
      mockGetDescriptionFile.mockImplementation((fs, dir, files, callback) => {
        callback(null, null);
      });

      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        '/test/context',
        'test-module',
        config,
      );

      expect(result).toBeDefined();
      // Should return module when no package.json data available
    });

    it('should handle mismatched package name gracefully - include filters', async () => {
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

      // Mock getDescriptionFile to return mismatched package name
      mockGetDescriptionFile.mockImplementation((fs, dir, files, callback) => {
        callback(null, {
          data: { name: 'different-module', version: '1.5.0' },
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
      // Should return module when package name doesn't match
    });

    it('should handle missing version in package.json gracefully - include filters', async () => {
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

      // Mock getDescriptionFile to return package.json without version
      mockGetDescriptionFile.mockImplementation((fs, dir, files, callback) => {
        callback(null, {
          data: { name: 'test-module' }, // No version
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
      // Should return module when no version in package.json
    });
  });

  describe('combined include and exclude filtering', () => {
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

    it('should handle both include and exclude filters correctly', async () => {
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
          version: '^1.0.0', // 1.5.0 satisfies this
        },
        exclude: {
          version: '^2.0.0', // 1.5.0 does not match this
        },
        allowNodeModulesSuffixMatch: undefined,
      };

      mockResolver.resolve.mockImplementation(
        (context, lookupStartPath, request, resolveData, callback) => {
          callback(null, '/resolved/path/to/test-module');
        },
      );

      // Mock getDescriptionFile for both include and exclude filters
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
      // Should include module since it satisfies include and doesn't match exclude
    });
  });
});
