const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './test-1': './test 1.js',
        './test-2': './path with spaces/test-2.js',
      },
    }),
  ],
};
