import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  container,
  rspack,
  type Configuration,
  type Stats,
} from '@rspack/core';
import {
  ExposeEagerPlugin,
  type ExposeEagerPluginOptions,
} from '../src/ExposeEagerPlugin';
import { ModuleFederationPlugin } from '../src/ModuleFederationPlugin';

async function runCompiler(
  context: string,
  plugins: NonNullable<Configuration['plugins']>,
): Promise<Stats> {
  const compiler = rspack({
    context,
    entry: {},
    mode: 'development',
    devtool: false,
    output: {
      path: path.join(context, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
    },
    optimization: {
      minimize: false,
      splitChunks: false,
    },
    plugins,
  });

  try {
    return await new Promise<Stats>((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error) {
          reject(error);
        } else if (!stats) {
          reject(new Error('Rspack completed without stats.'));
        } else if (stats.hasErrors()) {
          reject(new Error(stats.toString({ all: false, errors: true })));
        } else {
          resolve(stats);
        }
      });
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function writeFixture(context: string): Promise<void> {
  await Promise.all([
    writeFile(
      path.join(context, 'eager.js'),
      "globalThis.__MF_EAGER_EXPOSE_MARKER__ = 'eager'; export const value = 'eager';\n",
    ),
    writeFile(
      path.join(context, 'lazy.js'),
      "globalThis.__MF_LAZY_EXPOSE_MARKER__ = 'lazy'; export const value = 'lazy';\n",
    ),
  ]);
}

async function expectEagerOutput(context: string): Promise<void> {
  const outputPath = path.join(context, 'dist');
  const assets = await readdir(outputPath);
  const remoteEntry = await readFile(
    path.join(outputPath, 'remoteEntry.js'),
    'utf8',
  );
  const lazyChunk = await readFile(
    path.join(outputPath, 'lazy-chunk.js'),
    'utf8',
  );

  expect(assets).toContain('remoteEntry.js');
  expect(assets).toContain('lazy-chunk.js');
  expect(assets).not.toContain('eager-chunk.js');
  expect(
    assets.some((asset) =>
      asset.startsWith('__module_federation_expose_eager_factory__'),
    ),
  ).toBe(false);
  expect(remoteEntry).toContain('__MF_EAGER_EXPOSE_MARKER__');
  expect(remoteEntry).toContain('Promise.resolve()');
  expect(remoteEntry).not.toContain('__MF_LAZY_EXPOSE_MARKER__');
  expect(lazyChunk).toContain('__MF_LAZY_EXPOSE_MARKER__');
}

const exposeEagerOptions = {
  name: 'remote',
  exposes: {
    './eager': {
      import: './eager.js',
      name: 'eager-chunk',
      eager: true,
    },
    './lazy': {
      import: './lazy.js',
      name: 'lazy-chunk',
    },
  },
} satisfies ExposeEagerPluginOptions;

describe('ExposeEagerPlugin', () => {
  it('is applied by the enhanced ModuleFederationPlugin', async () => {
    const context = await mkdtemp(
      path.join(tmpdir(), 'module-federation-rspack-eager-wrapper-'),
    );

    try {
      await writeFixture(context);

      await runCompiler(context, [
        new ModuleFederationPlugin({
          ...exposeEagerOptions,
          filename: 'remoteEntry.js',
          dts: false,
          manifest: false,
        }),
      ]);

      await expectEagerOutput(context);
    } finally {
      await rm(context, { recursive: true, force: true });
    }
  });

  it('works alongside the built-in Rspack container plugin', async () => {
    const context = await mkdtemp(
      path.join(tmpdir(), 'module-federation-rspack-eager-standalone-'),
    );

    try {
      await writeFixture(context);

      await runCompiler(context, [
        new ExposeEagerPlugin(exposeEagerOptions),
        new container.ModuleFederationPlugin({
          name: 'remote',
          filename: 'remoteEntry.js',
          exposes: {
            './eager': {
              import: './eager.js',
              name: 'eager-chunk',
            },
            './lazy': {
              import: './lazy.js',
              name: 'lazy-chunk',
            },
          },
        }),
      ]);

      await expectEagerOutput(context);
    } finally {
      await rm(context, { recursive: true, force: true });
    }
  });
});
