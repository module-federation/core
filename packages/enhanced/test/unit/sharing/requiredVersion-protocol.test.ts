/*
 * @rstest-environment node
 */

import {
  normalizeVersion,
  getRequiredVersionFromDescriptionFile,
  getRawDependencyVersionFromDescriptionFile,
} from '../../../src/lib/sharing/utils';

describe('requiredVersion protocol specifier handling', () => {
  describe('normalizeVersion', () => {
    it('preserves semver ranges from package.json', () => {
      expect(normalizeVersion('^18.2.0')).toBe('^18.2.0');
      expect(normalizeVersion('~1.2.3')).toBe('~1.2.3');
      expect(normalizeVersion('>=1.0.0')).toBe('>=1.0.0');
      expect(normalizeVersion('*')).toBe('*');
      expect(normalizeVersion('1.2.3')).toBe('1.2.3');
    });

    it('returns empty string for package-manager protocol specifiers', () => {
      expect(normalizeVersion('catalog:')).toBe('');
      expect(normalizeVersion('catalog:react')).toBe('');
      expect(normalizeVersion('workspace:*')).toBe('');
      expect(normalizeVersion('workspace:^1.0.0')).toBe('');
      expect(normalizeVersion('npm:react@^18.2.0')).toBe('');
      expect(normalizeVersion('npm:lodash@4')).toBe('');
      expect(normalizeVersion('patch:react@19.0.0#./patches/react.patch')).toBe(
        '',
      );
      expect(normalizeVersion('file:../local-pkg')).toBe('');
      expect(normalizeVersion('link:../local-pkg')).toBe('');
      expect(normalizeVersion('portal:../local-pkg')).toBe('');
    });

    it('still extracts versions from git URL dependencies', () => {
      // Existing normalizeVersion / getGitUrlVersion behavior for git hashes
      const gitHash = normalizeVersion(
        'git+https://github.com/facebook/react.git#v18.2.0',
      );
      expect(gitHash).not.toBe('');
      expect(gitHash).not.toBe('catalog:');
    });
  });

  describe('getRequiredVersionFromDescriptionFile', () => {
    it('returns semver ranges unchanged', () => {
      expect(
        getRequiredVersionFromDescriptionFile(
          { dependencies: { react: '^18.2.0' } },
          'react',
        ),
      ).toBe('^18.2.0');
      expect(
        getRequiredVersionFromDescriptionFile(
          { dependencies: { lodash: '*' } },
          'lodash',
        ),
      ).toBe('*');
    });

    it('returns undefined for protocol specifiers (not catalog:/workspace:*)', () => {
      expect(
        getRequiredVersionFromDescriptionFile(
          { dependencies: { react: 'catalog:' } },
          'react',
        ),
      ).toBeUndefined();
      expect(
        getRequiredVersionFromDescriptionFile(
          { dependencies: { react: 'workspace:*' } },
          'react',
        ),
      ).toBeUndefined();
      expect(
        getRequiredVersionFromDescriptionFile(
          { dependencies: { lodash: 'npm:lodash@4.17.21' } },
          'lodash',
        ),
      ).toBeUndefined();
    });

    it('still exposes the raw protocol string via getRawDependencyVersionFromDescriptionFile', () => {
      const data = { dependencies: { react: 'catalog:' } };
      expect(getRawDependencyVersionFromDescriptionFile(data, 'react')).toBe(
        'catalog:',
      );
    });
  });
});
