const path = require('node:path');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');

module.exports = {
  mode: 'production',
  target: 'node20',
  entry: './src/index.ts',
  output: {
    clean: true,
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/rspack'),
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
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript' },
              target: 'es2022',
            },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'node20_rspack_consumer',
      filename: 'remoteEntry.js',
      exposes: {
        './Greeting': './src/exposed.ts',
      },
      dts: false,
    }),
  ],
};
