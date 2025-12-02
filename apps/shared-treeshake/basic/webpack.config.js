const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = {
  target: 'async-node',
  entry: './index.js',
  mode: 'production',
  optimization: {
    minimize: true,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  output: {
    publicPath: '/',
    chunkFilename: '[id].js',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'treeshake_share',
      manifest: true,
      library: { type: 'commonjs-module' },
      exposes: {
        './App': './App.js',
      },
      // shared: {
      //   'ui-lib': {
      //     requiredVersion: '*',
      //     treeshake: true,
      //   },
      //   'ui-lib-dynamic-specific-export': {
      //     requiredVersion: '*',
      //     treeshake: true,
      //   },
      //   'ui-lib-dynamic-default-export': {
      //     requiredVersion: '*',
      //     treeshake: true,
      //   },
      //   'ui-lib-side-effect': {
      //     requiredVersion: '*',
      //     treeshake: true,
      //   },
      // },
    }),
  ],
};
