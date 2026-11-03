#!/usr/bin/env node
// Run after building runtime-core and enhanced:
// node tools/scripts/benchmark-runtime-dod.mjs --baseline <git-ref> --rounds 10 --output <json>
// Each pair uses fresh Node processes; order alternates to reduce drift.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import Module, { createRequire } from 'node:module';
import { cpus, platform, release, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const script = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(script), '../..');
const require = createRequire(path.join(root, 'package.json'));
const enhancedRequire = createRequire(
  path.join(root, 'packages/enhanced/package.json'),
);
const args = process.argv.slice(2);
const arg = (key, fallback) => {
  const i = args.indexOf(key);
  return i < 0 ? fallback : args[i + 1];
};
const remotePath =
  'packages/enhanced/src/lib/container/ContainerReferencePlugin.ts';
const pluginPaths = [
  remotePath,
  'packages/enhanced/src/lib/sharing/ConsumeSharedPlugin.ts',
  'packages/enhanced/src/lib/sharing/ProvideSharedPlugin.ts',
];
const median = (values) => quantile(values, 0.5);
function quantile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  return sorted[lo] + (sorted[Math.ceil(i)] - sorted[lo]) * (i - lo);
}
const hash = (value) => createHash('sha256').update(value).digest('hex');

if (arg('--worker')) {
  await worker(JSON.parse(readFileSync(arg('--worker'), 'utf8')));
} else {
  await main();
}

async function main() {
  const baseline = execFileSync(
    'git',
    ['rev-parse', arg('--baseline', 'HEAD')],
    { cwd: root, encoding: 'utf8' },
  ).trim();
  const rounds = Number(arg('--rounds', '10'));
  assert(Number.isInteger(rounds) && rounds > 0);
  const output = path.resolve(arg('--output', 'runtime-dod-results.json'));
  const scratch = mkdtempSync(path.join(tmpdir(), 'mf-dod-bench-'));
  const original = path.join(scratch, 'original');
  mkdirSync(original);
  const archive = execFileSync(
    'git',
    ['archive', baseline, 'packages/runtime-core/src', ...pluginPaths],
    { cwd: root },
  );
  const extraction = spawnSync('tar', ['-x', '-C', original], {
    input: archive,
  });
  assert.equal(extraction.status, 0, String(extraction.stderr));
  const esbuild = require('esbuild');
  const version = require('./packages/runtime-core/package.json').version;
  const variants = {};
  for (const [variant, sourceRoot] of [
    ['baseline', original],
    ['candidate', root],
  ]) {
    const runtimeDir = path.join(sourceRoot, 'packages/runtime-core/src');
    const runtimeBundle = path.join(scratch, `${variant}-runtime.cjs`);
    await esbuild.build({
      stdin: {
        contents: `export * from ${JSON.stringify(path.join(runtimeDir, 'index.ts'))};
export * from ${JSON.stringify(path.join(runtimeDir, 'utils/hooks/index.ts'))};`,
        resolveDir: root,
        loader: 'ts',
      },
      outfile: runtimeBundle,
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node24',
      minifyWhitespace: true,
      minifySyntax: true,
      legalComments: 'none',
      nodePaths: [
        path.join(root, 'packages/runtime-core/node_modules'),
        path.join(root, 'node_modules'),
      ],
      define: {
        __VERSION__: JSON.stringify(version),
        FEDERATION_DEBUG: '""',
      },
    });
    const pluginFiles = {};
    for (const source of pluginPaths) {
      const name = path.basename(source, '.ts');
      const pluginCode = (
        await esbuild.transform(
          readFileSync(path.join(sourceRoot, source), 'utf8'),
          { loader: 'ts', format: 'cjs', target: 'node24' },
        )
      ).code;
      const file = path.join(scratch, `${variant}-${name}.cjs`);
      writeFileSync(file, pluginCode);
      pluginFiles[name] = { file, source };
    }
    const bytes = readFileSync(runtimeBundle);
    variants[variant] = {
      runtimeBundle,
      pluginFiles,
      bundleBytes: bytes.length,
      bundleGzipBytes: gzipSync(bytes).length,
      sourceHash: hash(readFileSync(path.join(sourceRoot, remotePath))),
    };
  }
  // A checksum alone could hide offsetting result changes. Compare individual
  // semver outcomes before timing, including invalid inputs and OR ranges.
  const versions = [
    '',
    'invalid',
    '0.0.0',
    '0.2.3',
    '1.0.0',
    '1.2.3',
    '2.0.0',
    '1.2.3-alpha.1',
    '1.2.3-beta.2',
    '1.2.3+build',
    'v1.2.3',
    ...Array.from({ length: 50 }, (_, i) => `${i % 4}.${i % 7}.${i % 11}`),
  ];
  const ranges = [
    '',
    '*',
    'x',
    'X',
    '1.x',
    '^0',
    '^0.2',
    '^1.2.3',
    '~ 1.2',
    '^1.2.3-alpha.1',
    '>= 1.0.0 < 2.0.0',
    '1.0.0 - 2.0.0',
    'invalid',
    '^1 || >=3.0.0',
    'invalid || *',
    '||',
    ...versions.filter(Boolean).flatMap((v) => [`<=${v}`, `^${v}`]),
  ];
  const baselineSatisfy = require(variants.baseline.runtimeBundle).satisfy;
  const candidateSatisfy = require(variants.candidate.runtimeBundle).satisfy;
  for (const version of versions) {
    for (const range of ranges) {
      assert.equal(
        candidateSatisfy(version, range),
        baselineSatisfy(version, range),
        `${version} ${range}`,
      );
    }
  }
  const fixture = path.join(scratch, 'fixture');
  mkdirSync(fixture);
  for (let i = 0; i < 500; i++) {
    writeFileSync(
      path.join(fixture, `local-${i}.js`),
      `export const value = ${i};`,
    );
  }
  const samples = [];
  const runs = {
    'aa-baseline': variants.baseline,
    'aa-repeat': variants.baseline,
    baseline: variants.baseline,
    candidate: variants.candidate,
  };
  for (let round = 0; round < rounds; round++) {
    for (const variant of round % 2
      ? ['candidate', 'baseline', 'aa-repeat', 'aa-baseline']
      : ['aa-baseline', 'aa-repeat', 'baseline', 'candidate']) {
      const config = path.join(scratch, 'worker.json');
      writeFileSync(
        config,
        JSON.stringify({ ...runs[variant], fixture, variant, round }),
      );
      const child = spawnSync(
        process.execPath,
        ['--expose-gc', script, '--worker', config],
        {
          cwd: root,
          encoding: 'utf8',
          maxBuffer: 8 * 1024 * 1024,
          env: { ...process.env, NODE_ENV: 'production' },
          timeout: 300000,
        },
      );
      assert.equal(child.status, 0, child.stdout + child.stderr);
      const marker = child.stdout.lastIndexOf('BENCH_RESULT=');
      assert(marker >= 0, child.stdout);
      const sample = JSON.parse(
        child.stdout.slice(marker + 'BENCH_RESULT='.length),
      );
      samples.push({ round, variant, ...sample });
      console.log(`Completed pair ${round + 1}/${rounds}: ${variant}`);
    }
    writeResults();
  }

  function writeResults() {
    const summary = samples[0].metrics.map(({ name, unit }) => {
      const pick = (variant) =>
        samples
          .filter((s) => s.variant === variant)
          .map((s) => s.metrics.find((m) => m.name === name));
      const a = pick('baseline');
      const b = pick('candidate');
      const control = pick('aa-baseline');
      const repeat = pick('aa-repeat');
      for (let i = 0; i < a.length; i++) {
        assert.equal(a[i].checksum, b[i].checksum, `Output mismatch: ${name}`);
        assert.equal(a[i].iterations, b[i].iterations, name);
        assert.equal(control[i].checksum, repeat[i].checksum, name);
        assert.equal(a[i].checksum, control[i].checksum, name);
      }
      const before = a.map((m) => m.value);
      const after = b.map((m) => m.value);
      const reductions = before.map((v, i) => (1 - after[i] / v) * 100);
      const aaReductionPct = control.map(
        (m, i) => (1 - repeat[i].value / m.value) * 100,
      );
      const observedNoisePct = quantile(aaReductionPct.map(Math.abs), 0.95);
      const pairedReductionPct = median(reductions);
      const pairsFaster = reductions.filter((v) => v > 0).length;
      return {
        name,
        unit,
        baselineMedian: median(before),
        candidateMedian: median(after),
        baselineIqr: [quantile(before, 0.25), quantile(before, 0.75)],
        candidateIqr: [quantile(after, 0.25), quantile(after, 0.75)],
        pairedReductionPct,
        pairedReductionRange: [
          Math.min(...reductions),
          Math.max(...reductions),
        ],
        pairsFaster,
        pairs: before.length,
        aaReductionPct,
        observedNoisePct,
        interpretation:
          before.length >= 5 &&
          pairedReductionPct > observedNoisePct &&
          pairsFaster >= Math.ceil(before.length * 0.8)
            ? 'faster than observed A/A noise'
            : 'inconclusive',
      };
    });
    writeFileSync(
      output,
      JSON.stringify(
        {
          baseline,
          date: new Date().toISOString(),
          environment: {
            node: process.version,
            platform: `${platform()} ${release()}`,
            cpu: cpus()[0].model,
            cpus: cpus().length,
            webpack: require('webpack/package.json').version,
            esbuild: esbuild.version,
          },
          method: {
            rounds,
            order:
              'serial fresh processes; A/A and A/B interleaved, order reversed each round',
            warmup: 'per scenario; explicit GC before timed batch',
            runtime:
              'esbuild Node bundle, identifiers retained for profiles; same built dependencies',
            startup:
              'fresh Node process: evaluate runtime, construct host with 10 remotes/20 shared packages/3 versions, load shares and first raw container; excludes network, DOM and rendering',
            loadRemote: 'real API, raw in-memory containers, no network or DOM',
            webpack:
              '500 local modules, 10 remote imports; cache and minifier disabled',
            reduction: '(baseline - candidate) / baseline; paired median',
          },
          variants,
          summary,
          samples,
        },
        null,
        2,
      ) + '\n',
    );
  }
  console.table(
    JSON.parse(readFileSync(output, 'utf8')).summary.map((m) => ({
      scenario: m.name,
      before: m.baselineMedian.toFixed(3),
      after: m.candidateMedian.toFixed(3),
      unit: m.unit,
      reduction: `${m.pairedReductionPct.toFixed(1)}%`,
      wins: `${m.pairsFaster}/${m.pairs}`,
    })),
  );
  console.log(`Raw samples: ${output}\nScratch: ${scratch}`);
  if (arg('--profile-dir')) {
    const profileDir = path.resolve(arg('--profile-dir'));
    mkdirSync(profileDir, { recursive: true });
    for (const variant of ['baseline', 'candidate']) {
      const config = path.join(scratch, `profile-${variant}.json`);
      writeFileSync(
        config,
        JSON.stringify({ ...variants[variant], profile: true }),
      );
      const child = spawnSync(
        process.execPath,
        [
          '--expose-gc',
          '--cpu-prof',
          `--cpu-prof-dir=${profileDir}`,
          `--cpu-prof-name=${variant}.cpuprofile`,
          script,
          '--worker',
          config,
        ],
        { cwd: root, encoding: 'utf8', timeout: 300000 },
      );
      assert.equal(child.status, 0, child.stdout + child.stderr);
    }
  }
}

async function worker(config) {
  const evaluationStart = performance.now();
  const runtime = require(config.runtimeBundle);
  const evaluationMs = performance.now() - evaluationStart;
  const metrics = [
    {
      name: 'startup/module-evaluation',
      unit: 'ms/start',
      iterations: 1,
      checksum: 1,
      value: evaluationMs,
    },
  ];
  async function startup(record) {
    runtime.resetFederationGlobalInfo();
    const shared = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [
        `shared-${i}`,
        ['1.0.0', '1.2.0', '1.3.0'].map((version) => ({
          version,
          get: () => () => version,
          shareConfig: { requiredVersion: '^1.0.0', singleton: false },
        })),
      ]),
    );
    const remotes = Array.from({ length: 10 }, (_, i) => ({
      name: `startup-${i}`,
      entry: `https://example.test/${i}.js`,
    }));
    const plugins = Array.from({ length: 5 }, (_, i) => ({
      name: `startup-observer-${i}`,
      beforeRequest: (data) => data,
      resolveShare: (data) => data,
    }));
    let start = performance.now();
    const host = new runtime.ModuleFederation({
      name: 'startup-host',
      remotes,
      shared,
      plugins,
      shareStrategy: 'loaded-first',
    });
    const initializeMs = performance.now() - start;
    start = performance.now();
    const values = [];
    for (const name of Object.keys(shared)) {
      const factory = await host.loadShare(name);
      values.push(factory());
    }
    const sharesMs = performance.now() - start;
    assert.deepEqual(values, Array(20).fill('1.3.0'));
    let initialized = 0;
    host.initRawContainer(remotes[9].name, remotes[9].entry, {
      init() {
        initialized++;
      },
      get() {
        return () => ({ value: 42 });
      },
    });
    start = performance.now();
    const first = await host.loadRemote('startup-9/Widget');
    const firstMs = performance.now() - start;
    assert.equal(first.value, 42);
    start = performance.now();
    const warm = await host.loadRemote('startup-9/Widget');
    const warmMs = performance.now() - start;
    assert.equal(warm.value, 42);
    assert.equal(initialized, 1);
    if (record) {
      for (const [name, value] of Object.entries({
        initialize: initializeMs,
        'load-20-shares': sharesMs,
        'first-loadRemote': firstMs,
        'cached-loadRemote': warmMs,
        total: evaluationMs + initializeMs + sharesMs + firstMs,
      })) {
        metrics.push({
          name: `startup/${name}`,
          value,
          unit: 'ms/start',
          iterations: 1,
          checksum: 42,
        });
      }
    }
  }
  await startup(true);
  if (config.profile) {
    // Separate from the measurements: sampling overhead must not affect A/B.
    for (let i = 0; i < 200; i++) await startup(false);
    return;
  }
  const webpack = require('webpack');
  // Transpile only this plugin; reuse exactly the same built dependencies.
  function loadPlugin(name) {
    const { file, source } = config.pluginFiles[name];
    const filename = path.join(
      root,
      source.replace('/src/', '/dist/src/').replace(/\.ts$/, '.js'),
    );
    const pluginModule = new Module(filename);
    pluginModule.filename = filename;
    pluginModule.paths = Module._nodeModulePaths(path.dirname(filename));
    pluginModule._compile(readFileSync(file, 'utf8'), filename);
    return pluginModule.exports.default;
  }
  const ContainerReferencePlugin = loadPlugin('ContainerReferencePlugin');
  function syncMeasure(name, iterations, fn) {
    let checksum = 0;
    for (let i = 0; i < Math.min(30000, iterations); i++) fn(i);
    global.gc();
    const start = performance.now();
    for (let i = 0; i < iterations; i++) checksum += fn(i);
    const elapsedMs = performance.now() - start;
    metrics.push({
      name,
      iterations,
      checksum,
      elapsedMs,
      value: (elapsedMs * 1000) / iterations,
      unit: 'us/op',
    });
  }
  async function asyncMeasure(name, iterations, fn) {
    let checksum = 0;
    for (let i = 0; i < Math.min(10000, iterations); i++) await fn(i);
    global.gc();
    const start = performance.now();
    for (let i = 0; i < iterations; i++) checksum += await fn(i);
    const elapsedMs = performance.now() - start;
    metrics.push({
      name,
      iterations,
      checksum,
      elapsedMs,
      value: (elapsedMs * 1000) / iterations,
      unit: 'us/op',
    });
  }
  await asyncMeasure('startup/repeated-instance', 200, async () => {
    await startup(false);
    return 1;
  });
  const semverCases = [
    ['1.2.3', '^1.0.0'],
    ['2.0.0', '^1.0.0'],
    ['1.2.3-beta.2', '^1.2.3-beta.1'],
    ['1.9.0', '~1.2.0'],
    ['3.0.0', '^1 || >=3.0.0'],
    ['1.2.3', '1.0.0 - 2.0.0'],
    ['1.2.3', '*'],
    ['invalid', '^1.0.0'],
  ];
  syncMeasure('semver/mixed', 100000, (i) => {
    const [version, range] = semverCases[i % semverCases.length];
    return Number(runtime.satisfy(version, range));
  });
  const makeRemotes = (n) =>
    Array.from({ length: n }, (_, i) => ({
      name: `@scope/remote${String(i).padStart(4, '0')}`,
      alias: `app${String(i).padStart(4, '0')}`,
      entry: `https://example.test/${i}/entry.js`,
    }));
  for (const n of [1, 10, 100, 1000]) {
    const remotes = makeRemotes(n);
    // Deterministic mix: name, alias, miss, and non-boundary prefix.
    const requests = Array.from({ length: 256 }, (_, i) => {
      const remote = remotes[(i * 37) % n];
      return [
        `${remote.name}/Button`,
        `${remote.alias}/nested/Box`,
        `missing${i}/Button`,
        `${remote.name}-other/Box`,
      ][i % 4];
    });
    syncMeasure(`matchRemote/${n}`, n < 100 ? 1000000 : 100000, (i) => {
      const match = runtime.matchRemoteWithNameAndExpose(
        remotes,
        requests[i % 256],
      );
      return match ? match.expose.length + match.pkgNameOrAlias.length : 0;
    });
  }
  for (const listeners of [0, 1, 5, 20]) {
    for (const kind of ['async', 'waterfall']) {
      const hook =
        kind === 'async'
          ? new runtime.AsyncHook()
          : new runtime.AsyncWaterfallHook('benchmark');
      const data = { value: 1 };
      let calls = 0;
      for (let i = 0; i < listeners; i++) {
        hook.on(() => {
          calls++;
        });
      }
      await asyncMeasure(`hook/${kind}/${listeners}`, 500000, async () => {
        const value = await hook.emit(data);
        assert(kind === 'async' ? value === undefined : value === data);
        return 1;
      });
      assert.equal(calls, 510000 * listeners);
    }
  }
  for (const n of [1, 10, 100, 1000]) {
    for (const pluginCount of [0, 5]) {
      runtime.resetFederationGlobalInfo();
      const remotes = makeRemotes(n);
      let observed = 0;
      const plugins = Array.from({ length: pluginCount }, (_, i) => ({
        name: `observer-${i}`,
        beforeRequest(data) {
          observed++;
          return data;
        },
        onLoad() {
          observed++;
        },
        afterLoadRemote() {
          observed++;
        },
      }));
      const host = new runtime.ModuleFederation({
        name: 'benchmark-host',
        remotes,
        plugins,
        shareStrategy: 'loaded-first',
      });
      for (let i = 0; i < remotes.length; i++) {
        const remote = remotes[i];
        const value = { index: i };
        host.initRawContainer(remote.name, remote.entry, {
          init() {},
          get() {
            return () => value;
          },
        });
      }
      const ids = remotes.map((r, i) => `${i % 2 ? r.alias : r.name}/Button`);
      await asyncMeasure(
        `loadRemote/${n}/plugins-${pluginCount}`,
        40000,
        async (i) => {
          const index = (i * 37) % n;
          const value = await host.loadRemote(ids[index]);
          assert.equal(value.index, index);
          return value.index;
        },
      );
      assert.equal(observed, 50000 * pluginCount * 3);
    }
  }
  function options(n) {
    return {
      remoteType: 'script',
      remotes: Object.fromEntries(
        makeRemotes(n).map((r, i) => [r.name, `container${i}@${r.entry}`]),
      ),
    };
  }
  function compilerOptions(n) {
    return {
      mode: 'development',
      context: config.fixture,
      entry: './index.js',
      devtool: false,
      cache: false,
      output: {
        path: path.join(config.fixture, 'dist'),
        filename: '[name].js',
        uniqueName: 'dod-benchmark',
      },
      optimization: { minimize: false },
      plugins: [new ContainerReferencePlugin(options(n))],
      infrastructureLogging: { level: 'none' },
    };
  }
  for (const n of [1, 10, 32, 33, 100, 1000]) {
    const compiler = webpack(compilerOptions(n));
    const params = compiler.newCompilationParams();
    compiler.newCompilation(params);
    const factorize = params.normalModuleFactory.hooks.factorize.taps.find(
      (tap) => tap.name === 'ContainerReferencePlugin',
    ).fn;
    const remoteNames = makeRemotes(n).map((r) => r.name);
    for (const kind of ['miss', 'mixed']) {
      const requests = Array.from({ length: 256 }, (_, i) => ({
        request:
          kind === 'mixed' && i % 4 === 0
            ? `${remoteNames[(i * 37) % n]}/Button`
            : `/repo/src/features/feature-${i}/index.js`,
      }));
      syncMeasure(`factorize/${n}/${kind}`, n < 100 ? 1000000 : 100000, (i) => {
        const module = factorize(requests[i % 256]);
        return module ? module.internalRequest.length : 0;
      });
    }
    await new Promise((resolve, reject) =>
      compiler.close((e) => (e ? reject(e) : resolve())),
    );
  }
  // Exercise the actual sharing hooks, including their layered prefix scans.
  // Misses isolate matching work without introducing filesystem resolution.
  for (const n of [1, 10, 100, 1000]) {
    const ConsumeSharedPlugin = loadPlugin('ConsumeSharedPlugin');
    const ProvideSharedPlugin = loadPlugin('ProvideSharedPlugin');
    const prefixes = Object.fromEntries(
      Array.from({ length: n }, (_, i) => [
        `@shared/pkg${i}/`,
        { import: false, requiredVersion: false },
      ]),
    );
    const provides = Object.fromEntries(
      Object.keys(prefixes).map((key) => [key, { version: '1.0.0' }]),
    );
    const compiler = webpack({
      ...compilerOptions(1),
      plugins: [
        new ConsumeSharedPlugin({ consumes: prefixes }),
        new ProvideSharedPlugin({ provides }),
      ],
    });
    const params = compiler.newCompilationParams();
    compiler.newCompilation(params);
    const consume = params.normalModuleFactory.hooks.factorize.taps.find(
      (tap) => tap.name === 'ConsumeSharedPlugin',
    ).fn;
    const provide = params.normalModuleFactory.hooks.module.taps.find(
      (tap) => tap.name === 'ProvideSharedPlugin',
    ).fn;
    const requests = Array.from({ length: 256 }, (_, i) => ({
      context: config.fixture,
      request: `./local-${i}.js`,
      dependencies: [{}],
      contextInfo: { issuerLayer: i % 2 ? 'client' : undefined },
    }));
    await asyncMeasure(`shared-prefix/consume/${n}/miss`, 20000, async (i) => {
      assert.equal(await consume(requests[i % 256]), undefined);
      return 1;
    });
    const module = { layer: undefined };
    syncMeasure(`shared-prefix/provide/${n}/miss`, 20000, (i) => {
      assert.equal(
        provide(
          module,
          { resource: `/src/local-${i % 256}.js` },
          requests[i % 256],
        ),
        module,
      );
      return 1;
    });
    await new Promise((resolve, reject) =>
      compiler.close((e) => (e ? reject(e) : resolve())),
    );
  }
  const { createFsFromVolume, Volume } = enhancedRequire('memfs');
  for (const n of [1, 100, 1000]) {
    await asyncMeasure(`compiler-setup/${n}`, 200, async () => {
      const compiler = webpack(compilerOptions(n));
      await new Promise((resolve, reject) =>
        compiler.close((e) => (e ? reject(e) : resolve())),
      );
      return 1;
    });
    const names = makeRemotes(n).map((r) => r.name);
    writeFileSync(
      path.join(config.fixture, 'index.js'),
      Array.from(
        { length: 500 },
        (_, i) =>
          `import { value as v${i} } from './local-${i}.js';\nconsole.log(v${i});`,
      ).join('\n') +
        '\n' +
        Array.from(
          { length: 10 },
          (_, i) =>
            `import(${JSON.stringify(`${names[(i * 37) % n]}/Button${i}`)});`,
        ).join('\n'),
    );
    async function build() {
      const compiler = webpack(compilerOptions(n));
      const outputFs = createFsFromVolume(new Volume());
      outputFs.join = path.join;
      compiler.outputFileSystem = outputFs;
      const stats = await new Promise((resolve, reject) =>
        compiler.run((e, stats) => (e ? reject(e) : resolve(stats))),
      );
      await new Promise((resolve, reject) =>
        compiler.close((e) => (e ? reject(e) : resolve())),
      );
      assert(!stats.hasErrors(), stats.toString({ all: false, errors: true }));
      const assets = stats
        .toJson({ all: false, assets: true })
        .assets.map((a) => a.name)
        .sort()
        .map((name) => [
          name,
          hash(outputFs.readFileSync(path.join(config.fixture, 'dist', name))),
        ]);
      return hash(JSON.stringify(assets));
    }
    const expected = await build();
    global.gc();
    const batchMs = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      assert.equal(await build(), expected);
      batchMs.push(performance.now() - start);
    }
    const elapsedMs = batchMs.reduce((sum, value) => sum + value, 0);
    metrics.push({
      name: `webpack-build/${n}`,
      iterations: 3,
      checksum: expected,
      batchMs,
      elapsedMs,
      value: elapsedMs / 3,
      unit: 'ms/build',
    });
  }
  console.log('BENCH_RESULT=' + JSON.stringify({ metrics }));
}
