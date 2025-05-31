const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'async-node',
  entry: {
    index: [path.resolve(__dirname, 'src/index.js')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'inline-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  watch: false,
  stats: 'minimal',
};
