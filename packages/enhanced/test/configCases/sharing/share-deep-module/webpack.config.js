const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  optimization: {
    moduleIds: 'named',
    chunkIds: 'named',
  },
  plugins: [
    new SharePlugin({
      shared: {
        shared: {
          nodeModulesReconstructedLookup: true,
        },
        'shared/directory/': {
          nodeModulesReconstructedLookup: true,
        },
      },
    }),
  ],
};
