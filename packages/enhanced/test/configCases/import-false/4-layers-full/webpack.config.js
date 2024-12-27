const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  entry: './index.js',
  mode: 'development',
  devtool: false,
  output: {
    filename: '[name].js',
    uniqueName: '4-layers-full',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container_b',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      remotes: {
        containerA: '../3-layers-full/container.js'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          version: false,
          import:false
        }
      }
    }),
  ],
};
