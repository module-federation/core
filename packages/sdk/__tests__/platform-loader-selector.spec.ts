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
type StatsModule = {
  name?: string;
  identifier?: string;
  modules?: StatsModule[];
};

function runSdk(condition: string, code: string): string {
  return runNodeWithConditions(packageDir, [condition], code);
}

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

function flattenModules(modules: StatsModule[]): StatsModule[] {
  return modules.flatMap((module) => [
    module,
    ...flattenModules(module.modules ?? []),
  ]);
}

function compileSdk(
  compilerFactory: CompilerFactory,
  compilerName: string,
  condition: string,
): Promise<{ modules: string[]; warnings: string[] }> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-sdk-selector-'));
  fs.writeFileSync(
    path.join(root, 'entry.js'),
    'import { loadScriptNode } from "@module-federation/sdk";\nexport default loadScriptNode;\n',
  );
  return new Promise((resolve, reject) => {
    const compiler = compilerFactory({
      context: packageDir,
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
      compiler.close(() => undefined);
      fs.rmSync(root, { recursive: true, force: true });
      if (error) {
        reject(error);
        return;
      }
      const info = stats?.toJson({ modules: true, warnings: true });
      if (stats?.hasErrors()) {
        reject(new Error(info?.errors?.[0]?.message ?? 'compile failed'));
        return;
      }
      resolve({
        modules: flattenModules(
          (info?.modules ?? []) as unknown as StatsModule[],
        ).map((module) => module.name ?? module.identifier ?? ''),
        warnings: (info?.warnings ?? []).map((warning) => warning.message),
      });
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
      runSdk(
        condition,
        "console.log(require('./dist/index.cjs').isBrowserEnvValue)",
      ),
    ).toBe(expected);
  });

  it('rejects Node evaluation in a web runtime', () => {
    expect(
      runSdk(
        'module-federation:target-web',
        "require('./dist/index.cjs').loadScriptNode('unused', {}).catch((error) => console.log(error.message))",
      ),
    ).toBe('Node script loading is disabled by module-federation:target-web.');
  });

  it('evaluates a classic remote script in a worker runtime', () => {
    expect(
      runSdk(
        'module-federation:target-worker',
        "globalThis.importScripts = () => { globalThis.__worker_remote__ = { value: 42 } }; require('./dist/index.cjs').loadScriptNode('remote.js', { attrs: { globalName: '__worker_remote__' } }).then((value) => console.log(JSON.stringify(value)))",
      ),
    ).toBe('{"value":42}');
  });

  it('imports a module remote in a worker runtime', () => {
    expect(
      runSdk(
        'module-federation:target-worker',
        "require('./dist/index.cjs').loadScriptNode('data:text/javascript,export default { value: 42 }', { attrs: { type: 'module' } }).then((value) => console.log(value.default.value))",
      ),
    ).toBe('42');
  });

  it.each(compilerCases())(
    'keeps Node evaluation out of the %s web graph',
    async (name, compiler) => {
      const { modules } = await compileSdk(
        compiler,
        name,
        'module-federation:target-web',
      );
      expect(modules).toContain('./dist/selectors/platform-loader/web.js');
      expect(modules).not.toContain('./dist/node.js');
    },
    60_000,
  );

  it.each(compilerCases())(
    'leaves the worker module import to the %s runtime',
    async (name, compiler) => {
      const { modules, warnings } = await compileSdk(
        compiler,
        name,
        'module-federation:target-worker',
      );
      expect(modules).toContain('./dist/selectors/platform-loader/worker.js');
      expect(warnings).toEqual([]);
    },
    60_000,
  );
});
