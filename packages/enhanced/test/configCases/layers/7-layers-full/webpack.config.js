const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  entry: './index.js',
  mode: 'development',
  devtool: false,
  target: 'node',
  experiments: {
    layers: true,
  },
  output: {
    filename: '[name].js',
    uniqueName: '7-layers-full',
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
  plugins: [
    new ModuleFederationPlugin({
      name: 'container_7',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
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
    }),
  ],
};
