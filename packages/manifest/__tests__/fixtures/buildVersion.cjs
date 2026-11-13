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
const { StatsPlugin } = require('../../src/StatsPlugin.ts');
const {
  getFederationBuildIdentifier,
  setCompilationBuildVersion,
} = require('../../src/buildVersion.ts');
const [bundler, directory] = process.argv.slice(2);
const loaded = require(bundler === 'webpack' ? 'webpack' : '@rspack/core');
const build = bundler === 'webpack' ? loaded : loaded.rspack;
delete process.env.MF_BUILD_VERSION;
fs.writeFileSync(
  path.join(directory, 'package.json'),
  '{"name":"provider","version":"1.0.0"}',
);
const writeEntry = (value) =>
  fs.writeFileSync(
    path.join(directory, 'entry.js'),
    `module.exports = { value: ${JSON.stringify(value)}, id: FEDERATION_BUILD_IDENTIFIER };`,
  );
writeEntry('first');
let custom = false;
let coordinatedVersion;
const options = {
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
    {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap(
          { name: 'FrameworkBuildVersion', stage: -Infinity },
          (compilation) => {
            if (coordinatedVersion)
              setCompilationBuildVersion(compilation, coordinatedVersion);
          },
        );
        new compiler.webpack.DefinePlugin({
          FEDERATION_BUILD_IDENTIFIER: getFederationBuildIdentifier(
            compiler,
            'provider',
          ),
        }).apply(compiler);
      },
    },
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
};
const buildInfo = () =>
  JSON.parse(
    fs.readFileSync(path.join(directory, 'dist/mf-manifest.json'), 'utf8'),
  ).metaData.buildInfo;
const output = () => {
  const context = { module: { exports: undefined } };
  vm.runInNewContext(
    fs.readFileSync(path.join(directory, 'dist/main.cjs'), 'utf8'),
    context,
  );
  return context.module.exports;
};
async function runBuild(mode = 'production', target = 'node') {
  const compiler = build({ ...options, mode, target });
  try {
    await new Promise((resolve, reject) =>
      compiler.run((error, stats) =>
        error || stats.hasErrors()
          ? reject(error || Error(stats.toString({ all: false, errors: true })))
          : resolve(),
      ),
    );
    const info = buildInfo();
    if (!custom && output().id !== `provider:${info.buildVersion}`)
      throw Error('Manifest and container identity differ');
    return info;
  } finally {
    await new Promise((resolve) => compiler.close(resolve));
  }
}
(async () => {
  const compiler = build(options);
  let watcher;
  const versions = [];
  const identities = [];
  const outputs = [];
  try {
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
          versions.push(buildInfo().buildVersion);
          const result = output();
          identities.push(result.id);
          outputs.push(result.value);
          if (phase++ === 0) watcher.invalidate();
          else if (phase === 2) writeEntry('second');
          else {
            clearTimeout(timer);
            resolve();
          }
        },
      );
    });
  } finally {
    if (watcher) await new Promise((resolve) => watcher.close(resolve));
    await new Promise((resolve) => compiler.close(resolve));
  }
  const coordinated = [];
  for (const version of ['shared-round-1', 'shared-round-2']) {
    coordinatedVersion = version;
    for (const target of ['web', 'node']) {
      const info = await runBuild('development', target);
      coordinated.push({
        target,
        buildVersion: info.buildVersion,
        identity: output().id,
      });
    }
  }
  coordinatedVersion = undefined;
  const production = await runBuild();
  process.env.MF_BUILD_VERSION = 'release-42';
  const explicit = (await runBuild()).buildVersion;
  custom = true;
  const customVersion = (await runBuild()).buildVersion;
  console.log(
    JSON.stringify({
      versions,
      identities,
      outputs,
      coordinated,
      production,
      explicit,
      custom: customVersion,
    }),
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
