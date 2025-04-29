const { SharePlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    main: {
      import: './src/index.js',
    },
  },
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        test: /tests\/different-layers\.test\.js$/,
        layer: 'differing-layer',
      },
      {
        test: /tests\/prefixed-share\.test\.js$/,
        layer: 'prefixed-layer',
      },
      {
        layer: 'multi-pkg-layer',
        issuerLayer: 'prefixed-layer',
        use: [
          {
            loader: path.resolve(
              __dirname,
              './loaders/multi-pkg-layer-loader.js',
            ),
          },
        ],
      },
      {
        layer: 'required-layer',
        issuerLayer: 'differing-layer',
        exclude: /react\/index2\.js$/,
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
        test: /react\/index2\.js$/,
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
        test: /tests\/lib-two\.test\.js$/,
        layer: 'lib-two-layer',
      },
      {
        test: /lib2\/index\.js$/,
        layer: 'lib-two-required-layer',
        issuerLayer: 'lib-two-layer',
        use: [
          {
            loader: path.resolve(
              __dirname,
              './loaders/different-layer-loader.js',
            ),
          },
        ],
      },
    ],
  },
  plugins: [
    new SharePlugin({
      shareScope: 'default',
      shared: {
        react: {
          singleton: true,
        },
        'explicit-layer-react': {
          request: 'react/index2',
          import: 'react/index2',
          shareKey: 'react',
          singleton: true,
          issuerLayer: 'differing-layer',
          layer: 'explicit-layer',
        },
        'differing-layer-react': {
          request: 'react',
          import: 'react',
          shareKey: 'react',
          singleton: true,
          issuerLayer: 'differing-layer',
          layer: 'differing-layer',
        },
        'lib-two': {
          request: 'lib-two',
          import: 'lib2',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: false,
        },
        nonsense: {
          request: 'lib-two',
          import: 'lib2',
          shareKey: 'lib-two',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: true,
          issuerLayer: 'lib-two-layer',
          layer: 'differing-layer',
        },
        'lib-two-layered': {
          import: 'lib2',
          shareKey: 'lib-two',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: true,
          issuerLayer: 'lib-two-layer',
          layer: 'differing-layer',
        },
        multi: {
          request: 'multi-pkg/',
          requiredVersion: '^2.0.0',
          version: '2.0.0',
          strictVersion: true,
          eager: true,
        },
      },
    }),
  ],
};
