const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  output: {
    uniqueName: 'b',
  },
  plugins: [
    new SharePlugin({
      shared: ['package'],
    }),
  ],
};
