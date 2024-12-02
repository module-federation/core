const { ConsumeSharedPlugin } = require('../../../../dist/src');
const WConsumeSharedPlugin = require('webpack/lib/sharing/ConsumeSharedPlugin');
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
        test: /tests\/layer-inheritance\.test\.js$/,
        layer: 'index-layer',
      },
      {
        test: /shared\/react-boundary\.js$/,
        issuerLayer: 'index-layer',
        layer: 'entry-layer',
      },
      {
        test: /tests\/different-layers\.test\.js$/,
        layer: 'differing-layer',
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
        test: /react\/index\.js$/,
        layer: 'react-layer',
        issuerLayer: 'entry-layer',
        use: [
          {
            loader: path.resolve(__dirname, './loaders/react-layer-loader.js'),
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
    new ConsumeSharedPlugin({
      consumes: {
        react: {
          singleton: true,
        },
        'explicit-layer-react': {
          import: 'react/index2',
          shareKey: 'react',
          singleton: true,
          issuerLayer: 'differing-layer',
          layer: 'explicit-layer',
        },
        'differing-layer-react': {
          import: 'react',
          shareKey: 'react',
          singleton: true,
          issuerLayer: 'differing-layer',
          layer: 'differing-layer',
        },
        'layered-react': {
          import: 'react',
          shareKey: 'react',
          singleton: true,
          issuerLayer: 'other-layer',
        },
        'lib-two': {
          import: 'lib2',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: false,
        },
        'lib-two-layered': {
          import: 'lib2',
          shareKey: 'lib-two',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: true,
          layer: 'lib-two-required-layer',
        },
      },
    }),
  ],
};
