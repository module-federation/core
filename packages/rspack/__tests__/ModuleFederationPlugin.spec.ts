import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ModuleFederationPlugin,
  resolveRspackRuntimeAlias,
  resolveRspackRuntimeImplementation,
} from '../src/ModuleFederationPlugin';
import { RemoteEntryPlugin } from '../src/RemoteEntryPlugin';

describe('remote entry public path', () => {
  it.each(['webpack', 'rspack'] as const)(
    'sets the modern-module public path in %s runtime mode',
    async (runtimeMode) => {
      const require = process
        .getBuiltinModule('module')
        .createRequire(__filename);
      const { rspack }: typeof import('@rspack/core') = require('@rspack/core');
      const outputPath = await mkdtemp(join(tmpdir(), 'mf-public-path-'));
      const compiler = rspack({
        mode: 'development',
        target: 'node',
        devtool: false,
        entry: `data:text/javascript,${encodeURIComponent(
          'export const readPublicPath = () => __webpack_public_path__;',
        )}`,
        output: {
          path: outputPath,
          filename: '[name].mjs',
          publicPath: '/initial/',
          module: true,
          library: { type: 'modern-module' },
        },
        optimization: { runtimeChunk: 'single' },
        experiments: { runtimeMode },
        plugins: [
          {
            apply(compiler) {
              RemoteEntryPlugin.addPublicPathEntry(
                compiler,
                'return "https://cdn.example.test/";',
                'main',
              );
            },
          },
        ],
      });

      try {
        expect(compiler.options.experiments.runtimeMode).toBe(runtimeMode);
        await new Promise<void>((resolve, reject) => {
          compiler.run((error, stats) => {
            if (error) return reject(error);
            if (stats?.hasErrors()) {
              return reject(
                new Error(stats.toString({ all: false, errors: true })),
              );
            }
            resolve();
          });
        });
        const { readPublicPath } = require(join(outputPath, 'main.mjs'));
        expect(readPublicPath()).toBe('https://cdn.example.test/');
      } finally {
        await new Promise<void>((resolve, reject) => {
          compiler.close((error) => (error ? reject(error) : resolve()));
        });
        await rm(outputPath, { recursive: true, force: true });
      }
    },
  );
});

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
