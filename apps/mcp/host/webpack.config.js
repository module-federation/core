const { composePlugins, withNx } = require('@nx/webpack');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = composePlugins(withNx(), async (config) => {
  config.cache = false;
  config.devtool = false;
  config.target = 'async-node';
  config.output.publicPath = 'auto';
  config.output.chunkFilename = '[id]-[chunkhash].js';
  config.optimization.chunkIds = 'named';

  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'mcp_host',
      dts: false,
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
      ],
      experiments: {
        asyncStartup: true,
      },
      remotes: {
        mcp_remote1: 'mcp_remote1@http://localhost:3030/remoteEntry.js',
        mcp_remote2: 'mcp_remote2@http://localhost:3031/remoteEntry.js',
      },
    }),
  );
  return config;
});
