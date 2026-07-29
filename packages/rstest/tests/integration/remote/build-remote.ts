import { rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { rspack, type Rspack } from '@rsbuild/core';

const require = createRequire(import.meta.url);
const remoteDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(remoteDirectory, 'dist');

const runCompiler = async (compiler: Rspack.Compiler): Promise<void> => {
  try {
    await new Promise<void>((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error) {
          reject(error);
          return;
        }
        if (!stats || stats.hasErrors()) {
          reject(
            new Error(
              stats?.toString({ all: false, errors: true }) ??
                'Rspack completed without stats.',
            ),
          );
          return;
        }
        resolve();
      });
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

export const setup = async (): Promise<void> => {
  await rm(outputDirectory, { force: true, recursive: true });

  const compiler = rspack({
    context: remoteDirectory,
    entry: './entry.js',
    mode: 'development',
    output: {
      chunkFilename: '[name].cjs',
      filename: '[name].cjs',
      path: outputDirectory,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'fixture_remote',
        filename: 'remoteEntry.cjs',
        library: {
          type: 'commonjs-module',
        },
        exposes: {
          './value': './value.js',
        },
        dts: false,
        manifest: false,
        dev: false,
        runtimePlugins: [
          require.resolve('@module-federation/node/runtimePlugin'),
        ],
        experiments: {
          asyncStartup: true,
          optimization: {
            target: 'node',
          },
        },
      }),
    ],
    target: 'async-node',
  });

  try {
    await runCompiler(compiler);
  } catch (error) {
    await rm(outputDirectory, { force: true, recursive: true });
    throw error;
  }
};

export const teardown = async (): Promise<void> => {
  await rm(outputDirectory, { force: true, recursive: true });
};
