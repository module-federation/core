const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new SharePlugin({
      name: 'shared-strategy',
      shared: {
        react: {
          requiredVersion: false,
          singleton: true,
          strictVersion: false,
          version: '0.1.2',
        },
      },
    }),
  ],
};
