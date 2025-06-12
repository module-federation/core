const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

const common = {
  name: 'layers_fallback_test',
  shared: {
    // Unlayered lodash - should be used as fallback
    lodash: {
      import: './lodash.js',
      version: '4.17.21',
      requiredVersion: '^4.17.0',
      singleton: true,
      // No layer specified - this is the fallback
    },
    // Layer1 specific lodash
    'lodash-layer1': {
      shareKey: 'lodash',
      import: './lodash-layer1.js',
      version: '4.18.0',
      requiredVersion: '^4.17.0',
      singleton: true,
      layer: 'layer1',
    },
    // Note: No layer2 specific lodash - should fallback to unlayered
  },
};

const commonConfig = {
  entry: './index.js',
  mode: 'development',
  devtool: false,
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        test: /ComponentA\.js$/,
        layer: 'layer1',
      },
      {
        test: /ComponentB\.js$/,
        layer: 'layer2',
      },
      {
        test: /lodash\.js$/,
        issuerLayer: 'layer2',
        use: [
          {
            loader: path.resolve(__dirname, './layer2-lodash-loader.js'),
          },
        ],
      },
    ],
  },
};

module.exports = [
  {
    ...commonConfig,
    output: {
      filename: '[name].js',
      uniqueName: '9-layers-fallback',
    },
    plugins: [
      new ModuleFederationPlugin({
        ...common,
      }),
    ],
  },
];
