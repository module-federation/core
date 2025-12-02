const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  cache: false,
  // context:
  //   '/Users/bytedance/outter/core/packages/enhanced/test/configCases/treshake-share/basic',
  // entry:
  //   '/Users/bytedance/outter/core/packages/enhanced/test/configCases/treshake-share/basic/index.js',
  // target: 'node',
  optimization: {
    minimize: true,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  output: {
    publicPath: '/',
    chunkFilename: '[id].js',
  },
  target: 'async-node',
  plugins: [
    new ModuleFederationPlugin({
      name: 'treeshake_share',
      manifest: true,
      filename: 'remoteEntry.js',
      library: {
        type: 'commonjs-module',
        name: 'treeshake_share',
      },
      runtimePlugins: [require.resolve('./runtime-plugin.js')],
      exposes: {
        './App': './App.js',
      },
      shared: {
        'ui-lib': {
          requiredVersion: '*',
          treeshake: true,
        },
        'ui-lib-dynamic-specific-export': {
          requiredVersion: '*',
          treeshake: true,
        },
        'ui-lib-dynamic-default-export': {
          requiredVersion: '*',
          treeshake: true,
        },
        'ui-lib-side-effect': {
          requiredVersion: '*',
          treeshake: true,
        },
      },
    }),
  ],
};
