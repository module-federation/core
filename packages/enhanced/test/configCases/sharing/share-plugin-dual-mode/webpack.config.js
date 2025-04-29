const { SharePlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  context: `${__dirname}/cjs`,
  plugins: [
    new SharePlugin({
      shared: {
        lib: {},
        transitive_lib: {},
      },
    }),
  ],
};
