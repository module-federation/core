import {
  testRequestFilters,
  addSingletonFilterWarning,
  extractPathAfterNodeModules,
  createLookupKeyForSharing,
} from '../../../src/lib/sharing/utils';
import type { Compilation } from 'webpack';

describe('Filtering Utils', () => {
  describe('testRequestFilters', () => {
    it('should return true when no filters are provided', () => {
      expect(testRequestFilters('test')).toBe(true);
      expect(testRequestFilters('test', undefined, undefined)).toBe(true);
    });

    it('should handle string include filters', () => {
      expect(testRequestFilters('react', 'react')).toBe(true);
      expect(testRequestFilters('react', 'vue')).toBe(false);
      expect(testRequestFilters('react/hooks', 'react')).toBe(false);
    });

    it('should handle RegExp include filters', () => {
      expect(testRequestFilters('react', /^react$/)).toBe(true);
      expect(testRequestFilters('react-dom', /^react/)).toBe(true);
      expect(testRequestFilters('vue', /^react/)).toBe(false);
    });

    it('should handle string exclude filters', () => {
      expect(testRequestFilters('react', undefined, 'react')).toBe(false);
      expect(testRequestFilters('react', undefined, 'vue')).toBe(true);
      expect(testRequestFilters('react/hooks', undefined, 'react')).toBe(true);
    });

    it('should handle RegExp exclude filters', () => {
      expect(testRequestFilters('react', undefined, /^react$/)).toBe(false);
      expect(testRequestFilters('react-dom', undefined, /^react/)).toBe(false);
      expect(testRequestFilters('vue', undefined, /^react/)).toBe(true);
    });

    it('should handle both include and exclude filters', () => {
      // Must pass include AND not match exclude
      expect(testRequestFilters('react-dom', /^react/, /test/)).toBe(true);
      expect(testRequestFilters('vue', /^react/, /test/)).toBe(false); // fails include
      expect(testRequestFilters('react-test', /^react/, /test/)).toBe(false); // matches exclude
    });

    it('should handle complex patterns', () => {
      const remainder = '/components/Button';
      expect(testRequestFilters(remainder, /components/, /Button/)).toBe(false);
      expect(testRequestFilters(remainder, /components/, /Modal/)).toBe(true);
      expect(testRequestFilters(remainder, /utils/, /Button/)).toBe(false);
    });
  });

  describe('addSingletonFilterWarning', () => {
    let mockCompilation: Compilation;

    beforeEach(() => {
      mockCompilation = {
        warnings: [],
      } as unknown as Compilation;
    });

    it('should add warning for include version filter', () => {
      addSingletonFilterWarning(
        mockCompilation,
        'react',
        'include',
        'version',
        '^18.0.0',
        'react',
        '/path/to/react',
      );

      expect(mockCompilation.warnings).toHaveLength(1);
      expect(mockCompilation.warnings[0].message).toContain('react');
      expect(mockCompilation.warnings[0].message).toContain('singleton');
      expect(mockCompilation.warnings[0].message).toContain('include');
      expect(mockCompilation.warnings[0].message).toContain('version');
      expect(mockCompilation.warnings[0].message).toContain('^18.0.0');
    });

    it('should add warning for exclude request filter', () => {
      const regexFilter = /test/;
      addSingletonFilterWarning(
        mockCompilation,
        'react',
        'exclude',
        'request',
        regexFilter,
        'react/test',
        '/path/to/react',
      );

      expect(mockCompilation.warnings).toHaveLength(1);
      expect(mockCompilation.warnings[0].message).toContain('react');
      expect(mockCompilation.warnings[0].message).toContain('singleton');
      expect(mockCompilation.warnings[0].message).toContain('exclude');
      expect(mockCompilation.warnings[0].message).toContain('request');
      expect(mockCompilation.warnings[0].message).toContain('/test/');
    });

    it('should handle missing resource parameter', () => {
      addSingletonFilterWarning(
        mockCompilation,
        'react',
        'include',
        'version',
        '^18.0.0',
        'react',
      );

      expect(mockCompilation.warnings).toHaveLength(1);
      expect(mockCompilation.warnings[0].message).toContain('react');
    });

    it('should handle string filter values', () => {
      addSingletonFilterWarning(
        mockCompilation,
        'lodash',
        'exclude',
        'request',
        'test',
        'lodash/test',
      );

      expect(mockCompilation.warnings).toHaveLength(1);
      expect(mockCompilation.warnings[0].message).toContain('lodash');
      expect(mockCompilation.warnings[0].message).toContain('test');
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

    it('should handle scoped packages', () => {
      const filePath = '/project/node_modules/@scope/package/lib/index.js';
      const result = extractPathAfterNodeModules(filePath);
      expect(result).toBe('@scope/package/lib/index.js');
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
  });
});
