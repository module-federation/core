const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  entry: './index.js',
  mode: 'development',
  target: 'node',
  devtool: false,
  experiments: {
    layers: true,
  },
  output: {
    filename: '[name].js',
    uniqueName: '8-layers-full',
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
  plugins: [
    new ModuleFederationPlugin({
      name: 'container_8',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
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
    }),
  ],
};
