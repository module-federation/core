import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ModuleFederation } from '../src/core';
import { addUseIn } from '../src/utils/share';
import { resetFederationGlobalInfo } from '../src/global';
import type { Shared, SharedScope, ShareScopeMap } from '../src/type';

describe('addUseIn Integration Tests', () => {
  let mockHost: ModuleFederation;

  beforeEach(() => {
    // Reset global federation state
    resetFederationGlobalInfo();
  });

  afterEach(() => {
    // Clean up after each test
    resetFederationGlobalInfo();
  });

  describe('Shared Module useIn Tracking', () => {
    it('should track single app usage in useIn array', () => {
      // Create a realistic shared module configuration
      const shared: Shared = {
        from: 'host-app-test',
        useIn: [],
        version: '18.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: true,
          requiredVersion: '^18.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () =>
          Promise.resolve(() => ({
            useState: (initial: any) => [initial, () => {}],
            useEffect: () => {},
            createElement: (type: string, props: any, ...children: any[]) => ({
              type,
              props,
              children,
            }),
            version: '18.0.0',
          })),
        strategy: 'version-first',
        loaded: false,
      };

      // Call addUseIn and verify tracking
      addUseIn(shared);

      expect(shared.useIn).toContain('host-app-test');
      expect(shared.useIn.length).toBe(1);
    });

    it('should track multiple apps using same shared module', () => {
      const reactShared: Shared = {
        from: 'multi-host',
        useIn: [],
        version: '18.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: true,
          requiredVersion: '^18.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({ version: '18.0.0' })),
        strategy: 'version-first',
        loaded: false,
      };

      // First app uses the shared module
      addUseIn(reactShared);
      expect(reactShared.useIn).toContain('multi-host');

      // Second app uses the same shared module (update from)
      reactShared.from = 'multi-consumer';
      addUseIn(reactShared);

      expect(reactShared.useIn).toContain('multi-host');
      expect(reactShared.useIn).toContain('multi-consumer');
      expect(reactShared.useIn.length).toBe(2);
    });

    it('should handle version-first strategy with different versions', () => {
      const react18: Shared = {
        from: 'version-provider',
        useIn: [],
        version: '18.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: true,
          requiredVersion: '^18.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({ version: '18.0.0' })),
        strategy: 'version-first',
        loaded: true,
      };

      const react17: Shared = {
        from: 'version-consumer',
        useIn: [],
        version: '17.0.2',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: true,
          requiredVersion: '^17.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({ version: '17.0.2' })),
        strategy: 'version-first',
        loaded: false, // Not loaded due to version-first choosing 18.0.0
      };

      // In version-first strategy, higher version should be preferred
      addUseIn(react18); // This gets loaded
      addUseIn(react17); // This should still track usage but not be loaded

      // Higher version tracks the app that would use it
      expect(react18.useIn).toContain('version-provider');

      // Lower version still tracks its intended user
      expect(react17.useIn).toContain('version-consumer');

      // In real scenario, both apps would end up using react18
      react18.from = 'version-consumer';
      addUseIn(react18);
      expect(react18.useIn).toContain('version-provider');
      expect(react18.useIn).toContain('version-consumer');
    });

    it('should handle loaded-first strategy', () => {
      const utils20: Shared = {
        from: 'loaded-first',
        useIn: [],
        version: '2.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: true,
          requiredVersion: '^2.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () =>
          Promise.resolve(() => ({
            validate: (data: any) => Boolean(data),
            transform: (data: any) => ({ ...data, providerId: 'provider-app' }),
            version: '2.0.0',
          })),
        strategy: 'loaded-first',
        loaded: true, // First one loaded
      };

      const utils19: Shared = {
        from: 'loaded-second',
        useIn: [],
        version: '1.9.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: true,
          requiredVersion: '^1.9.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({ version: '1.9.0' })),
        strategy: 'loaded-first',
        loaded: false, // Not loaded due to loaded-first strategy
      };

      // First app loads and gets tracked
      addUseIn(utils20);
      expect(utils20.useIn).toContain('loaded-first');
      expect(utils20.loaded).toBe(true);

      // Second app should use the already loaded version
      utils20.from = 'loaded-second';
      addUseIn(utils20);
      expect(utils20.useIn).toContain('loaded-first');
      expect(utils20.useIn).toContain('loaded-second');

      // The unloaded version may still track its intended user
      addUseIn(utils19);
      expect(utils19.useIn).toContain('loaded-second');
    });

    it('should handle synchronous shared module loading', () => {
      const hostUtils: Shared = {
        from: 'sync-test',
        useIn: [],
        version: '1.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: false,
          requiredVersion: '^1.0.0',
          eager: true, // Eager loading should make it available synchronously
          strictVersion: false,
        },
        get: () =>
          Promise.resolve(() => ({
            formatText: (text: string) => `Host Utils: ${text}`,
            timestamp: Date.now(),
          })),
        strategy: 'version-first',
        loaded: true, // Already loaded due to eager: true
      };

      // Synchronous loading should still track usage
      addUseIn(hostUtils);
      expect(hostUtils.useIn).toContain('sync-test');
      expect(hostUtils.loaded).toBe(true);
    });
  });

  describe('ShareScope Integration', () => {
    it('should work with realistic share scope structure', () => {
      // Create a realistic share scope map structure
      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '18.0.0': {
              from: 'host-app',
              useIn: [],
              version: '18.0.0',
              scope: ['default'],
              deps: [],
              shareConfig: {
                singleton: true,
                requiredVersion: '^18.0.0',
                eager: false,
                strictVersion: false,
              },
              get: () => Promise.resolve(() => ({ version: '18.0.0' })),
              strategy: 'version-first',
              loaded: false,
            },
          },
          lodash: {
            '4.17.21': {
              from: 'provider-app',
              useIn: [],
              version: '4.17.21',
              scope: ['default'],
              deps: [],
              shareConfig: {
                singleton: false,
                requiredVersion: '^4.17.0',
                eager: false,
                strictVersion: false,
              },
              get: () => Promise.resolve(() => ({ version: '4.17.21' })),
              strategy: 'version-first',
              loaded: false,
            },
          },
        },
      };

      // Simulate multiple apps using shared modules
      const reactShared = shareScopeMap.default['react']['18.0.0'];
      const lodashShared = shareScopeMap.default['lodash']['4.17.21'];

      // App1 uses both react and lodash
      reactShared.from = 'app1';
      addUseIn(reactShared);
      lodashShared.from = 'app1';
      addUseIn(lodashShared);

      // App2 uses react only
      reactShared.from = 'app2';
      addUseIn(reactShared);

      // App3 uses lodash only
      lodashShared.from = 'app3';
      addUseIn(lodashShared);

      // Verify tracking
      expect(reactShared.useIn).toEqual(['app1', 'app2']);
      expect(lodashShared.useIn).toEqual(['app1', 'app3']);
    });

    it('should handle complex multi-scope scenarios', () => {
      const shared: Shared = {
        from: 'cross-scope-app',
        useIn: [],
        version: '1.0.0',
        scope: ['default', 'custom'],
        deps: [],
        shareConfig: {
          singleton: false,
          requiredVersion: '^1.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({ version: '1.0.0' })),
        strategy: 'version-first',
        loaded: false,
      };

      // Multiple scopes should still track correctly
      addUseIn(shared);
      expect(shared.useIn).toContain('cross-scope-app');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle undefined or null shared module gracefully', () => {
      expect(() => addUseIn(undefined as any)).not.toThrow();
      expect(() => addUseIn(null as any)).not.toThrow();
    });

    it('should handle shared module without from property', () => {
      const shared: Shared = {
        from: undefined as any,
        useIn: [],
        version: '1.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: false,
          requiredVersion: '^1.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        loaded: false,
      };

      expect(() => addUseIn(shared)).not.toThrow();
      expect(shared.useIn).toEqual([]);
    });

    it('should handle duplicate tracking calls', () => {
      const shared: Shared = {
        from: 'duplicate-test',
        useIn: [],
        version: '1.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: false,
          requiredVersion: '^1.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        loaded: false,
      };

      // Call addUseIn multiple times
      addUseIn(shared);
      addUseIn(shared);
      addUseIn(shared);

      // Should only appear once
      expect(shared.useIn).toEqual(['duplicate-test']);
      expect(shared.useIn.length).toBe(1);
    });

    it('should maintain isolation between different shared modules', () => {
      const shared1: Shared = {
        from: 'isolated-app-1',
        useIn: [],
        version: '1.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: false,
          requiredVersion: '^1.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        loaded: false,
      };

      const shared2: Shared = {
        from: 'isolated-app-2',
        useIn: [],
        version: '2.0.0',
        scope: ['default'],
        deps: [],
        shareConfig: {
          singleton: false,
          requiredVersion: '^2.0.0',
          eager: false,
          strictVersion: false,
        },
        get: () => Promise.resolve(() => ({})),
        strategy: 'version-first',
        loaded: false,
      };

      addUseIn(shared1);
      addUseIn(shared2);

      // Each should only track its own app
      expect(shared1.useIn).toEqual(['isolated-app-1']);
      expect(shared2.useIn).toEqual(['isolated-app-2']);
      expect(shared1.useIn).not.toContain('isolated-app-2');
      expect(shared2.useIn).not.toContain('isolated-app-1');
    });
  });
});
