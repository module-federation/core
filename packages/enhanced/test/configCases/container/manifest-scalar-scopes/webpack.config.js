const { ModuleFederationPlugin } = require('../../../../dist/src');
const {
  normalizeWebpackPath,
} = require('@module-federation/sdk/normalize-webpack-path');
const { DefinePlugin } = require(normalizeWebpackPath('webpack'));

const cases = [undefined, 'common'].map((layer) => ({
  layer,
  prefix: layer ? 'common-' : '',
}));

module.exports = cases.map(({ layer, prefix }) => ({
  experiments: { layers: true },
  module: { rules: layer ? [{ test: /bootstrap\.js$/, layer }] : [] },
  optimization: { chunkIds: 'named', moduleIds: 'named' },
  output: {
    publicPath: '/',
    chunkFilename: `${prefix}[id].js`,
  },
  plugins: [
    new DefinePlugin({
      TEST_LAYER: layer === undefined ? 'undefined' : JSON.stringify(layer),
      TEST_PREFIX: JSON.stringify(prefix),
    }),
    new ModuleFederationPlugin({
      name: `scalar_scopes_${prefix.replace(/-/g, '_')}fixture`,
      manifest: { fileName: `${prefix}mf.json` },
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
          shareScope: 'default',
          version: '1.0.0',
          requiredVersion: '1.0.0',
          singleton: true,
        },
      },
    }),
  ],
}));
