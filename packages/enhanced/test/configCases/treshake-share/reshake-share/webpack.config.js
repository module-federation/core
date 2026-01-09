const { TreeshakeSharedPlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  cache: false,
  optimization: {
    // minimize: true,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  output: {
    publicPath: '/',
    chunkFilename: '[id].js',
  },
  target: 'async-node',
  plugins: [
    new TreeshakeSharedPlugin({
      reShake: true,
      mfConfig: {
        name: 'reshake_share',
        library: {
          type: 'commonjs2',
        },
        shared: {
          'ui-lib': {
            version: '1.0.0',
            treeshake: {
              strategy: 'infer',
              usedExports: ['Badge', 'MessagePro'],
            },
            requiredVersion: '^1.0.0',
          },
          'ui-lib-dep': {
            version: '1.0.0',
            treeshake: {
              strategy: 'infer',
              usedExports: ['Message'],
            },
            requiredVersion: '^1.0.0',
          },
        },
        treeshakeSharedPlugins: [path.resolve(__dirname, './CustomPlugin.js')],
      },
    }),
  ],
};
