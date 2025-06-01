const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'async-node',
  devtool: false,
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    clean: true,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\/]node_modules[\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: 'vendors.js',
        },
        modules: {
          test: /[\/]src[\/]modules[\/]/,
          name: 'modules',
          chunks: 'all',
          enforce: true,
          filename: 'modules.js',
        },
        utils: {
          test: /[\/]src[\/]utils[\/]/,
          name: 'utils',
          chunks: 'all',
          filename: 'utils.js',
        },
      },
    },
  },
  externals: {
    axios: 'commonjs axios',
    ws: 'commonjs ws',
    fs: 'commonjs fs',
    path: 'commonjs path',
    vm: 'commonjs vm',
  },
  // resolve: {
  //   extensions: ['.js', '.json']
  // },
  // node: {
  //   __dirname: false,
  //   __filename: false
  // },
  stats: {
    colors: true,
    modules: false,
    chunks: true,
    chunkModules: false,
  },
};
