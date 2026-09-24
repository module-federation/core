import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { clearImmediate, setImmediate } from 'node:timers';
import { TextDecoder, TextEncoder } from 'node:util';
import type webpack from 'webpack';
import { runNodeWithConditions } from '../../../tools/testing/runNodeWithConditions';

const packageDir = path.resolve(__dirname, '..');
type CompilerFactory = typeof webpack;

function compilerCases(): [string, CompilerFactory][] {
  Object.defineProperties(globalThis, {
    clearImmediate: { configurable: true, value: clearImmediate },
    setImmediate: { configurable: true, value: setImmediate },
    TextDecoder: { configurable: true, value: TextDecoder },
    TextEncoder: { configurable: true, value: TextEncoder },
  });
  return [
    [
      'webpack',
      createRequire(path.resolve(packageDir, '../enhanced/package.json'))(
        'webpack',
      ) as CompilerFactory,
    ],
    [
      'rspack',
      createRequire(path.resolve(packageDir, '../rspack/package.json'))(
        '@rspack/core',
      ) as CompilerFactory,
    ],
  ];
}

function runCompiled(
  compilerFactory: CompilerFactory,
  compilerName: string,
  condition: string,
  entrySource: string,
): Promise<string> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-entry-selector-'));
  fs.writeFileSync(path.join(root, 'entry.js'), entrySource);
  return new Promise((resolve, reject) => {
    const compiler = compilerFactory({
      context: packageDir,
      target: 'node',
      mode: 'none',
      entry: path.join(root, 'entry.js'),
      output: {
        path: path.join(root, compilerName),
        filename: 'out.js',
      },
      resolve: {
        alias: {
          '@module-federation/webpack-bundler-runtime': path.join(
            packageDir,
            'dist/index.js',
          ),
        },
        conditionNames: [condition, 'import', '...'],
      },
      optimization: {
        minimize: false,
      },
    });
    compiler.run((error, stats) => {
      const finish = (result: string | Error) => {
        compiler.close(() => undefined);
        fs.rmSync(root, { recursive: true, force: true });
        if (result instanceof Error) {
          reject(result);
          return;
        }
        resolve(result);
      };
      if (error) {
        finish(error);
        return;
      }
      if (stats?.hasErrors()) {
        finish(
          new Error(stats.toJson().errors?.[0]?.message ?? 'compile failed'),
        );
        return;
      }
      try {
        const output = execFileSync(
          process.execPath,
          [path.join(root, compilerName, 'out.js')],
          {
            encoding: 'utf8',
            env: {
              ...process.env,
              NODE_PATH: path.resolve(packageDir, '../../node_modules'),
            },
          },
        );
        finish(output.trim());
      } catch (runError) {
        finish(
          runError instanceof Error ? runError : new Error(String(runError)),
        );
      }
    });
  });
}

const containerEntrySource = `
import federation from '@module-federation/webpack-bundler-runtime';
try {
  console.log(
    'result:' +
      String(
        federation.bundlerRuntime.initContainerEntry({ webpackRequire: {} }),
      ),
  );
} catch (error) {
  console.log('threw');
}
`;

const sharedGetterSource = `
import federation from '@module-federation/webpack-bundler-runtime';
const factory = () => 'shared';
try {
  const getter = federation.bundlerRuntime.getSharedFallbackGetter({
    shareKey: 'react',
    factory,
    webpackRequire: { federation: {} },
  });
  console.log(getter());
} catch (error) {
  console.log('threw');
}
`;

describe('container entry selector', () => {
  it('initializes nothing without a share scope, and the disabled leaf has no callable export', () => {
    const code =
      "const { initContainerEntry } = require('#mf/container-entry'); console.log(typeof initContainerEntry === 'function' ? 'result:' + String(initContainerEntry({ webpackRequire: {} })) : 'export:' + typeof initContainerEntry);";
    expect(runNodeWithConditions(packageDir, [], code)).toBe(
      'result:undefined',
    );
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-container-entry'],
        code,
      ),
    ).toBe('export:undefined');
  });

  it('patches tree-shaking status without a bundler runtime, and omits the plugin when shared is disabled', () => {
    const code =
      "require('@module-federation/runtime/helpers').default.global.addGlobalSnapshot({ host: { shared: [{ sharedName: 'react', treeShakingStatus: 2 }] } }); const { createTreeShakingSharePlugin } = require('#mf/tree-shaking-share-plugin'); const plugin = createTreeShakingSharePlugin({ webpackRequire: { federation: { sharedFallback: { react: [] } } } }); if (!plugin) { console.log('absent'); } else { const factory = () => 'react'; const react = { get: factory, treeShaking: { status: 1 } }; plugin.beforeInit({ userOptions: { shared: { react } }, origin: { name: 'host' }, options: {} }); console.log(`status:${react.treeShaking.status} getter:${react.get === factory ? 'original' : 'wrapped'}`); }";
    expect(runNodeWithConditions(packageDir, [], code)).toBe(
      'status:2 getter:original',
    );
    expect(
      runNodeWithConditions(packageDir, ['module-federation:no-shared'], code),
    ).toBe('absent');
  });

  it.each(compilerCases())(
    'uses the same container result from a %s bundle',
    async (name, compiler) => {
      await expect(
        runCompiled(
          compiler,
          `${name}-container`,
          'import',
          containerEntrySource,
        ),
      ).resolves.toBe('result:undefined');
      await expect(
        runCompiled(
          compiler,
          `${name}-container-off`,
          'module-federation:no-container-entry',
          containerEntrySource,
        ),
      ).resolves.toBe('threw');
    },
    60_000,
  );

  it.each(compilerCases())(
    'uses the same shared fallback result from a %s bundle',
    async (name, compiler) => {
      await expect(
        runCompiled(compiler, `${name}-shared`, 'import', sharedGetterSource),
      ).resolves.toBe('shared');
      await expect(
        runCompiled(
          compiler,
          `${name}-shared-off`,
          'module-federation:no-shared',
          sharedGetterSource,
        ),
      ).resolves.toBe('threw');
    },
    60_000,
  );
});
