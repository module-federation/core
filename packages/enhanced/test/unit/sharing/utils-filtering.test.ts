/*
 * @jest-environment node
 */

import {
  testRequestFilters,
  extractPathAfterNodeModules,
  createLookupKeyForSharing,
} from '../../../src/lib/sharing/utils';

describe('Filtering utility functions', () => {
  describe('testRequestFilters', () => {
    it('should return true when no filters are provided', () => {
      const result = testRequestFilters('some/module');
      expect(result).toBe(true);
    });

    it('should handle string include filters', () => {
      // Should include exact matches
      expect(testRequestFilters('react', 'react')).toBe(true);
      expect(testRequestFilters('vue', 'react')).toBe(false);

      // Should handle partial matches
      expect(testRequestFilters('lodash', 'lodash')).toBe(true);
      expect(testRequestFilters('lodash/util', 'lodash')).toBe(false);
    });

    it('should handle RegExp include filters', () => {
      const includeFilter = /^react/;

      expect(testRequestFilters('react', includeFilter)).toBe(true);
      expect(testRequestFilters('react-dom', includeFilter)).toBe(true);
      expect(testRequestFilters('vue', includeFilter)).toBe(false);
      expect(testRequestFilters('preact', includeFilter)).toBe(false);
    });

    it('should handle string exclude filters', () => {
      // Should exclude exact matches
      expect(testRequestFilters('react', undefined, 'react')).toBe(false);
      expect(testRequestFilters('vue', undefined, 'react')).toBe(true);

      // Should handle partial matches
      expect(testRequestFilters('lodash', undefined, 'lodash')).toBe(false);
      expect(testRequestFilters('lodash/util', undefined, 'lodash')).toBe(true);
    });

    it('should handle RegExp exclude filters', () => {
      const excludeFilter = /test|spec/;

      expect(testRequestFilters('react', undefined, excludeFilter)).toBe(true);
      expect(testRequestFilters('test-utils', undefined, excludeFilter)).toBe(
        false,
      );
      expect(
        testRequestFilters('component.spec.js', undefined, excludeFilter),
      ).toBe(false);
      expect(
        testRequestFilters('module.test.ts', undefined, excludeFilter),
      ).toBe(false);
    });

    it('should handle both include and exclude filters together', () => {
      const includeFilter = /^@company/;
      const excludeFilter = /test/;

      // Should include matches that pass include and don't match exclude
      expect(
        testRequestFilters('@company/component', includeFilter, excludeFilter),
      ).toBe(true);
      expect(
        testRequestFilters('@company/test-utils', includeFilter, excludeFilter),
      ).toBe(false);
      expect(
        testRequestFilters('@other/component', includeFilter, excludeFilter),
      ).toBe(false);
      expect(
        testRequestFilters('regular-module', includeFilter, excludeFilter),
      ).toBe(false);
    });

    it('should prioritize include filter over exclude filter', () => {
      // If include doesn't match, should return false regardless of exclude
      expect(testRequestFilters('vue', 'react', 'vue')).toBe(false);

      // If include matches but exclude also matches, should return false
      expect(testRequestFilters('react', 'react', 'react')).toBe(false);

      // If include matches and exclude doesn't match, should return true
      expect(testRequestFilters('react', 'react', 'vue')).toBe(true);
    });

    it('should handle complex regex patterns', () => {
      const complexInclude = /^(@scope\/|lodash)/;
      const complexExclude = /(\.test\.|\.spec\.|\/test\/|\/spec\/)/;

      expect(
        testRequestFilters('@scope/component', complexInclude, complexExclude),
      ).toBe(true);
      expect(
        testRequestFilters('lodash/get', complexInclude, complexExclude),
      ).toBe(true);
      expect(
        testRequestFilters(
          '@scope/component.test.js',
          complexInclude,
          complexExclude,
        ),
      ).toBe(false);
      expect(testRequestFilters('react', complexInclude, complexExclude)).toBe(
        false,
      );
      expect(
        testRequestFilters('test/helper', complexInclude, complexExclude),
      ).toBe(false);
    });
  });

  describe('extractPathAfterNodeModules', () => {
    it('should extract path after node_modules', () => {
      const filePath = '/project/node_modules/package/lib/index.js';
      const result = extractPathAfterNodeModules(filePath);
      expect(result).toBe('package/lib/index.js');
    });

    it('should handle paths with multiple node_modules (use last occurrence)', () => {
      const filePath =
        '/project/node_modules/package/node_modules/sub-package/index.js';
      const result = extractPathAfterNodeModules(filePath);
      expect(result).toBe('sub-package/index.js');
    });

    it('should return null for paths without node_modules', () => {
      const filePath = '/project/src/components/Component.js';
      const result = extractPathAfterNodeModules(filePath);
      expect(result).toBeNull();
    });

    it('should handle Windows-style paths', () => {
      const filePath = 'C:\\project\\node_modules\\package\\lib\\index.js';
      const result = extractPathAfterNodeModules(filePath);
      expect(result).toBe('package\\lib\\index.js');
    });

    it('should handle paths ending with node_modules', () => {
      const filePath = '/project/node_modules';
      const result = extractPathAfterNodeModules(filePath);
      expect(result).toBe('');
    });

    it('should handle scoped packages', () => {
      const filePath = '/project/node_modules/@scope/package/lib/index.js';
      const result = extractPathAfterNodeModules(filePath);
      expect(result).toBe('@scope/package/lib/index.js');
    });

    it('should handle nested node_modules with scoped packages', () => {
      const filePath =
        '/project/node_modules/package/node_modules/@scope/sub-package/index.js';
      const result = extractPathAfterNodeModules(filePath);
      expect(result).toBe('@scope/sub-package/index.js');
    });
  });

  describe('createLookupKeyForSharing', () => {
    it('should return request when no layer is provided', () => {
      const result = createLookupKeyForSharing('react');
      expect(result).toBe('react');
    });

    it('should return request when layer is null', () => {
      const result = createLookupKeyForSharing('react', null);
      expect(result).toBe('react');
    });

    it('should return request when layer is undefined', () => {
      const result = createLookupKeyForSharing('react', undefined);
      expect(result).toBe('react');
    });

    it('should create composite key when layer is provided', () => {
      const result = createLookupKeyForSharing('react', 'ssr');
      expect(result).toBe('(ssr)react');
    });

    it('should handle complex requests with layers', () => {
      const result = createLookupKeyForSharing('@scope/package/lib', 'client');
      expect(result).toBe('(client)@scope/package/lib');
    });

    it('should handle empty string layer', () => {
      const result = createLookupKeyForSharing('react', '');
      expect(result).toBe('react');
    });

    it('should handle whitespace-only layer', () => {
      const result = createLookupKeyForSharing('react', '   ');
      expect(result).toBe('(   )react');
    });
  });
});
