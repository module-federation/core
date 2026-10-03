import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

it('checks packed root, helpers, and core in strict ESM/CJS consumers', () => {
  const runtimeDir = path.resolve(__dirname, '..');
  const workspace = path.resolve(runtimeDir, '../..');
  const fixtures = path.join(__dirname, 'resources', 'packed-declarations');
  const consumer = mkdtempSync(path.join(__dirname, 'packed-consumer-'));
  const archive = path.join(consumer, 'runtime.tgz');
  const run = (command: string, args: string[], cwd = consumer) => {
    const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
    if (result.error) throw result.error;
    expect({
      command: [command, ...args],
      status: result.status,
      diagnostics: result.status === 0 ? '' : result.stdout + result.stderr,
    }).toEqual({ command: [command, ...args], status: 0, diagnostics: '' });
  };
  try {
    run('corepack', ['pnpm', 'pack', '--out', archive], runtimeDir);
    const modules = path.join(consumer, 'node_modules');
    const federation = path.join(modules, '@module-federation');
    const runtime = path.join(federation, 'runtime');
    mkdirSync(runtime, { recursive: true });
    run('tar', ['-xzf', archive, '--strip-components=1', '-C', runtime]);
    for (const dependency of ['runtime-core', 'sdk', 'error-codes']) {
      symlinkSync(
        path.join(runtimeDir, 'node_modules/@module-federation', dependency),
        path.join(federation, dependency),
      );
    }
    mkdirSync(path.join(modules, '@types'));
    symlinkSync(
      path.join(workspace, 'node_modules/@types/node'),
      path.join(modules, '@types/node'),
    );
    symlinkSync(
      path.join(workspace, 'node_modules/webpack'),
      path.join(modules, 'webpack'),
    );
    writeFileSync(
      path.join(consumer, 'package.json'),
      JSON.stringify({
        name: 'packed-runtime-consumer',
        private: true,
        type: 'module',
      }),
    );
    for (const extension of ['mts', 'cts'])
      copyFileSync(
        path.join(fixtures, `consumer.${extension}`),
        path.join(consumer, `consumer.${extension}`),
      );
    const compiler = path.join(workspace, 'node_modules/typescript/bin/tsc');
    const flags = [
      compiler,
      '--ignoreConfig',
      '--noEmit',
      '--strict',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--lib',
      'ES2022,DOM',
      '--types',
      'node',
    ];
    for (const inputs of [
      ['consumer.mts'],
      ['consumer.cts'],
      ['consumer.mts', 'consumer.cts'],
    ])
      run(process.execPath, [...flags, ...inputs]);
    writeFileSync(
      path.join(consumer, 'namespace.mjs'),
      `import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const load=process.argv[2]==='cjs'?async name=>require(name):async name=>import(name);
const runtime=await load('@module-federation/runtime');
const helpers=await load('@module-federation/runtime/helpers');
const core=await load('@module-federation/runtime/core');
assert.equal(typeof runtime.createInstance,'function');
assert.equal(runtime.ModuleFederation,core.ModuleFederation);
assert.equal(core.default.ModuleFederation,core.ModuleFederation);
assert.equal(helpers.default.global,helpers.global);
assert.equal(helpers.default.share,helpers.share);
assert.equal(helpers.default.utils,helpers.utils);
`,
    );
    for (const format of ['esm', 'cjs'])
      run(process.execPath, ['namespace.mjs', format]);
  } finally {
    rmSync(consumer, { recursive: true, force: true });
  }
}, 30000);
