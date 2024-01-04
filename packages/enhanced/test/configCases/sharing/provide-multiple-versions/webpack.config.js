const { ProvideSharedPlugin } = require('../../../../dist/src');

module.exports = {
  plugins: [
    new ProvideSharedPlugin({
      provides: ['shared'],
    }),
  ],
};
