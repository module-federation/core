const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path')

const common = {
  name: 'layers_container_2',
  exposes: {
    './ComponentB': './ComponentB',
    './ComponentC': './ComponentC',
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
      version: '0',
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
      }
    ],
  },
};

module.exports = [
  {
    ...commonConfig,
    output: {
      filename: '[name].js',
      uniqueName: '4-layers-full',
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'commonjs-module' },
        filename: 'container.js',
        remotes: {
          containerA: {
            external:'../3-layers-full/container.js',
            shareScope: 'layered-components',
          },
          // containerB: './container.js',
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
      uniqueName: '4-layers-full-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'module' },
        filename: 'module/container.mjs',
        remotes: {
          containerA: {
            external: '../../3-layers-full/module/container.mjs',
            shareScope: 'layered-components',
          },
          // containerB: './container.mjs',
        },
        ...common,
      }),
    ],
    target: 'node14',
  },
];
