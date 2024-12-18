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
};

/** @type {import("../../../../").Configuration[]} */
module.exports = [
  {
    ...common,
    output: {
      filename: '[name].js',
      uniqueName: '4-layers-full',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'layers_container_2',
        library: { type: 'commonjs-module' },
        filename: 'container.js',
        remotes: {
          containerA: '../3-layers-full/container.js',
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
      uniqueName: '4-layers-full-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'layers_container_2',
        library: { type: 'module' },
        filename: 'module/container.mjs',
        remotes: {
          containerA: '../../3-layers-full/module/container.mjs',
          containerB: './container.mjs',
        },
        ...commonMF,
      }),
    ],
    target: 'node14',
  },
];
