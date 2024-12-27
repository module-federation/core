const { ModuleFederationPlugin } = require('../../../../dist/src');

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
    uniqueName: '5-layers-full',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        layer: 'react-layer',
      },
      {
        test: /react\.js$/,
        issuerLayer: 'react-layer',
        loader: require.resolve('./layered-react-loader'),
      },
    ],
  },
  plugins: [
    // NEVER ADD shareScope to the plugin
    new ModuleFederationPlugin({
      name: 'container_5',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      exposes: {
        './ComponentA': './ComponentA',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          layer: 'react-layer',
          issuerLayer: 'react-layer',
        },
      },
    }),
  ],
};
