const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.ts'),
  devtool: false,
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: 'http://127.0.0.1:3102/',
    module: true,
    scriptType: 'module',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
              target: 'es2021',
            },
          },
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'import_map_remote',
      filename: 'remoteEntry.js',
      library: { type: 'module' },
      exposes: {
        './hello': './src/hello.ts',
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      scriptLoading: 'module',
    }),
  ],
  optimization: {
    runtimeChunk: false,
    splitChunks: false,
  },
};
