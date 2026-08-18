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

  it('registers dynamic shared modules without mutating options', async () => {
    const GM = new ModuleFederation({
      name: '@federation/dynamic-shared',
      remotes: [],
      shared: {},
    });
    const sharedFactory = () => ({ name: 'dynamic-shared' });

    GM.registerShared({
      'dynamic-shared': {
        version: '1.0.0',
        get: () => Promise.resolve(sharedFactory),
      },
    });

    expect(GM.options.shared).toEqual({});
    expect(GM.shareScopeMap.default['dynamic-shared']['1.0.0']).toBeDefined();

    GM.initOptions({
      name: '@federation/dynamic-shared',
      remotes: [],
    });

    expect(GM.options.shared).toEqual({});

    GM.initShareScopeMap('default', {});
    GM.initializeSharing();

    expect(GM.shareScopeMap.default['dynamic-shared']['1.0.0']).toBeDefined();
    const loadedShared = await GM.loadShare<{ name: string }>('dynamic-shared');

    expect(loadedShared).toBe(sharedFactory);
    expect(loadedShared?.()).toEqual({ name: 'dynamic-shared' });
  });

  it('does not mutate configured shared options when registering dynamically', () => {
    const existingFactory = () => ({ name: 'existing-shared' });
    const GM = new ModuleFederation({
      name: '@federation/dynamic-shared-config',
      remotes: [],
      shared: {
        'existing-shared': {
          version: '1.0.0',
          scope: ['default', 'legacy'],
          lib: existingFactory,
          shareConfig: {
            singleton: true,
            requiredVersion: '^1.0.0',
            eager: true,
            strictVersion: true,
          },
        },
      },
    });

    GM.registerShared({
      'existing-shared': {
        version: '2.0.0',
        scope: ['default', 'custom'],
        get: () => Promise.resolve(() => ({ name: 'existing-shared' })),
        shareConfig: {
          singleton: true,
          requiredVersion: '^2.0.0',
          eager: true,
          strictVersion: true,
        },
      },
    });

    expect(GM.options.shared['existing-shared']).toHaveLength(1);
    expect(GM.options.shared['existing-shared'][0]).toMatchObject({
      version: '1.0.0',
      scope: ['default', 'legacy'],
      lib: existingFactory,
      shareConfig: {
        singleton: true,
        requiredVersion: '^1.0.0',
        eager: true,
        strictVersion: true,
      },
    });
    expect(GM.shareScopeMap.custom['existing-shared']['2.0.0']).toBeDefined();
  });

  it('preserves array shared options and re-registration semantics', () => {
    const GM = new ModuleFederation({
      name: '@federation/dynamic-array-shared',
      remotes: [],
      shared: {},
    });
    const shared = {
      'array-shared': [
        {
          version: '1.0.0',
          get: () => Promise.resolve(() => ({ version: '1.0.0' })),
        },
        {
          version: '2.0.0',
          get: () => Promise.resolve(() => ({ version: '2.0.0' })),
        },
      ],
    } as const;

    GM.registerShared(shared);
    expect(GM.options.shared).toEqual({});
    GM.initializeSharing();
    GM.registerShared(shared);

    expect(GM.shareScopeMap.default['array-shared']['1.0.0']).toBeDefined();
    expect(GM.shareScopeMap.default['array-shared']['2.0.0']).toBeDefined();
    expect(GM.options.shared).toEqual({});
  });
});
