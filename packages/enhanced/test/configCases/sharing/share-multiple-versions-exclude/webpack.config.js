const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  optimization: {
    concatenateModules: false,
  },
  plugins: [
    new SharePlugin({
      shared: {
        shared: {
          import: 'shared',
          shareKey: 'shared',
          shareScope: 'default',
          requiredVersion: '^2.0.0',
          exclude: {
            version: '<2.0.0',
          },
        },
      },
    }),
  ],
};
