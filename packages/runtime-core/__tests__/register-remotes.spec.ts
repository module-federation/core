import { assert, describe, it, expect, vi } from 'vitest';
import { ModuleFederation } from '../src/index';
import { Global } from '../src/global';

describe('ModuleFederation', () => {
  it('registers new remotes and loads them correctly', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });

    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');
    // Register new remotes
    FM.registerRemotes([
      {
        name: '@register-remotes/app2',
        entry:
          'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
      },
    ]);
    const app2Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app2/say',
    );
    assert(app2Module);
    const res = await app2Module();
    expect(res).toBe('hello app2');
  });
  it('does not merge loaded remote by default', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    FM.registerRemotes([
      {
        name: '@register-remotes/app1',
        // Entry is different from the registered remote
        entry:
          'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
      },
    ]);

    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');
  });
  it('merges loaded remote by setting "force: true"', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');

    FM.registerRemotes(
      [
        {
          name: '@register-remotes/app1',
          // Entry is different from the registered remote
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
        },
      ],
      { force: true },
    );
    const newApp1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(newApp1Module);
    const newApp1Res = await newApp1Module();
    // Value is different from the registered remote
    expect(newApp1Res).toBe('hello app1 entry2');
  });
  it('reloads manifest snapshots when a manifest remote is force registered with the same entry', async () => {
    const manifestUrl =
      'http://localhost:1111/resources/register-remotes/manifest/federation-manifest.json';
    const manifests = [
      {
        id: '@register-remotes/manifest',
        name: '@register-remotes/manifest',
        metaData: {
          name: '@register-remotes/manifest',
          publicPath: 'http://localhost:1111/',
          type: 'app',
          globalName: '@snapshot/remote1',
          buildInfo: {
            buildVersion: 'first',
          },
          remoteEntry: {
            name: 'federation-remote-entry.js',
            path: 'resources/snapshot/remote1',
          },
          types: {
            name: 'index.d.ts',
            path: './',
          },
        },
        remotes: [],
        shared: [],
        exposes: [],
      },
      {
        id: '@register-remotes/manifest',
        name: '@register-remotes/manifest',
        metaData: {
          name: '@register-remotes/manifest',
          publicPath: 'http://localhost:1111/',
          type: 'app',
          globalName: '@snapshot/remote2',
          buildInfo: {
            buildVersion: 'second',
          },
          remoteEntry: {
            name: 'federation-remote-entry.js',
            path: 'resources/snapshot/remote2',
          },
          types: {
            name: 'index.d.ts',
            path: './',
          },
        },
        remotes: [],
        shared: [],
        exposes: [],
      },
    ];
    const manifestFetch = vi.fn((url: string) => {
      if (url === manifestUrl) {
        return Promise.resolve(
          new Response(
            JSON.stringify(manifests[manifestFetch.mock.calls.length - 1]),
            {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }
    });
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/manifest',
          entry: manifestUrl,
        },
      ],
      plugins: [
        {
          name: 'manifest-fetch',
          fetch: manifestFetch,
        },
      ],
    });

    const appModule = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/manifest/say',
    );
    assert(appModule);
    expect(await appModule()).toBe('hello world "@snapshot/remote1"');

    FM.registerRemotes(
      [
        {
          name: '@register-remotes/manifest',
          entry: manifestUrl,
        },
      ],
      { force: true },
    );

    const nextAppModule = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/manifest/say',
    );
    assert(nextAppModule);
    expect(await nextAppModule()).toBe('hello world "@snapshot/remote2"');
    expect(manifestFetch).toHaveBeenCalledTimes(2);
  });

  it('emits removeRemote hook before force registering an existing remote', () => {
    const removeRemote = vi.fn();
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
      plugins: [
        {
          name: 'remove-remote-test-plugin',
          removeRemote,
        },
      ],
    });

    FM.registerRemotes(
      [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
        },
      ],
      { force: true },
    );

    expect(removeRemote).toHaveBeenCalledWith({
      remote: expect.objectContaining({ name: '@register-remotes/app1' }),
      origin: FM,
    });
  });

  it('removes a registered remote by name and emits removeRemote hook', async () => {
    const removeRemote = vi.fn();
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          alias: 'app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
      plugins: [
        {
          name: 'direct-remove-remote-test-plugin',
          removeRemote,
        },
      ],
    });

    await FM.removeRemote('app1');

    expect(FM.options.remotes).toHaveLength(0);
    expect(removeRemote).toHaveBeenCalledWith({
      remote: expect.objectContaining({
        name: '@register-remotes/app1',
        alias: 'app1',
      }),
      origin: FM,
    });

    await FM.removeRemote('app1');
    expect(removeRemote).toHaveBeenCalledTimes(2);
    expect(removeRemote).toHaveBeenLastCalledWith({
      remote: expect.objectContaining({
        name: 'app1',
      }),
      origin: FM,
    });
  });

  it('clears loaded remote entry cache when removing a remote', async () => {
    const entry =
      'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js';
    const remoteEntryClear = vi.fn();
    const libClear = vi.fn();
    const globalClear = vi.fn();
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          alias: 'app1',
          entry,
        },
      ],
    });

    FM.moduleCache.set('@register-remotes/app1', {
      remoteInfo: {
        name: '@register-remotes/app1',
        alias: 'app1',
        entry,
        type: 'global',
        entryGlobalName: 'app1',
        shareScope: 'default',
      },
      remoteEntryExports: {
        get: vi.fn(),
        init: vi.fn(),
        __webpack_clear_cache__: remoteEntryClear,
      },
      lib: {
        get: vi.fn(),
        init: vi.fn(),
        __webpack_clear_cache__: libClear,
      },
    } as any);
    (globalThis as any).app1 = {
      get: vi.fn(),
      init: vi.fn(),
      __webpack_clear_cache__: globalClear,
    };
    Global.__FEDERATION__.moduleInfo = {
      '@federation/instance:1.0.1': {
        version: '1.0.1',
        remoteEntry: '',
        remotesInfo: {
          '@register-remotes/app1': {
            matchedVersion: entry,
          },
          '@register-remotes/app2': {
            matchedVersion: 'http://localhost:1111/app2/mf-manifest.json',
          },
        },
      },
      [`@register-remotes/app1:${entry}`]: {
        version: entry,
        remoteEntry: 'static/remoteEntry.js',
      },
    } as any;
    Global.__FEDERATION__.__MANIFEST_LOADING__[entry] = Promise.resolve(
      {} as any,
    );
    FM.snapshotHandler.manifestCache.set(entry, {} as any);

    await FM.removeRemote('app1');

    expect(remoteEntryClear).toHaveBeenCalledTimes(1);
    expect(libClear).toHaveBeenCalledTimes(1);
    expect(globalClear).toHaveBeenCalledTimes(1);
    expect(FM.moduleCache.has('@register-remotes/app1')).toBe(false);
    expect((globalThis as any).app1).toBeUndefined();
    expect(
      Global.__FEDERATION__.moduleInfo['@federation/instance:1.0.1']
        .remotesInfo?.['@register-remotes/app1'],
    ).toBeUndefined();
    expect(
      Global.__FEDERATION__.moduleInfo['@federation/instance:1.0.1']
        .remotesInfo?.['@register-remotes/app2'],
    ).toEqual({
      matchedVersion: 'http://localhost:1111/app2/mf-manifest.json',
    });
    expect(
      Global.__FEDERATION__.moduleInfo[`@register-remotes/app1:${entry}`],
    ).toBeUndefined();
    expect(Global.__FEDERATION__.__MANIFEST_LOADING__[entry]).toBeUndefined();
    expect(FM.snapshotHandler.manifestCache.has(entry)).toBe(false);
  });

  it('keeps loaded remote cleanup context when removeRemote hook clears moduleCache first', async () => {
    const entry =
      'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js';
    const remoteEntryClear = vi.fn();
    const libClear = vi.fn();
    const globalClear = vi.fn();
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          alias: 'app1',
          entry,
        },
      ],
      plugins: [
        {
          name: 'module-cache-first-remove-plugin',
          removeRemote({ origin }) {
            origin.moduleCache.delete('@register-remotes/app1');
          },
        },
      ],
    });

    FM.moduleCache.set('@register-remotes/app1', {
      remoteInfo: {
        name: '@register-remotes/app1',
        alias: 'app1',
        entry,
        type: 'global',
        entryGlobalName: 'app1',
        shareScope: 'default',
      },
      remoteEntryExports: {
        get: vi.fn(),
        init: vi.fn(),
        __webpack_clear_cache__: remoteEntryClear,
      },
      lib: {
        get: vi.fn(),
        init: vi.fn(),
        __webpack_clear_cache__: libClear,
      },
    } as any);
    (globalThis as any).app1 = {
      get: vi.fn(),
      init: vi.fn(),
      __webpack_clear_cache__: globalClear,
    };
    Global.__FEDERATION__.moduleInfo = {
      '@federation/instance:1.0.1': {
        version: '1.0.1',
        remoteEntry: '',
        remotesInfo: {
          '@register-remotes/app1': {
            matchedVersion: entry,
          },
        },
      },
      [`@register-remotes/app1:${entry}`]: {
        version: entry,
        remoteEntry: 'static/remoteEntry.js',
      },
    } as any;
    Global.__FEDERATION__.__MANIFEST_LOADING__[entry] = Promise.resolve(
      {} as any,
    );
    FM.snapshotHandler.manifestCache.set(entry, {} as any);

    await FM.removeRemote('app1');

    expect(remoteEntryClear).toHaveBeenCalledTimes(1);
    expect(libClear).toHaveBeenCalledTimes(1);
    expect(globalClear).toHaveBeenCalledTimes(1);
    expect(FM.moduleCache.has('@register-remotes/app1')).toBe(false);
    expect((globalThis as any).app1).toBeUndefined();
    expect(
      Global.__FEDERATION__.moduleInfo['@federation/instance:1.0.1']
        .remotesInfo?.['@register-remotes/app1'],
    ).toBeUndefined();
    expect(
      Global.__FEDERATION__.moduleInfo[`@register-remotes/app1:${entry}`],
    ).toBeUndefined();
    expect(Global.__FEDERATION__.__MANIFEST_LOADING__[entry]).toBeUndefined();
    expect(FM.snapshotHandler.manifestCache.has(entry)).toBe(false);
  });
});
