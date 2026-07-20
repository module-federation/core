import { describe, it, expect, rs } from '@rstest/core';
import { ModuleFederation, Module } from '../src/index';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import type { ShareScopeMap } from '../src/type';

describe('ModuleFederation', () => {
  it('should initialize with provided arguments', () => {
    const GM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [],
    });
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

  it('preserves inherited share scopes for nested remotes', async () => {
    const react19Scope = {
      react: {
        '19.0.0': {
          version: '19.0.0',
          from: 'host-a',
        },
      },
    } as ShareScopeMap[string];
    const react18Scope = {
      react: {
        '18.0.0': {
          version: '18.0.0',
          from: 'host-a',
        },
      },
    } as ShareScopeMap[string];
    const hostA = new ModuleFederation({
      name: '@federation/host-a',
      remotes: [],
    });
    const containerB = new ModuleFederation({
      name: '@federation/container-b',
      remotes: [],
    });

    hostA.initShareScopeMap('react18-share-scope', react18Scope);
    hostA.initShareScopeMap('react19-share-scope', react19Scope);

    const remoteB = new Module({
      remoteInfo: {
        name: '@federation/remote-b',
        entry: 'http://localhost:3002/remoteEntry.js',
        type: 'global',
        entryGlobalName: '__remote_b__',
        shareScope: 'react18-share-scope',
      },
      host: hostA,
    });
    remoteB.remoteEntryExports = {
      init: rs.fn((shareScope, _initScope, remoteEntryInitOptions) => {
        containerB.initShareScopeMap('react18-share-scope', shareScope, {
          hostShareScopeMap: remoteEntryInitOptions.shareScopeMap,
        });
      }),
      get: rs.fn(),
    } as any;

    await remoteB.init();

    const initRemoteC = rs.fn(
      (shareScope, _initScope, remoteEntryInitOptions) => {
        expect(shareScope).toBe(react19Scope);
        expect(
          remoteEntryInitOptions.shareScopeMap['react18-share-scope'],
        ).toBe(react18Scope);
        expect(
          remoteEntryInitOptions.shareScopeMap['react19-share-scope'],
        ).toBe(react19Scope);
      },
    );
    const remoteC = new Module({
      remoteInfo: {
        name: '@federation/remote-c',
        entry: 'http://localhost:3003/remoteEntry.js',
        type: 'global',
        entryGlobalName: '__remote_c__',
        shareScope: 'react19-share-scope',
      },
      host: containerB,
    });
    remoteC.remoteEntryExports = {
      init: initRemoteC,
      get: rs.fn(),
    } as any;

    await remoteC.init();

    expect(initRemoteC).toHaveBeenCalledTimes(1);
    expect(containerB.shareScopeMap['react18-share-scope']).toBe(react18Scope);
    expect(containerB.shareScopeMap['react19-share-scope']).toBe(react19Scope);
  });
});
