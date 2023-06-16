import { ScopeType, BundlerConfigProps } from '../types/bundler-config';
import {
  DefaultContainerName,
  DefaultRemoteName,
} from '../utilities/constants';

import { container } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

/** Default react shared modules */
export const DefaultSharedModules = {
  react: {
    singleton: true,
    eager: true,
  },
  'react-dom': {
    singleton: true,
    eager: true,
  },
};

/** Default cors for local development */
export const DefaultDevCorsSettings = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
};

/** Default minimum webpack config for module federation.
    Note: All items in this object can and should be overridden when needed.
*/
const DefaultConfiguration = ({
  scope,
  scopeType,
  useTypescript,
  devPort,
}: BundlerConfigProps) => {
  return {
    entry: useTypescript ? './src/index.ts' : './src/index.js',
    output: {
      publicPath: scopeType == ScopeType.Host ? '/' : 'auto',
      chunkFilename: '[name].[contenthash:8].js',
      filename: '[name].[contenthash:8].js',
      assetModuleFilename: '[name].[contenthash:8][ext][query]',
      clean: true,
    },
    devServer: {
      port: devPort,
      open: scopeType == ScopeType.Host,
      historyApiFallback: true,
      headers: DefaultDevCorsSettings,
    },
    resolve: {
      extensions: useTypescript
        ? ['.ts', '.tsx', '.js', '.jsx']
        : ['.js', '.jsx'],
    },
    module: {
      rules: useTypescript
        ? [
            {
              test: /\.(js|jsx|tsx|ts)$/,
              loader: 'ts-loader',
              exclude: /node_modules/,
            },
            {
              test: /\.(jpg|png|jpeg|svg)/,
              type: 'asset/resource',
              exclude: /node_modules/,
            },
          ]
        : [
            {
              test: /\.(js|jsx)$/,
              loader: 'babel-loader',
              exclude: /node_modules/,
              options: { presets: ['@babel/preset-react'] },
            },
            {
              test: /\.(jpg|png|jpeg|svg)/,
              type: 'asset/resource',
              exclude: /node_modules/,
            },
          ],
    },
    plugins: [
      new container.ModuleFederationPlugin({
        name: scopeType === ScopeType.Host ? DefaultContainerName : scope,
        filename: DefaultRemoteName,
        shared: DefaultSharedModules,
        remotes: [],
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
  };
};

export default DefaultConfiguration;
