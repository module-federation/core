import path from 'path';
import {
  resolveCanonicalShareKey,
  extractSharedKeys,
  CanonicalSharedPlugin,
  clearPackageJsonCache,
  SharedKeysSet,
} from '../src/resolveCanonicalShareKey';

describe('resolveCanonicalShareKey', () => {
  beforeEach(() => {
    clearPackageJsonCache();
  });

  const managersDir = path.resolve(__dirname, '..');
  const managersSrcDir = path.resolve(managersDir, 'src');

  describe('extractSharedKeys', () => {
    it('extracts keys from object form', () => {
      const shared = {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@pkg/foo/bar': { singleton: true },
      };
      const keys = extractSharedKeys(shared);
      expect(keys).toBeInstanceOf(SharedKeysSet);
      expect(Array.from(keys)).toEqual(
        expect.arrayContaining(['react', 'react-dom', '@pkg/foo/bar']),
      );
    });

    it('extracts keys from array form', () => {
      const shared = ['react', 'lodash', { '@pkg/bar': { singleton: true } }];
      const keys = extractSharedKeys(shared);
      expect(Array.from(keys)).toEqual(
        expect.arrayContaining(['react', 'lodash', '@pkg/bar']),
      );
    });

    it('extracts configured request overrides', () => {
      const shared = {
        internal: {
          request: '@scope/pkg/context',
          import: '@scope/pkg/context',
          singleton: true,
        },
      };
      const keys = extractSharedKeys(shared);
      expect(keys.has('internal')).toBe(true);
      expect(keys.has('@scope/pkg/context')).toBe(true);
    });

    it('extracts trailing-slash prefixes into prefixes array', () => {
      const shared = {
        '@scope/pkg/': { singleton: true },
        '@scope/pkg/deep/': { singleton: true },
        'react/': { singleton: true },
      };
      const keys = extractSharedKeys(shared);
      expect(keys.has('@scope/pkg/')).toBe(true);
      expect(keys.prefixes).toEqual([
        '@scope/pkg/deep/',
        '@scope/pkg/',
        'react/',
      ]);
    });

    it('returns empty set for null or undefined', () => {
      expect(extractSharedKeys(null).size).toBe(0);
      expect(extractSharedKeys(undefined).size).toBe(0);
    });
  });

  describe('resolveCanonicalShareKey with repro fixtures', () => {
    it('returns null for non-relative requests', () => {
      const sharedKeys = extractSharedKeys({
        '@module-federation/managers': { singleton: true },
      });
      expect(
        resolveCanonicalShareKey(managersSrcDir, 'lodash', sharedKeys),
      ).toBeNull();
      expect(
        resolveCanonicalShareKey(
          managersSrcDir,
          '@module-federation/managers',
          sharedKeys,
        ),
      ).toBeNull();
    });

    it('resolves relative import of root package when root package is shared', () => {
      const sharedKeys = extractSharedKeys({
        '@module-federation/managers': { singleton: true },
      });
      const result = resolveCanonicalShareKey(
        managersSrcDir,
        './index',
        sharedKeys,
      );
      expect(result).toBe('@module-federation/managers');
    });

    it('resolves relative import of subpath when subpath is shared', () => {
      const sharedKeys = extractSharedKeys({
        '@module-federation/managers/SharedManager': { singleton: true },
      });
      const result = resolveCanonicalShareKey(
        managersSrcDir,
        './SharedManager',
        sharedKeys,
      );
      expect(result).toBe('@module-federation/managers/SharedManager');
    });

    it('resolves relative import when configured via request override', () => {
      const sharedKeys = extractSharedKeys({
        internalManager: {
          request: '@module-federation/managers/SharedManager',
          singleton: true,
        },
      });
      const result = resolveCanonicalShareKey(
        managersSrcDir,
        './SharedManager',
        sharedKeys,
      );
      expect(result).toBe('@module-federation/managers/SharedManager');
    });

    it('resolves relative import matching trailing-slash prefix', () => {
      const sharedKeys = extractSharedKeys({
        '@module-federation/managers/': { singleton: true },
      });
      const result = resolveCanonicalShareKey(
        managersSrcDir,
        './SharedManager',
        sharedKeys,
      );
      expect(result).toBe('@module-federation/managers/SharedManager');
    });

    it('returns null when relative import is not in sharedKeys', () => {
      const sharedKeys = extractSharedKeys({
        '@module-federation/managers/SharedManager': { singleton: true },
      });
      const result = resolveCanonicalShareKey(
        managersSrcDir,
        './ContainerManager',
        sharedKeys,
      );
      expect(result).toBeNull();
    });
  });

  describe('CanonicalSharedPlugin', () => {
    it('registers beforeResolve hook and rewrites relative requests matching sharedKeys', () => {
      const plugin = new CanonicalSharedPlugin({
        '@module-federation/managers/SharedManager': { singleton: true },
      });

      let tapCallback: any;
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: jest.fn((name, fn: any) => {
              const mockNmf = {
                hooks: {
                  beforeResolve: {
                    tap: jest.fn((_subName, subFn: any) => {
                      tapCallback = subFn;
                    }),
                  },
                },
              };
              fn(mockNmf);
            }),
          },
        },
      };

      plugin.apply(mockCompiler);

      expect(mockCompiler.hooks.normalModuleFactory.tap).toHaveBeenCalledWith(
        'CanonicalSharedPlugin',
        expect.any(Function),
      );
      expect(tapCallback).toBeDefined();

      const resolveData = {
        context: managersSrcDir,
        request: './SharedManager',
      };
      tapCallback(resolveData);
      expect(resolveData.request).toBe(
        '@module-federation/managers/SharedManager',
      );

      const nonMatchingData = {
        context: managersSrcDir,
        request: './ContainerManager',
      };
      tapCallback(nonMatchingData);
      expect(nonMatchingData.request).toBe('./ContainerManager');
    });

    it('rewrites relative requests when shared with request override or prefix', () => {
      const plugin = new CanonicalSharedPlugin({
        customAlias: {
          request: '@module-federation/managers/SharedManager',
        },
        '@module-federation/managers/utils/': {
          singleton: true,
        },
      });

      let tapCallback: any;
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: jest.fn((_name, fn: any) => {
              fn({
                hooks: {
                  beforeResolve: {
                    tap: jest.fn((_subName, subFn: any) => {
                      tapCallback = subFn;
                    }),
                  },
                },
              });
            }),
          },
        },
      };

      plugin.apply(mockCompiler);

      const requestOverrideData = {
        context: managersSrcDir,
        request: './SharedManager',
      };
      tapCallback(requestOverrideData);
      expect(requestOverrideData.request).toBe(
        '@module-federation/managers/SharedManager',
      );

      const prefixData = {
        context: managersSrcDir,
        request: './utils',
      };
      tapCallback(prefixData);
      expect(prefixData.request).toBe('@module-federation/managers/utils');
    });

    it('does not register hooks when shared is empty', () => {
      const plugin = new CanonicalSharedPlugin({});
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: jest.fn(),
          },
        },
      };
      plugin.apply(mockCompiler);
      expect(mockCompiler.hooks.normalModuleFactory.tap).not.toHaveBeenCalled();
    });
  });
});
