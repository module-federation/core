import fs from 'node:fs';
import {
  ModuleFederationPlugin,
  resolveRspackRuntimeAlias,
  resolveRspackRuntimeImplementation,
} from '../src/ModuleFederationPlugin';

function getOptimizationDefines(
  optimization?: NonNullable<
    NonNullable<
      ConstructorParameters<typeof ModuleFederationPlugin>[0]['experiments']
    >['optimization']
  >,
  exposes?: ConstructorParameters<typeof ModuleFederationPlugin>[0]['exposes'],
) {
  let definitions: Record<string, string | boolean> = {};
  class DefinePlugin {
    constructor(options: Record<string, string | boolean>) {
      definitions = options;
    }

    apply() {}
  }

  const plugin = new ModuleFederationPlugin({
    name: 'test',
    exposes,
    experiments: { optimization },
  });

  (plugin as any)._patchBundlerConfig({
    webpack: { DefinePlugin },
  });

  return definitions;
}

describe('runtime resolution compatibility', () => {
  it('prefers the bundler implementation when available', () => {
    const resolve = jest.fn((request: string) => {
      if (request === '@module-federation/runtime-tools/bundler') {
        return '/workspace/runtime-tools/dist/bundler.js';
      }

      throw new Error(`Unexpected request: ${request}`);
    }) as typeof require.resolve;

    expect(resolveRspackRuntimeImplementation(undefined, resolve)).toBe(
      '/workspace/runtime-tools/dist/bundler.js',
    );
  });

  it('falls back to legacy esm runtime entries for older implementations', () => {
    const resolve = jest.fn(
      (request: string, options?: { paths?: string[] }) => {
        const basedFromLegacy = options?.paths?.[0] === '/legacy/runtime-tools';

        if (
          basedFromLegacy &&
          request === '@module-federation/runtime/bundler'
        ) {
          throw new Error(`Cannot find module '${request}'`);
        }
        if (request === '@module-federation/runtime/dist/index.js') {
          return '/legacy/runtime/dist/index.js';
        }

        throw new Error(`Unexpected request: ${request}`);
      },
    ) as typeof require.resolve;

    expect(resolveRspackRuntimeAlias('/legacy/runtime-tools', resolve)).toBe(
      '/legacy/runtime/dist/index.js',
    );
  });

  it('falls back to legacy cjs runtime entries when esm legacy builds are unavailable', () => {
    const resolve = jest.fn(
      (request: string, options?: { paths?: string[] }) => {
        const basedFromLegacy = options?.paths?.[0] === '/legacy/runtime-tools';

        if (
          basedFromLegacy &&
          (request === '@module-federation/runtime/bundler' ||
            request === '@module-federation/runtime/dist/index.js')
        ) {
          throw new Error(`Cannot find module '${request}'`);
        }
        if (request === '@module-federation/runtime/dist/index.cjs') {
          return '/legacy/runtime/dist/index.cjs';
        }

        throw new Error(`Unexpected request: ${request}`);
      },
    ) as typeof require.resolve;

    expect(resolveRspackRuntimeAlias('/legacy/runtime-tools', resolve)).toBe(
      '/legacy/runtime/dist/index.cjs',
    );
  });
});

describe('runtime capability optimization defines', () => {
  it('keeps all runtime capabilities enabled by default', () => {
    expect(getOptimizationDefines()).toMatchObject({
      FEDERATION_OPTIMIZE_NO_REMOTE: false,
      FEDERATION_OPTIMIZE_NO_SHARED: false,
      FEDERATION_HAS_EXPOSES: false,
    });
  });

  it('derives expose capability from the container configuration', () => {
    expect(getOptimizationDefines(undefined, {})).toMatchObject({
      FEDERATION_HAS_EXPOSES: false,
    });
    expect(
      getOptimizationDefines(undefined, {
        './Button': './src/Button',
      }),
    ).toMatchObject({
      FEDERATION_HAS_EXPOSES: true,
    });
  });

  it('defines each disabled runtime capability independently', () => {
    expect(
      getOptimizationDefines({
        disableRemote: true,
        disableShared: true,
      }),
    ).toMatchObject({
      FEDERATION_OPTIMIZE_NO_REMOTE: true,
      FEDERATION_OPTIMIZE_NO_SHARED: true,
    });
  });
});

describe('lazy compilation client for remotes', () => {
  const rspackClient =
    '/repo/node_modules/.pnpm/@rspack+core@2.1.10/node_modules/@rspack/core/hot/lazy-compilation-web.js';
  const query = `?${encodeURIComponent('/_rspack/lazy/trigger')}`;
  const federationClient = require.resolve('../client/lazy-compilation-web.js');

  function resolveClientRequest(
    request: string,
    {
      rspackVersion = '2.1.10',
      lazyCompilation = { imports: true, entries: false } as unknown,
    } = {},
  ) {
    let beforeResolve: ((data: { request: string }) => void) | undefined;
    const compiler = {
      webpack: { rspackVersion },
      options: { lazyCompilation },
      hooks: {
        normalModuleFactory: {
          tap: (_name: string, fn: (nmf: unknown) => void) =>
            fn({
              hooks: {
                beforeResolve: {
                  tap: (
                    _name: string,
                    cb: (data: { request: string }) => void,
                  ) => {
                    beforeResolve = cb;
                  },
                },
              },
            }),
        },
      },
    };
    const plugin = new ModuleFederationPlugin({
      name: 'remote',
      exposes: { './Button': './src/Button' },
    });
    (plugin as any)._patchLazyCompilationClient(compiler);

    const data = { request };
    beforeResolve?.(data);
    return data.request;
  }

  it('swaps the Rspack 2 web client and keeps the endpoint query', () => {
    expect(resolveClientRequest(rspackClient + query)).toBe(
      federationClient + query,
    );
  });

  it('leaves other requests alone', () => {
    expect(resolveClientRequest('./src/Button')).toBe('./src/Button');
    expect(
      resolveClientRequest(rspackClient.replace('-web.js', '-node.js') + query),
    ).toBe(rspackClient.replace('-web.js', '-node.js') + query);
    expect(resolveClientRequest('/app/my-lazy-client.js' + query)).toBe(
      '/app/my-lazy-client.js' + query,
    );
  });

  it('does nothing without lazy compilation or on Rspack 1', () => {
    expect(
      resolveClientRequest(rspackClient + query, { lazyCompilation: false }),
    ).toBe(rspackClient + query);
    expect(
      resolveClientRequest(rspackClient + query, { rspackVersion: '1.6.8' }),
    ).toBe(rspackClient + query);
  });

  function postedUrl(endpoint: string, publicPath: string, page: string) {
    const source = fs
      .readFileSync(federationClient, 'utf-8')
      .replace('export const activate =', 'return')
      .replace('import.meta.webpackHot', 'undefined');
    const opened: string[] = [];
    class XMLHttpRequest {
      open(_method: string, url: string) {
        opened.push(url);
      }
      setRequestHeader() {}
      send() {}
    }
    const activate = new Function(
      'XMLHttpRequest',
      '__resourceQuery',
      '__webpack_public_path__',
      'self',
      source,
    )(XMLHttpRequest, `?${encodeURIComponent(endpoint)}`, publicPath, {
      location: { href: page },
    });
    activate({ data: 'module', active: true, onError() {} });
    return opened[0];
  }

  it('posts to the remote origin instead of the host page', () => {
    expect(
      postedUrl(
        '/_rspack/lazy/trigger',
        'http://localhost:3011/',
        'http://localhost:3013/preload',
      ),
    ).toBe('http://localhost:3011/_rspack/lazy/trigger');
  });

  it('keeps an explicit serverUrl and falls back to the page', () => {
    expect(
      postedUrl(
        'http://localhost:4000/_rspack/lazy/trigger',
        'http://localhost:3011/',
        'http://localhost:3013/',
      ),
    ).toBe('http://localhost:4000/_rspack/lazy/trigger');
    expect(
      postedUrl('/_rspack/lazy/trigger', '/', 'http://localhost:3011/app'),
    ).toBe('http://localhost:3011/_rspack/lazy/trigger');
  });
});
