const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = {
  context: __dirname,
  mode: process.env.NODE_ENV || 'development',
  devtool: false,
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:3002/',
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
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
        },
      },
    },
    runtimeChunk: { name: 'runtime' },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote',
      filename: 'remoteEntry.js',
      exposes: {
        './Image': './src/components/Image.jsx',
        './Button': './src/components/Button.jsx',
        './Text': './src/components/Text.jsx',
        './SharedRedux': './src/components/SharedRedux.jsx',
        './SharedReact': './src/components/SharedReact.jsx',
        './LocalText': './src/components/LocalText.jsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18 || ^19', eager: false },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18 || ^19',
          eager: false,
        },
      },
    }),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
  devServer: {
    port: 3002,
    hot: false,
    historyApiFallback: true,
    devMiddleware: { writeToDisk: true },
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
