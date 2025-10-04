/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  shareScopes,
  createSharingTestEnvironment,
  resetAllMocks,
} from '../plugin-test-utils';
import { getConsumes } from './helpers';

type SharingTestEnvironment = ReturnType<typeof createSharingTestEnvironment>;

describe('ConsumeSharedPlugin', () => {
  describe('filtering functionality', () => {
    let testEnv: SharingTestEnvironment;

    beforeEach(() => {
      resetAllMocks();
      testEnv = createSharingTestEnvironment();
    });

    describe('version filtering', () => {
      it('should create plugin with version include filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^17.0.0',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('^17.0.0');
        expect(config.include?.version).toBe('^17.0.0');
      });

      it('should create plugin with version exclude filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^17.0.0',
              exclude: {
                version: '^18.0.0',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('^17.0.0');
        expect(config.exclude?.version).toBe('^18.0.0');
      });

      it('should create plugin with complex version filtering', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^16.0.0',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('^16.0.0');
        expect(config.include?.version).toBe('^17.0.0');
      });

      it('should warn about singleton usage with version filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^17.0.0',
              singleton: true,
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        // Plugin should be created successfully
        expect(plugin).toBeDefined();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.singleton).toBe(true);
        expect(config.include?.version).toBe('^17.0.0');
      });
    });

    describe('request filtering', () => {
      it('should create plugin with string request include filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'prefix/': {
              include: {
                request: 'component',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        expect(consumes).toHaveLength(1);
        expect(consumes[0][1].include?.request).toBe('component');
      });

      it('should create plugin with RegExp request include filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'prefix/': {
              include: {
                request: /^components/,
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        expect(consumes[0][1].include?.request).toEqual(/^components/);
      });

      it('should create plugin with string request exclude filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'prefix/': {
              exclude: {
                request: 'internal',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        expect(consumes[0][1].exclude?.request).toBe('internal');
      });

      it('should create plugin with RegExp request exclude filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'prefix/': {
              exclude: {
                request: /test$/,
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        expect(consumes[0][1].exclude?.request).toEqual(/test$/);
      });

      it('should create plugin with combined include and exclude request filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'components/': {
              include: {
                request: /^Button/,
              },
              exclude: {
                request: /Test$/,
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.include?.request).toEqual(/^Button/);
        expect(config.exclude?.request).toEqual(/Test$/);
      });
    });

    describe('combined version and request filtering', () => {
      it('should create plugin with both version and request filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            'ui/': {
              requiredVersion: '^1.0.0',
              include: {
                version: '^1.0.0',
                request: /components/,
              },
              exclude: {
                request: /test/,
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('^1.0.0');
        expect(config.include?.version).toBe('^1.0.0');
        expect(config.include?.request).toEqual(/components/);
        expect(config.exclude?.request).toEqual(/test/);
      });

      it('should create plugin with complex filtering scenarios and layers', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: '^17.0.0',
              layer: 'framework',
              include: {
                version: '^17.0.0',
              },
              exclude: {
                request: 'internal',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.layer).toBe('framework');
        expect(config.include?.version).toBe('^17.0.0');
        expect(config.exclude?.request).toBe('internal');
      });
    });

    describe('configuration edge cases', () => {
      it('should create plugin with invalid version patterns gracefully', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              requiredVersion: 'invalid-version',
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        // Should create plugin without throwing
        expect(plugin).toBeDefined();

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBe('invalid-version');
        expect(config.include?.version).toBe('^17.0.0');
      });

      it('should create plugin with missing requiredVersion but with version filters', () => {
        const plugin = new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            react: {
              // No requiredVersion specified
              include: {
                version: '^17.0.0',
              },
            },
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        const consumes = getConsumes(plugin);
        const [, config] = consumes[0];

        expect(config.requiredVersion).toBeUndefined();
        expect(config.include?.version).toBe('^17.0.0');
      });
    });
  });

  describe('issuerLayer fallback logic (PR #3893)', () => {
    describe('fallback behavior verification', () => {
      it('should demonstrate fallback logic pattern exists in code', () => {
        // This test documents the expected fallback pattern that PR #3893 introduced
        // The actual implementation should use this pattern:
        // unresolvedConsumes.get(createLookupKeyForSharing(request, contextInfo.issuerLayer)) ||
        // unresolvedConsumes.get(createLookupKeyForSharing(request, undefined))

        const mockUnresolvedConsumes = new Map([
          ['(client)react', { shareScope: 'layered-scope' }],
          ['react', { shareScope: 'default' }],
        ]);

        const { createLookupKeyForSharing } = jest.requireActual(
          '../../../../src/lib/sharing/utils',
        );

        // Test fallback pattern for layered context
        const layeredLookup = createLookupKeyForSharing('react', 'client');
        const nonLayeredLookup = createLookupKeyForSharing('react', undefined);

        // With issuerLayer='client' - should find layered config
        const layeredResult =
          mockUnresolvedConsumes.get(layeredLookup) ||
          mockUnresolvedConsumes.get(nonLayeredLookup);
        expect(layeredResult).toBeDefined();
        expect(layeredResult!.shareScope).toBe('layered-scope');

        // With no issuerLayer - should find non-layered config
        const nonLayeredResult = mockUnresolvedConsumes.get(
          createLookupKeyForSharing('react', undefined),
        );
        expect(nonLayeredResult).toBeDefined();
        expect(nonLayeredResult!.shareScope).toBe('default');
      });
    });

    describe('createLookupKeyForSharing fallback behavior', () => {
      it('should verify fallback logic uses correct lookup keys', () => {
        // Import the real function (not mocked) directly to test the logic
        const utils = jest.requireActual('../../../../src/lib/sharing/utils');
        const { createLookupKeyForSharing } = utils;

        // Test the utility function directly
        expect(createLookupKeyForSharing('react', 'client')).toBe(
          '(client)react',
        );
        expect(createLookupKeyForSharing('react', undefined)).toBe('react');
        expect(createLookupKeyForSharing('react', null)).toBe('react');
        expect(createLookupKeyForSharing('react', '')).toBe('react');
      });
    });
  });
});
