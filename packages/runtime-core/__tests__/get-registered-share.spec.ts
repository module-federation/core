import { describe, it, expect, beforeEach } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import { getRegisteredShare } from '../src/utils/share';
import type { ShareScopeMap, Shared, ShareStrategy } from '../src/type';

const HOST_PROVIDED_ERROR = "Shared module 'react' must be provided by host";
const resolveShare = {
  emit: () => undefined,
};

const throwingGet: Shared['get'] = () => {
  throw new Error(HOST_PROVIDED_ERROR);
};

const createShared = (overrides: Partial<Shared> = {}): Shared => {
  const version = overrides.version ?? '18.3.1';
  return {
    version,
    get: overrides.get ?? throwingGet,
    shareConfig: {
      requiredVersion: '*',
      singleton: true,
      eager: false,
      strictVersion: false,
      ...overrides.shareConfig,
    },
    scope: overrides.scope ?? ['default'],
    useIn: overrides.useIn ?? [],
    from: overrides.from ?? 'host',
    deps: overrides.deps ?? [],
    strategy: overrides.strategy ?? 'version-first',
    ...overrides,
  };
};

const createConsumeOnlyStub = (overrides: Partial<Shared> = {}): Shared =>
  createShared({
    from: 'host-stub',
    loaded: false,
    loading: null,
    get: throwingGet,
    shareConfig: {
      requiredVersion: '*',
      singleton: true,
      eager: false,
      strictVersion: false,
      import: false,
      ...overrides.shareConfig,
    },
    ...overrides,
  });

const createRealProvider = (overrides: Partial<Shared> = {}): Shared => {
  const marker = overrides.from ?? 'provider';
  const lib = overrides.lib ?? (() => ({ marker }));
  return createShared({
    from: marker,
    loaded: true,
    lib,
    get: () => Promise.resolve(lib),
    shareConfig: {
      requiredVersion: '*',
      singleton: true,
      eager: false,
      strictVersion: false,
      ...overrides.shareConfig,
    },
    ...overrides,
  });
};

const selectShare = (
  shareScopeMap: ShareScopeMap,
  shareInfo: Shared,
  pkgName = 'react',
) =>
  getRegisteredShare(
    shareScopeMap,
    pkgName,
    shareInfo,
    // @ts-expect-error test double for resolveShare hook
    resolveShare,
  );

describe('getRegisteredShare import:false consume-only stubs', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it.each<ShareStrategy>(['version-first', 'loaded-first'])(
    'prefers a later real provider over a same-version import:false stub (%s)',
    (strategy) => {
      const stub = createConsumeOnlyStub({
        version: '18.3.1',
        from: 'host-stub',
        strategy,
        shareConfig: {
          requiredVersion: '^18.3.1',
          singleton: true,
          eager: false,
          strictVersion: false,
          import: false,
        },
      });
      const real = createRealProvider({
        version: '18.3.1',
        from: 'provider',
        strategy,
        shareConfig: {
          requiredVersion: '^18.3.1',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
      });

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '18.3.1': stub,
          },
        },
      };

      const selected = selectShare(shareScopeMap, real);
      expect(selected?.shared).toBe(real);
      expect(shareScopeMap.default.react['18.3.1']).toBe(real);
    },
  );

  it('promotes a real requester into a same-version slot occupied by a loaded import:false stub', () => {
    const stub = createConsumeOnlyStub({
      version: '19.2.7',
      from: 'host-stub',
      loaded: true,
      strategy: 'version-first',
      shareConfig: {
        requiredVersion: '^19.0.0',
        singleton: true,
        eager: false,
        strictVersion: false,
        import: false,
      },
    });
    const real = createRealProvider({
      version: '19.2.7',
      from: 'provider',
      strategy: 'version-first',
      shareConfig: {
        requiredVersion: '^19.0.0',
        singleton: true,
        eager: false,
        strictVersion: false,
      },
    });
    const shareScopeMap: ShareScopeMap = {
      default: {
        react: {
          '19.2.7': stub,
        },
      },
    };

    const selected = selectShare(shareScopeMap, real);
    expect(selected?.shared).toBe(real);
    expect(shareScopeMap.default.react['19.2.7']).toBe(real);

    const consumer = createConsumeOnlyStub({
      version: '19.2.7',
      from: 'nested-consumer',
      shareConfig: {
        requiredVersion: '^19.0.0',
        singleton: true,
        eager: false,
        strictVersion: false,
        import: false,
      },
    });
    const later = selectShare(shareScopeMap, consumer);
    expect(later?.shared).toBe(real);
    expect(later?.shared?.shareConfig?.import).not.toBe(false);
  });

  it.each<ShareStrategy>(['version-first', 'loaded-first'])(
    'prefers a runtime-only host sentinel "0" over a higher import:false stub (%s)',
    (strategy) => {
      const stub = createConsumeOnlyStub({
        version: '1.2.3',
        from: 'remote-stub',
        loaded: false,
        loading: strategy === 'loaded-first' ? Promise.resolve() : null,
        strategy,
        shareConfig: {
          requiredVersion: '*',
          singleton: true,
          eager: false,
          strictVersion: false,
          import: false,
        },
      });
      const hostProvider = createRealProvider({
        version: '0',
        from: 'runtime-host',
        strategy,
        shareConfig: {
          requiredVersion: false,
          singleton: true,
          eager: false,
          strictVersion: false,
        },
      });

      const shareScopeMap: ShareScopeMap = {
        default: {
          react: {
            '1.2.3': stub,
            '0': hostProvider,
          },
        },
      };

      const selected = selectShare(shareScopeMap, stub);
      expect(selected?.shared).toBe(hostProvider);
      expect(selected?.shared?.from).toBe('runtime-host');
    },
  );

  it('keeps the import:false stub when no real provider exists', async () => {
    const stub = createConsumeOnlyStub({
      version: '18.3.1',
      from: 'host-stub',
      shareConfig: {
        requiredVersion: '^18.3.1',
        singleton: true,
        eager: false,
        strictVersion: false,
        import: false,
      },
    });
    const shareScopeMap: ShareScopeMap = {
      default: {
        react: {
          '18.3.1': stub,
        },
      },
    };

    const selected = selectShare(shareScopeMap, stub);
    expect(selected?.shared).toBe(stub);

    await expect(Promise.resolve().then(() => stub.get())).rejects.toThrow(
      HOST_PROVIDED_ERROR,
    );
  });

  it('still applies version-first among real providers after skipping stubs', () => {
    const oldReal = createRealProvider({
      version: '17.0.2',
      from: 'old-provider',
      loaded: false,
      lib: undefined,
      strategy: 'version-first',
    });
    const midReal = createRealProvider({
      version: '18.0.0',
      from: 'mid-provider',
      loaded: false,
      lib: undefined,
      strategy: 'version-first',
    });
    const stub = createConsumeOnlyStub({
      version: '19.0.0',
      from: 'stub',
      strategy: 'version-first',
    });

    const shareScopeMap: ShareScopeMap = {
      default: {
        react: {
          '17.0.2': oldReal,
          '19.0.0': stub,
          '18.0.0': midReal,
        },
      },
    };

    const selected = selectShare(
      shareScopeMap,
      createShared({
        version: '18.0.0',
        strategy: 'version-first',
        shareConfig: {
          requiredVersion: '*',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
      }),
    );
    expect(selected?.shared).toBe(midReal);
  });

  it('still applies loaded-first among real providers after skipping stubs', () => {
    const loadedReal = createRealProvider({
      version: '17.0.2',
      from: 'loaded-host',
      loaded: true,
      strategy: 'loaded-first',
    });
    const newerUnloaded = createRealProvider({
      version: '18.3.1',
      from: 'newer-unloaded',
      loaded: false,
      lib: undefined,
      loading: null,
      strategy: 'loaded-first',
    });
    const stub = createConsumeOnlyStub({
      version: '19.0.0',
      from: 'stub',
      loaded: false,
      loading: Promise.resolve(),
      strategy: 'loaded-first',
    });

    const shareScopeMap: ShareScopeMap = {
      default: {
        react: {
          '19.0.0': stub,
          '17.0.2': loadedReal,
          '18.3.1': newerUnloaded,
        },
      },
    };

    const selected = selectShare(
      shareScopeMap,
      createShared({
        version: '18.3.1',
        strategy: 'loaded-first',
        shareConfig: {
          requiredVersion: '*',
          singleton: true,
          eager: false,
          strictVersion: false,
        },
      }),
    );
    expect(selected?.shared).toBe(loadedReal);
  });

  it('uses a later real provider from loadShare when a same-version stub occupies the slot', async () => {
    const federation = new ModuleFederation({
      name: 'provider',
      remotes: [],
      shareStrategy: 'version-first',
      shared: {
        react: {
          version: '18.3.1',
          lib: () => ({ marker: 'real-provider' }),
          shareConfig: {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
        },
      },
    });

    // Occupy the same version slot with a loaded consume-only stub so
    // initializeSharing will not replace it. Selection must still skip it.
    federation.shareScopeMap.default.react = {
      '18.3.1': createConsumeOnlyStub({
        version: '18.3.1',
        from: 'zzz-host-stub',
        loaded: true,
        shareConfig: {
          requiredVersion: '^18.3.1',
          singleton: true,
          eager: false,
          strictVersion: false,
          import: false,
        },
      }),
    };

    const factory = await federation.loadShare<{ marker: string }>('react');
    expect(factory?.()).toEqual({ marker: 'real-provider' });
  });
});

describe('loadShare import:false consume-only stubs', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('selects a lower-version real provider over a higher import:false stub (19.2.8 vs 19.2.7)', async () => {
    const host = new ModuleFederation({
      name: 'repro-host',
      remotes: [],
      shareStrategy: 'version-first',
      shared: {
        react: [
          {
            version: '19.2.8',
            shareConfig: {
              singleton: true,
              requiredVersion: '^19.0.0',
              import: false,
            },
            get: () => () => {
              throw new Error(HOST_PROVIDED_ERROR);
            },
          },
          {
            version: '19.2.7',
            shareConfig: {
              singleton: true,
              requiredVersion: '^19.0.0',
            },
            get: () => () => ({ name: 'real-react-19.2.7' }),
          },
        ],
      },
    });

    const factory = await host.loadShare<{ name: string }>('react');
    expect(factory?.()).toEqual({ name: 'real-react-19.2.7' });
  });

  it('selects a later real provider over a same-version import:false stub', async () => {
    const host = new ModuleFederation({
      name: 'same-version-host',
      remotes: [],
      shareStrategy: 'version-first',
      shared: {
        react: {
          version: '19.2.7',
          shareConfig: {
            singleton: true,
            requiredVersion: '^19.0.0',
          },
          get: () => () => ({ name: 'real-react-19.2.7' }),
        },
      },
    });

    host.shareScopeMap.default.react = {
      '19.2.7': createConsumeOnlyStub({
        version: '19.2.7',
        from: 'zzz-host-stub',
        loaded: true,
        shareConfig: {
          requiredVersion: '^19.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          import: false,
        },
      }),
    };

    const factory = await host.loadShare<{ name: string }>('react');
    expect(factory?.()).toEqual({ name: 'real-react-19.2.7' });
    expect(
      host.shareScopeMap.default.react['19.2.7'].shareConfig.import,
    ).not.toBe(false);

    const later = selectShare(
      host.shareScopeMap,
      createConsumeOnlyStub({
        version: '19.2.7',
        from: 'nested-consumer',
        shareConfig: {
          requiredVersion: '^19.0.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          import: false,
        },
      }),
    );
    expect(later?.shared?.shareConfig?.import).not.toBe(false);
    expect(later?.shared).toBe(host.shareScopeMap.default.react['19.2.7']);
  });

  it('still throws must-be-provided-by-host when only an import:false stub exists', async () => {
    const host = new ModuleFederation({
      name: 'stub-only-host',
      remotes: [],
      shareStrategy: 'version-first',
      shared: {
        react: {
          version: '19.2.8',
          shareConfig: {
            singleton: true,
            requiredVersion: '^19.0.0',
            import: false,
          },
          get: () => () => {
            throw new Error(HOST_PROVIDED_ERROR);
          },
        },
      },
    });

    const factory = await host.loadShare('react');
    expect(factory).toEqual(expect.any(Function));
    expect(() => factory?.()).toThrow(HOST_PROVIDED_ERROR);
  });

  it('keeps the consume-only stub requiredVersion when selecting a real provider', () => {
    const stub = createConsumeOnlyStub({
      version: '19.2.8',
      from: 'consumer-stub',
      shareConfig: {
        requiredVersion: '^19.0.0',
        singleton: true,
        eager: false,
        strictVersion: true,
        import: false,
      },
    });
    const real = createRealProvider({
      version: '19.2.7',
      from: 'provider',
      loaded: false,
      lib: undefined,
      get: () => () => ({ name: 'real-react-19.2.7' }),
    });

    const selected = selectShare(
      {
        default: {
          react: {
            '19.2.8': stub,
            '19.2.7': real,
          },
        },
      },
      stub,
    );

    expect(selected?.shared).toBe(real);
    expect(stub.shareConfig.requiredVersion).toBe('^19.0.0');
    expect(stub.shareConfig.strictVersion).toBe(true);
  });

  it('uses the consume-only stub strictVersion against the selected real provider', () => {
    const stub = createConsumeOnlyStub({
      version: '19.2.8',
      from: 'consumer-stub',
      shareConfig: {
        requiredVersion: '^19.2.8',
        singleton: true,
        eager: false,
        strictVersion: true,
        import: false,
      },
    });
    const real = createRealProvider({
      version: '19.2.7',
      from: 'provider',
      loaded: false,
      lib: undefined,
    });

    expect(() =>
      selectShare(
        {
          default: {
            react: {
              '19.2.8': stub,
              '19.2.7': real,
            },
          },
        },
        stub,
      ),
    ).toThrow(/does not satisfy the requirement/);
  });
});
