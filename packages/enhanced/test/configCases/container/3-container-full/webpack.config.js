const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      remoteType: 'commonjs-module',
      remotes: {
        containerB: '../1-container-full/container.js',
      },
      shared: ['react'],
    }),
  ],
};
