const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new SharePlugin({
      shareScope: 'test-scope',
      shared: {
        package: {},
        '@scoped/package': {},
        'prefix/': {
          filter: {
            request: /deep/
          }
        },
      },
    }),
  ],
};
