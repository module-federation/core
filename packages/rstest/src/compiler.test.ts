import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { afterEach, describe, expect, it } from '@rstest/core';
import { rspack, type Rspack } from '@rsbuild/core';

import { withNodeDefaults } from './node-defaults';
import { applyNodeRspackDefaults } from './rspack-hook';

type StatsModule = {
  identifier?: string;
  modules?: StatsModule[];
};

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, {
        force: true,
        recursive: true,
      }),
    ),
  );
});

const collectModuleIdentifiers = (modules: StatsModule[]): string[] =>
  modules.flatMap((module) => [
    ...(module.identifier ? [module.identifier] : []),
    ...collectModuleIdentifiers(module.modules ?? []),
  ]);

const compileRemote = async (remote: string): Promise<string[]> => {
  const context = await mkdtemp(path.join(tmpdir(), 'rstest-federation-'));
  tempDirectories.push(context);

  await mkdir(path.join(context, 'src'));
  await writeFile(
    path.join(context, 'src/index.js'),
    "import('remote/Button');\n",
  );

  const rspackConfig: Rspack.Configuration = {
    context,
    entry: './src/index.js',
    mode: 'development',
    output: {
      filename: 'main.js',
      path: path.join(context, 'dist'),
    },
    plugins: [
      new ModuleFederationPlugin(
        withNodeDefaults({
          name: 'host',
          remotes: { remote },
        }),
      ),
    ],
  };
  applyNodeRspackDefaults(rspackConfig);

  const compiler = rspack(rspackConfig);

  let stats: Rspack.Stats;
  try {
    stats = await new Promise<Rspack.Stats>((resolve, reject) => {
      compiler.run((error, result) => {
        if (error) {
          reject(error);
        } else if (!result) {
          reject(new Error('Rspack completed without stats.'));
        } else {
          resolve(result);
        }
      });
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close((error) => (error ? reject(error) : resolve()));
    });
  }

  const result = stats.toJson({
    all: false,
    errors: true,
    modules: true,
    nestedModules: true,
  });
  expect(result.errors).toEqual([]);

  return collectModuleIdentifiers(result.modules ?? []);
};

describe('node remote transport', () => {
  it('compiles URL remotes as script externals', async () => {
    const identifiers = await compileRemote(
      'remote@http://localhost:3001/remoteEntry.js',
    );

    expect(identifiers).toContain(
      'external script "remote@http://localhost:3001/remoteEntry.js"',
    );
  });

  it('preserves inline CommonJS remote declarations', async () => {
    const remotePath = './rstest-remote-entry.cjs';
    const identifiers = await compileRemote(`commonjs ${remotePath}`);

    expect(identifiers).toContain(`external commonjs "${remotePath}"`);
  });
});
