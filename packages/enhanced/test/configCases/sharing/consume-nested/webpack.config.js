const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ModuleFederationPlugin({
      name: 'consume-nested',
      filename: 'remoteEntry.js',
      shared: {
        'package-2': { version: '1.0.0' },
        'package-1': { version: '1.0.0' },
      },
    }),
  ],
};
