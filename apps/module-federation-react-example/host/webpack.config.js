const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  ModuleFederationPlugin,
  ShareUsagePlugin,
} = require('@module-federation/enhanced');
const path = require('path');

module.exports = {
  entry: './src/index',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3001,
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      filename: 'remoteEntry.js',
      remotes: {
        remote: 'remote@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
    // Add ShareUsagePlugin to track usage of shared modules
    // Uncomment once the build issues are fixed
    new ShareUsagePlugin({
      outputFile: 'share-usage.json',
      includeDetails: true,
      includeUnused: true,
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
