const { ModuleFederationPlugin } = require('../../../../dist/src');
const react = require.resolve('./node_modules/react.js');

module.exports = {
  experiments: { layers: true },
  optimization: {
    chunkIds: 'named',
    moduleIds: 'named',
  },
  output: {
    publicPath: '/',
    chunkFilename: '[id].js',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      filename: 'container.[chunkhash:8].js',
      library: { type: 'commonjs-module' },
      exposes: {
        'expose-a': { import: './module.js', layer: 'server' },
      },
      remoteType: 'script',
      remotes: {
        remote: 'remote@http://localhost:8000/remoteEntry.js',
      },
      shared: {
        react: { layer: 'server', shareScope: ['server', 'default'] },
        'react-canary': {
          import: react,
          shareKey: 'react',
          shareScope: 'canary',
          requiredVersion: false,
        },
        'react-default': {
          import: react,
          shareKey: 'react',
          shareScope: 'default',
          requiredVersion: '1.0.0',
        },
      },
      manifest: {
        disableAssetsAnalyze: true,
      },
    }),
  ],
};
