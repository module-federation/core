const { ConsumeSharedPlugin } = require('../../../../dist/src');
const WConsumeSharedPlugin = require('webpack/lib/sharing/ConsumeSharedPlugin');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    main: {
      import: './index.js',
    },
  },
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        test: /index-test.js$/,
        layer: 'index-layer',
      },
      {
        test: /async-boundary.js$/,
        issuerLayer: 'index-layer',
        layer: 'entry-layer',
      },
      {
        test: /differing-test.js$/,
        layer: 'differing-layer',
      },
      {
        layer: 'required-layer',
        issuerLayer: 'differing-layer',
        exclude: /react\/index2\.js$/,
        use: [
          {
            loader: path.resolve(__dirname, './differing-layer.js'),
          },
        ],
      },
      {
        test: /react\/index2\.js$/,
        layer: 'explicit-layer',
        use: [
          {
            loader: path.resolve(__dirname, './explicit-layer.js'),
          },
        ],
      },
      {
        test: /react\/index\.js$/,
        layer: 'react-layer',
        issuerLayer: 'entry-layer',
        use: [
          {
            loader: path.resolve(__dirname, './layer-exporter.js'),
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
