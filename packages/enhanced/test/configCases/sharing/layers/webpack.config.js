const { ConsumeSharedPlugin } = require('../../../../dist/src');
const WConsumeSharedPlugin = require('webpack/lib/sharing/ConsumeSharedPlugin');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    main: {
      import: './index.js',
    }
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
        test: /react\/index\.js$/,
        layer: 'react-layer',
        issuerLayer: 'entry-layer',
        use: [
          {
            loader: path.resolve(__dirname, './layer-exporter.js')
          }
        ]
      }
    ],
  },
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        react: {
          singleton: true,
        },
        'layered-react': {
          import: 'react',
          shareKey: 'react',
          singleton: true,
          issuerLayer: 'entry-layer'
        }
      },
    }),
  ],
};
