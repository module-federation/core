import path from 'path';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { describe, expect, it } from '@rstest/core';

const nodeRequire = createRequire(__filename);
const rspack = nodeRequire('@rspack/core') as typeof import('@rspack/core');
const packageJson = nodeRequire('../../package.json') as {
  exports: Record<string, Record<string, string>>;
};

const PACKAGE_NAME = '@module-federation/modern-js-v3';
const RUNTIME_PLUGIN_EXPORTS = {
  './ssr-inject-data-fetch-function-plugin': 'injectDataFetchFunctionPlugin',
  ...(packageJson.exports['./ssr-dev-plugin']
    ? { './ssr-dev-plugin': 'mfSSRDevPlugin' }
    : {}),
} as const;

// Installs a copy of the package manifest whose export targets are marker
// modules, so the bundle shows which target Rspack's resolver picked.
const writeFixturePackage = async (root: string) => {
  const packageDir = path.join(root, 'node_modules', PACKAGE_NAME);
  await mkdir(packageDir, { recursive: true });
  await writeFile(
    path.join(packageDir, 'package.json'),
    JSON.stringify({ name: PACKAGE_NAME, exports: packageJson.exports }),
  );
  for (const [subpath, exportName] of Object.entries(RUNTIME_PLUGIN_EXPORTS)) {
    for (const [condition, target] of Object.entries(
      packageJson.exports[subpath],
    )) {
      if (condition === 'types') {
        continue;
      }
      const file = path.join(packageDir, target);
      await mkdir(path.dirname(file), { recursive: true });
      const marker = `resolved:${path.basename(target)}`;
      const previous = await readFile(file, 'utf8').catch(() => '');
      await writeFile(
        file,
        `${previous}export const ${exportName} = () => '${marker}';\n`,
      );
    }
  }
};

const bundleRuntimePlugins = async (
  root: string,
  target: 'webworker' | 'async-node',
) => {
  const outputPath = path.join(root, 'dist', target);
  await new Promise<void>((resolve, reject) => {
    rspack.rspack(
      {
        mode: 'development',
        devtool: false,
        context: root,
        target,
        entry: path.join(root, 'entry.mjs'),
        output: { path: outputPath, filename: 'main.js' },
      },
      (err, stats) => {
        if (err || stats?.hasErrors()) {
          reject(
            err ?? new Error(stats!.toString({ all: false, errors: true })),
          );
          return;
        }
        resolve();
      },
    );
  });
  return readFile(path.join(outputPath, 'main.js'), 'utf8');
};

describe('SSR runtime plugin exports', () => {
  it('resolves exported runtime plugins to the inert worker module for webworker targets only', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'mf-ssr-worker-plugins-'));
    try {
      await writeFixturePackage(root);
      await writeFile(
        path.join(root, 'entry.mjs'),
        Object.entries(RUNTIME_PLUGIN_EXPORTS)
          .map(
            ([subpath, exportName]) =>
              `import { ${exportName} } from '${PACKAGE_NAME}${subpath.slice(1)}';\nconsole.log(${exportName}());\n`,
          )
          .join(''),
      );

      const workerBundle = await bundleRuntimePlugins(root, 'webworker');
      expect(workerBundle).toContain('resolved:workerPlugins.mjs');
      expect(workerBundle).not.toContain(
        'resolved:injectDataFetchFunctionPlugin.mjs',
      );
      expect(workerBundle).not.toContain('resolved:devPlugin.mjs');

      const nodeBundle = await bundleRuntimePlugins(root, 'async-node');
      expect(nodeBundle).toContain(
        'resolved:injectDataFetchFunctionPlugin.mjs',
      );
      if (packageJson.exports['./ssr-dev-plugin']) {
        expect(nodeBundle).toContain('resolved:devPlugin.mjs');
      }
      expect(nodeBundle).not.toContain('resolved:workerPlugins.mjs');
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('registers inert plugins in worker builds', async () => {
    const { injectDataFetchFunctionPlugin, mfSSRDevPlugin } =
      await import('./workerPlugins');

    expect(injectDataFetchFunctionPlugin({})).toEqual({
      name: '@module-federation/inject-data-fetch-function-plugin',
    });
    expect(mfSSRDevPlugin()).toEqual({
      name: '@module-federation/modern-js-v3',
    });
  });
});
