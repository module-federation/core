const { composePlugins, withNx } = require('@nx/webpack');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  config.mode = 'development';
  config.target = 'async-node';
  config.devtool = false;
  config.cache = false;
  if (config.mode === 'development') {
    config.devServer = config.devServer || {};
    config.devServer.devMiddleware = config.devServer.devMiddleware || {};
    config.devServer.devMiddleware.writeToDisk = true;
  }

  config.plugins.push(
    new ModuleFederationPlugin({
      dts: false,
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
      ],
      name: 'mcp_remote1',
      library: { type: 'commonjs-module', name: 'mcp_remote1' },
      filename: 'remoteEntry.js',
      exposes: {
        './filesystem': './src/filesystem-server.ts',
        './tools': './src/tools-server.ts',
      },
    }),
  );
  return config;
});
