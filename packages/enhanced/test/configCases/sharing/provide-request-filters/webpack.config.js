const { ProvideSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ProvideSharedPlugin({
      provides: {
        'lodash/': {
          include: {
            request: 'get',
          },
        },
        react: {
          include: {
            request: 'react',
          },
        },
        'pkg/': {
          exclude: {
            request: /node_modules/,
          },
        },
      },
    }),
  ],
};
