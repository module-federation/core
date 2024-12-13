const { SharePlugin } = require('../../../../dist/src');
const path = require('path');

/** @type {import("../../../../").Configuration} */
module.exports = {
  mode: 'development',
  devtool: false,
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      // Different layer rules
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
      // Explicit layer rules
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
        // Different layer shared modules
        lib1: {
          version: '1.0.0',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          layer: 'different-layer',
        },
        './relative1': {
          import: './relative1',
          version: false,
          layer: 'different-layer',
        },

        // Explicit layer shared modules
        'lib-two': {
          import: 'lib2',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: true,
          layer: 'explicit-layer',
        },
        './relative2': {
          import: false,
          shareKey: 'store',
          version: '0',
          requiredVersion: false,
          strictVersion: true,
          layer: 'explicit-layer',
        },

        // Required layer shared modules
        lib3: {
          shareScope: 'other',
          layer: 'required-layer',
        },
        store: {
          version: '0',
          layer: 'required-layer',
        },

        // Unlayered shared modules
        lib4: {
          version: '1.0.0',
          requiredVersion: '^1.0.0',
          strictVersion: true,
        },
        './relative3': {
          import: './relative3',
          version: false,
        },
      },
    }),
  ],
};
