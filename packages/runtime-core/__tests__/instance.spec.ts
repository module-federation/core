import { describe, it, expect, rs } from '@rstest/core';
import { ModuleFederation, Module } from '../src/index';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';

describe('ModuleFederation', () => {
  it('should initialize with provided arguments', () => {
    const GM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [],
    });
  });

  it('caches shared factories returned by synchronous getters', () => {
    const factory = () => ({ value: 'shared' });
    const getShared = rs.fn(() => factory);
    const federation = new ModuleFederation({
      name: '@federation/sync-shared-cache',
      remotes: [],
      shared: {
        'sync-shared': {
          version: '1.0.0',
          get: getShared,
        },
      },
    });

    const firstFactory = federation.loadShareSync('sync-shared');
    const secondFactory = federation.loadShareSync('sync-shared');

    expect(firstFactory).toBe(factory);
    expect(secondFactory).toBe(factory);
    expect(getShared).toHaveBeenCalledTimes(1);
    expect(federation.shareScopeMap.default['sync-shared']['1.0.0'].lib).toBe(
      factory,
    );
  });

  it('deduplicates concurrent remote module init', async () => {
    let beforeInitContainerCalls = 0;
    let initContainerCalls = 0;
    const initSpy = rs.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 10)),
    );

    const initCounterPlugin: ModuleFederationRuntimePlugin = {
      name: 'init-counter',
      beforeInitContainer(args) {
        beforeInitContainerCalls += 1;
        return args;
      },
      initContainer(args) {
        initContainerCalls += 1;
        return args;
      },
    };

    const GM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [],
      plugins: [initCounterPlugin],
    });

    const module = new Module({
      remoteInfo: {
        name: '@test/remote',
        entry:
          'http://localhost:1111/resources/main/federation-remote-entry.js',
        type: 'global',
        entryGlobalName: '__test_remote__',
        shareScope: 'default',
      },
      host: GM,
    });

    module.remoteEntryExports = {
      init: initSpy,
      get: rs.fn(),
    } as any;

    const firstInit = module.init('first');
    const secondInit = module.init('second');

    await Promise.all([firstInit, secondInit]);

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(beforeInitContainerCalls).toBe(1);
    expect(initContainerCalls).toBe(1);
    expect(module.inited).toBe(true);
    expect(module.initing).toBe(false);
    expect((module as any).initPromise).toBeUndefined();
  });

  describe('a shared module registered by several containers', () => {
    type SharedLib = { owner: string };
    const sharedLib = (
      owner: string,
      get: () => Promise<() => SharedLib> = () =>
        new Promise((resolve) => {
          const instance = { owner };
          setTimeout(() => resolve(() => instance), 10);
        }),
    ) => ({
      version: '1.0.0',
      shareConfig: { singleton: true, requiredVersion: '^1.0.0' },
      get,
    });
    const joinShareScope = async (
      name: string,
      lib: ReturnType<typeof sharedLib>,
      scope?: ModuleFederation['shareScopeMap'][string],
    ) => {
      const federation = new ModuleFederation({
        name,
        remotes: [],
        shared: { lib },
      });
      if (scope) {
        federation.initShareScopeMap('default', scope);
      }
      await Promise.all(federation.initializeSharing('default'));
      return federation;
    };

    it('keeps a module that is loading when a later container registers the same version', async () => {
      const appA = await joinShareScope('app_a', sharedLib('app_a'));
      const scope = appA.shareScopeMap['default'];
      const libForA = appA.loadShare<SharedLib>('lib');
      while (!scope['lib']['1.0.0'].loading) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // 'app_b' sorts after 'app_a', and app_a's module is loading but not loaded
      const appB = await joinShareScope('app_b', sharedLib('app_b'), scope);
      const libForB = appB.loadShare<SharedLib>('lib');

      const [factoryA, factoryB] = await Promise.all([libForA, libForB]);
      expect(factoryA && factoryA()).toBe(factoryB && factoryB());
      expect(scope['lib']['1.0.0'].from).toBe('app_a');
    });

    it('lets a later container replace a module that failed to load', async () => {
      const appA = await joinShareScope(
        'app_a',
        sharedLib('app_a', () => Promise.reject(new Error('chunk failed'))),
      );
      const scope = appA.shareScopeMap['default'];
      await expect(appA.loadShare<SharedLib>('lib')).rejects.toThrow(
        'chunk failed',
      );

      const appB = await joinShareScope('app_b', sharedLib('app_b'), scope);
      const factoryB = await appB.loadShare<SharedLib>('lib');

      expect(factoryB && factoryB().owner).toBe('app_b');
    });
  });
});
