#!/usr/bin/env node
// Build runtime-core JS for both revisions, then measure browser dependency
// closures. Disabling a feature is a separate scenario, not an optimization
// claim for the full-featured runtime.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from 'node:zlib';
import { createDualFormatConfig } from './tsdown/config-helpers.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const require = createRequire(path.join(root, 'package.json'));
const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseline = execFileSync('git', ['rev-parse', arg('--baseline', 'HEAD')], {
  cwd: root,
  encoding: 'utf8',
}).trim();
const output = path.resolve(arg('--output', 'runtime-size-results.json'));
const scratch = mkdtempSync(path.join(tmpdir(), 'mf-runtime-size-'));
const original = path.join(scratch, 'original');
mkdirSync(original);
const archive = execFileSync(
  'git',
  ['archive', baseline, 'packages/runtime-core', 'tsconfig.base.json'],
  { cwd: root },
);
const extraction = spawnSync('tar', ['-x', '-C', original], { input: archive });
assert.equal(extraction.status, 0, String(extraction.stderr));
const esbuild = require('esbuild');
const webpack = require('webpack');
const { build: buildPackage } = await import(require.resolve('tsdown'));
const version = require('./packages/runtime-core/package.json').version;
const records = [];
const sourceHashes = {};
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
function sourceHash(directory) {
  const digest = createHash('sha256');
  for (const file of readdirSync(directory, { recursive: true }).sort()) {
    if (file.endsWith('.ts')) {
      digest.update(file).update(readFileSync(path.join(directory, file)));
    }
  }
  return digest.digest('hex');
}
const compress = (bytes) => ({
  bytes: bytes.length,
  gzip9: gzipSync(bytes, { level: 9 }).length,
  brotli11: brotliCompressSync(bytes, {
    params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
  }).length,
  sha256: hash(bytes),
});

async function webpackBundle(contents, define, coreDist) {
  const input = path.join(scratch, 'consumer.js');
  writeFileSync(input, contents);
  const compiler = webpack({
    mode: 'production',
    context: root,
    target: ['web', 'es2021'],
    entry: input,
    devtool: false,
    cache: false,
    experiments: { outputModule: true },
    output: {
      path: path.join(scratch, 'webpack-dist'),
      filename: 'bundle.mjs',
      library: { type: 'module' },
      uniqueName: 'mf-runtime-footprint',
    },
    resolve: {
      alias: {
        '@module-federation/runtime-core$': path.join(coreDist, 'index.js'),
      },
      modules: [
        'node_modules',
        path.join(root, 'packages/runtime-core/node_modules'),
        path.join(root, 'node_modules'),
      ],
    },
    optimization: { minimize: true, moduleIds: 'natural' },
    plugins: [new webpack.DefinePlugin(define)],
    infrastructureLogging: { level: 'error' },
    stats: 'errors-only',
  });
  const stats = await new Promise((resolve, reject) =>
    compiler.run((error, stats) => (error ? reject(error) : resolve(stats))),
  );
  await new Promise((resolve, reject) =>
    compiler.close((error) => (error ? reject(error) : resolve())),
  );
  assert(!stats.hasErrors(), stats.toString({ all: false, errors: true }));
  const details = stats.toJson({ all: false, assets: true });
  const jsAssets = details.assets.filter((asset) => /\.m?js$/.test(asset.name));
  assert.equal(jsAssets.length, 1, 'Measure the entire JS payload');
  return readFileSync(path.join(scratch, 'webpack-dist/bundle.mjs'));
}

const flavors = [
  { name: 'universal-full', define: {} },
  { name: 'web-full', define: { ENV_TARGET: '"web"' } },
  {
    name: 'web-no-snapshot',
    define: {
      ENV_TARGET: '"web"',
      FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN: 'true',
    },
  },
  {
    name: 'web-no-snapshot-no-shared',
    define: {
      ENV_TARGET: '"web"',
      FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN: 'true',
      FEDERATION_OPTIMIZE_NO_SHARED: 'true',
    },
  },
];
const entries = [
  { name: 'runtime-core', export: '*' },
  { name: 'runtime', export: '*' },
  { name: 'createInstance-only', export: '{ createInstance }' },
  { name: 'webpack-bundler-runtime', export: '*', defaultExport: true },
];

for (const [variant, sourceRoot] of [
  ['baseline', original],
  ['candidate', root],
]) {
  const packageDir = path.join(sourceRoot, 'packages/runtime-core');
  const coreDist = path.join(scratch, `${variant}-core-dist`);
  sourceHashes[variant] = sourceHash(path.join(packageDir, 'src'));
  await buildPackage({
    ...createDualFormatConfig({
      name: `runtime-size-${variant}`,
      packageDir,
      entry: { index: 'src/index.ts', types: 'src/types.ts' },
      external: ['@module-federation/*'],
      define: {
        __VERSION__: JSON.stringify(version),
        FEDERATION_DEBUG: '""',
      },
      unbundle: true,
      dts: false,
      outDir: coreDist,
    }),
    config: false,
  });

  for (const entry of entries) {
    const entryPath =
      entry.name === 'runtime-core'
        ? path.join(coreDist, 'index.js')
        : path.join(
            root,
            'packages',
            entry.name === 'webpack-bundler-runtime'
              ? 'webpack-bundler-runtime'
              : 'runtime',
            'dist',
            entry.name === 'webpack-bundler-runtime'
              ? 'bundler.js'
              : 'index.js',
          );
    for (const flavor of flavors) {
      const contents =
        `export ${entry.export} from ${JSON.stringify(entryPath)};` +
        (entry.defaultExport
          ? `export { default } from ${JSON.stringify(entryPath)};`
          : '');
      const settings = {
        stdin: { contents, resolveDir: root, loader: 'js' },
        absWorkingDir: root,
        outfile: path.join(
          scratch,
          `${variant}-${entry.name}-${flavor.name}.js`,
        ),
        bundle: true,
        write: false,
        minify: true,
        platform: 'browser',
        target: 'es2021',
        format: 'esm',
        legalComments: 'none',
        metafile: true,
        logLevel: 'silent',
        nodePaths: [
          path.join(root, 'packages/runtime-core/node_modules'),
          path.join(root, 'node_modules'),
        ],
        alias: {
          '@module-federation/runtime-core': path.join(coreDist, 'index.js'),
        },
        define: {
          'process.env.NODE_ENV': '"production"',
          FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN: 'false',
          FEDERATION_OPTIMIZE_NO_REMOTE: 'false',
          FEDERATION_OPTIMIZE_NO_SHARED: 'false',
          ...flavor.define,
        },
      };
      const result = await esbuild.build(settings);
      const bytes = result.outputFiles[0].contents;
      const meta = Object.values(result.metafile.outputs)[0];
      assert.equal(
        meta.imports.length,
        0,
        'Bundle must include all dependencies',
      );
      writeFileSync(settings.outfile, bytes);
      if (flavor.name === 'web-full') {
        const repeated = await esbuild.build(settings);
        assert.equal(hash(repeated.outputFiles[0].contents), hash(bytes));
      }
      records.push({
        bundler: 'esbuild',
        variant,
        entry: entry.name,
        flavor: flavor.name,
        ...compress(bytes),
        file: settings.outfile,
        inputs: Object.entries(meta.inputs)
          .map(([file, value]) => ({
            file: file.includes(`${variant}-core-dist/`)
              ? `runtime-core/dist/${file.split(`${variant}-core-dist/`)[1]}`
              : file,
            bytesInOutput: value.bytesInOutput,
          }))
          .filter((input) => input.bytesInOutput > 0)
          .sort((a, b) => b.bytesInOutput - a.bytesInOutput),
      });
      if (flavor.name === 'web-full' || entry.name === 'runtime') {
        const webpackBytes = await webpackBundle(
          contents,
          settings.define,
          coreDist,
        );
        if (flavor.name === 'web-full') {
          assert.equal(
            hash(await webpackBundle(contents, settings.define, coreDist)),
            hash(webpackBytes),
            'Webpack output must be deterministic',
          );
        }
        const webpackFile = path.join(
          scratch,
          `${variant}-${entry.name}-${flavor.name}-webpack.mjs`,
        );
        writeFileSync(webpackFile, webpackBytes);
        records.push({
          bundler: 'webpack',
          variant,
          entry: entry.name,
          flavor: flavor.name,
          ...compress(webpackBytes),
          file: webpackFile,
        });
      }
    }
  }
}

const comparison = records
  .filter((record) => record.variant === 'candidate')
  .map((after) => {
    const before = records.find(
      (record) =>
        record.variant === 'baseline' &&
        record.bundler === after.bundler &&
        record.entry === after.entry &&
        record.flavor === after.flavor,
    );
    return {
      bundler: after.bundler,
      entry: after.entry,
      flavor: after.flavor,
      baselineBytes: before.bytes,
      candidateBytes: after.bytes,
      deltaBytes: after.bytes - before.bytes,
      baselineGzip9: before.gzip9,
      candidateGzip9: after.gzip9,
      deltaGzip9: after.gzip9 - before.gzip9,
      baselineBrotli11: before.brotli11,
      candidateBrotli11: after.brotli11,
      deltaBrotli11: after.brotli11 - before.brotli11,
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
        esbuild: esbuild.version,
        webpack: webpack.version,
      },
      method: {
        packageBuild: 'Repository tsdown JS config, declarations omitted',
        consumerBuild:
          'esbuild browser/es2021/ESM/minify; full dependency closure',
        webpackBuild:
          'webpack production/web/es2021/outputModule; default minifier; one JS asset',
        compression: 'gzip level 9; Brotli quality 11',
        exports: 'All public exports, except createInstance-only scenario',
        scopes:
          'Runtime dependencies identical; runtime-core rebuilt for each revision',
        featureFlags: 'Separate opt-out scenarios; public defaults unchanged',
        attribution:
          'bytesInOutput is minified JS attribution, not gzip attribution',
        repeatCheck:
          'Each web-full build repeated with both bundlers and SHA-256 matched',
      },
      sourceHashes,
      comparison,
      records,
    },
    null,
    2,
  ) + '\n',
);
console.table(comparison);
console.log(`Results: ${output}\nScratch: ${scratch}`);
