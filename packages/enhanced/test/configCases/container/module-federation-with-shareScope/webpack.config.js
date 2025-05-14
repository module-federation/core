const { ModuleFederationPlugin } = require('../../../../dist/src');

const common = {
  entry: {
    main: './index.js',
  },
  optimization: {
    runtimeChunk: 'single',
  },
};

const commonMF = {
  runtime: false,
  exposes: {
    './ComponentB': './ComponentB',
    './ComponentC': './ComponentC',
  },
  shared: ['react'],
  shareScope: 'test-scope',
};

/** @type {import("../../../../types").Configuration[]} */
module.exports = [
  {
    ...common,
    output: {
      filename: '[name].js',
      uniqueName: 'mf-with-shareScope',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'containerA',
        library: { type: 'commonjs-module' },
        filename: 'container.js',
        remotes: {
          containerA: '../0-container-full/container.js',
          containerB: './container.js',
        },
        ...commonMF,
      }),
    ],
  },
  {
    ...common,
    experiments: {
      outputModule: true,
    },
    output: {
      filename: 'module/[name].mjs',
      uniqueName: 'mf-with-shareScope-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'containerB',
        library: { type: 'module' },
        filename: 'module/container.mjs',
        remotes: {
          containerA: '../../0-container-full/module/container.mjs',
          containerB: './container.mjs',
        },
        ...commonMF,
      }),
    ],
    target: 'node14',
  },
];
