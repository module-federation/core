const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  entry: './index.js',
  target: 'async-node',
  output: {
    filename: '[name].js',
    publicPath: '/',
  },
  optimization: {
    runtimeChunk: 'single',
    sideEffects: true,
    minimize: false,
    concatenateModules: false,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'hoist_inactive_connections',
      filename: 'container.js',
      exposes: {
        './noop': './noop.js',
      },
      runtimePlugins: [require.resolve('./runtime-plugin.js')],
    }),
  ],
};
