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
    uniqueName: '6-layers-full',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        layer: 'react-layer',
      },
    ],
  },
  plugins: [
    // NEVER ADD shareScope to the plugin
    new ModuleFederationPlugin({
      name: 'container_6',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      remotes: {
        containerA: {
          external: '../5-layers-full/container.js',
        },
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          import: false,
          layer: 'react-layer',
        },
      },
    }),
  ],
};
