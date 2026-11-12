const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Module = require('node:module');
const { transformSync } = require('@swc/core');
Module._extensions['.ts'] = (module, filename) =>
  module._compile(
    transformSync(fs.readFileSync(filename, 'utf8'), {
      filename,
      jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
      module: { type: 'commonjs' },
    }).code,
    filename,
  );
const { StatsPlugin } = require(
  path.resolve(__dirname, '../../src/StatsPlugin.ts'),
);
const [bundler, directory] = process.argv.slice(2);
const loaded = require(bundler === 'webpack' ? 'webpack' : '@rspack/core');
const build = bundler === 'webpack' ? loaded : loaded.rspack;
delete process.env.MF_BUILD_VERSION;
fs.writeFileSync(
  path.join(directory, 'package.json'),
  '{"name":"provider","version":"1.0.0"}',
);
fs.writeFileSync(path.join(directory, 'entry.js'), 'module.exports = "first";');
let custom = false;
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
    new StatsPlugin(
      {
        name: 'provider',
        manifest: {
          additionalData({ stats }) {
            if (custom)
              stats.metaData.buildInfo.buildVersion = 'custom-release';
            return stats;
          },
        },
      },
      { bundler, pluginVersion: 'test' },
    ),
  ],
});
const version = () =>
  JSON.parse(
    fs.readFileSync(path.join(directory, 'dist/mf-manifest.json'), 'utf8'),
  ).metaData.buildInfo.buildVersion;
const output = () => {
  const context = { module: { exports: undefined } };
  vm.runInNewContext(
    fs.readFileSync(path.join(directory, 'dist/main.cjs'), 'utf8'),
    context,
  );
  return context.module.exports;
};
(async () => {
  let watcher;
  try {
    const versions = [];
    const outputs = [];
    let explicit;
    await new Promise((resolve, reject) => {
      let phase = 0;
      const timer = setTimeout(
        () => reject(Error('Watch build timed out')),
        20000,
      );
      watcher = compiler.watch(
        { aggregateTimeout: 10, poll: 50, ignored: /dist/ },
        (error, stats) => {
          if (error || stats.hasErrors()) {
            clearTimeout(timer);
            reject(
              error || Error(stats.toString({ all: false, errors: true })),
            );
            return;
          }
          if (phase < 3) {
            versions.push(version());
            outputs.push(output());
          }
          switch (phase++) {
            case 0:
              watcher.invalidate();
              break;
            case 1:
              fs.writeFileSync(
                path.join(directory, 'entry.js'),
                'module.exports = "second";',
              );
              break;
            case 2:
              process.env.MF_BUILD_VERSION = 'release-42';
              watcher.invalidate();
              break;
            case 3:
              explicit = version();
              custom = true;
              watcher.invalidate();
              break;
            default:
              clearTimeout(timer);
              resolve();
          }
        },
      );
    });
    console.log(
      JSON.stringify({ versions, outputs, explicit, custom: version() }),
    );
  } finally {
    if (watcher) await new Promise((resolve) => watcher.close(resolve));
    await new Promise((resolve) => compiler.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
