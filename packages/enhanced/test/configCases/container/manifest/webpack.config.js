const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  optimization: {
    chunkIds: 'named',
    moduleIds: 'named',
  },
  output: {
    publicPath: '/',
    chunkFilename: '[id].js',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      filename: 'container.[chunkhash:8].js',
      library: { type: 'commonjs-module' },
      exposes: {
        'expose-a': './module.js',
      },
      remoteType: 'script',
      remotes: {
        '@remote/alias': 'remote@http://localhost:8000/remoteEntry.js',
      },
      shared: {
        react: {},
      },
    }),
  ],
};
