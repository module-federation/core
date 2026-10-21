import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ModuleFederationPlugin,
  resolveRspackRuntimeAlias,
  resolveRspackRuntimeImplementation,
} from '../src/ModuleFederationPlugin';

describe('emitted module formats', () => {
  it.each(['js', 'mjs'])(
    'compiles the emitted %s entry with dts disabled',
    (ext) => {
      const output = mkdtempSync(join(tmpdir(), 'mf-rspack-format-'));
      try {
        execFileSync(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            `
          import { createRequire, Module } from 'node:module';
          import { pathToFileURL } from 'node:url';
          const require = createRequire(import.meta.url);
          const originalLoad = Module._load;
          Module._load = function(id, ...args) {
            if (id.startsWith('@module-federation/dts-plugin')) {
              throw new Error('DTS must remain unloaded when disabled');
            }
            return originalLoad.call(this, id, ...args);
          };
          const entry = process.argv[1];
          const { ModuleFederationPlugin } = entry.endsWith('.mjs')
            ? await import(pathToFileURL(entry).href) : require(entry);
          const { rspack } = require('@rspack/core');
          const compiler = rspack({
            mode: 'none', entry: {}, output: { path: process.argv[2] },
            plugins: [new ModuleFederationPlugin({
              name: 'formatTest', dts: false, manifest: false
            })]
          });
          try {
            await new Promise((resolve, reject) => compiler.run((error, stats) => {
              if (error) reject(error);
              else if (stats.hasErrors()) reject(new Error(stats.toString()));
              else resolve();
            }));
          } finally {
            await new Promise((resolve, reject) => compiler.close(error => error ? reject(error) : resolve()));
            Module._load = originalLoad;
          }
          `,
            join(__dirname, '../dist', `index.${ext}`),
            output,
          ],
          { cwd: join(__dirname, '..'), timeout: 30000 },
        );
      } finally {
        rmSync(output, { recursive: true, force: true });
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

describe('dts plugin loading', () => {
  function createCompiler() {
    class NoopPlugin {
      apply() {}
    }
    return {
      context: __dirname,
      options: {
        plugins: [],
        resolve: { alias: {} },
      },
      webpack: {
        DefinePlugin: NoopPlugin,
        container: { ModuleFederationPlugin: NoopPlugin },
      },
      hooks: {
        afterPlugins: { tap: jest.fn() },
      },
    };
  }

  function loadPluginWithDtsFactory(
    dtsPluginFactory: () => Record<string, unknown>,
  ) {
    let Plugin!: typeof ModuleFederationPlugin;
    jest.isolateModules(() => {
      jest.doMock('@module-federation/dts-plugin', dtsPluginFactory);
      ({ ModuleFederationPlugin: Plugin } =
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../src/ModuleFederationPlugin') as typeof import('../src/ModuleFederationPlugin'));
    });
    return Plugin;
  }

  afterEach(() => {
    jest.dontMock('@module-federation/dts-plugin');
  });

  it('does not load @module-federation/dts-plugin when dts is disabled', () => {
    const dtsPluginFactory = jest.fn(() => ({ DtsPlugin: jest.fn() }));
    const Plugin = loadPluginWithDtsFactory(dtsPluginFactory);

    new Plugin({ name: 'host', dts: false, manifest: false }).apply(
      createCompiler() as any,
    );

    expect(dtsPluginFactory).not.toHaveBeenCalled();
  });

  it('loads and applies @module-federation/dts-plugin when dts is enabled', () => {
    const dtsApply = jest.fn();
    const addRuntimePlugins = jest.fn();
    const DtsPlugin = jest.fn(() => ({ apply: dtsApply, addRuntimePlugins }));
    const dtsPluginFactory = jest.fn(() => ({ DtsPlugin }));
    const Plugin = loadPluginWithDtsFactory(dtsPluginFactory);

    expect(dtsPluginFactory).not.toHaveBeenCalled();

    const compiler = createCompiler();
    new Plugin({ name: 'host', manifest: false }).apply(compiler as any);

    expect(dtsPluginFactory).toHaveBeenCalledTimes(1);
    expect(DtsPlugin).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'host' }),
    );
    expect(dtsApply).toHaveBeenCalledWith(compiler);
    expect(addRuntimePlugins).toHaveBeenCalled();
  });
});
