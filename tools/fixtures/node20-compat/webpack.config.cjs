const path = require('node:path');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');

module.exports = {
  mode: 'production',
  target: 'node20',
  entry: './src/index.ts',
  output: {
    clean: true,
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/webpack'),
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
              parser: { syntax: 'typescript' },
              target: 'es2022',
            },
          },
        },
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'node20_webpack_consumer',
      filename: 'remoteEntry.js',
      exposes: {
        './Greeting': './src/exposed.ts',
      },
      dts: false,
    }),
  ],
};
