const { ProvideSharedPlugin } = require('../../../../dist/src');
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
    new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        react: {
          shareKey: 'react',
          version: '17.0.2',
          singleton: true,
        },
        'explicit-layer-react': {
          request: 'react/index2',
          shareKey: 'react',
          version: '17.0.2',
          singleton: true,
          layer: 'explicit-layer',
        },
        'differing-layer-react': {
          request: 'react',
          shareKey: 'react',
          version: '17.0.2',
          singleton: true,
          layer: 'differing-layer',
        },
        'required-layer-react': {
          request: 'react',
          shareKey: 'react',
          version: '17.0.2',
          singleton: true,
          layer: 'required-layer',
        },
        'lib-two': {
          shareKey: 'lib-two',
          request: 'lib2',
          version: '1.3.4',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          eager: false,
        },
        'lib-two-layered': {
          request: 'lib2',
          shareKey: 'lib-two',
          version: '1.3.4',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          eager: true,
          layer: 'lib-two-layer',
        },
        'lib-two-required': {
          request: 'lib2',
          shareKey: 'lib-two',
          version: '1.3.4',
          requiredVersion: '^1.0.0',
          strictVersion: true,
          eager: true,
          layer: 'lib-two-required-layer',
        },
        'multi-pkg/': {
          version: '2.0.0',
          requiredVersion: '^2.0.0',
          strictVersion: true,
          eager: true,
        },
        'multi-layered': {
          request: 'multi-pkg/',
          version: '2.0.0',
          requiredVersion: '^2.0.0',
          strictVersion: true,
          eager: true,
          layer: 'multi-pkg-layer',
        },
      },
    }),
  ],
};
