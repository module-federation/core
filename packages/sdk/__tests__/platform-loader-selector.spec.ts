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

interface CompiledRun {
  output: string;
  bundle: string;
}

const NODE_LOADER_MARKER =
  'vm.SyntheticModule is required to load Node.js built-in modules in ESM remote entries.';

function runCompiled(
  compilerFactory: CompilerFactory,
  compilerName: string,
  condition: string,
): Promise<CompiledRun> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-sdk-selector-'));
  fs.writeFileSync(
    path.join(root, 'entry.js'),
    "import { loadScriptNode } from '@module-federation/sdk'; loadScriptNode('unused', {}).catch((error) => console.log(error.message));",
  );
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
          '@module-federation/sdk': path.join(packageDir, 'dist/index.js'),
        },
        conditionNames: [condition, 'import', '...'],
      },
      optimization: {
        minimize: false,
      },
    });
    compiler.run((error, stats) => {
      const finish = (result: CompiledRun | Error) => {
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
        const bundlePath = path.join(root, compilerName, 'out.js');
        const output = execFileSync(process.execPath, [bundlePath], {
          encoding: 'utf8',
          env: {
            ...process.env,
            NODE_PATH: path.resolve(packageDir, '../../node_modules'),
          },
        });
        finish({
          output: output.trim(),
          bundle: fs.readFileSync(bundlePath, 'utf8'),
        });
      } catch (runError) {
        finish(
          runError instanceof Error ? runError : new Error(String(runError)),
        );
      }
    });
  });
}

describe('platform loader selector', () => {
  it.each([
    ['module-federation:target-web', 'true'],
    ['module-federation:target-node', 'false'],
    ['module-federation:target-worker', 'false'],
    ['module-federation:target-universal', 'false'],
  ])('reports the %s environment', (condition, expected) => {
    expect(
      runNodeWithConditions(
        packageDir,
        [condition],
        "console.log(require('./dist/index.cjs').isBrowserEnvValue)",
      ),
    ).toBe(expected);
  });

  it('rejects Node evaluation in a web runtime', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:target-web'],
        "require('./dist/index.cjs').loadScriptNode('unused', {}).catch((error) => console.log(error.message))",
      ),
    ).toBe('Node script loading is disabled by module-federation:target-web.');
  });

  it('evaluates a classic remote script in a worker runtime', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:target-worker'],
        "globalThis.importScripts = () => { globalThis.__worker_remote__ = { value: 42 } }; require('./dist/index.cjs').loadScriptNode('remote.js', { attrs: { globalName: '__worker_remote__' } }).then((value) => console.log(JSON.stringify(value)))",
      ),
    ).toBe('{"value":42}');
  });

  it('imports a module remote in a worker runtime', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:target-worker'],
        "require('./dist/index.cjs').loadScriptNode('data:text/javascript,export default { value: 42 }', { attrs: { type: 'module' } }).then((value) => console.log(value.default.value))",
      ),
    ).toBe('42');
  });

  it.each(compilerCases())(
    'rejects Node script loading from a %s web bundle and drops the Node loader',
    async (name, compiler) => {
      const web = await runCompiled(
        compiler,
        `${name}-web`,
        'module-federation:target-web',
      );
      expect(web.output).toBe(
        'Node script loading is disabled by module-federation:target-web.',
      );
      expect(web.bundle).not.toContain(NODE_LOADER_MARKER);

      const legacy = await runCompiled(compiler, `${name}-legacy`, 'import');
      expect(legacy.bundle).toContain(NODE_LOADER_MARKER);
    },
    60_000,
  );
});
