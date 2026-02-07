import { assert, describe, it, expect } from 'vitest';
import { ModuleFederation } from '../src/index';

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

  it('unloads remote by name and supports re-registration', async () => {
    const FM = new ModuleFederation({
      name: '@federation/runtime-unload-name',
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

  it('unloads remote by alias', async () => {
    const FM = new ModuleFederation({
      name: '@federation/runtime-unload-alias',
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

    expect(FM.unloadRemote('app2')).toBe(true);
    await expect(
      FM.loadRemote<Promise<() => string>>('app2/say'),
    ).rejects.toThrow();
  });

  it('returns false for missing remote unload', () => {
    const FM = new ModuleFederation({
      name: '@federation/runtime-unload-miss',
      version: '1.0.1',
      remotes: [],
    });
    expect(FM.unloadRemote('missing')).toBe(false);
  });
});
