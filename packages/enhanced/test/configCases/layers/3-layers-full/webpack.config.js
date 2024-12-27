const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  entry: './index.js',
  mode: 'development',
  devtool: false,
  output: {
    filename: '[name].js',
    uniqueName: '3-layers-full',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container_a',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      exposes: {
        './ComponentA': './ComponentA',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          version: false
        }
      }
    }),
  ],
};
