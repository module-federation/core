import runtimePlugin from './runtimePlugin';

describe('nextjs-mf runtimePlugin resolveShare (react/react-dom pairing)', () => {
  const plugin = runtimePlugin();

  const scope = 'default';
  const makeArgs = (overrides: Partial<any> = {}) => {
    const args = {
      shareScopeMap: {} as any,
      scope,
      pkgName: 'react',
      version: '0.0.0',
      GlobalFederation: { __INSTANCES__: [{}] } as any,
      resolver: () => undefined,
      ...overrides,
    };
    return args;
  };

  test('react picks highest common with react-dom', () => {
    const react180 = { version: '18.0.0', from: 'host' } as any;
    const react182 = { version: '18.2.0', from: 'remoteA' } as any;
    const dom180 = { version: '18.0.0', from: 'host' } as any;
    const args = makeArgs({
      pkgName: 'react',
      shareScopeMap: {
        [scope]: {
          react: {
            '18.0.0': react180,
            '18.2.0': react182,
          },
          'react-dom': {
            '18.0.0': dom180,
          },
        },
      },
      // default would have picked 18.2.0 without pairing logic
      resolver: () => react182,
    });

    const res = (plugin as any).resolveShare(args);
    const picked = res.resolver();
    expect(picked).toBe(react180);
  });

  test('react-dom/client resolves to its highest common with react', () => {
    const react183 = { version: '18.3.0', from: 'remoteA' } as any;
    const react184 = { version: '18.4.0', from: 'remoteB' } as any;
    const dom183client = { version: '18.3.0', from: 'remoteA-client' } as any;
    const dom184 = { version: '18.4.0', from: 'remoteB' } as any;

    const args = makeArgs({
      pkgName: 'react-dom/client',
      shareScopeMap: {
        [scope]: {
          react: {
            '18.3.0': react183,
            '18.4.0': react184,
          },
          'react-dom/client': {
            '18.3.0': dom183client,
          },
          'react-dom': {
            '18.4.0': dom184,
          },
        },
      },
      // default resolver for subpath should prefer its own highest (18.3.0 here)
      resolver: () => dom183client,
    });

    const res = (plugin as any).resolveShare(args);
    const picked = res.resolver();
    // react-dom/client is available only at 18.3.0; highest common with react is 18.4.0,
    // but subpath share missing 18.4.0, so we should return 18.3.0 from the subpath map
    expect(picked).toBe(dom183client);
  });

  test('falls back to default resolver when no common versions', () => {
    const react190 = { version: '19.0.0' } as any;
    const dom182 = { version: '18.2.0' } as any;
    const defaultPick = {} as any;
    const args = makeArgs({
      pkgName: 'react',
      shareScopeMap: {
        [scope]: {
          react: { '19.0.0': react190 },
          'react-dom': { '18.2.0': dom182 },
        },
      },
      resolver: () => defaultPick,
    });
    const res = (plugin as any).resolveShare(args);
    const picked = res.resolver();
    expect(picked).toBe(defaultPick);
  });
});
