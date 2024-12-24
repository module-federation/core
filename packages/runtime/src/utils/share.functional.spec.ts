import { describe, it, expect, vi } from 'vitest';
import {
  formatShare,
  getRegisteredShare,
  getRegisteredShareFromLayer,
  findSingletonVersionOrderByVersion,
  findSingletonVersionOrderByLoaded,
  getFindShareFunction,
  getGlobalShareScope,
  getTargetSharedOptions,
} from './share';
import { DEFAULT_SCOPE } from '../constant';
import { SyncWaterfallHook } from './hooks';
import type { Shared, ShareScopeMap, ShareInfos, ShareStrategy } from '../type';

// Mock console for warning tests
const mockWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
const mockError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

describe('share utilities', () => {
  describe('formatShare', () => {
    it('should format share with get function', () => {
      const shareArgs = {
        get: () => Promise.resolve(() => ({ version: '1.0.0' })),
        version: '1.0.0',
        shareConfig: {
          requiredVersion: '^1.0.0',
        },
      };

      const result = formatShare(shareArgs, 'test-host', 'test-pkg');

      expect(result).toMatchObject({
        version: '1.0.0',
        from: 'test-host',
        scope: ['default'],
        strategy: 'version-first',
        shareConfig: {
          requiredVersion: '^1.0.0',
          singleton: false,
          eager: false,
          strictVersion: false,
        },
      });
      expect(typeof result.get).toBe('function');
    });

    it('should format share with lib', () => {
      const shareArgs = {
        lib: () => ({ version: '1.0.0' }),
        version: '1.0.0',
        shareConfig: {
          requiredVersion: '^1.0.0',
        },
      };

      const result = formatShare(shareArgs, 'test-host', 'test-pkg');

      expect(result).toMatchObject({
        version: '1.0.0',
        from: 'test-host',
        scope: ['default'],
        loaded: true,
        strategy: 'version-first',
      });
      expect(typeof result.get).toBe('function');
    });

    it('should format share with custom scope and layer', () => {
      const shareArgs = {
        lib: () => ({ version: '1.0.0' }),
        version: '1.0.0',
        scope: ['custom'],
        shareConfig: {
          layer: 'base',
          singleton: true,
          requiredVersion: '^1.0.0',
        },
      };

      const result = formatShare(shareArgs, 'test-host', 'test-pkg');

      expect(result).toMatchObject({
        version: '1.0.0',
        from: 'test-host',
        scope: ['custom'],
        loaded: true,
        strategy: 'version-first',
        shareConfig: {
          layer: 'base',
          singleton: true,
          requiredVersion: '^1.0.0',
        },
      });
    });

    it('should handle string scope by converting to array', () => {
      const shareArgs = {
        lib: () => ({ version: '1.0.0' }),
        version: '1.0.0',
        scope: 'custom',
        shareConfig: {
          requiredVersion: '^1.0.0',
        },
      };

      const result = formatShare(shareArgs, 'test-host', 'test-pkg');

      expect(result.scope).toEqual(['custom']);
    });

    it('should warn when using deprecated strategy in shareArgs', () => {
      const shareArgs = {
        lib: () => ({ version: '1.0.0' }),
        version: '1.0.0',
        strategy: 'loaded-first' as const,
        shareConfig: {
          requiredVersion: '^1.0.0',
        },
      };

      formatShare(shareArgs, 'test-host', 'test-pkg');

      expect(mockWarn).toHaveBeenCalledWith(
        expect.stringContaining('shared.strategy is deprecated'),
      );
    });

    it('should use provided strategy parameter over shareArgs strategy', () => {
      const shareArgs = {
        lib: () => ({ version: '1.0.0' }),
        version: '1.0.0',
        strategy: 'loaded-first' as const,
        shareConfig: {
          requiredVersion: '^1.0.0',
        },
      };

      const result = formatShare(
        shareArgs,
        'test-host',
        'test-pkg',
        'version-first',
      );

      expect(result.strategy).toBe('version-first');
    });

    it('should throw error when neither get nor lib is provided', () => {
      const shareArgs = {
        version: '1.0.0',
        shareConfig: {
          requiredVersion: '^1.0.0',
        },
      };

      const result = formatShare(shareArgs, 'test-host', 'test-pkg');

      expect(typeof result.get).toBe('function');
      expect(result.get()).rejects.toThrow('Can not get shared');
    });
  });

  describe('getRegisteredShare', () => {
    const resolveShare = new SyncWaterfallHook<{
      shareScopeMap: ShareScopeMap;
      scope: string;
      pkgName: string;
      version: string;
      GlobalFederation: any;
      resolver: () => Shared | undefined;
    }>('resolveShare');

    it('should return undefined if no share scope map', () => {
      const result = getRegisteredShare(
        {} as ShareScopeMap,
        'react',
        {
          version: '1.0.0',
          shareConfig: {
            requiredVersion: '^1.0.0',
            singleton: false,
            eager: false,
            strictVersion: false,
          },
          scope: [DEFAULT_SCOPE],
          get: () => Promise.resolve(() => ({})),
          from: 'test',
          deps: [],
          useIn: [],
          loading: null,
          strategy: 'version-first',
        } as Shared,
        resolveShare,
      );

      expect(result).toBeUndefined();
    });

    it('should find share in default scope when no layer', () => {
      const mockShare: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        from: 'test',
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
      };

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': mockShare,
          },
        },
      };

      const shareInfo: Shared = {
        version: '16.0.0',
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShare(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('16.0.0');
      expect(result?.from).toBe('test');
    });

    it('should check layer scope first when layer exists', () => {
      const mockShare16: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const mockShare17: Shared = {
        version: '17.0.0',
        lib: () => ({ version: '17.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^17.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: 'base',
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': mockShare16,
          },
        },
        '(base)default': {
          react: {
            '17.0.0': mockShare17,
          },
        },
      };

      const shareInfo: Shared = {
        version: '16.0.0',
        shareConfig: {
          layer: 'base',
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShare(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('17.0.0'); // Should get from layer scope
    });

    it('should handle multiple scopes', () => {
      const mockShare16: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const mockShare161: Shared = {
        version: '16.0.1',
        lib: () => ({ version: '16.0.1' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
        scope: ['custom'],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': mockShare16,
          },
        },
        custom: {
          react: {
            '16.0.1': mockShare161,
          },
        },
      };

      const shareInfo: Shared = {
        version: '16.0.0',
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          strictVersion: false,
        },
        scope: ['default', 'custom'],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShare(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('16.0.1'); // Should get highest version across scopes
    });

    it('should handle loaded-first strategy', () => {
      const mockShare16: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'loaded-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
        loaded: true,
      };

      const mockShare17: Shared = {
        version: '17.0.0',
        lib: () => ({ version: '17.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^17.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'loaded-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
        loaded: false,
      };

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': mockShare16,
            '17.0.0': mockShare17,
          },
        },
      };

      const shareInfo: Shared = {
        version: '16.0.0',
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'loaded-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShare(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('16.0.0'); // Should get loaded version even though lower
    });

    it('should warn but not error when version mismatch with strictVersion false', () => {
      const mockShare: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': mockShare,
          },
        },
      };

      const shareInfo: Shared = {
        version: '17.0.0',
        shareConfig: {
          singleton: true,
          requiredVersion: '^17.0.0',
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShare(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(mockWarn).toHaveBeenCalledWith(
        expect.stringContaining('does not satisfy'),
      );
      expect(mockError).not.toHaveBeenCalled();
    });

    it('should error when version mismatch with strictVersion true', () => {
      const mockShare: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: true,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': mockShare,
          },
        },
      };

      const shareInfo: Shared = {
        version: '17.0.0',
        shareConfig: {
          singleton: true,
          requiredVersion: '^17.0.0',
          eager: false,
          strictVersion: true,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShare(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(mockError).toHaveBeenCalledWith(
        expect.stringContaining('does not satisfy'),
      );
    });

    it('should handle requiredVersion=false by returning any version', () => {
      const mockShare: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: false,
          singleton: false,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': mockShare,
          },
        },
      };

      const shareInfo: Shared = {
        version: '17.0.0',
        shareConfig: {
          singleton: false,
          requiredVersion: false,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShare(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('16.0.0');
    });

    it('should handle requiredVersion="*" by returning any version', () => {
      const mockShare: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '*',
          singleton: false,
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': mockShare,
          },
        },
      };

      const shareInfo: Shared = {
        version: '17.0.0',
        shareConfig: {
          singleton: false,
          requiredVersion: '*',
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShare(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('16.0.0');
    });
  });

  describe('getRegisteredShareFromLayer', () => {
    const resolveShare = new SyncWaterfallHook<{
      shareScopeMap: ShareScopeMap;
      scope: string;
      pkgName: string;
      version: string;
      GlobalFederation: any;
      resolver: () => Shared | undefined;
    }>('resolveShare');

    it('should return undefined if layer scope does not exist', () => {
      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': {
              version: '16.0.0',
              lib: () => ({ version: '16.0.0' }),
              get: () => Promise.resolve(() => ({})),
              shareConfig: {
                requiredVersion: '^16.0.0',
                singleton: true,
                eager: false,
                strictVersion: false,
              },
              scope: [DEFAULT_SCOPE],
              strategy: 'version-first',
              deps: [],
              useIn: [],
              loading: null,
              from: 'test',
            } as Shared,
          },
        },
      };

      const result = getRegisteredShareFromLayer(
        shareScopeMap,
        'react',
        {
          version: '16.0.0',
          shareConfig: {
            layer: 'base',
            singleton: true,
            requiredVersion: '^16.0.0',
            eager: false,
            strictVersion: false,
          },
          scope: [DEFAULT_SCOPE],
          get: () => Promise.resolve(() => ({})),
          strategy: 'version-first',
          deps: [],
          useIn: [],
          loading: null,
          from: 'test-consumer',
        } as Shared,
        resolveShare,
      );

      expect(result).toBeUndefined();
    });

    it('should find share in layer scope', () => {
      const mockShare: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: 'base',
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {},
        '(base)default': {
          react: {
            '16.0.0': mockShare,
          },
        },
      };

      const shareInfo: Shared = {
        version: '16.0.0',
        shareConfig: {
          layer: 'base',
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShareFromLayer(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('16.0.0');
      expect(result?.shareConfig.layer).toBe('base');
    });

    it('should handle multiple scopes with layer', () => {
      const mockShare16: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: 'base',
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const mockShare17: Shared = {
        version: '17.0.0',
        lib: () => ({ version: '17.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^17.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: 'base',
        },
        scope: ['custom'],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {},
        custom: {},
        '(base)default': {
          react: {
            '16.0.0': mockShare16,
          },
        },
        '(base)custom': {
          react: {
            '17.0.0': mockShare17,
          },
        },
      };

      const shareInfo: Shared = {
        version: '16.0.0',
        shareConfig: {
          layer: 'base',
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE, 'custom'],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShareFromLayer(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('17.0.0'); // Should get highest version across layer scopes
    });

    it('should respect version requirements within layer', () => {
      const mockShare16: Shared = {
        version: '16.0.0',
        lib: () => ({ version: '16.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: 'base',
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const mockShare17: Shared = {
        version: '17.0.0',
        lib: () => ({ version: '17.0.0' }),
        get: () => Promise.resolve(() => ({})),
        shareConfig: {
          requiredVersion: '^17.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: 'base',
        },
        scope: [DEFAULT_SCOPE],
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test',
      };

      const shareScopeMap: ShareScopeMap = {
        default: {},
        '(base)default': {
          react: {
            '16.0.0': mockShare16,
            '17.0.0': mockShare17,
          },
        },
      };

      const shareInfo: Shared = {
        version: '16.0.0',
        shareConfig: {
          layer: 'base',
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          strictVersion: false,
        },
        scope: [DEFAULT_SCOPE],
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        deps: [],
        useIn: [],
        loading: null,
        from: 'test-consumer',
      };

      const result = getRegisteredShareFromLayer(
        shareScopeMap,
        'react',
        shareInfo,
        resolveShare,
      );

      expect(result).toBeDefined();
      expect(result?.version).toBe('16.0.0'); // Should get version that satisfies requirement
    });
  });

  describe('findSingletonVersionOrderByVersion', () => {
    it('should find highest version when none are loaded', () => {
      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': {
              version: '16.0.0',
              loaded: false,
            } as Shared,
            '17.0.0': {
              version: '17.0.0',
              loaded: false,
            } as Shared,
          },
        },
      };

      const result = findSingletonVersionOrderByVersion(
        shareScopeMap,
        'default',
        'react',
      );

      expect(result).toBe('17.0.0');
    });
  });

  describe('findSingletonVersionOrderByLoaded', () => {
    it('should prioritize loaded versions', () => {
      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': {
              version: '16.0.0',
              loaded: true,
            } as Shared,
            '17.0.0': {
              version: '17.0.0',
              loaded: false,
            } as Shared,
          },
        },
      };

      const result = findSingletonVersionOrderByLoaded(
        shareScopeMap,
        'default',
        'react',
      );

      expect(result).toBe('16.0.0');
    });

    it('should choose higher version when multiple are loaded', () => {
      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '16.0.0': {
              version: '16.0.0',
              loaded: true,
            } as Shared,
            '17.0.0': {
              version: '17.0.0',
              loaded: true,
            } as Shared,
          },
        },
      };

      const result = findSingletonVersionOrderByLoaded(
        shareScopeMap,
        'default',
        'react',
      );

      expect(result).toBe('17.0.0');
    });
  });

  describe('getFindShareFunction', () => {
    it('should return findSingletonVersionOrderByLoaded for loaded-first strategy', () => {
      const result = getFindShareFunction('loaded-first');
      expect(result).toBe(findSingletonVersionOrderByLoaded);
    });

    it('should return findSingletonVersionOrderByVersion for version-first strategy', () => {
      const result = getFindShareFunction('version-first');
      expect(result).toBe(findSingletonVersionOrderByVersion);
    });
  });

  describe('getGlobalShareScope', () => {
    it('should return global share scope map', () => {
      const result = getGlobalShareScope();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('getTargetSharedOptions', () => {
    it('should get target shared options', () => {
      const shareInfos: ShareInfos = {
        react: [
          {
            version: '16.0.0',
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
            },
            from: 'test',
            scope: [DEFAULT_SCOPE],
            get: () => Promise.resolve(() => ({})),
            deps: [],
            useIn: [],
            loading: null,
            strategy: 'version-first' as ShareStrategy,
          },
        ],
      };

      const options = {
        pkgName: 'react',
        extraOptions: {
          customShareInfo: {
            version: '16.0.0',
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
            },
          },
        },
        shareInfos,
      };

      const result = getTargetSharedOptions(options);
      expect(result).toEqual({
        singleton: true,
        requiredVersion: '^16.0.0',
      });
    });

    it('should return undefined if no matching options', () => {
      const options = {
        pkgName: 'react',
        extraOptions: {
          customShareInfo: {
            version: '16.0.0',
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
            },
          },
        },
        shareInfos: {} as ShareInfos,
      };

      const result = getTargetSharedOptions(options);
      expect(result).toBeUndefined();
    });
  });
});
