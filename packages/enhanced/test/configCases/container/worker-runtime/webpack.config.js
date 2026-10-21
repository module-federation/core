const { ModuleFederationPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  entry: {
    main: './index.js',
    other: './other.js',
  },
  output: {
    filename: '[name].js',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        remote: 'internal ./container.js',
      },
    }),
  ],
};
