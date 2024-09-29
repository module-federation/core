//const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

//registerPluginTSTranspiler();
const { composePlugins, withNx } = require('@nx/webpack');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // config.output.publicPath = '/remotetest'; // this breaks because of import.meta
  // config.output.publicPath = 'auto';
  config.target = 'async-node';
  config.devtool = false;
  config.cache = false;
  if (config.mode === 'development') {
    config.devServer.devMiddleware.writeToDisk = true;
  }

  config.plugins.push(
    new ModuleFederationPlugin({
      dts: false,
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
      ],
      name: 'node_remote',
      library: { type: 'commonjs-module', name: 'node_remote' },
      filename: 'remoteEntry.js',
      exposes: {
        './test': './src/expose.js',
      },
    }),
  );
  return config;
});
