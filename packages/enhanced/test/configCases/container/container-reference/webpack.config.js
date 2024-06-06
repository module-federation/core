const { ContainerReferencePlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  plugins: [
    new ContainerReferencePlugin({
      remoteType: 'var',
      remotes: {
        abc: 'ABC',
        def: 'DEF',
      },
    }),
  ],
};
