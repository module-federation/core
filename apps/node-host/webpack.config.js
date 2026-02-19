const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'async-node',
    context: __dirname,
    cache: false,
    devtool: false,
    entry: {
      main: path.resolve(__dirname, 'src/main.js'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js',
      chunkFilename: '[id]-[contenthash].js',
      publicPath: '/testing',
      clean: true,
    },
    externalsPresets: { node: true },
    externals: [nodeExternals()],
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
    plugins: [
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
    ],
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    },
    optimization: {
      chunkIds: 'named',
      minimize: isProduction,
      runtimeChunk: false,
    },
  };
};
