const { ConsumeSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        'shared-dep': {
          import: false,
        },
      },
    }),
  ],
};
