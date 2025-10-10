const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  optimization: {
    chunkIds: 'named',
    moduleIds: 'named',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container-transitive-override-consumer',
      remoteType: 'commonjs-module',
      remotes: {
        'container-no-shared':
          '../1-transitive-overriding/container-no-shared.js',
      },
      shared: {
        './shared': {
          shareKey: 'shared',
          version: '2',
        },
      },
    }),
  ],
};
