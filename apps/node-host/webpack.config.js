const { composePlugins, withNx } = require('@nx/webpack');
const { UniversalFederationPlugin } = require('@module-federation/node');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), async (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.cache = false;
  config.devtool = false;
  config.output.publicPath = '/testing';
  await new Promise((r) => setTimeout(r, 400));
  config.module.rules.pop();
  config.plugins.push(
    new UniversalFederationPlugin({
      isServer: true,
      name: 'node_host',
      // runtimePlugins: [require.resolve('./runtimePlugin.ts')],
      remotes: {
        node_local_remote:
          'commonjs ../../node-local-remote/dist/remoteEntry.js',
        // node_local_remote: '__webpack_require__.federation.instance.moduleCache.get("node_local_remote")',
        // node_remote:
        //   '__webpack_require__.federation.instance.moduleCache.get("node_remote")@http://localhost:3002/remoteEntry.js',
        node_remote: 'node_remote@http://localhost:3002/remoteEntry.js',
      },
    }),
  );
  return config;
});
