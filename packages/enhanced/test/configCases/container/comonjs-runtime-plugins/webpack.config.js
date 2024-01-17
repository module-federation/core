const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');
const common = {
  shared: {
    react: {
      version: false,
      requiredVersion: false,
    },
  },
  runtimePlugins: [path.resolve(__dirname, './runtimePlugin.js')],
};

module.exports = [
  {
    entry: './index.js',
    output: {
      filename: '[name].js',
      uniqueName: 'comonjs-runtime-plugins-consumer',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'consumer',
        library: { type: 'commonjs-module' },
        remotes: {
          containerA: {
            external: './provider/container.js',
            name: 'provider',
          },
        },
        ...common,
      }),
    ],
  },
  {
    output: {
      filename: 'provider/[name].js',
      uniqueName: 'comonjs-runtime-plugins-provider',
    },
    entry: 'data:application/node;base64,',
    plugins: [
      new ModuleFederationPlugin({
        name: 'provider',
        library: { type: 'commonjs-module' },
        filename: 'provider/container.js',
        exposes: {
          './ComponentA': {
            import: './ComponentA',
          },
        },
        ...common,
      }),
    ],
    target: 'node14',
  },
];
