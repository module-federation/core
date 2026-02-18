const { composePlugins, withNx } = require('@nx/webpack');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const path = require('path');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({ skipTypeChecking: true }),
  async (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    config.cache = false;
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    };
    config.devtool = false;
    config.target = 'async-node';
    config.entry = {
      main: path.resolve(__dirname, 'src/main.js'),
    };
    config.output = {
      ...config.output,
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js',
      publicPath: '/testing',
      chunkFilename: '[id]-[contenthash].js',
    };
    config.optimization.chunkIds = 'named';
    await new Promise((r) => setTimeout(r, 400));
    config.module.rules.pop();
    config.plugins.push(
      new ModuleFederationPlugin({
        name: 'node_host',
        dts: false,
        runtimePlugins: [
          require.resolve('@module-federation/node/runtimePlugin'),
        ],
        experiments: {
          asyncStartup: true,
        },
        remotes: {
          node_local_remote:
            'commonjs ../../node-local-remote/dist/remoteEntry.js',
          node_remote: 'node_remote@http://localhost:3022/remoteEntry.js',
        },
      }),
    );
    return config;
  },
);
