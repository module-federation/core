const { ContainerPlugin } = require('../../../../dist/src');
const { ConsumeSharedPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  plugins: [
    new ContainerPlugin({
      name: 'container',
      filename: 'container-file.js',
      library: {
        type: 'commonjs-module',
      },
      exposes: {
        './test': './test',
      },
    }),
    new ConsumeSharedPlugin({
      consumes: {
        './value': {
          shareKey: 'value',
        },
      },
    }),
  ],
};
