import { satisfy } from '@module-federation/runtime-tools/runtime-core';

describe('Fallback Version Filtering', () => {
  describe('Include Version Filtering', () => {
    it('should check if fallbackVersion satisfies the include filter version range', () => {
      const includeVersion = '^18.0.0';
      const fallbackVersion = '18.2.0';

      // fallbackVersion satisfies the filter, so module should be included
      expect(satisfy(fallbackVersion, includeVersion)).toBe(true);
    });

    it('should exclude module if fallbackVersion does not satisfy include filter', () => {
      const includeVersion = '^5.0.0';
      const fallbackVersion = '4.17.0';

      // fallbackVersion doesn't satisfy the filter, so module should be excluded
      expect(satisfy(fallbackVersion, includeVersion)).toBe(false);
    });

    it('should handle complex version ranges with fallbackVersion', () => {
      const includeVersion = '>=2.0.0 <3.0.0';

      expect(satisfy('2.5.0', includeVersion)).toBe(true); // should include
      expect(satisfy('1.9.0', includeVersion)).toBe(false); // should exclude
      expect(satisfy('3.0.0', includeVersion)).toBe(false); // should exclude
    });
  });

  describe('Exclude Version Filtering', () => {
    it('should check if fallbackVersion satisfies the exclude filter version range', () => {
      const excludeVersion = '^3.0.0';
      const fallbackVersion = '3.0.0';

      // fallbackVersion satisfies the filter, so module should be excluded
      expect(satisfy(fallbackVersion, excludeVersion)).toBe(true);
    });

    it('should NOT exclude module if fallbackVersion does not satisfy exclude filter', () => {
      const excludeVersion = '^3.0.0';
      const fallbackVersion = '2.6.0';

      // fallbackVersion doesn't satisfy the filter, so module should NOT be excluded
      expect(satisfy(fallbackVersion, excludeVersion)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string fallbackVersion', () => {
      const actualVersion = '1.0.0';
      const fallbackVersion = '';
      const includeVersion = '^1.0.0';

      // Empty string should be ignored, use actual version
      const versionToCheck = fallbackVersion || actualVersion;
      expect(versionToCheck).toBe(actualVersion);
      expect(satisfy(versionToCheck, includeVersion)).toBe(true);
    });

    it('should handle null/undefined actual version with fallbackVersion', () => {
      const actualVersion = undefined;
      const fallbackVersion = '2.0.0';
      const includeVersion = '^2.0.0';

      const versionToCheck = fallbackVersion || actualVersion;
      expect(versionToCheck).toBe(fallbackVersion);
      expect(satisfy(versionToCheck, includeVersion)).toBe(true);
    });

    it('should handle invalid version strings in fallbackVersion', () => {
      const fallbackVersion = 'invalid-version';
      const includeVersion = '^1.0.0';

      // This should throw or return false depending on satisfy implementation
      expect(() => satisfy(fallbackVersion, includeVersion)).toThrow();
    });
  });

  describe('ConsumeSharedPlugin Behavior', () => {
    it('should use fallbackVersion to determine if module satisfies include filter', () => {
      const config = {
        include: {
          version: '^18.0.0',
          fallbackVersion: '18.2.0',
        },
      };

      // Check if fallbackVersion satisfies the include filter
      const shouldInclude = satisfy(
        config.include.fallbackVersion,
        config.include.version,
      );
      expect(shouldInclude).toBe(true); // Module should be included
    });

    it('should use fallbackVersion to determine if module satisfies exclude filter', () => {
      const config = {
        exclude: {
          version: '^3.0.0',
          fallbackVersion: '3.0.0',
        },
      };

      // Check if fallbackVersion satisfies the exclude filter
      const shouldExclude = satisfy(
        config.exclude.fallbackVersion,
        config.exclude.version,
      );
      expect(shouldExclude).toBe(true); // Module should be excluded
    });

    it('should NOT include module if fallbackVersion does not satisfy include filter', () => {
      const config = {
        include: {
          version: '^5.0.0',
          fallbackVersion: '4.17.0',
        },
      };

      const shouldInclude = satisfy(
        config.include.fallbackVersion,
        config.include.version,
      );
      expect(shouldInclude).toBe(false); // Module should NOT be included
    });
  });

  describe('ProvideSharedPlugin Behavior', () => {
    it('should simulate include filter with fallbackVersion for provided modules', () => {
      const config = {
        version: '17.0.0', // Actual version from package.json
        include: {
          version: '^18.0.0',
          fallbackVersion: '18.2.0',
        },
      };

      const versionToCheck = config.include.fallbackVersion || config.version;
      const shouldProvide = satisfy(versionToCheck, config.include.version);

      expect(versionToCheck).toBe('18.2.0');
      expect(shouldProvide).toBe(true);
    });

    it('should simulate exclude filter with fallbackVersion for provided modules', () => {
      const config = {
        version: '18.0.0', // Actual version
        exclude: {
          version: '^16.0.0',
          fallbackVersion: '16.8.0',
        },
      };

      const versionToCheck = config.exclude.fallbackVersion || config.version;
      const shouldExclude = satisfy(versionToCheck, config.exclude.version);

      expect(versionToCheck).toBe('16.8.0');
      expect(shouldExclude).toBe(true); // Should be excluded
    });
  });
});
