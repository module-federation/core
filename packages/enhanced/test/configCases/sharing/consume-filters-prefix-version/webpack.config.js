const path = require('path');
const { ConsumeSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  mode: 'development',
  devtool: false,
  resolve: {
    alias: {
      'my-lib': path.resolve(__dirname, 'node_modules/lib'),
    },
  },
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
        './src/local': {
          include: { version: '^2.0.0' },
        },
        './src/local2': {
          exclude: { version: '^1.0.0', fallbackVersion: '1.0.0' },
        },
        'my-lib': {
          packageName: 'lib',
          include: { version: '^2.0.0' },
        },
      },
    }),
  ],
};
