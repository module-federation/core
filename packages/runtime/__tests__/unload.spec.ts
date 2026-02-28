import { assert, describe, expect, it, vi } from 'vitest';
import {
  CurrentGlobal,
  Global,
  ModuleFederation,
} from '@module-federation/runtime-core';
import { init } from '../src';
import { unloadRemote, unloadRemoteFromInstance } from '../src/unload';

describe('unload api', () => {
  it('unloads loaded remote by name and allows re-registration', async () => {
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

    expect(unloadRemoteFromInstance(FM, '@register-remotes/app2')).toBe(true);
    expect(
      FM.options.remotes.find((item) => item.name === '@register-remotes/app2'),
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

    expect(unloadRemoteFromInstance(FM, 'app2')).toBe(true);
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
    expect(unloadRemoteFromInstance(FM, 'missing')).toBe(false);
  });

  it('does not clear global container when unloading remote not loaded by current host', () => {
    const entryGlobalName = '__TEST_RUNTIME_UNLOAD_NOT_LOADED__';
    try {
      (CurrentGlobal as any)[entryGlobalName] = { loadedBy: 'other-host' };

      const FM = new ModuleFederation({
        name: '@federation/runtime-unload-not-loaded',
        version: '1.0.1',
        remotes: [
          {
            name: '@register-remotes/app2',
            alias: 'app2',
            entry:
              'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
            entryGlobalName,
          },
        ],
      });

      expect(unloadRemoteFromInstance(FM, '@register-remotes/app2')).toBe(true);
      expect((CurrentGlobal as any)[entryGlobalName]).toEqual({
        loadedBy: 'other-host',
      });
    } finally {
      delete (CurrentGlobal as any)[entryGlobalName];
    }
  });

  it('clears idToRemoteMap and preloaded entries for unloaded remote', async () => {
    const FM = new ModuleFederation({
      name: '@federation/runtime-unload-id-map',
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
    Global.__FEDERATION__.__PRELOADED_MAP__.set('app2/say', true);
    Global.__FEDERATION__.__PRELOADED_MAP__.set(
      '@register-remotes/app2/say',
      true,
    );

    expect(
      Object.values((FM as any).remoteHandler.idToRemoteMap).some(
        (item: any) => item.name === '@register-remotes/app2',
      ),
    ).toBe(true);
    expect(unloadRemoteFromInstance(FM, '@register-remotes/app2')).toBe(true);

    expect(
      Object.values((FM as any).remoteHandler.idToRemoteMap).some(
        (item: any) => item.name === '@register-remotes/app2',
      ),
    ).toBe(false);
    expect(Global.__FEDERATION__.__PRELOADED_MAP__.get('app2/say')).toBe(
      undefined,
    );
    expect(
      Global.__FEDERATION__.__PRELOADED_MAP__.get('@register-remotes/app2/say'),
    ).toBe(undefined);
  });

  it('emits afterRemoveRemote hook on unload', () => {
    const afterRemoveRemote = vi.fn();
    const FM = new ModuleFederation({
      name: '@federation/runtime-unload-bundler-cache',
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
    FM.registerPlugins([
      {
        name: 'after-remove-remote-test',
        afterRemoveRemote,
      },
    ]);

    expect(unloadRemoteFromInstance(FM, '@register-remotes/app2')).toBe(true);
    expect(afterRemoveRemote).toHaveBeenCalledTimes(1);
    expect(afterRemoveRemote).toHaveBeenCalledWith({
      remote: expect.objectContaining({
        name: '@register-remotes/app2',
        alias: 'app2',
      }),
      origin: FM,
      loaded: false,
    });
  });

  it('exports top-level unloadRemote wrapper and delegates to instance', async () => {
    const FM = init({
      name: '@federation/unload-wrapper',
      remotes: [
        {
          name: '@register-remotes/app1',
          alias: 'app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    await FM.loadRemote('@register-remotes/app1/say');
    expect(unloadRemote('@register-remotes/app1')).toBe(true);
  });

  it('throws for top-level unloadRemote wrapper when instance is missing', async () => {
    vi.resetModules();
    const runtimeUnload = await import('../src/unload');
    expect(() => runtimeUnload.unloadRemote('missing')).toThrow();
  });
});
