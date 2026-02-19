const path = require('node:path');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/bootstrap.tsx',
  context: __dirname,
  devtool: false,
  output: {
    clean: true,
    publicPath: 'http://127.0.0.1:3015/',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: [
          {
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
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'rstest_host',
      filename: 'remoteEntry.js',
      remotes: {
        rstest_remote: 'rstest_remote@http://127.0.0.1:3016/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
        },
        'react-dom': {
          singleton: true,
        },
      },
    }),
  ],
  devServer: {
    host: '127.0.0.1',
    port: 3015,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
