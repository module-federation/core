import nextMfRuntimePlugin from './runtimePlugin';

describe('core/runtimePlugin', () => {
  afterEach(() => {
    delete (globalThis as any).__webpack_require__;
    delete (globalThis as any).moduleGraphDirty;
  });

  it('returns lifecycle args when null fallback is disabled', () => {
    const plugin = nextMfRuntimePlugin({ onRemoteFailure: 'error' }) as any;
    const args = {
      lifecycle: 'beforeRequest' as const,
      id: 'shop/menu',
      error: new Error('boom'),
      from: 'runtime' as const,
      options: {},
      origin: {},
    };

    expect(plugin.errorLoadRemote?.(args as any)).toBe(args);
  });

  it('returns null fallback module for onLoad failures', () => {
    const plugin = nextMfRuntimePlugin({
      onRemoteFailure: 'null-fallback',
    }) as any;
    const fallbackFactory = plugin.errorLoadRemote?.({
      lifecycle: 'onLoad',
      id: 'shop/menu',
      error: new Error('boom'),
      from: 'runtime',
      origin: {},
    } as any) as
      | (() => { __esModule: boolean; default: () => null })
      | undefined;

    expect(typeof fallbackFactory).toBe('function');
    expect(fallbackFactory?.()).toMatchObject({
      __esModule: true,
      default: expect.any(Function),
    });
    expect(fallbackFactory?.().default()).toBeNull();
  });

  it('preserves lifecycle args for non-onLoad failures in null fallback mode', () => {
    const plugin = nextMfRuntimePlugin({
      onRemoteFailure: 'null-fallback',
    }) as any;
    const args = {
      lifecycle: 'beforeRequest' as const,
      id: 'shop/menu',
      error: new Error('boom'),
      from: 'runtime' as const,
      options: {},
      origin: {},
    };

    expect(plugin.errorLoadRemote?.(args as any)).toBe(args);
  });

  it('pins react shares to host instance when available', () => {
    const plugin = nextMfRuntimePlugin({ onRemoteFailure: 'error' }) as any;
    const args: any = {
      pkgName: 'react',
      scope: 'default',
      version: '19.0.0',
      shareScopeMap: {
        default: {
          react: {
            '19.0.0': { from: 'remote' },
          },
        },
      },
      shareInfo: {
        from: 'shop',
      },
      GlobalFederation: {
        __INSTANCES__: [
          {
            options: {
              name: 'home_app',
              shared: {
                react: [{ from: 'other-host' }],
              },
            },
          },
          {
            options: {
              name: 'shop',
              shared: {
                react: [{ from: 'host' }],
              },
            },
          },
        ],
      },
    };

    const resolved = plugin.resolveShare?.(args);
    expect(resolved).toBe(args);
    expect(typeof args.resolver).toBe('function');
    const result = args.resolver();
    expect(result).toMatchObject({
      useTreesShaking: false,
      shared: { from: 'other-host' },
    });
    expect(args.shareScopeMap.default.react['19.0.0']).toEqual({
      from: 'other-host',
    });
  });

  it('prefers the current federation runtime instance when resolving host shares', () => {
    (globalThis as any).__webpack_require__ = {
      federation: {
        instance: {
          name: 'host_b',
        },
      },
    };

    const plugin = nextMfRuntimePlugin({ onRemoteFailure: 'error' }) as any;
    const args: any = {
      pkgName: 'react',
      scope: 'default',
      version: '19.0.0',
      shareScopeMap: {
        default: {
          react: {
            '19.0.0': { from: 'remote' },
          },
        },
      },
      shareInfo: {
        from: 'shop',
      },
      GlobalFederation: {
        __INSTANCES__: [
          {
            options: {
              name: 'host_a',
              shared: {
                react: [{ from: 'host-a-share' }],
              },
            },
          },
          {
            options: {
              name: 'host_b',
              shared: {
                react: [{ from: 'host-b-share' }],
              },
            },
          },
        ],
      },
    };

    plugin.resolveShare?.(args);
    const result = args.resolver();

    expect(result.shared).toEqual({ from: 'host-b-share' });
  });

  it('marks module graph dirty when remote loading errors occur', () => {
    (globalThis as any).moduleGraphDirty = false;
    const plugin = nextMfRuntimePlugin({ onRemoteFailure: 'error' }) as any;

    const args = {
      lifecycle: 'beforeRequest' as const,
      id: 'shop/menu',
      error: new Error('boom'),
      from: 'runtime' as const,
      options: {},
      origin: {},
    };

    expect(plugin.errorLoadRemote?.(args as any)).toBe(args);
    expect((globalThis as any).moduleGraphDirty).toBe(true);
  });

  it('passes through non-core packages in resolveShare', () => {
    const plugin = nextMfRuntimePlugin({ onRemoteFailure: 'error' }) as any;
    const args: any = {
      pkgName: 'lodash',
      scope: 'default',
      version: '4.17.21',
      shareScopeMap: {
        default: {
          lodash: {
            '4.17.21': { from: 'remote' },
          },
        },
      },
    };

    expect(plugin.resolveShare?.(args)).toBe(args);
    expect(args.resolver).toBeUndefined();
  });

  it('can disable core share resolution overrides', () => {
    const plugin = nextMfRuntimePlugin({
      onRemoteFailure: 'error',
      resolveCoreShares: false,
    }) as any;
    const args: any = {
      pkgName: 'react',
      scope: 'default',
      version: '18.3.1',
      shareScopeMap: {
        default: {
          react: {
            '18.3.1': { from: 'remote' },
          },
        },
      },
      shareInfo: {
        from: 'shop',
      },
      GlobalFederation: {
        __INSTANCES__: [
          {
            options: {
              name: 'home_app',
              shared: {
                react: [{ from: 'host' }],
              },
            },
          },
        ],
      },
    };

    expect(plugin.resolveShare?.(args)).toBe(args);
    expect(args.resolver).toBeUndefined();
  });
});
