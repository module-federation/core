import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { TextDecoder, TextEncoder } from 'node:util';
import type webpack from 'webpack';
import { runNodeWithConditions } from '../../../tools/testing/runNodeWithConditions';

const packageDir = path.resolve(__dirname, '..');
type CompilerFactory = typeof webpack;

function compilerCases(): [string, CompilerFactory][] {
  Object.defineProperties(globalThis, {
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
  name: string,
  entrySource: string,
): Promise<string> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-selector-'));
  fs.writeFileSync(path.join(root, 'entry.js'), entrySource);
  return new Promise((resolve, reject) => {
    const compiler = compilerFactory({
      context: packageDir,
      target: 'node',
      mode: 'none',
      entry: path.join(root, 'entry.js'),
      output: { path: path.join(root, name), filename: 'out.js' },
      resolve: {
        alias: {
          '@module-federation/runtime-core': path.join(
            packageDir,
            'dist/index.js',
          ),
        },
        conditionNames: ['module-federation:no-remote', 'import', '...'],
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
          [path.join(root, name, 'out.js')],
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

describe('remote module selector packaging', () => {
  it('keeps the remote module available by default', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        [],
        "const { Module } = require('#mf/remote-module'); console.log(new Module({ remoteInfo: { name: 'remote' }, host: {} }).remoteInfo.name)",
      ),
    ).toBe('remote');
  });

  it('exports the unavailable module for the no-remote condition', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-remote'],
        "const { Module } = require('#mf/remote-module'); try { new Module() } catch (error) { console.log(error.message) }",
      ),
    ).toBe(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  });

  it('lets webpack and rspack load the disabled remote module', async () => {
    const results = await Promise.all(
      compilerCases().map(([name, compiler]) =>
        runCompiled(
          compiler,
          name,
          "import { Module } from '@module-federation/runtime-core'; try { new Module(); } catch (error) { console.log(error.message); }",
        ),
      ),
    );
    expect(results).toEqual([
      'Remote loading is disabled by experiments.optimization.disableRemote.',
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    ]);
  });

  it('loads the enabled leaf in both module formats', () => {
    const cjsPath = path.join(
      packageDir,
      'dist/selectors/remote-module/enabled.cjs',
    );
    const esmUrl = pathToFileURL(
      path.join(packageDir, 'dist/selectors/remote-module/enabled.js'),
    ).href;
    expect(
      runNodeWithConditions(
        packageDir,
        [],
        `const { Module } = require(${JSON.stringify(cjsPath)}); console.log(new Module({ remoteInfo: { name: 'remote' }, host: {} }).remoteInfo.name)`,
      ),
    ).toBe('remote');
    expect(
      runNodeWithConditions(
        packageDir,
        [],
        `import(${JSON.stringify(esmUrl)}).then(({ Module }) => console.log(new Module({ remoteInfo: { name: 'remote' }, host: {} }).remoteInfo.name))`,
      ),
    ).toBe('remote');
  });
});
