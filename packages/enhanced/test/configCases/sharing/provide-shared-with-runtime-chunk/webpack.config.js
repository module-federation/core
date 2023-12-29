const { ProvideSharedPlugin } = require('../../../../dist/src');

module.exports = {
  output: {
    filename: '[name].js',
  },
  optimization: {
    runtimeChunk: 'single',
  },
  plugins: [
    new ProvideSharedPlugin({
      provides: ['x'],
    }),
  ],
};
