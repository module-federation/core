const { ModuleFederationPlugin } = require('../../../../dist/src');

const common = {
  name: 'container_8',
  filename: 'container.js',
  remotes: {
    containerA: {
      external: '../7-layers-full/container.js',
    },
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: false,
      import: false,
    },
    randomvalue: {
      request: 'react',
      import: false,
      shareKey: 'react',
      singleton: true,
      requiredVersion: false,
      layer: 'react-layer',
      issuerLayer: 'react-layer',
    },
  },
};

const commonConfig = {
  entry: './index.js',
  mode: 'development',
  devtool: false,
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        layer: 'react-layer',
        test: /ComponentA\.js$/,
      },
      {
        test: /react\.js$/,
        issuerLayer: 'react-layer',
        layer: 'react-layer',
      },
    ],
  },
};

module.exports = [
  {
    ...commonConfig,
    output: {
      filename: '[name].js',
      uniqueName: '8-layers-full',
    },
    plugins: [
      new ModuleFederationPlugin({
        ...common,
        library: { type: 'commonjs-module' },
      }),
    ],
  },
  {
    ...commonConfig,
    experiments: {
      ...commonConfig.experiments,
      outputModule: true,
    },
    output: {
      filename: 'module/[name].mjs',
      uniqueName: '8-layers-full-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        ...common,
        library: { type: 'module' },
        filename: 'module/container.mjs',
        remotes: {
          containerA: {
            external: '../../7-layers-full/module/container.mjs',
          },
        },
      }),
    ],
    target: 'node14',
  },
];
