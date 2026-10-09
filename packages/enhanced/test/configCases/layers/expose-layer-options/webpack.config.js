const { DefinePlugin } = require('webpack');
const assert = require('assert');
const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = [
  { name: 'object', manifest: true, arrayForm: false },
  { name: 'array', manifest: false, arrayForm: true },
  { name: 'rule', manifest: true, arrayForm: true, ruleLayer: 'rule' },
].map(({ name, manifest, arrayForm, ruleLayer }) => {
  let compilations = 0;
  return {
    mode: 'development',
    infrastructureLogging: { level: 'error', debug: false },
    experiments: { layers: true },
    output: {
      filename: `${name}/bundle.js`,
      chunkFilename: `${name}/[id].js`,
      publicPath: '/',
      uniqueName: `expose_layers_${name}`,
    },
    module: { rules: [{ test: /source\.js$/, layer: ruleLayer }] },
    plugins: [
      {
        apply(compiler) {
          const cached = compiler.options.cache?.type === 'filesystem';
          // The harness warms the disk cache twice before executing the fixture.
          const serverLayer =
            cached && compilations++ >= 2 ? 'updated' : 'server';
          if (cached && compilations === 2) {
            compiler.hooks.done.tap('check exposed module cache', (stats) => {
              const modules = stats
                .toJson({ all: false, modules: true, cachedModules: true })
                .modules.filter(
                  (module) =>
                    module.nameForCondition === require.resolve('./source.js'),
                );
              assert(
                modules.length > 0 &&
                  modules.every((module) => module.built === false),
              );
            });
          }
          const exposes = {
            './Server': { import: './source.js', layer: serverLayer },
            './Client': {
              import: ['./side-effect.js', './source.js'],
              name: 'client',
              layer: 'client',
            },
            './Inherited': { import: './source.js' },
            './String': './source.js',
            './List': ['./side-effect.js', './source.js'],
          };
          new DefinePlugin({
            TEST_MANIFEST: JSON.stringify(manifest),
            TEST_ARRAY: JSON.stringify(arrayForm),
            TEST_RULE: JSON.stringify(ruleLayer ?? null),
            TEST_SERVER: JSON.stringify(cached ? 'updated' : 'server'),
          }).apply(compiler);
          new ModuleFederationPlugin({
            name: `expose_layers_${name}`,
            filename: `${name}/container.js`,
            library: { type: 'commonjs-module' },
            manifest: manifest ? { filePath: name } : false,
            exposes: arrayForm
              ? [
                  ...Object.entries(exposes).map(([key, value]) => ({
                    [key]: value,
                  })),
                  './source.js',
                ]
              : exposes,
          }).apply(compiler);
        },
      },
    ],
  };
});
