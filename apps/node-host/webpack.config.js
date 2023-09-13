const nxPlugin = require('nx/src/utils/nx-plugin.js');
const nxWebpack = require('@nx/webpack');
const moduleFederationNode = require('@module-federation/node');

nxPlugin.registerPluginTSTranspiler();

// Nx plugins for webpack.
module.exports = nxWebpack.composePlugins(nxWebpack.withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.cache = false;
  config.devtool = false;
  config.output.publicPath = '/testing';

  config.module.rules.pop();
  config.plugins.push(
    new moduleFederationNode.UniversalFederationPlugin({
      isServer: true,
      name: 'node_host',
      remotes: {
        "node_local_remote": 'node_remote@http://localhost:3002/remoteEntry.js',
        node_remote: 'commonjs ../node-remote/remoteEntry.js',
      },
      experiments: {},
    })
  );
  return config;
});
