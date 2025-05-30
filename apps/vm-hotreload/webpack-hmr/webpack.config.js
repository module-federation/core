const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    entrypoint1: [
      'webpack/hot/poll?1000',
      path.resolve(__dirname, 'src/entrypoint1.js'),
    ],
    entrypoint2: [
      'webpack/hot/poll?1000',
      path.resolve(__dirname, 'src/entrypoint2.js'),
    ],
    index: ['webpack/hot/poll?1000', path.resolve(__dirname, 'src/index.js')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'inline-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  externals: [
    // Exclude node_modules from bundling, except for webpack/hot/poll
    function ({ request }, callback) {
      if (/webpack\/hot\/poll/.test(request)) return callback();
      if (/^[@a-z][a-z/\-0-9.]+$/.test(request))
        return callback(null, 'commonjs ' + request);
      callback();
    },
  ],
  watch: true,
  stats: 'minimal',
};
