const { composePlugins, withNx } = require('@nx/webpack');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), async (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.mode = 'development';
  config.cache = false;
  config.devtool = false;
  config.target = 'async-node';
  config.output.chunkFilename = '[id]-[chunkhash].js';
  config.output.libraryTarget = 'commonjs2';
  config.output.chunkLoading = 'async-node';
  config.optimization = {};
  delete config.externals;
  config.optimization.chunkIds = 'named';
  config.devServer = {
    writeToDisk: true,
  };
  await new Promise((r) => setTimeout(r, 400));
  // Remove TypeScript loader since we're using JavaScript
  config.module.rules.pop();
  // Remove ForkTsCheckerWebpackPlugin since we're not using TypeScript
  config.plugins = config.plugins.filter(
    (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin',
  );
  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'mcp_host',
      dts: false,
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
      ],
      library: { type: 'commonjs-module', name: 'mcp_host' },
      remoteType: 'node-commonjs',
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
