const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  ModuleFederationPlugin,
  // ShareUsagePlugin,
} = require('@module-federation/enhanced');

module.exports = {
  context: __dirname,
  mode: process.env.NODE_ENV || 'development',
  devtool: false,
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:3001/',
    clean: true,
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
  },
  resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'] },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env', '@babel/preset-react'] },
        },
      },
      { test: /\.(png|jpg|jpeg|gif|svg)$/i, type: 'asset/resource' },
    ],
  },
  optimization: { minimize: false, splitChunks: false, runtimeChunk: false },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: { remote: 'remote@http://localhost:3002/remoteEntry.js' },
      shared: {
        react: { singleton: true, requiredVersion: '^18 || ^19', eager: false },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18 || ^19',
          eager: false,
        },
      },
    }),
    // new ShareUsagePlugin({ filename: 'share-usage.json' }),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
  devServer: {
    port: 3001,
    hot: false,
    historyApiFallback: true,
    devMiddleware: { writeToDisk: true },
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
