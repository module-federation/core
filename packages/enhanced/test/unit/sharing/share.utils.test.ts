/*
 * @jest-environment node
 */

import {
  normalizeVersion,
  getRequiredVersionFromDescriptionFile,
  normalizeConsumeShareOptions,
} from '../../../src/lib/sharing/utils';
import type { ConsumeOptions } from '../../../src/declarations/plugins/sharing/ConsumeSharedModule';

describe('share utils', () => {
  describe('normalizeVersion', () => {
    it('should return the same version for semver versions', () => {
      expect(normalizeVersion('1.0.0')).toBe('1.0.0');
      expect(normalizeVersion('^1.0.0')).toBe('^1.0.0');
      expect(normalizeVersion('~1.0.0')).toBe('~1.0.0');
      expect(normalizeVersion('>=1.0.0')).toBe('>=1.0.0');
    });

    it('should handle GitHub URLs', () => {
      expect(normalizeVersion('github:foo/bar#v1.0.0')).toBe('v1.0.0');
      expect(normalizeVersion('foo/bar#v1.0.0')).toBe('v1.0.0');
      expect(normalizeVersion('git+https://github.com/foo/bar#v1.0.0')).toBe(
        'v1.0.0',
      );
    });

    it('should handle empty or invalid inputs', () => {
      expect(normalizeVersion('')).toBe('');
      expect(normalizeVersion('  ')).toBe('');
      expect(normalizeVersion(null as any)).toBe('');
      expect(normalizeVersion(undefined as any)).toBe('');
    });
  });

  describe('getRequiredVersionFromDescriptionFile', () => {
    it('should get version from dependencies', () => {
      const data = {
        dependencies: {
          'package-a': '1.0.0',
        },
      };
      expect(getRequiredVersionFromDescriptionFile(data, 'package-a')).toBe(
        '1.0.0',
      );
    });

    it('should get version from optionalDependencies with highest priority', () => {
      const data = {
        dependencies: {
          'package-a': '1.0.0',
        },
        optionalDependencies: {
          'package-a': '2.0.0',
        },
      };
      expect(getRequiredVersionFromDescriptionFile(data, 'package-a')).toBe(
        '2.0.0',
      );
    });

    it('should get version from peerDependencies if not in dependencies', () => {
      const data = {
        peerDependencies: {
          'package-a': '1.0.0',
        },
      };
      expect(getRequiredVersionFromDescriptionFile(data, 'package-a')).toBe(
        '1.0.0',
      );
    });

    it('should get version from devDependencies if not in other dependency types', () => {
      const data = {
        devDependencies: {
          'package-a': '1.0.0',
        },
      };
      expect(getRequiredVersionFromDescriptionFile(data, 'package-a')).toBe(
        '1.0.0',
      );
    });

    it('should return undefined if package not found', () => {
      const data = {
        dependencies: {
          'package-b': '1.0.0',
        },
      };
      expect(
        getRequiredVersionFromDescriptionFile(data, 'package-a'),
      ).toBeUndefined();
    });

    it('should normalize git URLs in dependencies', () => {
      const data = {
        dependencies: {
          'package-a': 'github:foo/bar#v1.0.0',
        },
      };
      expect(getRequiredVersionFromDescriptionFile(data, 'package-a')).toBe(
        'v1.0.0',
      );
    });
  });

  describe('normalizeConsumeShareOptions', () => {
    it('should normalize options with defaults', () => {
      const options: ConsumeOptions = {
        import: 'package-a',
      };

      const result = normalizeConsumeShareOptions(options);

      expect(result).toEqual({
        shareConfig: {
          fixedDependencies: false,
          requiredVersion: false,
          strictVersion: undefined,
          singleton: false,
          eager: undefined,
          layer: undefined,
        },
        shareScope: undefined,
        shareKey: undefined,
      });
    });

    it('should preserve all provided options', () => {
      const options: ConsumeOptions = {
        import: 'package-a',
        requiredVersion: '1.0.0',
        strictVersion: true,
        singleton: true,
        eager: true,
        shareKey: 'custom-key',
        shareScope: 'custom-scope',
        layer: 'custom-layer',
      };

      const result = normalizeConsumeShareOptions(options);

      expect(result).toEqual({
        shareConfig: {
          fixedDependencies: false,
          requiredVersion: '1.0.0',
          strictVersion: true,
          singleton: true,
          eager: true,
          layer: 'custom-layer',
        },
        shareScope: 'custom-scope',
        shareKey: 'custom-key',
      });
    });
  });
});
