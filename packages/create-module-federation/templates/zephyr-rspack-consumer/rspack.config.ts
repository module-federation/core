import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { withZephyr } from 'zephyr-rspack-plugin';
import moduleFederationConfig from './module-federation.config';
import { container, ProgressPlugin } from '@rspack/core';

const config = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3003,
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
    new container.ModuleFederationPlugin(moduleFederationConfig),
    new ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

export default withZephyr()(config);
