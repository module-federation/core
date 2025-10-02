/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  createMockCompilation,
  mockGetDescriptionFile,
  resetAllMocks,
} from '../plugin-test-utils';
import type { ResolveFunction, DescriptionFileResolver } from './helpers';

const descriptionFileMock =
  mockGetDescriptionFile as jest.MockedFunction<DescriptionFileResolver>;

describe('ConsumeSharedPlugin', () => {
  describe('include version filtering logic', () => {
    let plugin: InstanceType<typeof ConsumeSharedPlugin>;
    let mockCompilation: ReturnType<
      typeof createMockCompilation
    >['mockCompilation'];
    let mockResolver: {
      resolve: jest.Mock<
        ReturnType<ResolveFunction>,
        Parameters<ResolveFunction>
      >;
    };

    const successResolve: ResolveFunction = (
      _context,
      _lookupStartPath,
      _request,
      _resolveContext,
      callback,
    ) => {
      callback(null, '/resolved/path/to/test-module');
    };

    const descriptionWithVersion =
      (version: string): DescriptionFileResolver =>
      (_fs, _dir, _files, callback) => {
        callback(null, {
          data: { name: 'test-module', version },
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
      });

      mockResolver = {
        resolve: jest.fn<
          ReturnType<ResolveFunction>,
          Parameters<ResolveFunction>
        >(),
      };
      mockCompilation = createMockCompilation().mockCompilation;
      mockCompilation.inputFileSystem.readFile = jest.fn();
      mockCompilation.resolverFactory = {
        get: jest.fn(() => mockResolver),
      };
      mockCompilation.warnings = [];
      mockCompilation.errors = [];
      mockCompilation.contextDependencies = { addAll: jest.fn() };
      mockCompilation.fileDependencies = { addAll: jest.fn() };
      mockCompilation.missingDependencies = { addAll: jest.fn() };
      mockCompilation.compiler = { context: '/test/context' };
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
        nodeModulesReconstructedLookup: undefined,
      };

      mockResolver.resolve.mockImplementation(successResolve);

      // Mock getDescriptionFile to return matching version
      descriptionFileMock.mockImplementation(descriptionWithVersion('1.5.0'));

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
        nodeModulesReconstructedLookup: undefined,
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
        nodeModulesReconstructedLookup: undefined,
      };

      mockResolver.resolve.mockImplementation(successResolve);

      descriptionFileMock.mockImplementation(descriptionWithVersion('1.5.0'));

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
        nodeModulesReconstructedLookup: undefined,
      };

      mockResolver.resolve.mockImplementation(successResolve);

      descriptionFileMock.mockImplementation(descriptionWithVersion('1.5.0'));

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
        nodeModulesReconstructedLookup: undefined,
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
