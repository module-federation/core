const path = require('node:path');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  context: __dirname,
  entry: './src/index.ts',
  target: 'async-node',
  devtool: false,
  output: {
    clean: true,
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist-node'),
    library: {
      type: 'commonjs-module',
    },
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
      name: 'rstest_remote',
      dts: false,
      filename: 'remoteEntry.js',
      library: { type: 'commonjs-module' },
      remoteType: 'commonjs-module',
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
      ],
      exposes: {
        './Button': './src/Button.tsx',
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
};
