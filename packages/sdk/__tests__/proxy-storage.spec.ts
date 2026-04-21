import {
  FEDERATION_PROXY_BROWSER_ENV_KEY,
  FEDERATION_PROXY_MODULE_INFO_KEY,
  FEDERATION_PROXY_STORAGE_KEY,
  FederationProxyDataManager,
  type GlobalModuleInfo,
} from '../src/proxy';

describe('FederationProxyDataManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores proxy state in the shared chrome-devtools format', () => {
    const manager = new FederationProxyDataManager();
    const moduleInfo: GlobalModuleInfo = {
      extendInfos: {
        region: 'cn',
        overrides: {
          provider: 'http://127.0.0.1:3001/mf-manifest.json',
        },
      },
      res: {
        success: true,
      },
      'provider:1.0.0': {
        version: '1.0.0',
        remoteEntry: 'http://127.0.0.1:3001/mf-manifest.json',
      },
    };

    manager.applyState({
      moduleInfo,
      overrides: {
        provider: 'http://127.0.0.1:3001/mf-manifest.json',
      },
      browserEnv: true,
    });

    expect(manager.getOverrides()).toEqual({
      provider: 'http://127.0.0.1:3001/mf-manifest.json',
    });
    expect(manager.getModuleInfo()).toEqual(moduleInfo);
    expect(manager.getBrowserEnv()).toBe(true);
    expect(
      JSON.parse(localStorage.getItem(FEDERATION_PROXY_STORAGE_KEY) || '{}'),
    ).toEqual({
      overrides: {
        provider: 'http://127.0.0.1:3001/mf-manifest.json',
      },
    });
    expect(localStorage.getItem(FEDERATION_PROXY_MODULE_INFO_KEY)).toBe(
      JSON.stringify(moduleInfo),
    );
    expect(localStorage.getItem(FEDERATION_PROXY_BROWSER_ENV_KEY)).toBe('true');
  });

  it('reads legacy top-level overrides and normalizes writes back to overrides field', () => {
    localStorage.setItem(
      FEDERATION_PROXY_STORAGE_KEY,
      JSON.stringify({
        provider: '9.9.9',
        enableFastRefresh: true,
      }),
    );

    const manager = new FederationProxyDataManager();

    expect(manager.getOverrides()).toEqual({
      provider: '9.9.9',
    });

    manager.mergeOverrides({
      runtime_remote2: 'http://127.0.0.1:3007/mf-manifest.json',
    });

    expect(
      JSON.parse(localStorage.getItem(FEDERATION_PROXY_STORAGE_KEY) || '{}'),
    ).toEqual({
      enableFastRefresh: true,
      overrides: {
        provider: '9.9.9',
        runtime_remote2: 'http://127.0.0.1:3007/mf-manifest.json',
      },
    });
  });

  it('clears only proxy-specific fields without touching other runtime flags', () => {
    const manager = new FederationProxyDataManager();

    manager.setRuntimeConfig({
      overrides: {
        provider: '1.0.0',
      },
      enableFastRefresh: true,
      eagerShare: ['react', '18.3.1'],
    });

    manager.clearOverrides();

    expect(manager.getRuntimeConfig()).toEqual({
      enableFastRefresh: true,
      eagerShare: ['react', '18.3.1'],
    });
  });

  it('resets all proxy storage keys', () => {
    const manager = new FederationProxyDataManager();

    manager.applyState({
      moduleInfo: {
        provider: {
          version: '1.0.0',
        },
      } as any,
      overrides: {
        provider: '1.0.0',
      },
      browserEnv: true,
    });

    manager.reset();

    expect(localStorage.getItem(FEDERATION_PROXY_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(FEDERATION_PROXY_MODULE_INFO_KEY)).toBeNull();
    expect(localStorage.getItem(FEDERATION_PROXY_BROWSER_ENV_KEY)).toBeNull();
  });
});
