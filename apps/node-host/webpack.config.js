const { registerTsConfigPaths } = require('nx/src/plugins/js/utils/register');
const { workspaceRoot } = require('nx/src/utils/workspace-root');
const path = require('path');

registerTsConfigPaths(path.join(workspaceRoot, 'tsconfig.tmp.json'));

const { composePlugins, withNx } = require('@nx/webpack');
const { UniversalFederationPlugin } = require('@module-federation/node');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.cache = false;
  config.devtool = false;
  config.output.publicPath = '/testing';

  config.module.rules.pop();
  config.plugins.push(
    new UniversalFederationPlugin({
      isServer: true,
      name: 'node_host',
      remotes: {
        node_local_remote:
          'commonjs ../../node-local-remote/dist/remoteEntry.js',
        node_remote: 'node_remote@http://localhost:3002/remoteEntry.js',
      },
    }),
  );
  return config;
});
