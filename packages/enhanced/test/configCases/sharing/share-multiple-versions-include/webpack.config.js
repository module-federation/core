const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  plugins: [
    new SharePlugin({
      shared: {
        shared: {
          import: 'shared',
          include: {
            version: '^2.0.0',
          },
          requiredVersion: '^2.0.0',
        },
      },
    }),
  ],
};
