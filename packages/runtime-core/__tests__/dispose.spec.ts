import { describe, it, expect, rs } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { CurrentGlobal, setGlobalFederationInstance } from '../src/global';

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
    const destroyed = host.destroy();
    expect(host.destroy()).toBe(destroyed);
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
    await host.destroy();
    expect(other.shareScopeMap.default.react['1'].lib).toBe(lib);
    expect(shared.useIn).toEqual([other.name]);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(other);
    await other.destroy();
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
    await host.destroy();
    expect(scope.default.react['1']).toBeUndefined();
    expect(CurrentGlobal.__FEDERATION__.__SHARE__.settled).toBeUndefined();
  });

  it('runs all cleanup hooks and remains closed when cleanup fails', async () => {
    const host = new ModuleFederation({ name: 'dispose-failure' });
    const cleanup = rs.fn();
    const fail = () => {
      throw new Error('cleanup failed');
    };
    host.hooks.lifecycle.dispose.on(fail);
    host.hooks.lifecycle.dispose.on(cleanup);
    await expect(host.destroy()).rejects.toThrow('MF disposal failed');
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(() => host.registerRemotes([])).toThrow('disposed');
    host.hooks.lifecycle.dispose.remove(fail);
    await host.destroy();
  });
});
