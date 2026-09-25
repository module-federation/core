import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { FederationKernel, getRemoteEntry } from '../src/kernel';
import { remote } from '../src/remote/capability';
import { PLATFORM_UNAVAILABLE_MESSAGE } from '../src/core';
import { ModuleFederation } from '../src';
import { shared } from '../src/shared/capability';
import { CurrentGlobal } from '../src/global';
import type { ModuleFederationRuntimePlugin, Platform } from '../src/type';

declare global {
  // eslint-disable-next-line no-var
  var FEDERATION_OPTIMIZE_NO_REMOTE: boolean | undefined;
  // eslint-disable-next-line no-var
  var FEDERATION_OPTIMIZE_NO_SHARED: boolean | undefined;
}

const remoteInfo = {
  name: 'app',
  entry: 'http://localhost:1111/app/remoteEntry.js',
  type: 'global' as const,
  entryGlobalName: 'app',
  shareScope: 'default',
};

const pluginNames = (instance: FederationKernel) =>
  instance.options.plugins.map((plugin) => plugin.name);

describe('FederationKernel', () => {
  afterEach(() => {
    delete globalThis.FEDERATION_OPTIMIZE_NO_REMOTE;
  });

  it('has disabled handlers and a platform that rejects loads without capabilities', async () => {
    const kernel = new FederationKernel({ name: 'bare' });

    expect(pluginNames(kernel)).toEqual([]);
    await expect(kernel.loadRemote('app/Button')).rejects.toThrow(
      'Remote loading is disabled',
    );
    expect(() => kernel.loadShareSync('react')).toThrow(
      'Shared dependency loading is disabled',
    );
    await expect(
      kernel.platform.loadEntry({
        remoteInfo,
        loaderHook: kernel.loaderHook,
      }),
    ).rejects.toThrow(PLATFORM_UNAVAILABLE_MESSAGE);
    await expect(
      kernel.platform.loadScript(remoteInfo.entry, {}),
    ).rejects.toThrow(PLATFORM_UNAVAILABLE_MESSAGE);
  });

  it('loads a remote through the platform when given remote and platform', async () => {
    const factory = () => ({ default: 'Button' });
    const entry = {
      init: rs.fn(),
      get: rs.fn(async () => factory),
    };
    const platform: Platform = {
      isBrowser: () => true,
      loadScript: async () => undefined,
      loadEntry: rs.fn(async () => entry),
    };
    const kernel = new FederationKernel(
      { name: 'host', remotes: [{ name: 'app', entry: remoteInfo.entry }] },
      { remote, platform },
    );

    const mod = await kernel.loadRemote<{ default: string }>('app/Button');

    expect(mod).toEqual({ default: 'Button' });
    expect(platform.loadEntry).toHaveBeenCalledTimes(1);
    expect(entry.get).toHaveBeenCalledWith('./Button');
    expect(pluginNames(kernel)).toEqual([]);
  });

  it('loads a shared fallback entry through the platform without remote', async () => {
    const entry = { init: rs.fn(), get: rs.fn() };
    const platform: Platform = {
      isBrowser: () => true,
      loadScript: async () => undefined,
      loadEntry: rs.fn(async () => entry),
    };
    const kernel = new FederationKernel(
      { name: 'fallback-host' },
      { platform },
    );

    await expect(getRemoteEntry({ origin: kernel, remoteInfo })).resolves.toBe(
      entry,
    );
    expect(platform.loadEntry).toHaveBeenCalledTimes(1);
  });

  it('lets a loadEntry plugin resolve a fallback entry without remote', async () => {
    const container = { init: rs.fn(), get: rs.fn() };
    const kernel = new FederationKernel({
      name: 'fallback-plugin-host',
      plugins: [{ name: 'custom-entry', loadEntry: () => container }],
    });

    await expect(getRemoteEntry({ origin: kernel, remoteInfo })).resolves.toBe(
      container,
    );
  });

  it('ignores remotes a beforeInit plugin injects when remote is not composed', () => {
    const injectRemotes: ModuleFederationRuntimePlugin = {
      name: 'inject-remotes',
      beforeInit(args) {
        args.userOptions.remotes = [{ name: 'app', entry: remoteInfo.entry }];
        return args;
      },
    };

    const kernel = new FederationKernel({
      name: 'host',
      plugins: [injectRemotes],
    });

    expect(kernel.options.remotes).toEqual([]);
  });

  it('registers its share scope under the id it is given', () => {
    const kernel = new FederationKernel(
      { name: 'kernel-share-id', id: 'kernel-share-id:1.0.0' },
      { shared },
    );

    expect(
      CurrentGlobal.__FEDERATION__.__SHARE__['kernel-share-id:1.0.0'],
    ).toBe(kernel.shareScopeMap);
    expect(CurrentGlobal.__FEDERATION__.__SHARE__['kernel-share-id']).toBe(
      undefined,
    );
  });
});

describe('root ModuleFederation', () => {
  afterEach(() => {
    delete globalThis.FEDERATION_OPTIMIZE_NO_REMOTE;
    delete globalThis.FEDERATION_OPTIMIZE_NO_SHARED;
  });

  it('composes shared, remote, snapshot and the universal platform', () => {
    const instance = new ModuleFederation({
      name: 'root',
      remotes: [{ name: 'app', entry: remoteInfo.entry }],
      shared: {
        react: { version: '18.0.0', lib: () => ({ root: true }) },
      },
    });

    expect(pluginNames(instance)).toEqual([
      'snapshot-plugin',
      'generate-preload-assets-plugin',
    ]);
    expect(instance.options.remotes.map((r) => r.name)).toEqual(['app']);
    expect(instance.loadShareSync<{ root: boolean }>('react')()).toEqual({
      root: true,
    });
    expect(instance.platform.isBrowser()).toBe(true);
    expect(instance.options.inBrowser).toBe(true);
  });

  it('drops remote and snapshot when FEDERATION_OPTIMIZE_NO_REMOTE is set', async () => {
    globalThis.FEDERATION_OPTIMIZE_NO_REMOTE = true;

    const instance = new ModuleFederation({
      name: 'root-no-remote',
      remotes: [{ name: 'app', entry: remoteInfo.entry }],
    });

    expect(pluginNames(instance)).toEqual([]);
    expect(instance.options.remotes).toEqual([]);
    await expect(instance.loadRemote('app/Button')).rejects.toThrow(
      'Remote loading is disabled',
    );
  });

  it('has no platform loader when remote and shared are both disabled', async () => {
    globalThis.FEDERATION_OPTIMIZE_NO_REMOTE = true;
    globalThis.FEDERATION_OPTIMIZE_NO_SHARED = true;

    const instance = new ModuleFederation({ name: 'root-all-off' });

    expect(() => instance.loadShareSync('react')).toThrow(
      'Shared dependency loading is disabled',
    );
    await expect(
      instance.platform.loadEntry({
        remoteInfo,
        loaderHook: instance.loaderHook,
      }),
    ).rejects.toThrow(PLATFORM_UNAVAILABLE_MESSAGE);
  });
});
