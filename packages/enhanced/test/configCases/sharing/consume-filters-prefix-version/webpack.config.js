const { ConsumeSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        'lib/': {
          include: { version: '^2.0.0' },
        },
        'lib-included/': {
          include: { version: '^1.0.0' },
        },
        'lib-excluded/': {
          exclude: { version: '^1.0.0' },
        },
      },
    }),
  ],
};
