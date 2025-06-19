const { composePlugins, withNx } = require('@nx/webpack');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = composePlugins(withNx(), (config) => {
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
      name: 'mcp_remote2',
      library: { type: 'commonjs-module', name: 'mcp_remote2' },
      filename: 'remoteEntry.js',
      exposes: {
        './git': './src/git-server.ts',
        './database': './src/database-server.ts',
      },
    }),
  );
  return config;
});
