const { ModuleFederationPlugin } = require('../../../../dist/src');

const common = {
  name: 've',
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
      uniqueName: '0-ve-full',
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'commonjs-module' },
        virtualRuntimeEntry: true,
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
    output: {
      filename: 'module/[name].mjs',
      uniqueName: '0-ve-full-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'module' },
        virtualRuntimeEntry: true,
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
