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

      // Invalid version should return false
      expect(satisfy(fallbackVersion, includeVersion)).toBe(false);
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

    it('should simulate ProvideSharedPlugin filtering logic', () => {
      // Simulate the actual filtering logic used in ProvideSharedPlugin
      const testCases = [
        {
          name: 'include filter passes with fallbackVersion',
          actualVersion: '1.2.0',
          config: {
            include: {
              version: '^2.0.0',
              fallbackVersion: '2.1.0',
            },
          },
          expected: true, // Should provide because fallbackVersion satisfies include
        },
        {
          name: 'include filter fails even with fallbackVersion',
          actualVersion: '1.2.0',
          config: {
            include: {
              version: '^2.0.0',
              fallbackVersion: '1.5.0',
            },
          },
          expected: false, // Should not provide because fallbackVersion doesn't satisfy include
        },
        {
          name: 'exclude filter triggers with fallbackVersion',
          actualVersion: '2.0.0',
          config: {
            exclude: {
              version: '^1.0.0',
              fallbackVersion: '1.5.0',
            },
          },
          expected: false, // Should not provide because fallbackVersion matches exclude
        },
        {
          name: 'exclude filter does not trigger with fallbackVersion',
          actualVersion: '2.0.0',
          config: {
            exclude: {
              version: '^1.0.0',
              fallbackVersion: '3.0.0',
            },
          },
          expected: true, // Should provide because fallbackVersion doesn't match exclude
        },
      ];

      testCases.forEach((testCase) => {
        // Simulate ProvideSharedPlugin include filtering logic
        let shouldProvide = true;

        if (testCase.config.include) {
          let versionIncludeFailed = false;
          if (typeof testCase.config.include.version === 'string') {
            if (
              typeof testCase.actualVersion === 'string' &&
              testCase.actualVersion
            ) {
              if (
                !satisfy(
                  testCase.actualVersion,
                  testCase.config.include.version,
                )
              ) {
                versionIncludeFailed = true;
              }
            } else {
              versionIncludeFailed = true;
            }
          }

          // Check fallback version for include
          if (
            versionIncludeFailed &&
            testCase.config.include &&
            typeof testCase.config.include.fallbackVersion === 'string' &&
            testCase.config.include.fallbackVersion
          ) {
            if (
              satisfy(
                testCase.config.include.fallbackVersion,
                testCase.config.include.version,
              )
            ) {
              versionIncludeFailed = false; // fallbackVersion satisfies, so include
            }
          }

          if (versionIncludeFailed) {
            shouldProvide = false;
          }
        }

        if (testCase.config.exclude && shouldProvide) {
          let versionExcludeMatches = false;
          if (
            typeof testCase.config.exclude.version === 'string' &&
            typeof testCase.actualVersion === 'string' &&
            testCase.actualVersion
          ) {
            if (
              satisfy(testCase.actualVersion, testCase.config.exclude.version)
            ) {
              versionExcludeMatches = true;
            }
          }

          // Check fallback version for exclude
          if (
            !versionExcludeMatches &&
            testCase.config.exclude &&
            typeof testCase.config.exclude.fallbackVersion === 'string' &&
            testCase.config.exclude.fallbackVersion
          ) {
            if (
              satisfy(
                testCase.config.exclude.fallbackVersion,
                testCase.config.exclude.version,
              )
            ) {
              versionExcludeMatches = true; // fallbackVersion satisfies, so exclude
            }
          }

          if (versionExcludeMatches) {
            shouldProvide = false;
          }
        }

        expect(shouldProvide).toBe(testCase.expected);
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple filter combinations with fallbackVersion', () => {
      const scenarios = [
        {
          description: 'Both include and exclude with fallbackVersion',
          actualVersion: '2.5.0',
          include: { version: '^3.0.0', fallbackVersion: '3.1.0' },
          exclude: { version: '^2.0.0', fallbackVersion: '1.0.0' },
          expectedResult: true, // Include fallback satisfies, exclude fallback doesn't
        },
        {
          description:
            'Include passes but exclude also matches with fallbackVersion',
          actualVersion: '1.0.0',
          include: { version: '^2.0.0', fallbackVersion: '2.1.0' },
          exclude: { version: '^2.0.0', fallbackVersion: '2.2.0' },
          expectedResult: false, // Both match, but exclude takes precedence
        },
      ];

      scenarios.forEach((scenario) => {
        // Test the logic for each scenario
        let shouldInclude = true;

        // Include check
        if (scenario.include) {
          let includeFailsWithActual = !satisfy(
            scenario.actualVersion,
            scenario.include.version,
          );
          if (includeFailsWithActual && scenario.include.fallbackVersion) {
            includeFailsWithActual = !satisfy(
              scenario.include.fallbackVersion,
              scenario.include.version,
            );
          }
          if (includeFailsWithActual) {
            shouldInclude = false;
          }
        }

        // Exclude check
        if (scenario.exclude && shouldInclude) {
          let excludeMatchesActual = satisfy(
            scenario.actualVersion,
            scenario.exclude.version,
          );
          if (!excludeMatchesActual && scenario.exclude.fallbackVersion) {
            excludeMatchesActual = satisfy(
              scenario.exclude.fallbackVersion,
              scenario.exclude.version,
            );
          }
          if (excludeMatchesActual) {
            shouldInclude = false;
          }
        }

        expect(shouldInclude).toBe(scenario.expectedResult);
      });
    });

    it('should handle edge cases with empty and invalid versions', () => {
      const edgeCases = [
        {
          description: 'Empty actualVersion with valid fallbackVersion',
          actualVersion: '',
          include: { version: '^1.0.0', fallbackVersion: '1.2.0' },
          expectedResult: true,
        },
        {
          description: 'Invalid actualVersion with valid fallbackVersion',
          actualVersion: 'not-a-version',
          include: { version: '^1.0.0', fallbackVersion: '1.2.0' },
          expectedResult: true,
        },
        {
          description: 'Valid actualVersion with invalid fallbackVersion',
          actualVersion: '1.2.0',
          include: { version: '^2.0.0', fallbackVersion: 'invalid' },
          expectedResult: false, // Actual doesn't satisfy, fallback is invalid
        },
      ];

      edgeCases.forEach((edgeCase) => {
        let shouldInclude = true;

        if (edgeCase.include) {
          let includeFailsWithActual = false;

          // Check if actual version satisfies
          if (
            !edgeCase.actualVersion ||
            !satisfy(edgeCase.actualVersion, edgeCase.include.version)
          ) {
            includeFailsWithActual = true;
          }

          // If actual version fails, try fallback
          if (includeFailsWithActual && edgeCase.include.fallbackVersion) {
            if (
              satisfy(
                edgeCase.include.fallbackVersion,
                edgeCase.include.version,
              )
            ) {
              includeFailsWithActual = false;
            }
          }

          if (includeFailsWithActual) {
            shouldInclude = false;
          }
        }

        expect(shouldInclude).toBe(edgeCase.expectedResult);
      });
    });
  });
});
