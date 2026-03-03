const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'production',
  optimization: {
    chunkIds: 'named',
    moduleIds: 'named',
    splitChunks: {
      cacheGroups: {
        'expose-a': {
          chunks: /__federation_expose_expose_a/,
          minSize: 0,
          maxSize: 100,
          name: '__federation_expose_expose_a',
        },
      },
    },
  },
  output: {
    publicPath: '/',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'manifest_split_chunks',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      exposes: {
        './expose-a': './module.js',
      },
      manifest: true,
    }),
  ],
};
