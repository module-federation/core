import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration } from 'webpack';
import { container } from 'webpack';
import { withZephyr } from 'zephyr-webpack-plugin';

const { ModuleFederationPlugin } = container;

const config: Configuration = {
  entry: './src/index.ts',
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
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react', '@babel/preset-typescript'],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: '{{ mfName }}',
      filename: 'remoteEntry.js',
      remotes: {
        provider: 'provider@http://localhost:3000/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

export default withZephyr()(config);
