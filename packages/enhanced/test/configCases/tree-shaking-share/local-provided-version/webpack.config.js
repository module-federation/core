const path = require('path');
const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  cache: false,
  optimization: {
    minimize: true,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  output: {
    publicPath: '/',
    chunkFilename: '[id].js',
  },
  resolve: {
    alias: {
      'local-provided': path.resolve(__dirname, 'local-provided/index.js'),
    },
  },
  target: 'async-node',
  plugins: [
    new ModuleFederationPlugin({
      name: 'local_provided_version',
      filename: 'remoteEntry.js',
      library: {
        type: 'commonjs-module',
        name: 'local_provided_version',
      },
      exposes: {
        './App': './App.js',
      },
      shared: {
        'local-provided': {
          requiredVersion: '*',
          version: '2.3.4',
          treeShaking: {
            mode: 'runtime-infer',
          },
        },
      },
    }),
  ],
};
