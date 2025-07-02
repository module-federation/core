const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'async-node',
  entry: {
    index: path.resolve(__dirname, 'src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    libraryTarget: 'commonjs2',
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\/]node_modules[\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        analytics: {
          test: /[\/]src[\/]analytics\.js$/,
          name: 'analytics',
          chunks: 'all',
          enforce: true,
        },
        dashboard: {
          test: /[\/]src[\/]dashboard\.js$/,
          name: 'dashboard',
          chunks: 'all',
          enforce: true,
        },
        components: {
          test: /[\/]src[\/]components[\/]/,
          name: 'components',
          chunks: 'all',
          enforce: true,
        },
        utils: {
          test: /[\/]src[\/]utils[\/]/,
          name: 'utils',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: -10,
        },
      },
    },
  },
  devtool: false,
  plugins: [new webpack.HotModuleReplacementPlugin()],
  watch: false,
  stats: 'minimal',
};
