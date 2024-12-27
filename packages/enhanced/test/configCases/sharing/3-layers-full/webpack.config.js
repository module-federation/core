const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

const common = {
  name: 'layer_container',
  exposes: {
    './ComponentA': {
      import: './ComponentA',
    },
    './ComponentALayers': {
      import: './ComponentALayers',
    },
  },
  shared: {
    react: {
      version: false,
      requiredVersion: false,
      singleton: true,
    },
    'layered-react': {
      request: 'react',
      import: 'react',
      shareKey: 'react',
      version: '1.2.3',
      requiredVersion: '^1.0.0',
      singleton: true,
      layer: 'layered-components',
      issuerLayer: 'layered-components',
    },
  },
};

const commonConfig = {
  devtool: false,
  experiments: {
    layers: true,
  },
  entry: './index.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /ComponentALayers\.js$/,
        layer: 'layered-components',
      },
      {
        test: /react\.js$/,
        include: /node_modules/,
        issuerLayer: 'layered-components',
        layer: 'layered-components',
        use: [
          {
            loader: path.resolve(__dirname, './layered-react-loader.js'),
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
      uniqueName: '3-layers-full',
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'commonjs-module' },
        filename: 'container.js',
        remotes: {
          containerA: {
            external: './container.js',
          },
        },
        ...common,
      }),
    ],
  },
  {
    ...commonConfig,
    experiments: {
      ...commonConfig.experiments,
      outputModule: true,
    },
    output: {
      filename: 'module/[name].mjs',
      uniqueName: '3-layers-full-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'module' },
        filename: 'module/container.mjs',
        remotes: {
          containerA: {
            external: './container.mjs',
          },
        },
        ...common,
      }),
    ],
    target: 'node14',
  },
];
