const { ConsumeSharedPlugin } = require('../../../../dist/src');

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
        issuerLayer: 'consume-share-layer',
        layer: 'other-layer',
        use: './uppercase-loader.js',
      },
    ],
  },
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        // react: {
        //   singleton: true,
        //   layer: 'react-layer',
        // },
        otherReact: {
          import: 'react',
          shareKey: 'react',
          singleton: true,
        },
      },
    }),
  ],
};
