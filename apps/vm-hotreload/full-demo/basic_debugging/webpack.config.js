const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'async-node',
  entry: {
    index: path.resolve(__dirname, 'examples/demo/index.js'),
    'hmr-client-demo': path.resolve(
      __dirname,
      'examples/demo/hmr-client-demo.js',
    ),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    library: {
      type: 'commonjs-module',
    },
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    modules: [path.resolve(__dirname, 'lib'), 'node_modules'],
  },
  devtool: false,
  plugins: [new webpack.HotModuleReplacementPlugin()],
  watch: false,
  stats: 'minimal',
};
