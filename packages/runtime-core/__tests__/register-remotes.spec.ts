import { assert, describe, it, expect } from 'vitest';
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

  it('unloads loaded remote by name and allows re-registration', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance-unload-name',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app2',
          alias: 'app2',
          entry:
            'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
        },
      ],
    });
    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app2/say',
    );
    assert(app1Module);
    expect(await app1Module()).toBe('hello app2');

    expect(FM.unloadRemote('@register-remotes/app2')).toBe(true);
    expect(
      FM.options.remotes.find((r) => r.name === '@register-remotes/app2'),
    ).toBeUndefined();

    await expect(
      FM.loadRemote<Promise<() => string>>('@register-remotes/app2/say'),
    ).rejects.toThrow();

    FM.registerRemotes([
      {
        name: '@register-remotes/app2',
        alias: 'app2',
        entry:
          'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
      },
    ]);
    const app1ModuleReloaded = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app2/say',
    );
    assert(app1ModuleReloaded);
    expect(await app1ModuleReloaded()).toBe('hello app2');
  });

  it('unloads by alias and clears preloaded entries', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance-unload-alias',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app2',
          alias: 'app2',
          entry:
            'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
        },
      ],
    });
    const app1Module = await FM.loadRemote<Promise<() => string>>('app2/say');
    assert(app1Module);
    expect(await app1Module()).toBe('hello app2');

    Global.__FEDERATION__.__PRELOADED_MAP__.set('app2/say', true);
    Global.__FEDERATION__.__PRELOADED_MAP__.set(
      '@register-remotes/app2/say',
      true,
    );

    expect(FM.unloadRemote('app2')).toBe(true);
    expect(Global.__FEDERATION__.__PRELOADED_MAP__.get('app2/say')).toBe(
      undefined,
    );
    expect(
      Global.__FEDERATION__.__PRELOADED_MAP__.get('@register-remotes/app2/say'),
    ).toBe(undefined);
  });

  it('returns false when unloading unknown remote', () => {
    const FM = new ModuleFederation({
      name: '@federation/instance-unload-miss',
      version: '1.0.1',
      remotes: [],
    });

    expect(FM.unloadRemote('unknown-remote')).toBe(false);
  });

  it('clears idToRemoteMap entries for unloaded remote', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance-unload-id-map',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app2',
          alias: 'app2',
          entry:
            'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
        },
      ],
    });
    await FM.loadRemote<Promise<() => string>>('@register-remotes/app2/say');
    await FM.loadRemote<Promise<() => string>>('app2/say');
    expect(
      Object.values(FM.remoteHandler.idToRemoteMap).some(
        (item) => item.name === '@register-remotes/app2',
      ),
    ).toBe(true);

    FM.unloadRemote('@register-remotes/app2');

    expect(
      Object.values(FM.remoteHandler.idToRemoteMap).some(
        (item) => item.name === '@register-remotes/app2',
      ),
    ).toBe(false);
  });

  it('clears webpack module cache and remote marker for unloaded remote only', () => {
    const FM = new ModuleFederation({
      name: '@federation/instance-unload-bundler-cache',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app2',
          alias: 'app2',
          entry:
            'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
        },
      ],
    });

    const targetMapping: any = ['default', './say', 'external-target'];
    targetMapping.p = Promise.resolve(1);
    const untouchedMapping: any = ['default', './say', 'external-untouched'];
    untouchedMapping.p = Promise.resolve(2);

    const webpackRequire: any = {
      c: {
        target: { id: 'target' },
        untouched: { id: 'untouched' },
      },
      m: {
        target: () => null,
        untouched: () => null,
      },
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              target: [
                { externalType: 'script', name: '@register-remotes/app2' },
              ],
              untouched: [{ externalType: 'script', name: 'other-remote' }],
            },
            idToExternalAndNameMapping: {
              target: targetMapping,
              untouched: untouchedMapping,
            },
          },
        },
      },
    };
    (FM as any)[Symbol.for('mf_webpack_require')] = webpackRequire;

    expect(FM.unloadRemote('@register-remotes/app2')).toBe(true);
    expect(webpackRequire.c.target).toBeUndefined();
    expect(webpackRequire.m.target).toBeUndefined();
    expect(targetMapping.p).toBeUndefined();
    expect(webpackRequire.c.untouched).toBeDefined();
    expect(webpackRequire.m.untouched).toBeDefined();
    expect(untouchedMapping.p).toBeDefined();
  });
});
