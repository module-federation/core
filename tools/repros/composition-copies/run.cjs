const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');
const os = require('node:os');
const stage = path.resolve(
  process.env.COMPOSITION_PROOF_DIR ||
    fs.mkdtempSync(path.join(os.tmpdir(), 'mf-composition-copies-')),
);
const observeOnly = process.argv.includes('--observe-only');
require('./setup.cjs')(stage);
console.log(`Composition proof artifacts: ${stage}`);
const req = createRequire(path.join(stage, 'package.json'));
const webpack = req('webpack');
const A = req('enhanced-a/webpack').ModuleFederationPlugin;
const B = req('enhanced-b/webpack').ModuleFederationPlugin;
const slot = Symbol.for('module-federation.composition/1');
const anchor = (name) =>
  path.join(
    stage,
    `family-${name}/node_modules/@module-federation/runtime-tools`,
  );
const results = [];
async function build(label, specs, poison) {
  const context = path.join(stage, label);
  fs.mkdirSync(context, { recursive: true });
  fs.writeFileSync(
    path.join(context, 'index.js'),
    'globalThis.__compositionProofInstances.push(__webpack_require__.federation.instance); export default 1;',
  );
  fs.writeFileSync(
    path.join(context, 'second.js'),
    'globalThis.__compositionProofInstances.push(__webpack_require__.federation.instance);',
  );
  let selected;
  const plugins = specs.map(
    ({ Ctor, family, target }, i) =>
      new Ctor({
        name: `host_${i}`,
        dts: false,
        manifest: false,
        implementation: anchor(family),
        experiments: {
          composedRuntime: true,
          ...(target ? { optimization: { target } } : {}),
        },
      }),
  );
  if (poison !== undefined)
    plugins.unshift({
      apply(c) {
        c[slot] = poison;
      },
    });
  plugins.push({
    apply(c) {
      c.hooks.afterCompile.tap('CaptureComposition', (compilation) => {
        const entry = c[slot]?.entry;
        selected = entry && { source: entry.source, adapters: entry.adapters };
      });
    },
  });
  let compiler;
  const result = await new Promise((resolve) => {
    try {
      compiler = webpack({
        context,
        mode: 'production',
        devtool: false,
        target: 'async-node',
        entry: ['./index.js', './second.js'],
        optimization: { minimize: false, concatenateModules: false },
        output: { path: path.join(context, 'dist') },
        plugins,
      });
    } catch (e) {
      return resolve({ error: e.message });
    }
    compiler.run((error, stats) =>
      compiler.close(() =>
        resolve(
          error
            ? { error: error.message }
            : {
                stats: stats.toJson({
                  all: false,
                  errors: true,
                  warnings: true,
                  modules: true,
                }),
                selected,
              },
        ),
      ),
    );
  });
  const r = {
    label,
    expected: label.startsWith('conflict')
      ? 'reject incompatible compiler composition'
      : label.startsWith('invalid')
        ? 'reject invalid compiler composition slot'
        : 'successful compatible composition',
    ...result,
  };
  if (r.stats) {
    r.errors = r.stats.errors.map((e) => e.message);
    r.warnings = r.stats.warnings.map((e) => e.message);
    r.modules = r.stats.modules.map((m) => m.nameForCondition).filter(Boolean);
    delete r.stats;
  }
  if (!r.error && r.errors?.length === 0) {
    globalThis.__compositionProofInstances = [];
    try {
      require(path.join(context, 'dist/main.js'));
      const instances = globalThis.__compositionProofInstances;
      r.executedIdentity = {
        count: instances.length,
        nonnull: !!instances[0],
        same: instances[0] === instances[1],
      };
    } catch (error) {
      r.executionError = error.message;
    }
    delete globalThis.__compositionProofInstances;
  }
  results.push(r);
  console.log(
    JSON.stringify({
      label: r.label,
      expected: r.expected,
      error: r.error,
      errors: r.errors,
      warnings: r.warnings,
      executedIdentity: r.executedIdentity,
      executionError: r.executionError,
      selectedFamily: r.selected?.source.match(/family-[ab]/g),
      modules: r.modules?.filter((x) =>
        /family-[ab].*(compose|platform)/.test(x),
      ),
    }),
  );
}
(async () => {
  console.log(
    JSON.stringify({
      copyA: req.resolve('enhanced-a/webpack'),
      copyB: req.resolve('enhanced-b/webpack'),
      distinct: A !== B,
    }),
  );
  await build('control-same-family-ab', [
    { Ctor: A, family: 'a' },
    { Ctor: B, family: 'a' },
  ]);
  await build('control-same-family-ba', [
    { Ctor: B, family: 'a' },
    { Ctor: A, family: 'a' },
  ]);
  await build('conflict-family-ab', [
    { Ctor: A, family: 'a' },
    { Ctor: B, family: 'b' },
  ]);
  await build('conflict-family-ba', [
    { Ctor: B, family: 'b' },
    { Ctor: A, family: 'a' },
  ]);
  await build('conflict-target-web-node', [
    { Ctor: A, family: 'a', target: 'web' },
    { Ctor: B, family: 'a', target: 'node' },
  ]);
  await build('conflict-target-node-web', [
    { Ctor: B, family: 'a', target: 'node' },
    { Ctor: A, family: 'a', target: 'web' },
  ]);
  for (const [kind, value] of [
    ['null', null],
    ['primitive', true],
    ['missing-shape', {}],
    ['missing-version', { participants: [], sealed: false }],
    ['invalid-version', { version: 2, participants: [], sealed: false }],
  ])
    await build('invalid-slot-' + kind, [{ Ctor: A, family: 'a' }], value);
  fs.writeFileSync(
    path.join(stage, 'results.json'),
    JSON.stringify(results, null, 2),
  );
  if (!observeOnly) {
    assert.notEqual(A, B);
    for (const result of results) {
      if (result.label.startsWith('control')) {
        assert.equal(result.error, undefined);
        assert.deepEqual(result.errors, []);
        assert.deepEqual(result.warnings, []);
        assert.deepEqual(result.executedIdentity, {
          count: 2,
          nonnull: true,
          same: true,
        });
        assert.equal(
          result.modules.filter((m) =>
            /webpack-bundler-runtime[\\/]dist[\\/]compose\.js$/.test(m),
          ).length,
          1,
        );
        assert.equal(
          result.modules.filter((m) =>
            /runtime-core[\\/]dist[\\/]kernel\.js$/.test(m),
          ).length,
          1,
        );
        assert.ok(
          !result.modules.some((m) => m.includes('/family-b/node_modules/')),
        );
      } else if (result.label.startsWith('conflict-family'))
        assert.match(result.error, /incompatible runtime families/);
      else if (result.label.startsWith('conflict-target'))
        assert.match(result.error, /incompatible targets/);
      else
        assert.match(
          result.error,
          /Invalid module-federation\.composition\/1 compiler slot/,
        );
    }
    console.log(
      'PASS: installed-copy identity, selected graph, conflicts in both orders and invalid slot boundary',
    );
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
