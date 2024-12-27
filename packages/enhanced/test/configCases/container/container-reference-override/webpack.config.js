const { ContainerReferencePlugin } = require('../../../../dist/src');
const { ProvideSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  plugins: [
    new ContainerReferencePlugin({
      remoteType: 'var',
      remotes: {
        abc: 'ABC',
      },
    }),
    new ProvideSharedPlugin({
      provides: {
        './new-test': {
          shareKey: 'test',
          version: false,
        },
      },
    }),
  ],
};
