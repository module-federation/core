const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'container-full-consumer',
      remoteType: 'commonjs-module',
      remotes: {
        containerB: '../1-container-full/container.js',
      },
      shared: ['react'],
    }),
  ],
};
