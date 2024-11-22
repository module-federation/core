const { ConsumeSharedPlugin } = require('../../../../dist/src');
const WConsumeSharedPlugin = require('webpack/lib/sharing/ConsumeSharedPlugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    other: './other.js',
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
        layer: 'react-layer',
      },
      {
        test: /\.js$/,
        issuerLayer: 'react-layer',
        layer: 'other-layer',
        use: './uppercase-loader.js',
      },
    ],
  },
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        react: {
          singleton: true,
          issuerLayer: 'loader-layer',
        },
        otherReact: {
          import: 'react',
          shareKey: 'react',
          singleton: true,
        },
      },
    }),
  ],
};
