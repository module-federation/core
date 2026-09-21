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
  it('initializes nothing without a share scope, and the disabled export cannot be called', () => {
    const code =
      "const { initContainerEntry } = require('#mf/container-entry'); try { console.log(String(initContainerEntry({ webpackRequire: {} }))); } catch (error) { console.log(error.message); }";
    expect(runNodeWithConditions(packageDir, [], code)).toBe('undefined');
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-container-entry'],
        code,
      ),
    ).toBe('initContainerEntry is not a function');
  });

  it('leaves share args unchanged without a bundler runtime, and omits the plugin when shared is disabled', () => {
    const code =
      "const { createTreeShakingSharePlugin } = require('#mf/tree-shaking-share-plugin'); const plugin = createTreeShakingSharePlugin({ webpackRequire: { federation: {} } }); if (!plugin) { console.log('absent'); } else { const args = { userOptions: {}, origin: { name: 'host' }, options: {} }; console.log(plugin.beforeInit(args) === args ? 'unchanged' : 'changed'); }";
    expect(runNodeWithConditions(packageDir, [], code)).toBe('unchanged');
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
