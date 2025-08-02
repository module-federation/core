// eslint-disable-next-line node/no-unpublished-require
const { ConsumeSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        shared: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared2: {
          import: false,
          eager: true,
        },
        shared3: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared4: {
          import: false,
          eager: true,
        },
        shared5: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared6: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared7: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared8: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared9: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared10: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared11: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared12: {
          import: false,
          eager: true,
        },
        shared13: {
          import: false,
          eager: true,
        },
        shared14: {
          import: false,
          eager: true,
        },
        shared15: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared16: {
          import: false,
          eager: true,
        },
        shared17: {
          import: false,
          strictVersion: true,
          eager: true,
        },
        shared18: {
          import: false,
          eager: true,
        },
        shared19: {
          import: false,
          eager: true,
        },
        shared20: {
          import: false,
          eager: true,
        },
        shared21: {
          import: false,
          eager: true,
        },
        shared22: {
          import: false,
          eager: true,
        },
        shared23: {
          import: false,
          eager: true,
        },
        shared24: {
          import: false,
          eager: true,
        },
      },
    }),
  ],
};
