const { ModuleFederationPlugin } = require('../../../../dist/src');
const { DefinePlugin } = require('webpack');

module.exports = [undefined, 'common'].map((layer) => ({
  experiments: { layers: true },
  module: { rules: layer ? [{ test: /bootstrap\.js$/, layer }] : [] },
  optimization: { chunkIds: 'named', moduleIds: 'named' },
  output: {
    publicPath: '/',
    chunkFilename: `${layer ? 'common-' : ''}[id].js`,
  },
  plugins: [
    new DefinePlugin({
      TEST_LAYER: layer === undefined ? 'undefined' : JSON.stringify(layer),
      TEST_PREFIX: JSON.stringify(layer ? 'common-' : ''),
    }),
    new ModuleFederationPlugin({
      name: layer ? 'scalar_scopes_common' : 'scalar_scopes',
      manifest: { fileName: `${layer ? 'common-' : ''}mf.json` },
      dts: false,
      shared: {
        'react-a': {
          import: './a.js',
          shareKey: 'react',
          ...(layer === undefined ? {} : { layer, issuerLayer: layer }),
          shareScope: 'a',
          version: '1.0.0',
          requiredVersion: false,
          singleton: true,
        },
        'react-b': {
          import: './b.js',
          shareKey: 'react',
          ...(layer === undefined ? {} : { layer, issuerLayer: layer }),
          shareScope: 'b',
          version: '1.0.0',
          requiredVersion: '1.0.0',
          singleton: true,
        },
      },
    }),
  ],
}));
