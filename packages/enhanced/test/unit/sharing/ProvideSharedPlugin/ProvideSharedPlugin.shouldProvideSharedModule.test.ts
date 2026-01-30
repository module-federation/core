/*
 * @rstest-environment node
 */

import { ProvideSharedPlugin } from '../plugin-test-utils';

describe('ProvideSharedPlugin', () => {
  describe('shouldProvideSharedModule method', () => {
    let plugin: InstanceType<typeof ProvideSharedPlugin>;

    beforeEach(() => {
      plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {},
      });
    });

    describe('version filtering logic', () => {
      it('should return true when no version is provided in config', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          // No version provided
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return true when version is not a string', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: 123, // Non-string version
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return true when no include/exclude filters are defined', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          // No include/exclude filters
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });
    });

    describe('include version filtering', () => {
      it('should return true when version satisfies include filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies ^1.0.0
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return false when version does not satisfy include filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.0.0',
          include: {
            version: '^1.0.0', // 2.0.0 does not satisfy ^1.0.0
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });

      it('should handle invalid semver patterns in include filter gracefully', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          include: {
            version: 'invalid-semver-pattern',
          },
        };

        // Should not throw error and should return based on semver parsing
        // @ts-ignore - accessing private method for testing
        expect(() => plugin.shouldProvideSharedModule(config)).not.toThrow();
      });

      it('should handle complex semver patterns in include filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.3',
          include: {
            version: '>=1.0.0 <2.0.0', // Complex range
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });
    });

    describe('exclude version filtering', () => {
      it('should return true when version does not match exclude filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          exclude: {
            version: '^2.0.0', // 1.0.0 does not match ^2.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return false when version matches exclude filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.1.0',
          exclude: {
            version: '^2.0.0', // 2.1.0 matches ^2.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });

      it('should handle invalid semver patterns in exclude filter gracefully', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0',
          exclude: {
            version: 'invalid-semver-pattern',
          },
        };

        // Should not throw error
        // @ts-ignore - accessing private method for testing
        expect(() => plugin.shouldProvideSharedModule(config)).not.toThrow();
      });

      it('should handle prerelease versions in exclude filter', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0-beta.1',
          exclude: {
            version: '1.0.0-beta.1', // Exact prerelease match
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });
    });

    describe('combined include and exclude filtering', () => {
      it('should return true when version passes both include and exclude filters', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies ^1.0.0
          },
          exclude: {
            version: '^2.0.0', // 1.5.0 does not match ^2.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should return false when version fails include filter even if exclude passes', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '2.0.0',
          include: {
            version: '^1.0.0', // 2.0.0 does not satisfy ^1.0.0
          },
          exclude: {
            version: '^3.0.0', // 2.0.0 does not match ^3.0.0 exclusion (would pass exclude)
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });

      it('should return false when version fails exclude filter even if include passes', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '^1.0.0', // 1.5.0 satisfies ^1.0.0 (would pass include)
          },
          exclude: {
            version: '^1.0.0', // 1.5.0 matches ^1.0.0 exclusion
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(false);
      });

      it('should handle edge case with empty string version', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '',
          include: {
            version: '^1.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        // Empty string version should be treated as no version
        expect(result).toBe(true);
      });

      it('should handle null version values', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: null,
          include: {
            version: '^1.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        // Null version should be treated as no version
        expect(result).toBe(true);
      });

      it('should handle undefined version values', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: undefined,
          include: {
            version: '^1.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        // Undefined version should be treated as no version
        expect(result).toBe(true);
      });
    });

    describe('edge cases and special scenarios', () => {
      it('should handle multiple version filters', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.5.0',
          include: {
            version: '>=1.0.0 <2.0.0 || >=3.0.0 <4.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should handle exact version matches', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.2.3',
          include: {
            version: '1.2.3', // Exact match
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });

      it('should handle version with metadata', () => {
        const config = {
          shareScope: 'default',
          shareKey: 'test-module',
          version: '1.0.0+build123',
          include: {
            version: '^1.0.0',
          },
        };

        // @ts-ignore - accessing private method for testing
        const result = plugin.shouldProvideSharedModule(config);

        expect(result).toBe(true);
      });
    });
  });
});
