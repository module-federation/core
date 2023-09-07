const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

registerPluginTSTranspiler();
const { composePlugins, withNx } = require('@nx/webpack');
const { UniversalFederationPlugin } = require('@module-federation/node');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.cache = false;
  config.devtool = false
  config.publicPath = 'auto'

  delete config.module.rules[config.module.rules.length - 1];
  config.plugins.push(
    new UniversalFederationPlugin({
      isServer: true,
      name: 'node_host',
      remotes: {
        node_remote:
          'node_remote@http://localhost:3002/remoteEntry.js',
      },
      experiments: {
      },
    })
  );
  return config;
});
