import fs from 'node:fs';
import path from 'node:path';
import { vi } from 'vitest';
import ReactBridgeAliasChangerPlugin from '../src';

const resolveRouterV8 = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v8/react-router',
);
const resolveRouterV8DomExport = path.join(
  resolveRouterV8,
  'dist/development/dom-export.js',
);

const runPlugin = (
  plugin: ReactBridgeAliasChangerPlugin,
  alias: Record<string, string> = {},
) => {
  const context = path.resolve(__dirname, '..');
  const targetFilePath = path.join(
    context,
    'node_modules/@module-federation/bridge-react/dist/router.es.js',
  );
  const existsSync = fs.existsSync;
  const existsSpy = vi
    .spyOn(fs, 'existsSync')
    .mockImplementation((filePath) =>
      String(filePath) === targetFilePath ? true : existsSync(filePath),
    );
  const compiler = {
    context,
    hooks: {
      afterEnvironment: {
        tap: (_name: string, callback: () => void) => callback(),
      },
    },
    options: {
      resolve: {
        alias,
      },
    },
  };

  try {
    plugin.apply(compiler);
  } finally {
    existsSpy.mockRestore();
  }

  return compiler.options.resolve.alias;
};

describe('ReactBridgeAliasChangerPlugin shared router guards', () => {
  it('rejects react-router-dom in array shared config', () => {
    expect(
      () =>
        new ReactBridgeAliasChangerPlugin({
          moduleFederationOptions: {
            shared: ['react-router-dom'],
          } as any,
        }),
    ).toThrow(
      'react-router-dom cannot be set to shared after react bridge is used',
    );
  });

  it('rejects react-router-dom in array object shared config', () => {
    expect(
      () =>
        new ReactBridgeAliasChangerPlugin({
          moduleFederationOptions: {
            shared: [{ 'react-router-dom': { singleton: true } }],
          } as any,
        }),
    ).toThrow(
      'react-router-dom cannot be set to shared after react bridge is used',
    );
  });

  it('rejects react-router-dom in aliased array object shared config', () => {
    expect(
      () =>
        new ReactBridgeAliasChangerPlugin({
          moduleFederationOptions: {
            shared: [
              {
                rrdom: {
                  request: 'react-router-dom',
                  import: 'react-router-dom',
                },
              },
            ],
          } as any,
        }),
    ).toThrow(
      'react-router-dom cannot be set to shared after react bridge is used',
    );
  });

  it('allows react-router in array shared config before the bridge proxies react-router', () => {
    expect(
      () =>
        new ReactBridgeAliasChangerPlugin({
          moduleFederationOptions: {
            shared: ['react-router'],
          } as any,
        }),
    ).not.toThrow();
  });

  it('rejects react-router in array shared config when the bridge proxies react-router', () => {
    const plugin = new ReactBridgeAliasChangerPlugin({
      moduleFederationOptions: {
        shared: ['react-router'],
      } as any,
    });

    expect(() =>
      runPlugin(plugin, { 'react-router': resolveRouterV8 }),
    ).toThrow(
      'react-router cannot be set to shared after react bridge is used',
    );
  });

  it('rejects react-router in array object shared config when the bridge proxies react-router', () => {
    const plugin = new ReactBridgeAliasChangerPlugin({
      moduleFederationOptions: {
        shared: [{ 'react-router': { singleton: true } }],
      } as any,
    });

    expect(() =>
      runPlugin(plugin, { 'react-router': resolveRouterV8 }),
    ).toThrow(
      'react-router cannot be set to shared after react bridge is used',
    );
  });

  it('rejects react-router in aliased array object shared config when the bridge proxies react-router', () => {
    const plugin = new ReactBridgeAliasChangerPlugin({
      moduleFederationOptions: {
        shared: [
          {
            rr: {
              request: 'react-router',
              import: 'react-router',
            },
          },
        ],
      } as any,
    });

    expect(() =>
      runPlugin(plugin, { 'react-router': resolveRouterV8 }),
    ).toThrow(
      'react-router cannot be set to shared after react bridge is used',
    );
  });

  it('rejects react-router-dom in object shared config', () => {
    expect(
      () =>
        new ReactBridgeAliasChangerPlugin({
          moduleFederationOptions: {
            shared: {
              'react-router-dom': { singleton: true },
            },
          } as any,
        }),
    ).toThrow(
      'react-router-dom cannot be set to shared after react bridge is used',
    );
  });

  it('rejects react-router-dom in aliased object shared config', () => {
    expect(
      () =>
        new ReactBridgeAliasChangerPlugin({
          moduleFederationOptions: {
            shared: {
              rrdom: {
                request: 'react-router-dom',
                import: 'react-router-dom',
              },
            },
          } as any,
        }),
    ).toThrow(
      'react-router-dom cannot be set to shared after react bridge is used',
    );
  });

  it('rejects react-router in object shared config when the bridge proxies react-router', () => {
    const plugin = new ReactBridgeAliasChangerPlugin({
      moduleFederationOptions: {
        shared: {
          'react-router': { singleton: true },
        },
      } as any,
    });

    expect(() =>
      runPlugin(plugin, { 'react-router': resolveRouterV8 }),
    ).toThrow(
      'react-router cannot be set to shared after react bridge is used',
    );
  });

  it('rejects react-router in aliased object shared config when the bridge proxies react-router', () => {
    const plugin = new ReactBridgeAliasChangerPlugin({
      moduleFederationOptions: {
        shared: {
          rr: {
            request: 'react-router',
            import: 'react-router',
          },
        },
      } as any,
    });

    expect(() =>
      runPlugin(plugin, { 'react-router': resolveRouterV8 }),
    ).toThrow(
      'react-router cannot be set to shared after react bridge is used',
    );
  });

  it('allows unrelated shared packages', () => {
    expect(
      () =>
        new ReactBridgeAliasChangerPlugin({
          moduleFederationOptions: {
            shared: {
              react: { singleton: true },
            },
          } as any,
        }),
    ).not.toThrow();
  });
});

describe('ReactBridgeAliasChangerPlugin router aliases', () => {
  it('keeps generated v8 exact bridge aliases over existing exact router aliases', () => {
    const plugin = new ReactBridgeAliasChangerPlugin({
      moduleFederationOptions: {} as any,
    });

    const alias = runPlugin(plugin, {
      react: 'react',
      'react-router$': resolveRouterV8,
      'react-router/dom$': resolveRouterV8DomExport,
    });

    expect(alias.react).toBe('react');
    expect(alias['react-router$']).toBe(
      '@module-federation/bridge-react/dist/router-v8.es.js',
    );
    expect(alias['react-router/dom$']).toBe(
      '@module-federation/bridge-react/dist/router-v8-dom.es.js',
    );
    expect(alias['react-router/dist/development/index.js']).toBe(
      resolveRouterV8,
    );
    expect(alias['react-router/dist/development/dom-export.js']).toBe(
      resolveRouterV8DomExport,
    );
  });
});
