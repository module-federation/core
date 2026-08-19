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
});
