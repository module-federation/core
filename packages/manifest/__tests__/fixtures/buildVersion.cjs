const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Module = require('node:module');
const assert = require('node:assert/strict');
const { transformSync } = require('@swc/core');
// Load the changed source without rebuilding shared workspace dist directories.
const source = path.resolve(__dirname, '../../src/buildVersion.ts');
Module._extensions['.ts'] = (module, filename) =>
  module._compile(
    transformSync(fs.readFileSync(filename, 'utf8'), {
      filename,
      jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
      module: { type: 'commonjs' },
    }).code,
    filename,
  );
const { BuildVersionPlugin, getCompilationBuildVersion } = require(source);
const { StatsPlugin } = require(
  path.resolve(__dirname, '../../src/StatsPlugin.ts'),
);
const [bundler, directory] = process.argv.slice(2);
const loaded = require(bundler === 'webpack' ? 'webpack' : '@rspack/core');
const build = bundler === 'webpack' ? loaded : loaded.rspack;
let version = 'first';
let built = 0;
const snapshots = [];
fs.writeFileSync(
  path.join(directory, 'entry.js'),
  'module.exports = FEDERATION_BUILD_IDENTIFIER;',
);
const compiler = build({
  mode: 'development',
  context: directory,
  target: 'node',
  entry: './entry.js',
  cache: true,
  devtool: false,
  output: {
    path: path.join(directory, 'dist'),
    filename: 'main.cjs',
    publicPath: 'https://assets.example/',
    library: { type: 'commonjs2' },
  },
  plugins: [
    new BuildVersionPlugin('provider', () => version),
    new StatsPlugin(
      { name: 'provider', experiments: { buildVersion: () => version } },
      { bundler, pluginVersion: 'test' },
    ),
    {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap('Observe', (compilation) => {
          compilation.hooks.buildModule.tap('Observe', () => built++);
          compilation.hooks.processAssets.tap('Observe', () => {
            snapshots.push(
              getCompilationBuildVersion(compilation, () => version),
            );
            version = 'later';
          });
        });
      },
    },
  ],
});
const run = () =>
  new Promise((resolve, reject) =>
    compiler.run((error, stats) => {
      if (error || stats.hasErrors())
        reject(error || Error(stats.toString({ all: false, errors: true })));
      else resolve();
    }),
  );
const output = () => {
  const context = { module: { exports: undefined } };
  vm.runInNewContext(
    fs.readFileSync(path.join(directory, 'dist/main.cjs'), 'utf8'),
    context,
  );
  return context.module.exports;
};
(async () => {
  try {
    await run();
    const first = output();
    assert.equal(
      JSON.parse(
        fs.readFileSync(path.join(directory, 'dist/mf-manifest.json'), 'utf8'),
      ).metaData.buildInfo.buildVersion,
      'first',
    );
    const firstBuilt = built;
    version = 'second';
    await run();
    const second = output();
    assert.equal(
      JSON.parse(
        fs.readFileSync(path.join(directory, 'dist/mf-manifest.json'), 'utf8'),
      ).metaData.buildInfo.buildVersion,
      'second',
    );
    assert.equal(first, 'provider:first');
    assert.equal(second, 'provider:second');
    console.log(
      JSON.stringify({
        outputs: [first, second],
        snapshots,
        rebuilt: built - firstBuilt,
      }),
    );
  } finally {
    await new Promise((resolve) => compiler.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
