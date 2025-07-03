const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  optimization: {
    concatenateModules: false,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  plugins: [
    new SharePlugin({
      shared: {
        shared: {
          import: 'shared',
          include: {
            version: '^2.0.0',
          },
        },
      },
    }),
  ],
};
