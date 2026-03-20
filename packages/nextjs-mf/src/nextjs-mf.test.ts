import { cp, mkdir, writeFile } from 'node:fs/promises';

jest.mock('@module-federation/enhanced/rspack', () => ({
  ModuleFederationPlugin: jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  })),
}));

jest.mock('@module-federation/runtime', () => ({
  loadScriptNode: jest.fn(),
}));

jest.mock('node:fs/promises', () => ({
  cp: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

import { ModuleFederationPlugin as MockedRspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { loadScriptNode } from '@module-federation/runtime';
import NextFederationPlugin from './index';
import createRuntimePlugin from './runtime-plugin';
import * as serverEntry from './server';

const mockRspackApply = jest.fn();
const mockRspackModuleFederationPlugin = jest.mocked(
  MockedRspackModuleFederationPlugin,
);
const mockLoadScriptNode = jest.mocked(loadScriptNode);
const mockCopyDirectory = jest.mocked(cp);
const mockMkdir = jest.mocked(mkdir);
const mockWriteFile = jest.mocked(writeFile);

type TestCompiler = {
  context: string;
  outputPath: string;
  hooks: {
    afterPlugins: {
      tap: jest.Mock;
    };
    afterEmit: {
      tapPromise: jest.Mock;
    };
    thisCompilation: {
      tap: jest.Mock;
    };
  };
  webpack: {
    EntryPlugin: jest.Mock;
    RuntimeGlobals: {
      startup: string;
      global: string;
    };
    RuntimeModule: typeof MockRuntimeModule;
    Template: {
      asString: (value: string | string[]) => string;
    };
  };
  options: {
    name: 'server' | 'client';
    output: {
      publicPath: string;
      uniqueName?: string;
    };
    module: {
      rules: Array<Record<string, unknown>>;
    };
    plugins: Array<Record<string, unknown>>;
    watchOptions?: {
      ignored?: string[];
    };
    node?: {
      global?: boolean;
    };
    target?: string;
    externals: unknown[];
  };
};

class MockRuntimeModule {
  static STAGE_TRIGGER = 0;

  constructor() {}
}

const createCompiler = (name: 'server' | 'client'): TestCompiler => ({
  context: '/tmp/nextjs-mf',
  hooks: {
    afterPlugins: {
      tap: jest.fn(),
    },
    afterEmit: {
      tapPromise: jest.fn(),
    },
    thisCompilation: {
      tap: jest.fn(),
    },
  },
  outputPath: '/tmp/nextjs-mf/.next/server',
  webpack: {
    EntryPlugin: jest.fn(),
    RuntimeGlobals: {
      startup: '__webpack_startup__',
      global: 'globalThis',
    },
    RuntimeModule: MockRuntimeModule,
    Template: {
      asString: (value) =>
        Array.isArray(value) ? value.join('\n') : String(value),
    },
  },
  options: {
    name,
    output: {
      publicPath: '/_next/',
    },
    module: {
      rules: [],
    },
    plugins: [],
    externals: [],
  },
});

describe('NextFederationPlugin', () => {
  beforeEach(() => {
    mockRspackApply.mockClear();
    mockRspackModuleFederationPlugin.mockReset();
    mockCopyDirectory.mockReset();
    mockMkdir.mockReset();
    mockWriteFile.mockReset();
    mockRspackModuleFederationPlugin.mockImplementation(
      () =>
        ({
          apply: mockRspackApply,
        }) as never,
    );
  });

  it('rejects the legacy extraOptions surface', () => {
    expect(
      () =>
        new NextFederationPlugin({
          name: 'home',
          filename: 'static/chunks/remoteEntry.js',
          extraOptions: {
            enableImageLoaderFix: true,
          },
        } as never),
    ).toThrow(/legacy extraOptions surface/i);
  });

  it('normalizes the client compiler before delegating to rspack federation', () => {
    const compiler = createCompiler('client');
    compiler.options.module.rules.push({
      loader: 'next-image-loader',
    });
    const plugin = new NextFederationPlugin({
      name: 'home',
      filename: 'static/chunks/remoteEntry.js',
      remotes: {
        shop: 'shop@http://localhost:3001/_next/static/chunks/remoteEntry.js',
      },
      shared: ['lodash'],
      experiments: {
        asyncStartup: false,
      },
    });

    plugin.apply(compiler);

    expect(compiler.options.output.uniqueName).toBe('home');
    expect(compiler.options.output.publicPath).toBe('auto');
    expect(compiler.options.watchOptions).toEqual({
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    });
    expect(compiler.options.module.rules[0]).toMatchObject({
      use: [
        expect.objectContaining({
          loader: expect.stringContaining('asset-adapter-loader'),
        }),
        expect.objectContaining({
          loader: 'next-image-loader',
        }),
      ],
    });
    expect(mockRspackModuleFederationPlugin).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'static/chunks/remoteEntry.js',
        library: {
          type: 'window',
          name: 'home',
        },
        manifest: {
          filePath: '/static/chunks',
        },
        remoteType: 'script',
        runtime: false,
        dts: false,
        shareStrategy: 'loaded-first',
      }),
    );

    const normalizedOptions = mockRspackModuleFederationPlugin.mock.calls[0][0];
    expect(normalizedOptions.remotes).toEqual({
      shop: 'shop@http://localhost:3001/_next/static/chunks/mf-manifest.json',
    });
    expect(normalizedOptions.runtimePlugins).toBeDefined();
    expect(normalizedOptions.runtimePlugins?.[0]).toContain('runtime-plugin');
    expect(normalizedOptions.shared).toEqual(
      expect.objectContaining({
        lodash: {},
        react: expect.objectContaining({
          singleton: true,
        }),
      }),
    );
    expect(normalizedOptions.experiments).toEqual(
      expect.objectContaining({
        asyncStartup: true,
      }),
    );
  });

  it('skips automatic asset adaptation for app directory compilers', () => {
    const compiler = createCompiler('client');
    compiler.options.module.rules.push({
      loader: 'next-image-loader',
    });
    compiler.options.plugins.push({
      constructor: {
        name: 'FlightClientEntryPlugin',
      },
    });
    const plugin = new NextFederationPlugin({
      name: 'home',
      filename: 'static/chunks/remoteEntry.js',
    });

    plugin.apply(compiler);

    expect(compiler.options.module.rules[0]).toMatchObject({
      loader: 'next-image-loader',
    });
  });

  it('normalizes the server compiler before delegating to rspack federation', () => {
    const compiler = createCompiler('server');
    const plugin = new NextFederationPlugin({
      name: 'checkout',
      filename: 'static/chunks/remoteEntry.js',
      remotes: {
        shop: 'shop@http://localhost:3001/_next/static/ssr/remoteEntry.js',
      },
      shared: {
        lodash: {},
      },
    });

    plugin.apply(compiler);

    expect(compiler.options.node).toEqual({
      global: false,
    });
    expect(compiler.options.target).toBe('async-node');
    expect(mockRspackModuleFederationPlugin).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'remoteEntry.js',
        library: {
          type: 'commonjs-module',
          name: 'checkout',
        },
        manifest: {
          filePath: '',
        },
      }),
    );

    const normalizedOptions = mockRspackModuleFederationPlugin.mock.calls[0][0];
    expect(normalizedOptions.remotes).toEqual({
      shop: 'shop@http://localhost:3001/_next/static/ssr/mf-manifest.json',
    });
  });

  it('publishes server federation assets into the served static directory', async () => {
    const compiler = createCompiler('server');
    compiler.outputPath = '/tmp/nextjs-mf/.next/dev/server';
    const plugin = new NextFederationPlugin({
      name: 'checkout',
      filename: 'static/chunks/remoteEntry.js',
    });

    plugin.apply(compiler);

    const afterEmitCallbacks = new Map(
      compiler.hooks.afterEmit.tapPromise.mock.calls.map(([name, callback]) => [
        name,
        callback,
      ]),
    );
    const persistManifestAssets = afterEmitCallbacks.get(
      'NextjsMfPersistManifestAssetsPlugin',
    ) as
      | ((compilation: {
          getAssets(): Array<{ name: string; source: { source(): string } }>;
        }) => Promise<void>)
      | undefined;
    const publishAssets = afterEmitCallbacks.get(
      'NextjsMfPublishServerAssetsPlugin',
    ) as (() => Promise<void>) | undefined;

    await persistManifestAssets?.({
      getAssets: () => [
        {
          name: 'mf-manifest.json',
          source: {
            source: () => '{"name":"checkout"}',
          },
        },
      ],
    });
    await publishAssets?.();

    expect(mockWriteFile).toHaveBeenCalledWith(
      '/tmp/nextjs-mf/.next/dev/server/mf-manifest.json',
      '{"name":"checkout"}',
    );

    expect(mockMkdir).toHaveBeenCalledWith('/tmp/nextjs-mf/.next/dev/server', {
      recursive: true,
    });
    expect(mockMkdir).toHaveBeenCalledWith(
      '/tmp/nextjs-mf/.next/dev/static/ssr',
      {
        recursive: true,
      },
    );
    expect(mockCopyDirectory).toHaveBeenCalledWith(
      '/tmp/nextjs-mf/.next/dev/server',
      '/tmp/nextjs-mf/.next/dev/static/ssr',
      {
        recursive: true,
        force: true,
      },
    );
  });

  it('rewrites client manifest assets to disk from the emitted sources', async () => {
    const compiler = createCompiler('client');
    compiler.outputPath = '/tmp/nextjs-mf/.next/dev';
    const plugin = new NextFederationPlugin({
      name: 'home',
      filename: 'static/chunks/remoteEntry.js',
    });

    plugin.apply(compiler);

    const afterEmitCallbacks = new Map(
      compiler.hooks.afterEmit.tapPromise.mock.calls.map(([name, callback]) => [
        name,
        callback,
      ]),
    );
    const persistManifestAssets = afterEmitCallbacks.get(
      'NextjsMfPersistManifestAssetsPlugin',
    ) as
      | ((compilation: {
          getAssets(): Array<{ name: string; source: { source(): string } }>;
        }) => Promise<void>)
      | undefined;

    await persistManifestAssets?.({
      getAssets: () => [
        {
          name: 'static/chunks/mf-manifest.json',
          source: {
            source: () => '{"name":"home"}',
          },
        },
        {
          name: 'static/chunks/mf-stats.json',
          source: {
            source: () => '{"stats":true}',
          },
        },
      ],
    });

    expect(mockWriteFile).toHaveBeenCalledWith(
      '/tmp/nextjs-mf/.next/dev/static/chunks/mf-manifest.json',
      '{"name":"home"}',
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      '/tmp/nextjs-mf/.next/dev/static/chunks/mf-stats.json',
      '{"stats":true}',
    );
  });

  it('keeps shared server dependencies bundled through Next externals', async () => {
    const compiler = createCompiler('server');
    const originalExternal = jest.fn(
      (
        ctx: { request?: string },
        callback: (err?: Error | null, result?: string) => void,
      ) => {
        callback(null, ctx.request ? `commonjs ${ctx.request}` : undefined);
      },
    );
    compiler.options.externals = [originalExternal];

    const plugin = new NextFederationPlugin({
      name: 'checkout',
      filename: 'static/chunks/remoteEntry.js',
      shared: {
        '@ant-design/': {
          singleton: true,
        },
      },
    });

    plugin.apply(compiler);

    const wrappedExternal = compiler.options.externals[0] as (ctx: {
      request?: string;
    }) => Promise<string | undefined>;

    await expect(
      wrappedExternal({
        request: '@ant-design/icons/lib/components/Context',
      }),
    ).resolves.toBeUndefined();
    await expect(
      wrappedExternal({
        request: 'react',
      }),
    ).resolves.toBe('commonjs react');
  });
});

describe('server runtime contract', () => {
  const originalFetch = global.fetch;
  const originalNodeEnv = process.env['NODE_ENV'];
  const runtimePlugin = createRuntimePlugin();
  let activeBuildVersion = 'local';
  let hostRemotes: Array<{ name: string; entry: string }> = [];
  let remoteEntryExports: { init: jest.Mock; get: jest.Mock };
  const registerRemotes = jest.fn(
    (remotes: Array<{ name: string; entry: string }>) => {
      hostRemotes.push(...remotes);
    },
  );
  const removeRemote = jest.fn((remote: { name: string }) => {
    hostRemotes = hostRemotes.filter(
      (candidate) => candidate.name !== remote.name,
    );
  });

  const createManifest = (buildVersion: string, publicPath: string) => ({
    id: 'shop',
    name: 'shop',
    metaData: {
      buildInfo: {
        buildVersion,
      },
      globalName: 'shop',
      publicPath,
      remoteEntry: {
        path: '',
        name: 'remoteEntry.js',
        type: 'global',
      },
      types: {
        path: '',
        name: '',
        zip: '',
        api: '',
      },
    },
    shared: [],
    remotes: [],
    exposes: [
      {
        id: 'menu',
        name: './menu',
        path: './components/menu',
        assets: {
          js: {
            sync: ['menu.js'],
            async: ['menu.async.js'],
          },
          css: {
            sync: ['menu.css'],
            async: [],
          },
        },
      },
    ],
  });

  beforeEach(() => {
    activeBuildVersion = 'local';
    remoteEntryExports = {
      init: jest.fn(),
      get: jest.fn(),
    };
    hostRemotes = [
      {
        name: 'shop',
        entry: 'http://localhost:3001/_next/static/ssr/mf-manifest.json',
      },
    ];
    registerRemotes.mockClear();
    removeRemote.mockClear();
    mockLoadScriptNode.mockReset();
    mockLoadScriptNode.mockResolvedValue(remoteEntryExports as never);
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/static/ssr/mf-manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () =>
            createManifest(
              activeBuildVersion,
              'http://localhost:3001/_next/static/chunks/',
            ),
        });
      }

      if (url.includes('/static/chunks/mf-manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () =>
            createManifest(
              activeBuildVersion,
              'http://localhost:3001/_next/static/chunks/',
            ),
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    }) as never;

    (globalThis as any).__FEDERATION__ = {
      __INSTANCES__: [
        {
          options: {
            get remotes() {
              return hostRemotes;
            },
            set remotes(value) {
              hostRemotes = value;
            },
          },
          remoteHandler: {
            registerRemotes,
            removeRemote,
          },
          snapshotHandler: {
            manifestCache: new Map(),
          },
        },
      ],
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env['NODE_ENV'] = originalNodeEnv;
    delete (globalThis as any).__FEDERATION__;
    delete (globalThis as any).__NEXTJS_MF_SSR__;
    delete (globalThis as any).shop;
    delete (globalThis as any).window;
  });

  it('returns a Pages Router fallback module when a server remote fails to load', async () => {
    const result = await runtimePlugin.errorLoadRemote?.({
      id: 'shop/pages/shop/index',
      from: 'build',
      lifecycle: 'onLoad',
      error: new Error('offline'),
    } as never);

    expect(result).toEqual(expect.any(Function));

    const fallbackModule = (
      result as () => {
        __esModule: boolean;
        default: {
          getInitialProps?: (
            ...args: unknown[]
          ) => Promise<Record<string, unknown>>;
        };
        getServerSideProps: () => Promise<{ props: Record<string, unknown> }>;
      }
    )();

    expect(fallbackModule.__esModule).toBe(true);
    await expect(fallbackModule.default.getInitialProps?.({})).resolves.toEqual(
      {},
    );
    await expect(fallbackModule.getServerSideProps()).resolves.toEqual({
      props: {},
    });
  });

  it('preserves static page methods through the server onLoad shim', async () => {
    const record = jest.fn();
    (globalThis as any).__NEXTJS_MF_SSR__ = {
      record,
    };

    const getInitialProps = jest.fn().mockResolvedValue({
      page: 'shop',
    });
    const Page = Object.assign(
      function FederatedPage() {
        return null;
      },
      { getInitialProps },
    );

    const result = runtimePlugin.onLoad?.({
      remote: {
        name: 'shop',
      },
      expose: './pages/shop/index',
      exposeModuleFactory: () => Page,
    } as never);

    expect(result).toEqual(expect.any(Function));

    const shimmedPage = (result as unknown as () => typeof Page)();
    await expect(shimmedPage.getInitialProps?.({})).resolves.toEqual({
      page: 'shop',
    });
    expect(record).toHaveBeenCalledWith('shop', './pages/shop/index');
  });

  it('preserves default export page statics on module-object shims', async () => {
    const getInitialProps = jest.fn().mockResolvedValue({
      page: 'checkout',
    });
    const Page = Object.assign(
      function CheckoutPage() {
        return null;
      },
      { getInitialProps },
    );
    const moduleExports = {
      __esModule: true,
      default: Page,
    };

    const result = runtimePlugin.onLoad?.({
      remote: {
        name: 'checkout',
      },
      expose: './pages/checkout/index',
      exposeModuleFactory: () => moduleExports,
    } as never) as unknown as {
      default: typeof Page;
    };

    await expect(result.default.getInitialProps?.({})).resolves.toEqual({
      page: 'checkout',
    });
  });

  it('collects request-scoped assets from mf-manifest metadata', async () => {
    const chunks = await serverEntry.withFederatedRequest(async () => {
      const beforeRequest = await runtimePlugin.beforeRequest?.({
        id: 'shop/menu',
      } as never);
      const runtimeRemoteName = beforeRequest?.id?.split('/')[0];

      const afterResolve = await runtimePlugin.afterResolve?.({
        remote: {
          name: runtimeRemoteName,
        },
        remoteInfo: {
          name: runtimeRemoteName,
          entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
          entryGlobalName: 'shop',
          buildVersion: activeBuildVersion,
        },
      } as never);

      expect(afterResolve?.remote.name).toBe(runtimeRemoteName);
      expect(afterResolve?.remoteInfo.name).toBe('shop');
      expect(afterResolve?.remoteInfo.entryGlobalName).not.toBe('shop');
      expect(afterResolve?.remoteInfo.entry).toContain(
        'mf-build-version=local',
      );

      const entryExports = await runtimePlugin.loadEntry?.({
        loaderHook: {
          lifecycle: {
            createScript: {
              emit: () => undefined,
            },
            fetch: {
              emit: async () => undefined,
            },
          },
        },
        remoteInfo: afterResolve?.remoteInfo,
      } as never);

      expect(entryExports).toBe(remoteEntryExports);
      expect(mockLoadScriptNode).toHaveBeenCalledWith(
        expect.stringContaining('mf-build-version=local'),
        expect.objectContaining({
          attrs: expect.objectContaining({
            globalName: 'shop',
            name: 'shop',
          }),
        }),
      );

      runtimePlugin.onLoad?.({
        remote: {
          name: runtimeRemoteName,
        },
        expose: './menu',
      } as never);

      return serverEntry.flushChunks();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/_next/static/ssr/mf-manifest.json',
      expect.objectContaining({
        cache: 'no-store',
      }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/_next/static/chunks/mf-manifest.json',
      expect.objectContaining({
        cache: 'no-store',
      }),
    );
    expect(chunks).toEqual([
      'http://localhost:3001/_next/static/chunks/remoteEntry.js?mf-build-version=local',
      'http://localhost:3001/_next/static/chunks/menu.css?mf-build-version=local',
      'http://localhost:3001/_next/static/chunks/menu.js?mf-build-version=local',
      'http://localhost:3001/_next/static/chunks/menu.async.js?mf-build-version=local',
    ]);
    expect(registerRemotes).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          name: expect.stringMatching(/^__nextjs_mf_generation__/),
          entry: expect.stringContaining('mf-build-version=local'),
        }),
      ],
      { force: false },
    );
  });

  it('reuses an attached host container for the pinned generation runtime', async () => {
    (globalThis as any).shop = remoteEntryExports;

    let generationGlobalName = '';
    const entryExports = await serverEntry.withFederatedRequest(async () => {
      const beforeRequest = await runtimePlugin.beforeRequest?.({
        id: 'shop/menu',
      } as never);
      const runtimeRemoteName = beforeRequest?.id?.split('/')[0];
      const afterResolve = await runtimePlugin.afterResolve?.({
        remote: {
          name: runtimeRemoteName,
        },
        remoteInfo: {
          name: runtimeRemoteName,
          entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
          entryGlobalName: 'shop',
          buildVersion: activeBuildVersion,
        },
      } as never);

      generationGlobalName = afterResolve?.remoteInfo.entryGlobalName || '';

      return runtimePlugin.loadEntry?.({
        loaderHook: {
          lifecycle: {
            createScript: {
              emit: () => undefined,
            },
            fetch: {
              emit: async () => undefined,
            },
          },
        },
        remoteInfo: afterResolve?.remoteInfo,
      } as never);
    });

    expect(entryExports).toBeDefined();
    expect(mockLoadScriptNode).not.toHaveBeenCalled();
    expect(generationGlobalName).toBeTruthy();
    expect((globalThis as any)[generationGlobalName]).toBeDefined();

    delete (globalThis as any)[generationGlobalName];
  });

  it('falls back to the browser manifest when the SSR manifest is unavailable', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/static/ssr/mf-manifest.json')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }

      if (url.includes('/static/chunks/mf-manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () =>
            createManifest(
              activeBuildVersion,
              'http://localhost:3001/_next/static/chunks/',
            ),
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    }) as never;

    const chunks = await serverEntry.withFederatedRequest(async () => {
      const beforeRequest = await runtimePlugin.beforeRequest?.({
        id: 'shop/menu',
      } as never);
      const runtimeRemoteName = beforeRequest?.id?.split('/')[0];

      const afterResolve = await runtimePlugin.afterResolve?.({
        remote: {
          name: runtimeRemoteName,
        },
        remoteInfo: {
          name: runtimeRemoteName,
          entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
          entryGlobalName: 'shop',
          buildVersion: activeBuildVersion,
        },
      } as never);

      runtimePlugin.onLoad?.({
        remote: {
          name: afterResolve?.remote.name,
        },
        expose: './menu',
      } as never);

      return serverEntry.flushChunks();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/_next/static/ssr/mf-manifest.json',
      expect.objectContaining({
        cache: 'no-store',
      }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/_next/static/chunks/mf-manifest.json',
      expect.objectContaining({
        cache: 'no-store',
      }),
    );
    expect(chunks).toContain(
      'http://localhost:3001/_next/static/chunks/remoteEntry.js?mf-build-version=local',
    );
  });

  it('retries browser manifest reads in development until the JSON is valid', async () => {
    process.env['NODE_ENV'] = 'development';
    let browserManifestAttempts = 0;

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/static/ssr/mf-manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () =>
            createManifest(
              activeBuildVersion,
              'http://localhost:3001/_next/static/chunks/',
            ),
        });
      }

      if (url.includes('/static/chunks/mf-manifest.json')) {
        browserManifestAttempts += 1;

        if (browserManifestAttempts < 3) {
          return Promise.resolve({
            ok: true,
            json: async () => {
              throw new SyntaxError(
                'Unexpected non-whitespace character after JSON at position 10',
              );
            },
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () =>
            createManifest(
              activeBuildVersion,
              'http://localhost:3001/_next/static/chunks/',
            ),
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    }) as never;

    const chunks = await serverEntry.withFederatedRequest(async () => {
      const beforeRequest = await runtimePlugin.beforeRequest?.({
        id: 'shop/menu',
      } as never);
      const runtimeRemoteName = beforeRequest?.id?.split('/')[0];

      const afterResolve = await runtimePlugin.afterResolve?.({
        remote: {
          name: runtimeRemoteName,
        },
        remoteInfo: {
          name: runtimeRemoteName,
          entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
          entryGlobalName: 'shop',
          buildVersion: activeBuildVersion,
        },
      } as never);

      runtimePlugin.onLoad?.({
        remote: {
          name: afterResolve?.remote.name,
        },
        expose: './menu',
      } as never);

      return serverEntry.flushChunks();
    });

    expect(browserManifestAttempts).toBe(3);
    expect(chunks).toContain(
      'http://localhost:3001/_next/static/chunks/remoteEntry.js?mf-build-version=local',
    );
  });

  it('parses the first complete manifest document when dev responses append trailing bytes', async () => {
    const corruptedBrowserManifest = `${JSON.stringify(
      createManifest(
        activeBuildVersion,
        'http://localhost:3001/_next/static/chunks/',
      ),
      null,
      2,
    )}     }\n    }\n  ]\n}`;

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/static/ssr/mf-manifest.json')) {
        return Promise.resolve({
          ok: true,
          text: async () =>
            JSON.stringify(
              createManifest(
                activeBuildVersion,
                'http://localhost:3001/_next/static/chunks/',
              ),
              null,
              2,
            ),
        });
      }

      if (url.includes('/static/chunks/mf-manifest.json')) {
        return Promise.resolve({
          ok: true,
          text: async () => corruptedBrowserManifest,
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    }) as never;

    const chunks = await serverEntry.withFederatedRequest(async () => {
      const beforeRequest = await runtimePlugin.beforeRequest?.({
        id: 'shop/menu',
      } as never);
      const runtimeRemoteName = beforeRequest?.id?.split('/')[0];

      const afterResolve = await runtimePlugin.afterResolve?.({
        remote: {
          name: runtimeRemoteName,
        },
        remoteInfo: {
          name: runtimeRemoteName,
          entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
          entryGlobalName: 'shop',
          buildVersion: activeBuildVersion,
        },
      } as never);

      runtimePlugin.onLoad?.({
        remote: {
          name: afterResolve?.remote.name,
        },
        expose: './menu',
      } as never);

      return serverEntry.flushChunks();
    });

    expect(chunks).toContain(
      'http://localhost:3001/_next/static/chunks/remoteEntry.js?mf-build-version=local',
    );
  });

  it('normalizes manifest publicPath for browser snapshots', async () => {
    const result = await runtimePlugin.loadRemoteSnapshot?.({
      from: 'manifest',
      manifestUrl: 'http://localhost:3001/_next/static/chunks/mf-manifest.json',
      manifestJson: createManifest(
        activeBuildVersion,
        'http://localhost:3001/_next/static/chunks/',
      ),
      remoteSnapshot: {
        publicPath: 'http://localhost:3001/_next/static/chunks/',
      },
      options: {
        inBrowser: true,
      },
    } as never);

    const normalizedSnapshot = result?.remoteSnapshot as
      | { publicPath?: string }
      | undefined;
    const normalizedManifest = result?.manifestJson as
      | { metaData: { publicPath?: string } }
      | undefined;

    expect(normalizedSnapshot?.publicPath).toBe('http://localhost:3001/_next/');
    expect(normalizedManifest?.metaData.publicPath).toBe(
      'http://localhost:3001/_next/',
    );
  });

  it('sanitizes malformed browser manifests before runtime-core parses them', async () => {
    (globalThis as any).window = {};
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(`{"id":"checkout"}  "path":"./ButtonOldAnt"`),
      ) as typeof global.fetch;

    const response = (await runtimePlugin.fetch?.(
      'http://localhost:3002/_next/static/chunks/mf-manifest.json',
      {} as never,
    )) as Response;

    await expect(response.json()).resolves.toEqual({
      id: 'checkout',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3002/_next/static/chunks/mf-manifest.json',
      {
        cache: 'no-store',
      },
    );
  });

  it('reuses an attached browser container before attempting a script load', async () => {
    (globalThis as any).window = {};
    (globalThis as any).shop = remoteEntryExports;

    const result = await runtimePlugin.loadEntry?.({
      remoteInfo: {
        name: 'shop',
        entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
        entryGlobalName: 'shop',
      },
    } as never);

    expect(result).toBe(remoteEntryExports);
    expect(mockLoadScriptNode).not.toHaveBeenCalled();
  });

  it('retires old remote generations after in-flight requests drain', async () => {
    let firstGenerationName = '';

    await serverEntry.withFederatedRequest(async () => {
      const beforeRequest = await runtimePlugin.beforeRequest?.({
        id: 'shop/menu',
      } as never);
      firstGenerationName = beforeRequest?.id?.split('/')[0] || '';
      await runtimePlugin.afterResolve?.({
        remote: {
          name: firstGenerationName,
        },
        remoteInfo: {
          name: firstGenerationName,
          entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
          entryGlobalName: 'shop',
          buildVersion: activeBuildVersion,
        },
      } as never);
      runtimePlugin.onLoad?.({
        remote: {
          name: firstGenerationName,
        },
        expose: './menu',
      } as never);
      await serverEntry.flushChunks();
    });

    activeBuildVersion = 'next-build';
    let secondGenerationName = '';

    await serverEntry.withFederatedRequest(async () => {
      const beforeRequest = await runtimePlugin.beforeRequest?.({
        id: 'shop/menu',
      } as never);
      secondGenerationName = beforeRequest?.id?.split('/')[0] || '';
      await runtimePlugin.afterResolve?.({
        remote: {
          name: secondGenerationName,
        },
        remoteInfo: {
          name: secondGenerationName,
          entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
          entryGlobalName: 'shop',
          buildVersion: activeBuildVersion,
        },
      } as never);
      runtimePlugin.onLoad?.({
        remote: {
          name: secondGenerationName,
        },
        expose: './menu',
      } as never);
      await serverEntry.flushChunks();
    });

    expect(secondGenerationName).not.toBe(firstGenerationName);
    expect(removeRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        name: firstGenerationName,
      }),
    );
    expect(
      hostRemotes.some((remote) => remote.name === firstGenerationName),
    ).toBe(false);
    expect(
      hostRemotes.some((remote) => remote.name === secondGenerationName),
    ).toBe(true);
  });
});
