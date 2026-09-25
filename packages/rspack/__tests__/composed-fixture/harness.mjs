// Builds with the real, ESM-only @rspack/core and the built wrapper in a plain Node process.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rspack } from '@rspack/core';

const FIXTURE = path.dirname(fileURLToPath(import.meta.url));
const { ModuleFederationPlugin } = createRequire(import.meta.url)(
  '../../dist/index.js',
);

const withoutVirtualModules = {
  apply(compiler) {
    const core = compiler.webpack;
    const value = {
      ...core,
      experiments: { ...core.experiments, VirtualModulesPlugin: undefined },
    };
    Object.defineProperty(compiler, 'rspack', { value });
    Object.defineProperty(compiler, 'webpack', { value });
  },
};

function config(
  outRoot,
  { out, target, mf, cacheDir, singleChunk, noVirtualModules },
) {
  const isHost = Boolean(mf.remotes);
  return {
    mode: 'production',
    target: target === 'node' ? 'async-node' : 'web',
    context: FIXTURE,
    devtool: false,
    entry: isHost ? { main: './host/index.js' } : {},
    output: {
      path: path.join(outRoot, out),
      filename: '[name].js',
      clean: true,
      uniqueName: mf.name,
      publicPath: 'auto',
      ...(isHost &&
        target === 'node' && { library: { type: 'commonjs-module' } }),
    },
    resolve: { alias: { 'shared-lib': path.join(FIXTURE, 'shared-lib') } },
    optimization: { minimize: false },
    infrastructureLogging: { level: 'error' },
    cache: cacheDir
      ? {
          type: 'persistent',
          storage: { type: 'filesystem', directory: cacheDir },
        }
      : false,
    plugins: [
      ...(noVirtualModules ? [withoutVirtualModules] : []),
      ...(singleChunk
        ? [new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })]
        : []),
      new ModuleFederationPlugin({
        dts: false,
        manifest: false,
        ...mf,
        experiments: {
          ...mf.experiments,
          optimization: { target, ...mf.experiments?.optimization },
        },
      }),
    ],
  };
}

function summarize(stats) {
  const { chunkGraph, chunks } = stats.compilation;
  const modules = new Set();
  for (const chunk of chunks) {
    for (const module of chunkGraph.getChunkModulesIterable(chunk)) {
      for (const inner of [module, ...(module.modules ?? [])]) {
        const name = inner.nameForCondition?.();
        if (name) modules.add(name.split(path.sep).join('/'));
      }
    }
  }
  const json = stats.toJson({
    all: false,
    errors: true,
    warnings: true,
    modules: true,
  });
  return {
    errors: (json.errors ?? []).map((e) => e.message),
    warnings: (json.warnings ?? []).map((w) => w.message),
    built: (json.modules ?? []).filter((m) => m.built).length,
    modules: [...modules].sort(),
  };
}

function runOnce(compiler) {
  return new Promise((resolve, reject) =>
    compiler.run((err, stats) => {
      if (err) return reject(err);
      const result = stats.stats
        ? stats.stats.map(summarize)
        : [summarize(stats)];
      compiler.close(() => resolve(result));
    }),
  );
}

function watchTwice(compiler) {
  const results = [];
  return new Promise((resolve, reject) => {
    const watching = compiler.watch({}, (err, stats) => {
      if (err) return reject(err);
      results.push(summarize(stats));
      if (results.length < 2) watching.invalidate();
      else watching.close(() => resolve(results));
    });
  });
}

const { outRoot, builds, multi, watch } = JSON.parse(process.argv[2]);
const results = [];
if (multi) {
  results.push(
    ...(await runOnce(rspack(builds.map((b) => config(outRoot, b))))),
  );
} else {
  for (const b of builds) {
    if (b.buildVersion) process.env.MF_BUILD_VERSION = b.buildVersion;
    else delete process.env.MF_BUILD_VERSION;
    const compiler = rspack(config(outRoot, b));
    results.push(...(await (watch ? watchTwice(compiler) : runOnce(compiler))));
  }
}
fs.writeSync(1, `RESULT ${JSON.stringify(results)}\n`);
