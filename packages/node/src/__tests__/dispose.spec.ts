import { destroyNodeInstance, getNodeInstanceLifecycle } from '../lifecycle';
import { describe, it, expect, rs } from '@rstest/core';
import { ModuleFederation } from './runtimeTestUtils';
import { ModuleFederation as CoreFederation } from '../../../runtime-core/src';
import { nodeRuntimeLifecycle } from '../lifecycle/plugin';
import {
  CurrentGlobal,
  setGlobalFederationInstance,
} from '../../../runtime-core/src/global';

describe('instance disposal', () => {
  it('drains loads, rejects new work and removes owned roots once', async () => {
    const cleanup = rs.fn();
    const host = new ModuleFederation({
      name: 'dispose-host',
      plugins: [{ name: 'cleanup', dispose: cleanup }],
    });
    setGlobalFederationInstance(host);
    let finish!: (value: string) => void;
    rs.spyOn(host.remoteHandler, 'loadRemote').mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const load = host.loadRemote('pending');
    expect(getNodeInstanceLifecycle(host)?.closed).toBe(false);
    const destroyed = destroyNodeInstance(host);
    expect(getNodeInstanceLifecycle(host)?.closed).toBe(true);
    expect(destroyNodeInstance(host)).toBe(destroyed);
    await expect(host.loadRemote('later')).rejects.toThrow('disposed');
    expect(cleanup).not.toHaveBeenCalled();
    finish('loaded');
    await load;
    await destroyed;
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(host);
    expect(host.moduleCache.size).toBe(0);
    expect(host.options.plugins).toEqual([]);
    expect(host.hooks.lifecycle.dispose.listeners.size).toBe(0);
    expect(destroyNodeInstance(host)).toBe(destroyed);
    expect(host).not.toHaveProperty('destroy');
    expect(host).not.toHaveProperty('disposed');
  });

  it('keeps another consumer’s shared factory and removes only its own use', async () => {
    const host = new ModuleFederation({ name: 'dispose-shared' });
    const other = new ModuleFederation({ name: 'dispose-other' });
    const lib = () => ({ retained: true });
    const shared = {
      from: host.name,
      useIn: [host.name, other.name],
      lib,
    } as any;
    other.shareScopeMap.default = { react: { '1': shared } };
    CurrentGlobal.__FEDERATION__.__SHARE__.other = other.shareScopeMap;
    setGlobalFederationInstance(host);
    setGlobalFederationInstance(other);
    await destroyNodeInstance(host);
    expect(other.shareScopeMap.default.react['1'].lib).toBe(lib);
    expect(shared.useIn).toEqual([other.name]);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(other);
    await destroyNodeInstance(other);
  });

  it('removes loaded shared records even when their settled promise remains', async () => {
    const host = new ModuleFederation({ name: 'dispose-settled' });
    const lib = () => ({ value: true });
    const shared = {
      from: host.name,
      useIn: [host.name],
      loaded: true,
      loading: Promise.resolve(lib),
      lib,
      get: () => Promise.resolve(lib),
    } as any;
    host.shareScopeMap.default = { react: { '1': shared } };
    const scope = host.shareScopeMap;
    CurrentGlobal.__FEDERATION__.__SHARE__.settled = scope;
    setGlobalFederationInstance(host);
    await destroyNodeInstance(host);
    expect(scope.default.react['1']).toBeUndefined();
    expect(CurrentGlobal.__FEDERATION__.__SHARE__.settled).toBeUndefined();
  });

  it('runs all cleanup hooks and remains closed when cleanup fails', async () => {
    const host = new ModuleFederation({ name: 'dispose-failure' });
    setGlobalFederationInstance(host);
    const cleanup = rs.fn();
    const fail = () => {
      throw new Error('cleanup failed');
    };
    host.hooks.lifecycle.dispose.on(fail);
    host.hooks.lifecycle.dispose.on(cleanup);
    await expect(destroyNodeInstance(host)).rejects.toMatchObject({
      errors: [expect.objectContaining({ message: 'cleanup failed' })],
    });
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(host);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(getNodeInstanceLifecycle(host)?.closed).toBe(true);
    expect(() => host.registerRemotes([])).toThrow('disposed');
    host.hooks.lifecycle.dispose.remove(fail);
    await destroyNodeInstance(host);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(host);
  });

  it('requires the Node plugin without closing a plain runtime instance', async () => {
    const host = new CoreFederation({ name: 'unmanaged-host' });
    expect(getNodeInstanceLifecycle(host)).toBeUndefined();
    await expect(destroyNodeInstance(host)).rejects.toThrow(
      'has no Node lifecycle',
    );
    expect(() => host.registerRemotes([])).not.toThrow();
    expect(host).not.toHaveProperty('destroy');
    expect(host).not.toHaveProperty('disposed');
  });

  it('reuses the installed lifecycle when another plugin applies it again', async () => {
    const cleanup = rs.fn();
    const host = new ModuleFederation({
      name: 'repeated-install',
      plugins: [{ name: 'cleanup', dispose: cleanup }],
    });
    const lifecycle = getNodeInstanceLifecycle(host);
    const loadRemote = host.loadRemote;
    const retainedProviders = (host as any).retainedProviders;
    expect(nodeRuntimeLifecycle().apply!(host)).toBeUndefined();
    expect(getNodeInstanceLifecycle(host)).toBe(lifecycle);
    expect(host.loadRemote).toBe(loadRemote);
    expect((host as any).retainedProviders).toBe(retainedProviders);
    await destroyNodeInstance(host);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('reads and destroys an instance installed by another module copy', async () => {
    const host = new ModuleFederation({ name: 'separate-module-copies' });
    const lifecycle = getNodeInstanceLifecycle(host);
    rs.resetModules();
    const otherCopy = await import('../lifecycle');
    expect(otherCopy.getNodeInstanceLifecycle).not.toBe(
      getNodeInstanceLifecycle,
    );
    expect(otherCopy.getNodeInstanceLifecycle(host)).toBe(lifecycle);
    const pending = otherCopy.destroyNodeInstance(host);
    expect(destroyNodeInstance(host)).toBe(pending);
    await pending;
    expect(lifecycle?.closed).toBe(true);
  });

  it('keeps a timed-out instance closed and retries only after pending work drains', async () => {
    rs.useFakeTimers();
    try {
      const cleanup = rs.fn();
      const host = new ModuleFederation({
        name: 'drain-timeout',
        plugins: [{ name: 'cleanup', dispose: cleanup }],
      });
      let finish!: (value: string) => void;
      rs.spyOn(host.remoteHandler, 'loadRemote').mockImplementation(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
      const load = host.loadRemote('pending');
      const failed = expect(destroyNodeInstance(host)).rejects.toThrow(
        'disposal timed out',
      );
      await rs.advanceTimersByTimeAsync(15000);
      await failed;
      expect(cleanup).not.toHaveBeenCalled();
      expect(getNodeInstanceLifecycle(host)?.closed).toBe(true);
      await expect(host.loadRemote('late')).rejects.toThrow('disposed');
      const retry = destroyNodeInstance(host);
      finish('loaded');
      await load;
      await retry;
      expect(cleanup).toHaveBeenCalledTimes(1);
    } finally {
      rs.useRealTimers();
    }
  });

  it('emits concise single-line retention debug logs for usedElsewhere and preserveShared (with and without provider)', async () => {
    const previousFedDebug = process.env.FEDERATION_DEBUG;
    const previousDebug = process.env.DEBUG;
    const debugSpy = rs.spyOn(console, 'debug').mockImplementation(() => {});
    try {
      // 1. Silent when neither DEBUG nor FEDERATION_DEBUG is enabled
      delete process.env.FEDERATION_DEBUG;
      delete process.env.DEBUG;
      const silentA = new ModuleFederation({
        name: 'silent-a',
        remotes: [{ name: 'silent-remote', entry: 'https://example.test/v1.js' }],
      });
      const silentB = new ModuleFederation({
        name: 'silent-b',
        remotes: [{ name: 'silent-remote', entry: 'https://example.test/v1.js' }],
      });
      setGlobalFederationInstance(silentA);
      setGlobalFederationInstance(silentB);
      const silentExports = { init: () => {}, get: async () => () => ({}) };
      const silentInfo = {
        name: 'silent-remote',
        entry: 'https://example.test/v1.js',
        type: 'global',
        entryGlobalName: 'silent_remote',
        shareScope: 'default',
      } as any;
      silentA.moduleCache.set('silent-remote', {
        remoteInfo: silentInfo,
        remoteEntryExports: silentExports,
      } as any);
      silentB.moduleCache.set('silent-remote', {
        remoteInfo: silentInfo,
        remoteEntryExports: silentExports,
      } as any);
      await silentA.removeRemote('silent-remote');
      expect(debugSpy).not.toHaveBeenCalled();
      await destroyNodeInstance(silentA);
      await destroyNodeInstance(silentB);

      // 2. usedElsewhere with DEBUG=modern-js:mf-ssr includes holders and no Stack trace
      process.env.DEBUG = 'modern-js:mf-ssr';
      const hostA = new ModuleFederation({
        name: 'host-a',
        remotes: [
          { name: 'shared-remote', entry: 'https://example.test/v1.js' },
        ],
      });
      const hostB = new ModuleFederation({
        name: 'host-b',
        remotes: [
          { name: 'shared-remote', entry: 'https://example.test/v1.js' },
        ],
      });
      setGlobalFederationInstance(hostA);
      setGlobalFederationInstance(hostB);
      const exportsObj = { init: () => {}, get: async () => () => ({}) };
      const remoteInfo = {
        name: 'shared-remote',
        entry: 'https://example.test/v1.js',
        type: 'global',
        entryGlobalName: 'shared_remote',
        shareScope: 'default',
      } as any;
      hostA.moduleCache.set('shared-remote', {
        remoteInfo,
        remoteEntryExports: exportsObj,
      } as any);
      hostB.moduleCache.set('shared-remote', {
        remoteInfo,
        remoteEntryExports: exportsObj,
      } as any);

      await hostA.removeRemote('shared-remote');

      let messages = debugSpy.mock.calls.map((args) => args.join(' '));
      expect(
        messages.some(
          (msg) =>
            msg.includes('[MF Node Lifecycle]') &&
            msg.includes('remote=shared-remote') &&
            msg.includes('reason=usedElsewhere') &&
            msg.includes('holders=host-b') &&
            !msg.includes('Stack trace:'),
        ),
      ).toBe(true);
      await destroyNodeInstance(hostA);
      await destroyNodeInstance(hostB);

      // 3. preserveShared with provider (useIn + loading + peer) using DEBUG=mf:node:lifecycle
      debugSpy.mockClear();
      process.env.DEBUG = 'mf:node:lifecycle';
      const hostC = new ModuleFederation({
        name: 'host-c',
        remotes: [
          { name: 'provider-remote', entry: 'https://example.test/p1.js' },
        ],
      });
      const provider = new ModuleFederation({
        name: 'provider-remote',
        id: 'provider-remote:b1',
      });
      setGlobalFederationInstance(hostC);
      setGlobalFederationInstance(provider);
      const sharedUseIn = {
        from: 'provider-remote',
        useIn: ['provider-remote', 'host-c'],
        loaded: true,
        lib: () => ({}),
      } as any;
      const sharedLoading = {
        from: 'provider-remote',
        useIn: ['provider-remote'],
        loading: Promise.resolve(),
        loaded: false,
      } as any;
      provider.shareScopeMap.default = {
        react: { '19.0.0': sharedUseIn },
        'react-dom': { '19.0.0': sharedLoading },
      };
      CurrentGlobal.__FEDERATION__.__SHARE__['provider-remote:b1'] =
        provider.shareScopeMap;
      hostC.moduleCache.set('provider-remote', {
        remoteInfo: {
          name: 'provider-remote',
          buildVersion: 'b1',
          entry: 'https://example.test/p1.js',
          type: 'global',
          entryGlobalName: 'provider_remote',
          shareScope: 'default',
        },
        remoteEntryExports: { init: () => {}, get: async () => () => ({}) },
      } as any);

      await hostC.removeRemote('provider-remote');

      messages = debugSpy.mock.calls.map((args) => args.join(' '));
      expect(
        messages.some(
          (msg) =>
            msg.includes('[MF Node Lifecycle]') &&
            msg.includes('remote=provider-remote') &&
            msg.includes('provider=provider-remote') &&
            msg.includes('reason=preserveShared') &&
            msg.includes('react@19.0.0(useIn=host-c)') &&
            msg.includes('react-dom@19.0.0(loading)') &&
            !msg.includes('Stack trace:'),
        ),
      ).toBe(true);
      delete CurrentGlobal.__FEDERATION__.__SHARE__['provider-remote:b1'];
      await destroyNodeInstance(hostC);

      // 4. preserveShared without a provider instance (!provider container remote)
      debugSpy.mockClear();
      delete process.env.DEBUG;
      process.env.FEDERATION_DEBUG = '1';
      const hostD = new ModuleFederation({
        name: 'host-d',
        remotes: [
          { name: 'bare-remote', entry: 'https://example.test/bare.js' },
        ],
      });
      setGlobalFederationInstance(hostD);
      const bareShared = {
        from: 'bare-remote',
        useIn: ['bare-remote', 'host-d'],
        loaded: true,
        lib: () => ({}),
      } as any;
      CurrentGlobal.__FEDERATION__.__SHARE__['bare-remote'] = {
        default: { lodash: { '4.17.21': bareShared } },
      };
      hostD.moduleCache.set('bare-remote', {
        remoteInfo: {
          name: 'bare-remote',
          entry: 'https://example.test/bare.js',
          type: 'global',
          entryGlobalName: 'bare_remote',
          shareScope: 'default',
        },
        remoteEntryExports: { init: () => {}, get: async () => () => ({}) },
      } as any);

      await hostD.removeRemote('bare-remote');

      messages = debugSpy.mock.calls.map((args) => args.join(' '));
      expect(
        messages.some(
          (msg) =>
            msg.includes('[MF Node Lifecycle]') &&
            msg.includes('remote=bare-remote') &&
            !msg.includes('provider=') &&
            msg.includes('reason=preserveShared') &&
            msg.includes('lodash@4.17.21(useIn=host-d)'),
        ),
      ).toBe(true);
      delete CurrentGlobal.__FEDERATION__.__SHARE__['bare-remote'];
      await destroyNodeInstance(hostD);
    } finally {
      if (previousFedDebug === undefined) delete process.env.FEDERATION_DEBUG;
      else process.env.FEDERATION_DEBUG = previousFedDebug;
      if (previousDebug === undefined) delete process.env.DEBUG;
      else process.env.DEBUG = previousDebug;
      debugSpy.mockRestore();
    }
  });
});
