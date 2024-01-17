const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');
const common = {
  name: 'comonjsRuntimePlugins',
  exposes: {
    './ComponentA': {
      import: './ComponentA',
    },
  },
  shared: {
    react: {
      version: false,
      requiredVersion: false,
    },
  },
  runtimePlugins: [path.resolve(__dirname, './runtimePlugin.js')],
};

module.exports = [
  {
    output: {
      filename: '[name].js',
      uniqueName: 'comonjs-runtime-plugins',
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'commonjs-module' },
        filename: 'container.js',
        remotes: {
          containerA: {
            external: 'comonjsRuntimePlugins@./container.js',
          },
        },
        ...common,
      }),
    ],
  },
  {
    experiments: {
      outputModule: true,
    },
    output: {
      filename: 'module/[name].mjs',
      uniqueName: 'comonjs-runtime-plugins-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'module' },
        filename: 'module/container.mjs',
        remotes: {
          containerA: {
            external: './container.mjs',
          },
        },
        ...common,
      }),
    ],
    target: 'node14',
  },
];
