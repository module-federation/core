const { SharePlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  plugins: [
    new SharePlugin({
      shared: {
        'my-middleware': {
          singleton: true,
          // import: false
        },
        'my-module/a': {
          singleton: true,
          version: '1.2.3',
          // import: false
        },
        'my-module/b': {
          singleton: true,
          version: '1.2.3',
          // import: false
        },
      },
    }),
  ],
};
