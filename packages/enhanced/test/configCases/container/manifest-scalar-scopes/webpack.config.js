const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  optimization: { chunkIds: 'named', moduleIds: 'named' },
  output: { publicPath: '/', chunkFilename: '[id].js' },
  plugins: [
    new ModuleFederationPlugin({
      name: 'scalar_scopes',
      manifest: true,
      dts: false,
      shared: {
        'react-a': {
          import: './a.js',
          shareKey: 'react',
          shareScope: 'a',
          version: '1.0.0',
          requiredVersion: false,
          singleton: true,
        },
        'react-b': {
          import: './b.js',
          shareKey: 'react',
          shareScope: 'b',
          version: '1.0.0',
          requiredVersion: '1.0.0',
          singleton: true,
        },
      },
    }),
  ],
};
