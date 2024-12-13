const { SharePlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        test: /different-layer\.test\.js$/,
        layer: 'different-layer',
      },
      {
        layer: 'required-layer',
        issuerLayer: 'different-layer',
        exclude: /relative2\.js$/,
        use: [
          {
            loader: path.resolve(
              __dirname,
              './loaders/different-layer-loader.js',
            ),
          },
        ],
      },
      {
        test: /relative2\.js$/,
        layer: 'explicit-layer',
        use: [
          {
            loader: path.resolve(
              __dirname,
              './loaders/explicit-layer-loader.js',
            ),
          },
        ],
      },
      {
        test: /explicit\.test\.js$/,
        layer: 'explicit-layer',
      },
    ],
  },
  plugins: [
    new SharePlugin({
      shared: {
        lib1: {
          version: '1.0.0',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          layer: 'different-layer',
        },
        'lib-two': {
          import: 'lib2',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: true,
          layer: 'explicit-layer',
        },
        lib3: {
          shareScope: 'other',
          layer: 'required-layer',
        },
        './relative1': {
          import: './relative1',
          version: false,
          layer: 'different-layer',
        },
        './relative2': {
          import: false,
          shareKey: 'store',
          version: '0',
          requiredVersion: false,
          strictVersion: true,
          layer: 'explicit-layer',
        },
        store: {
          version: '0',
          layer: 'required-layer',
        },
      },
    }),
  ],
};
