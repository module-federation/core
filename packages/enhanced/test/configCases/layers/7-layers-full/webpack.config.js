const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

const common = {
  name: 'container_7',
  filename: 'container.js',
  exposes: {
    './ComponentA': './ComponentA',
    './App': './App',
    './noop': './emptyComponent',
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: false,
    },
    randomvalue: {
      request: 'react',
      import: 'react',
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
        test: /ComponentA\.js$/,
        layer: 'react-layer',
      },
      {
        test: /react\.js$/,
        issuerLayer: 'react-layer',
        layer: 'react-layer',
        use: [
          {
            loader: path.resolve(__dirname, './layered-react-loader.js'),
          },
        ],
      },
    ],
  },
};

module.exports = [
  {
    ...commonConfig,
    output: {
      filename: '[name].js',
      uniqueName: '7-layers-full',
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
      uniqueName: '7-layers-full-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        ...common,
        library: { type: 'module' },
        filename: 'module/container.mjs',
      }),
    ],
    target: 'node14',
  },
];
