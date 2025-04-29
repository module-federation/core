const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  plugins: [
    new SharePlugin({
      shared: ['shared'],
    }),
  ],
};
