const { ModuleFederationPlugin } = require('../../../../dist/src');

const common = {
  name: 'sh',
  experiments: {
    federationRuntime: 'use-host',
  },
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
};

module.exports = [
  {
    output: {
      filename: '[name].js',
      uniqueName: '0-sh-full',
    },
    optimization: {
      moduleIds: 'named',
      concatenateModules: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'commonjs-module' },
        filename: 'container.js',
        remotes: {
          containerA: {
            external: './container.js',
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
    optimization: {
      moduleIds: 'named',
      concatenateModules: false,
    },
    output: {
      filename: 'module/[name].mjs',
      uniqueName: '0-sh-full-mjs',
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
