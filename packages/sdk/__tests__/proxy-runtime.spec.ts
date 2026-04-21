import {
  FEDERATION_PROXY_OVERRIDE_PLUGIN_NAME,
  FEDERATION_PROXY_SNAPSHOT_GUARD,
  FEDERATION_PROXY_SNAPSHOT_PLUGIN_NAME,
  FederationProxyDataManager,
  bootstrapFederationProxy,
  createFederationProxyOverridePlugin,
  createFederationProxySnapshotPlugin,
  registerFederationProxyRuntimePlugins,
  type GlobalModuleInfo,
} from '../src/proxy';

const resetFederationGlobals = () => {
  const target = globalThis as typeof globalThis & {
    __FEDERATION__?: Record<string, any>;
    __VMOK__?: Record<string, any>;
  };

  target.__FEDERATION__ = {
    __GLOBAL_PLUGIN__: [],
    moduleInfo: {},
  };
  target.__VMOK__ = target.__FEDERATION__;
  delete (target as Record<string, any>)[FEDERATION_PROXY_SNAPSHOT_GUARD];
};

describe('federation proxy runtime helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    resetFederationGlobals();
  });

  it('overrides remote entry from shared proxy state', () => {
    const manager = new FederationProxyDataManager();
    manager.setOverrides({
      provider: 'http://127.0.0.1:3009/mf-manifest.json',
    });

    const plugin = createFederationProxyOverridePlugin();
    const args = {
      remote: {
        name: 'provider',
        version: '1.0.0',
      },
    };

    plugin.beforeRegisterRemote?.(args);

    expect(args.remote).toEqual({
      name: 'provider',
      entry: 'http://127.0.0.1:3009/mf-manifest.json',
    });
  });

  it('supports legacy top-level override values for backwards compatibility', () => {
    localStorage.setItem(
      '__MF_DEVTOOLS__',
      JSON.stringify({
        runtime_remote2: '2.0.0',
      }),
    );

    const plugin = createFederationProxyOverridePlugin();
    const args = {
      remote: {
        name: 'runtime_remote2',
        entry: 'http://127.0.0.1:3007/mf-manifest.json',
      },
    };

    plugin.beforeRegisterRemote?.(args);

    expect(args.remote).toEqual({
      name: 'runtime_remote2',
      version: '2.0.0',
    });
  });

  it('hydrates snapshot data into the federation global once', () => {
    const manager = new FederationProxyDataManager();
    const moduleInfo: GlobalModuleInfo = {
      extendInfos: {
        region: 'cn',
      },
      provider: {
        version: '1.0.0',
        remoteEntry: 'http://127.0.0.1:3009/mf-manifest.json',
      },
    };
    manager.setModuleInfo(moduleInfo);

    const plugin = createFederationProxySnapshotPlugin();

    plugin.beforeLoadRemoteSnapshot?.({ options: { inBrowser: true } });
    plugin.beforeLoadRemoteSnapshot?.({ options: { inBrowser: true } });

    expect((globalThis as any).__FEDERATION__.moduleInfo).toEqual(moduleInfo);
    expect((globalThis as any)[FEDERATION_PROXY_SNAPSHOT_GUARD]).toBe(true);
  });

  it('registers proxy runtime plugins without duplicating names', () => {
    registerFederationProxyRuntimePlugins();
    registerFederationProxyRuntimePlugins();

    expect(
      (globalThis as any).__FEDERATION__.__GLOBAL_PLUGIN__.map(
        (plugin: { name: string }) => plugin.name,
      ),
    ).toEqual([
      FEDERATION_PROXY_OVERRIDE_PLUGIN_NAME,
      FEDERATION_PROXY_SNAPSHOT_PLUGIN_NAME,
    ]);
  });

  it('bootstraps data and runtime plugins together', () => {
    const moduleInfo: GlobalModuleInfo = {
      extendInfos: {
        region: 'cn',
      },
      provider: {
        version: '1.0.0',
      },
    };

    const result = bootstrapFederationProxy({
      data: {
        moduleInfo,
        overrides: {
          provider: 'http://127.0.0.1:3009/mf-manifest.json',
        },
        browserEnv: true,
      },
    });

    expect(result.manager.getState()).toEqual({
      runtimeConfig: {
        overrides: {
          provider: 'http://127.0.0.1:3009/mf-manifest.json',
        },
      },
      moduleInfo,
      overrides: {
        provider: 'http://127.0.0.1:3009/mf-manifest.json',
      },
      browserEnv: true,
    });
    expect(
      result.plugins.map((plugin: { name: string }) => plugin.name),
    ).toContain(FEDERATION_PROXY_OVERRIDE_PLUGIN_NAME);
    expect(
      result.plugins.map((plugin: { name: string }) => plugin.name),
    ).toContain(FEDERATION_PROXY_SNAPSHOT_PLUGIN_NAME);
  });
});
