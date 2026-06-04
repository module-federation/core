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
  target: 'async-node',
  plugins: [
    new ModuleFederationPlugin({
      name: 'multi_version_fallback',
      filename: 'remoteEntry.js',
      library: {
        type: 'commonjs-module',
        name: 'multi_version_fallback',
      },
      exposes: {
        './App': './App.js',
      },
      shared: {
        nanoid: {
          requiredVersion: '*',
          treeShaking: {
            mode: 'runtime-infer',
          },
        },
      },
    }),
  ],
};
