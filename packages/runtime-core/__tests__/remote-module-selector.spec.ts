import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { TextDecoder, TextEncoder } from 'node:util';
import type webpack from 'webpack';

const packageDir = path.resolve(__dirname, '..');
type CompilerFactory = typeof webpack;
type StatsModule = {
  name?: string;
  identifier?: string;
  modules?: StatsModule[];
};

function runNode(conditions: string[], code: string): string {
  const output = execFileSync(
    process.execPath,
    [...conditions.map((condition) => `--conditions=${condition}`), '-e', code],
    { cwd: packageDir, encoding: 'utf8' },
  );
  return output.trim();
}

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

function flattenModules(modules: StatsModule[]): StatsModule[] {
  return modules.flatMap((module) => [
    module,
    ...flattenModules(module.modules ?? []),
  ]);
}

function selectedModules(
  compilerFactory: CompilerFactory,
  name: string,
): Promise<string[]> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-selector-'));
  fs.writeFileSync(
    path.join(root, 'entry.js'),
    'import { Module } from "@module-federation/runtime-core";\nexport default Module;\n',
  );
  return new Promise((resolve, reject) => {
    const compiler = compilerFactory({
      context: packageDir,
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
      externals: [
        (
          { request }: { request?: string },
          callback: (error?: Error | null, result?: string) => void,
        ) => {
          if (
            request?.startsWith('@module-federation/') &&
            request !== '@module-federation/runtime-core'
          ) {
            callback(null, `commonjs ${request}`);
            return;
          }
          callback();
        },
      ],
    });
    compiler.run((error, stats) => {
      compiler.close(() => undefined);
      fs.rmSync(root, { recursive: true, force: true });
      if (error) {
        reject(error);
        return;
      }
      const info = stats?.toJson({ modules: true });
      if (stats?.hasErrors()) {
        reject(new Error(info?.errors?.[0]?.message ?? 'compile failed'));
        return;
      }
      const modules = flattenModules(
        (info?.modules ?? []) as unknown as StatsModule[],
      );
      resolve(modules.map((module) => module.name ?? module.identifier ?? ''));
    });
  });
}

describe('remote module selector packaging', () => {
  it('keeps the remote module available by default', () => {
    expect(
      runNode(
        [],
        "const { Module } = require('#mf/remote-module'); console.log(new Module({ remoteInfo: { name: 'remote' }, host: {} }).remoteInfo.name)",
      ),
    ).toBe('remote');
  });

  it('exports the unavailable module for the no-remote condition', () => {
    expect(
      runNode(
        ['module-federation:no-remote'],
        "const { Module } = require('#mf/remote-module'); try { new Module() } catch (error) { console.log(error.message) }",
      ),
    ).toBe(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  });

  it('lets webpack and rspack select the disabled leaf by condition name', async () => {
    const selected = await Promise.all(
      compilerCases().map(([name, compiler]) =>
        selectedModules(compiler, name),
      ),
    );
    for (const modules of selected) {
      expect(modules).toContain('./dist/selectors/remote-module/disabled.js');
      expect(modules).toContain('./dist/remote/disabled.js');
      expect(modules).not.toContain('./dist/selectors/remote-module/legacy.js');
      expect(modules).not.toContain('./dist/module/index.js');
    }
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
      runNode(
        [],
        `const { Module } = require(${JSON.stringify(cjsPath)}); console.log(new Module({ remoteInfo: { name: 'remote' }, host: {} }).remoteInfo.name)`,
      ),
    ).toBe('remote');
    expect(
      runNode(
        [],
        `import(${JSON.stringify(esmUrl)}).then(({ Module }) => console.log(new Module({ remoteInfo: { name: 'remote' }, host: {} }).remoteInfo.name))`,
      ),
    ).toBe('remote');
  });
});
