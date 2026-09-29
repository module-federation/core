const { ConsumeSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        'shared-dep': {
          import: false,
        },
        'shared-dep-explicit-wide': {
          import: false,
          shareKey: 'shared-dep',
          requiredVersion: '^1.0.0',
        },
        'shared-dep-explicit-narrow': {
          import: false,
          shareKey: 'shared-dep',
          requiredVersion: '~1.0.0',
        },
      },
    }),
  ],
};
