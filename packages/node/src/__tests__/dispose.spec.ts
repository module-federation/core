import { destroyNodeInstance, getNodeInstanceLifecycle } from '../lifecycle';
import { describe, it, expect, rs } from '@rstest/core';
import { ModuleFederation } from './runtimeTestUtils';
import { ModuleFederation as CoreFederation } from '../../../runtime-core/src';
import { nodeRuntimeLifecycle } from '../runtimeLifecycle';
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
});
