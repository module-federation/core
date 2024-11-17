const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    main: {
      import: './index.js',
      layer: 'entry-layer',
    },
  },
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        issuerLayer: 'entry-layer',
        layer: 'loader-layer',
      },
      {
        test: /react/,
        issuerLayer: 'entry-layer',
        layer: 'loader-layer',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'layers_test',
      shared: {
        react: {
          singleton: true,
        },
      },
    }),
  ],
};
