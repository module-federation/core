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
          requiredLayer: 'explicit-layer',
        },
        'differing-layer-react': {
          import: 'react',
          shareKey: 'react',
          singleton: true,
          requireLayer: 'required-layer',
        },
        'layered-react': {
          import: 'react',
          shareKey: 'react',
          singleton: true,
          issuerLayer: 'other-layer',
        },
      },
    }),
  ],
};
