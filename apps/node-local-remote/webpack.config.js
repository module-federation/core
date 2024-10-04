//const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

//registerPluginTSTranspiler();
const { composePlugins, withNx } = require('@nx/webpack');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  config.output.publicPath = 'auto';
  config.target = 'async-node';
  config.devtool = false;
  config.cache = false;

  if (config.devServer) {
    config.devServer.devMiddleware.writeToDisk = true;
  }

  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'node-local-remote',
      dts: false,
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
      ],
      library: { type: 'commonjs-module' },
      filename: 'remoteEntry.js',
      exposes: {
        './test': './src/expose.js',
      },
    }),
  );
  return config;
});
