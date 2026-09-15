#!/usr/bin/env node
'use strict';
// Real Webpack watch builds. No compiler mocks, synthetic hooks, or dependencies.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { execFileSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, '').split('=');
    return [key, value.join('=') || true];
  }),
);
const core = path.resolve(args.core || process.cwd());
const root = path.resolve(args.output || path.join(__dirname, 'results'));
const scenario = args.scenario || 'exposes';
assert(['exposes', 'unrelated'].includes(scenario));
const parameters = {
  exposes: Number(args.exposes || 100),
  common: Number(args.common || 20),
  unrelated: Number(args.unrelated || 2000),
  rebuilds: Number(args.rebuilds || 3),
};
for (const [key, value] of Object.entries(parameters))
  assert(
    Number.isSafeInteger(value) && value > 0,
    `${key} must be a positive integer`,
  );
const selection = args.selection || 'source';
assert(['source', 'flag'].includes(selection));
const refs = {
  graph: args['graph-ref'] || 'b830b22456c1ad6ad043ad3fcf5af2522cc7deeb',
  legacy: args['legacy-ref'] || 'd410bef123f5d91345e22db94b6eefb686ebc819',
};
const req = createRequire(path.join(core, 'package.json'));
const manifestReq = createRequire(
  path.join(core, 'packages/manifest/package.json'),
);
const enhancedReq = createRequire(
  path.join(core, 'packages/enhanced/package.json'),
);
let phase = {
  collectorMs: 0,
  collectorCalls: 0,
  graphMs: 0,
  graphCalls: 0,
  handlerMs: 0,
  handlerCalls: 0,
  toJsonMs: 0,
  toJsonCalls: 0,
};
const emptyPhase = () =>
  Object.fromEntries(Object.keys(phase).map((key) => [key, 0]));

function sourceManager(ref) {
  const cache = new Map();
  const { transformSync } = req('@swc/core');
  function load(name) {
    if (cache.has(name)) return cache.get(name).exports;
    const source = execFileSync(
      'git',
      ['show', `${ref}:packages/manifest/src/${name}.ts`],
      { cwd: core, encoding: 'utf8' },
    );
    const code = transformSync(source, {
      jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
      module: { type: 'commonjs' },
    }).code;
    const module = { exports: {} };
    cache.set(name, module);
    new Function('require', 'module', 'exports', code)(
      (id) => (id.startsWith('./') ? load(id.slice(2)) : manifestReq(id)),
      module,
      module.exports,
    );
    if (name === 'collectGraph') {
      const original = module.exports.collectGraph;
      // SWC exports use getters, so replace the module object rather than a getter.
      module.exports = {
        ...module.exports,
        collectGraph(...values) {
          const start = performance.now();
          phase.graphCalls++;
          try {
            return original(...values);
          } finally {
            phase.graphMs += performance.now() - start;
          }
        },
      };
    }
    if (name === 'ModuleHandler')
      instrumentSync(
        module.exports.ModuleHandler.prototype,
        'collect',
        'handler',
      );
    return module.exports;
  }
  return load('StatsManager').StatsManager;
}

function instrumentSync(object, method, prefix) {
  const original = object[method];
  object[method] = function (...values) {
    const start = performance.now();
    phase[`${prefix}Calls`]++;
    try {
      return original.apply(this, values);
    } finally {
      phase[`${prefix}Ms`] += performance.now() - start;
    }
  };
}

function fixture(directory) {
  fs.mkdirSync(directory, { recursive: true });
  const write = (file, content) =>
    fs.writeFileSync(path.join(directory, file), content);
  write(
    'package.json',
    JSON.stringify({
      name: 'manifest-benchmark',
      version: '1.0.0',
      private: true,
    }),
  );
  const exposes = {};
  const shared = {};
  if (scenario === 'exposes') {
    for (let i = 0; i < parameters.common; i++)
      write(`common-${i}.js`, `export default ${i};\n`);
    write('shared.js', 'export default "shared-value";\n');
    shared['./shared.js'] = {
      singleton: true,
      version: '1.0.0',
      requiredVersion: '1.0.0',
    };
    for (let i = 0; i < parameters.exposes; i++) {
      const imports = Array.from(
        { length: parameters.common },
        (_, n) => `import common${n} from './common-${n}.js';`,
      ).join('\n');
      const sum =
        Array.from({ length: parameters.common }, (_, n) => `common${n}`).join(
          ' + ',
        ) || '0';
      write(
        `expose-${i}.js`,
        `${imports}\nimport shared from './shared.js';\nimport './style-${i}.css';\nexport default () => [shared, ${sum}, ${i}];\nexport const lazy = () => import('./lazy-${i}.js');\n`,
      );
      write(
        `lazy-${i}.js`,
        `import './lazy-${i}.css';\nexport default ${i};\n`,
      );
      write(
        `style-${i}.css`,
        `.expose-${i} { color: rgb(${i % 255}, 20, 30); }\n`,
      );
      write(`lazy-${i}.css`, `.lazy-${i} { margin: ${i}px; }\n`);
      exposes[`./Component${i}`] = `./expose-${i}.js`;
    }
    write(
      'entry.js',
      'import("./expose-0.js").then(x => console.log(x.default()));\n',
    );
  } else {
    for (let i = 0; i < parameters.unrelated; i++) {
      write(`unrelated-${i}.js`, `export default ${i};\n`);
    }
    const imports = Array.from(
      { length: parameters.unrelated },
      (_, n) => `import item${n} from './unrelated-${n}.js';`,
    ).join('\n');
    const items = Array.from(
      { length: parameters.unrelated },
      (_, n) => `item${n}`,
    ).join(',');
    write(
      'entry.js',
      `${imports}\nconsole.log([${items}]);\nimport('remote/Widget').then(console.log);\n`,
    );
  }
  return { exposes, shared };
}

function readArtifact(output, filename, directory) {
  return JSON.parse(
    fs
      .readFileSync(path.join(output, filename), 'utf8')
      .split(directory)
      .join('<fixture>'),
  );
}

function checkAssets(stats, output) {
  const assetCounts = { jsSync: 0, jsAsync: 0, cssSync: 0, cssAsync: 0 };
  for (const item of [...stats.exposes, ...stats.shared]) {
    for (const type of ['js', 'css'])
      for (const load of ['sync', 'async']) {
        for (const asset of item.assets[type][load]) {
          assert(
            fs.existsSync(path.join(output, asset)),
            `Missing emitted asset ${asset}`,
          );
          assetCounts[`${type}${load[0].toUpperCase()}${load.slice(1)}`]++;
        }
      }
  }
  if (scenario === 'exposes') {
    assert.equal(stats.exposes.length, parameters.exposes);
    assert.equal(stats.shared.length, 1);
    assert(
      assetCounts.jsSync &&
        assetCounts.jsAsync &&
        assetCounts.cssSync &&
        assetCounts.cssAsync,
      'Fixture must exercise sync/async JS and CSS assets',
    );
  } else {
    assert.equal(stats.exposes.length, 0);
    assert.equal(stats.shared.length, 0);
    assert.equal(stats.remotes.length, 1);
  }
  return assetCounts;
}

async function worker() {
  const mode = args.worker;
  assert(['graph', 'legacy'].includes(mode));
  fs.mkdirSync(root, { recursive: true });
  const directory = fs.mkdtempSync(path.join(root, `${mode}-`));
  const { exposes, shared } = fixture(directory);
  const output = path.join(directory, 'dist');
  // Select before Enhanced imports StatsPlugin. Only the collector's source changes.
  const managerModule = req(
    path.join(core, 'packages/manifest/dist/StatsManager.js'),
  );
  if (selection === 'source')
    managerModule.StatsManager = sourceManager(refs[mode]);
  const Manager = managerModule.StatsManager;
  const original = Manager.prototype.generateStats;
  Manager.prototype.generateStats = async function (...values) {
    const start = performance.now();
    phase.collectorCalls++;
    try {
      return await original.apply(this, values);
    } finally {
      phase.collectorMs += performance.now() - start;
    }
  };
  const webpack = req('webpack');
  instrumentSync(webpack.Stats.prototype, 'toJson', 'toJson');
  const { ModuleFederationPlugin } = enhancedReq('@module-federation/enhanced');
  const options = {
    name: 'manifest_benchmark',
    filename: 'container.js',
    dts: false,
    dev: {
      disableHotTypesReload: true,
      disableLiveReload: true,
      disableDynamicRemoteTypeHints: true,
    },
    manifest:
      selection === 'flag' ? { useLegacyStats: mode === 'legacy' } : true,
    exposes,
    shared,
    ...(scenario === 'unrelated'
      ? { remotes: { remote: 'remote@https://example.invalid/remoteEntry.js' } }
      : {}),
  };
  const config = {
    context: directory,
    mode: 'development',
    devtool: false,
    target: 'web',
    entry: './entry.js',
    cache: { type: 'memory' },
    experiments: { css: true },
    output: {
      path: output,
      filename: '[name].js',
      chunkFilename: '[name].js',
      cssFilename: '[name].css',
      cssChunkFilename: '[name].css',
      publicPath: '/',
      uniqueName: 'manifest_benchmark',
    },
    module: { rules: [{ test: /\.css$/, type: 'css/auto' }] },
    optimization: {
      minimize: false,
      moduleIds: 'named',
      chunkIds: 'named',
      splitChunks: false,
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ModuleFederationPlugin(options),
    ],
    infrastructureLogging: { level: 'error' },
  };
  const compiler = webpack(config);
  const results = [];
  let buildStart;
  let editStart;
  let watch;
  compiler.hooks.watchRun.tap('benchmark-clock', () => {
    phase = emptyPhase();
    buildStart = performance.now();
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      watch.close(() => reject(new Error('Watch build timed out after 120s')));
    }, 120000);
    watch = compiler.watch({ aggregateTimeout: 20 }, async (error, stats) => {
      const end = performance.now();
      try {
        if (error) throw error;
        if (stats.hasErrors())
          throw new Error(stats.toString({ all: false, errors: true }));
        const measured = { ...phase };
        const artifacts = {
          stats: readArtifact(output, 'mf-stats.json', directory),
          manifest: readArtifact(output, 'mf-manifest.json', directory),
        };
        const builtModules = [...stats.compilation.modules].filter((module) =>
          stats.compilation.builtModules.has(module),
        ).length;
        const hotUpdateAssets = stats.compilation
          .getAssets()
          .filter((asset) => asset.name.includes('.hot-update.')).length;
        if (results.length) {
          assert.equal(
            builtModules,
            1,
            'A watch edit must rebuild exactly one source module',
          );
          assert(
            hotUpdateAssets > 0,
            'Incremental build must emit actual HMR updates',
          );
        }
        assert.equal(
          measured.collectorCalls,
          1,
          'Collector instrumentation must cover each real build',
        );
        if (mode === 'legacy')
          assert(
            measured.toJsonCalls > 0,
            'Legacy selection must invoke Stats.toJson',
          );
        else
          assert.equal(
            measured.toJsonCalls,
            0,
            'Graph selection unexpectedly fell back to Stats.toJson',
          );
        results.push({
          kind: results.length ? 'incremental' : 'cold',
          index: results.length,
          buildMs: end - buildStart,
          editToDoneMs: editStart ? end - editStart : null,
          ...measured,
          peakRssMiB: process.resourceUsage().maxRSS / 1024,
          modules: stats.compilation.modules.size,
          chunks: stats.compilation.chunks.size,
          builtModules,
          hotUpdateAssets,
          warnings: stats.compilation.warnings.map(
            (warning) => warning.message,
          ),
          assetCounts: checkAssets(artifacts.stats, output),
          artifacts,
        });
        if (results.length > parameters.rebuilds) {
          clearTimeout(timeout);
          watch.close((closeError) =>
            closeError ? reject(closeError) : resolve(),
          );
          return;
        }
        const editFile = path.join(
          directory,
          scenario === 'exposes' ? 'expose-0.js' : 'unrelated-0.js',
        );
        // Let Webpack finish installing watchers before the genuine single-file edit.
        setTimeout(() => {
          editStart = performance.now();
          fs.appendFileSync(
            editFile,
            `\nconsole.log('edit-${results.length}');\n`,
          );
        }, 100);
      } catch (failure) {
        clearTimeout(timeout);
        watch.close(() => reject(failure));
      }
    });
  });
  await new Promise((resolve, reject) =>
    compiler.close((error) => (error ? reject(error) : resolve())),
  );
  const record = {
    mode,
    selection,
    sourceRef: selection === 'source' ? refs[mode] : 'built distribution',
    coreHead: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: core,
      encoding: 'utf8',
    }).trim(),
    node: process.version,
    webpack: webpack.version,
    scenario,
    parameters,
    directory,
    results,
    builtManifestSha256: require('node:crypto')
      .createHash('sha256')
      .update(
        fs.readFileSync(
          path.join(core, 'packages/manifest/dist/StatsManager.js'),
        ),
      )
      .digest('hex'),
  };
  fs.writeFileSync(
    path.join(directory, 'record.json'),
    JSON.stringify(record, null, 2),
  );
  console.log(`BENCHMARK_RECORD=${path.join(directory, 'record.json')}`);
}

function differences(a, b, at = '$', output = []) {
  if (JSON.stringify(a) === JSON.stringify(b)) return output;
  if (
    a &&
    b &&
    typeof a === 'object' &&
    typeof b === 'object' &&
    Array.isArray(a) === Array.isArray(b)
  ) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
      differences(a[key], b[key], `${at}.${key}`, output);
  } else output.push({ path: at, legacy: a ?? null, graph: b ?? null });
  return output;
}

function canonical(value) {
  if (Array.isArray(value))
    return value
      .map(canonical)
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}

function distribution(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return {
    n: sorted.length,
    median:
      sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2,
    min: sorted[0],
    max: sorted.at(-1),
  };
}

function orchestrate() {
  fs.mkdirSync(root, { recursive: true });
  const samples = Number(args.samples || 5);
  const warmup = Number(args.warmup ?? 1);
  assert(Number.isSafeInteger(samples) && samples > 0);
  assert(Number.isSafeInteger(warmup) && warmup >= 0);
  const runs = [];
  const correctness = [];
  const forwarded = process.argv
    .slice(2)
    .filter((arg) => !/^--(samples|warmup|worker)=/.test(arg));
  for (let pair = -warmup; pair < samples; pair++) {
    const order =
      (pair + warmup) % 2 ? ['graph', 'legacy'] : ['legacy', 'graph'];
    const records = {};
    for (const mode of order) {
      const stdout = execFileSync(
        process.execPath,
        [__filename, ...forwarded, `--worker=${mode}`],
        {
          encoding: 'utf8',
          maxBuffer: 20 * 1024 * 1024,
          env: { ...process.env, NODE_ENV: 'development' },
        },
      );
      const filename = stdout.match(/BENCHMARK_RECORD=(.+)/)?.[1];
      assert(filename, stdout);
      records[mode] = JSON.parse(fs.readFileSync(filename, 'utf8'));
      runs.push({ warmup: pair < 0, pair, ...records[mode] });
      console.log(
        `${pair < 0 ? 'warmup' : `sample ${pair + 1}`} ${mode}: ${records[mode].results.map((r) => `${r.kind}=${r.buildMs.toFixed(1)}ms collector=${r.collectorMs.toFixed(1)}ms toJson=${r.toJsonCalls}`).join(', ')}`,
      );
    }
    for (let i = 0; i <= parameters.rebuilds; i++) {
      const legacy = records.legacy.results[i].artifacts;
      const graph = records.graph.results[i].artifacts;
      const exact = differences(legacy, graph);
      const orderInsensitive = differences(canonical(legacy), canonical(graph));
      correctness.push({ pair, build: i, exact, orderInsensitive });
    }
  }
  const summary = {};
  for (const mode of ['legacy', 'graph']) {
    summary[mode] = {};
    for (const kind of ['cold', 'incremental']) {
      const samples = runs
        .filter((run) => !run.warmup && run.mode === mode)
        .map((run) => run.results.filter((row) => row.kind === kind));
      // Rebuilds in one worker are correlated: summarize each worker first.
      summary[mode][kind] = Object.fromEntries(
        [
          'buildMs',
          'collectorMs',
          'toJsonMs',
          'toJsonCalls',
          'graphMs',
          'handlerMs',
          'peakRssMiB',
        ].map((key) => [
          key,
          distribution(
            samples.map(
              (rows) => distribution(rows.map((row) => row[key])).median,
            ),
          ),
        ]),
      );
    }
  }
  const report = {
    createdAt: new Date().toISOString(),
    command: [process.execPath, __filename, ...process.argv.slice(2)],
    environment: {
      platform: process.platform,
      architecture: process.arch,
      cpus: os.cpus().length,
      cpu: os.cpus()[0].model,
      totalMemoryGiB: os.totalmem() / 1024 ** 3,
      nodeOptions: process.env.NODE_OPTIONS || '',
    },
    controls: {
      freshProcessPerModeAndPair: true,
      alternatingOrder: true,
      warmupPairsDiscarded: warmup,
      webpackCache:
        'memory (fresh cold build; preserved for real watch rebuilds)',
      filesystemCache: 'OS cache not flushed; warmup + alternation only',
      dts: false,
      hmrPlugin: true,
      splitChunks: false,
      css: 'Webpack native experimental CSS',
      peakRss: 'process high-water mark, cumulative within cold+rebuild worker',
      timeBoundary:
        'watchRun to callback; excludes process setup and watcher debounce',
      semanticNormalization:
        'fixture absolute directory only; exact diffs retained; separate all-array-sorted comparison diagnoses order-only differences',
    },
    scenario,
    parameters,
    selection,
    refs,
    summary,
    correctness,
    runs,
  };
  const reportPath = path.join(root, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  const mismatch = correctness.reduce(
    (sum, result) => sum + result.orderInsensitive.length,
    0,
  );
  console.log(
    `Report: ${reportPath}; semantic differences=${mismatch}; exact differences=${correctness.reduce((sum, result) => sum + result.exact.length, 0)}`,
  );
  if (mismatch) process.exitCode = 2;
}

if (args.worker)
  worker().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
else orchestrate();
