const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

registerPluginTSTranspiler();
const { composePlugins, withNx } = require('@nx/webpack');
const {UniversalFederationPlugin} = require('@module-federation/node');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {

  // config.output.publicPath = 'auto'; // this breaks because of import.meta
  config.output.publicPath = '/'; // this works buy not correct way to do things.
  config.target = 'node';
  config.cache = false;

  config.plugins.push(new UniversalFederationPlugin({
    isServer: true,

    name: 'node_remote',
    library: {type: 'commonjs-module'},
    filename: 'remoteEntry.js',
    exposes: {
      './test': './src/expose.js',
    },
    experiments: {
      // disables / enables the remote sideloader promise template that evaluates the remote entry
      disableRemoteSideloader: true, // set to false to disable the hack i use to load remote on node. Default is false.
    }
  }));
  return config;
});
