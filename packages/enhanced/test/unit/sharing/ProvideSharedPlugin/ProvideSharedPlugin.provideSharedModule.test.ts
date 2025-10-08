/*
 * @jest-environment node
 */

import { ProvideSharedPlugin } from '../plugin-test-utils';

type CompilationWarning = { message: string; file?: string };
type CompilationErrorRecord = { message: string; file?: string };

describe('ProvideSharedPlugin', () => {
  describe('provideSharedModule method', () => {
    let plugin: InstanceType<typeof ProvideSharedPlugin>;
    let mockCompilation: {
      warnings: CompilationWarning[];
      errors: CompilationErrorRecord[];
    };

    beforeEach(() => {
      plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {},
      });

      mockCompilation = {
        warnings: [],
        errors: [],
      };
    });

    describe('version resolution logic', () => {
      it('should use provided version when available', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0', // Explicitly provided version
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // The key is generated using createLookupKeyForSharing(resource, config.layer)
        // For this test case, it should be the resource path since no layer is specified
        expect(resolvedProvideMap.get('/path/to/module')).toEqual({
          config,
          version: '1.0.0',
          resource: '/path/to/module',
        });
      });

      it('should resolve version from resourceResolveData.descriptionFileData', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
        };
        const resourceResolveData = {
          descriptionFileData: {
            version: '2.1.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          resourceResolveData,
        );

        expect(resolvedProvideMap.get('/path/to/module')).toEqual({
          config,
          version: '2.1.0',
          resource: '/path/to/module',
        });
      });

      it('should generate warning when no version can be resolved', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
        };
        const resourceResolveData = {
          descriptionFileData: {
            // No version in package.json
          },
          descriptionFilePath: '/path/to/package.json',
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          resourceResolveData,
        );

        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'No version specified',
        );
        expect(mockCompilation.warnings[0].file).toBe(
          'shared module test-module -> /path/to/module',
        );
      });

      it('should handle missing resourceResolveData gracefully', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          null, // No resolve data
        );

        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'No resolve data provided from resolver',
        );
      });

      it('should handle missing descriptionFileData gracefully', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
        };
        const resourceResolveData = {
          // No descriptionFileData
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          resourceResolveData,
        );

        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'No description file (usually package.json) found',
        );
      });
    });

    describe('include filtering logic', () => {
      it('should skip module when version include filter fails', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.0.0',
          include: {
            version: '^1.0.0', // 2.0.0 does not satisfy ^1.0.0
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Module should not be added to resolvedProvideMap (no lookup key should exist)
        expect(resolvedProvideMap.size).toBe(0);

        // Should generate warning for debugging (version filter warnings are generated)
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'does not satisfy include filter',
        );
      });

      it('should skip module when request include filter fails', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            request: '/specific/path', // Module path doesn't match
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/different/path/module',
          {},
        );

        // Module should not be added to resolvedProvideMap
        expect(resolvedProvideMap.size).toBe(0);

        // Request include filter failures do NOT generate warnings (only version filter failures do)
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should handle RegExp request include filters', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            request: /\/src\/components\//, // RegExp filter
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/app/src/components/Button.js', // Matches RegExp
          {},
        );

        // Module should be added since it matches the pattern
        // The key is the resource path, not the module name
        expect(resolvedProvideMap.has('/app/src/components/Button.js')).toBe(
          true,
        );
      });

      it('should skip module when RegExp request include filter fails', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            request: /\/src\/components\//, // RegExp filter
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/app/src/utils/helper.js', // Does not match RegExp
          {},
        );

        // Module should not be added
        expect(resolvedProvideMap.size).toBe(0);
        // Request include filter failures do NOT generate warnings
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should handle missing version with include version filter', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
          include: {
            version: '^1.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Should skip due to missing version with version filter
        expect(resolvedProvideMap.has('test-module')).toBe(false);
        expect(mockCompilation.warnings).toHaveLength(2); // Missing version warning + include filter warning
      });
    });

    describe('exclude filtering logic', () => {
      it('should skip module when version exclude filter matches', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          exclude: {
            version: '^1.0.0', // 1.5.0 matches ^1.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Module should not be added
        expect(resolvedProvideMap.has('test-module')).toBe(false);
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'matches exclude filter',
        );
      });

      it('should include module when version exclude filter does not match', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.0.0',
          exclude: {
            version: '^1.0.0', // 2.0.0 does not match ^1.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Module should be added (key is resource path)
        expect(resolvedProvideMap.has('/path/to/module')).toBe(true);
      });

      it('should skip module when request exclude filter matches', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          exclude: {
            request: '/path/to/module', // Exact match for exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Module should not be added
        expect(resolvedProvideMap.size).toBe(0);
        // Request exclude filter matches do NOT generate warnings (only version exclude matches do)
        expect(mockCompilation.warnings).toHaveLength(0);
      });

      it('should handle RegExp request exclude filters', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          exclude: {
            request: /test\.js$/, // RegExp exclude pattern
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module.test.js', // Matches exclude pattern
          {},
        );

        // Module should not be added
        expect(resolvedProvideMap.size).toBe(0);
        expect(mockCompilation.warnings).toHaveLength(0);
      });
    });

    describe('combined filtering scenarios', () => {
      it('should handle both include and exclude version filters', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies this
          },
          exclude: {
            version: '1.5.0', // Exact match exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Should be excluded due to exclude filter
        expect(resolvedProvideMap.size).toBe(0);
        expect(mockCompilation.warnings).toHaveLength(1);
        expect(mockCompilation.warnings[0].message).toContain(
          'matches exclude filter',
        );
      });

      it('should handle combined request and version filters', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            request: /\/src\//,
            version: '^1.0.0',
          },
        };

        // Test with matching path and version
        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/app/src/module.js',
          {},
        );

        expect(resolvedProvideMap.has('/app/src/module.js')).toBe(true);

        // Reset for next test
        resolvedProvideMap.clear();
        mockCompilation.warnings = [];

        // Test with non-matching path
        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/app/lib/module.js',
          {},
        );

        expect(resolvedProvideMap.size).toBe(0);
      });

      it('should generate singleton warning for version filters', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          singleton: true,
          include: {
            version: '^1.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
        );

        // Should add module successfully
        expect(resolvedProvideMap.has('/path/to/module')).toBe(true);

        // Should generate singleton warning
        const singletonWarnings = mockCompilation.warnings.filter((w) =>
          w.message.includes('singleton'),
        );
        expect(singletonWarnings).toHaveLength(1);
        expect(singletonWarnings[0].message).toContain(
          'singleton: true" is used together with "include.version',
        );
      });
    });

    describe('layer support', () => {
      it('should include layer in resolved entry when present', () => {
        const resolvedProvideMap = new Map();
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          layer: 'client',
        };

        // @ts-ignore - accessing private method for testing
        plugin.provideSharedModule(
          mockCompilation,
          resolvedProvideMap,
          'test-module',
          config,
          '/path/to/module',
          {},
          'client', // module layer
        );

        // The key should include the layer: "(client)/path/to/module"
        expect(resolvedProvideMap.has('(client)/path/to/module')).toBe(true);
        const entry = resolvedProvideMap.get('(client)/path/to/module');
        expect(entry.layer).toBe('client');
      });
    });
  });
});
