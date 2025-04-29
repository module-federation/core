const { ConsumeSharedPlugin } = require('../../../../dist/src');
const path = require('path');

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
        test: /async-boundary\.js$/,
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
          shareKey: 'react',
        },
      },
    }),
  ],
};
