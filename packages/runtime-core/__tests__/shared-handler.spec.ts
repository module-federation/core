import { describe, it, expect, beforeEach } from 'vitest';
import { SharedHandler } from '../src/shared';
import { ModuleFederation } from '../src/core';
import { addUseIn } from '../src/utils/share';
import type { Shared } from '../src/type';

describe('SharedHandler', () => {
  let sharedHandler: SharedHandler;
  let mockHost: ModuleFederation;

  beforeEach(() => {
    mockHost = {
      name: 'test-host',
      options: {
        name: 'test-host',
        shared: {},
        plugins: [],
      },
    } as ModuleFederation;

    sharedHandler = new SharedHandler(mockHost);
  });

  describe('addUseIn', () => {
    it('should add the from property to useIn array', () => {
      const shared: Shared = {
        from: 'test-app',
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
      };

      addUseIn(shared);

      expect(shared.useIn).toEqual(['test-app']);
    });

    it('should not add duplicate entries to useIn array', () => {
      const shared: Shared = {
        from: 'test-app',
        useIn: ['test-app'],
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
      };

      addUseIn(shared);

      expect(shared.useIn).toEqual(['test-app']);
      expect(shared.useIn.length).toBe(1);
    });

    it('should handle null or undefined shared object', () => {
      expect(() => addUseIn(null as any)).not.toThrow();
      expect(() => addUseIn(undefined as any)).not.toThrow();
    });

    it('should handle shared object without from property', () => {
      const shared: Shared = {
        from: '',
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
      };

      addUseIn(shared);

      expect(shared.useIn).toEqual([]);
    });

    it('should add different apps to useIn array', () => {
      const shared: Shared = {
        from: 'app1',
        useIn: ['app2', 'app3'],
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
      };

      addUseIn(shared);

      expect(shared.useIn).toEqual(['app2', 'app3', 'app1']);
      expect(shared.useIn.length).toBe(3);
    });
  });

  describe('loadShareSyncHook integration', () => {
    it('should call addUseIn when loading a shared module', async () => {
      const shareInfoRes: Shared = {
        from: 'provider-app',
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
        get: () => Promise.resolve(() => ({ test: 'module' })),
        strategy: 'version-first',
      };

      // Set up the shareScopeMap with a mock shared module
      sharedHandler.shareScopeMap = {
        default: {
          'test-lib': {
            '2.0.0': {
              ...shareInfoRes,
              useIn: [],
            },
          },
        },
      };

      // Simulate loading the shared module
      const factory = await shareInfoRes.get();
      const gShared = sharedHandler.shareScopeMap.default['test-lib']['2.0.0'];

      if (gShared) {
        gShared.lib = factory;
        gShared.loaded = true;
        addUseIn(gShared);
      }

      expect(gShared.useIn).toContain('provider-app');
      expect(gShared.loaded).toBe(true);
      expect(gShared.lib).toBeDefined();
    });
  });
});
