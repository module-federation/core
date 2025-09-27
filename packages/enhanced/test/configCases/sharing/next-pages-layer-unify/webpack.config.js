const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: __dirname,
        layer: 'pages-dir-browser',
      },
    ],
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/next/dist/compiled/react'),
      'react-dom': path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react-dom',
      ),
      'react/jsx-runtime': path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react/jsx-runtime.js',
      ),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'next-pages-layer-unify',
      experiments: { asyncStartup: false, aliasConsumption: true },
      shared: {
        'next/dist/compiled/react': {
          singleton: true,
          eager: true,
          requiredVersion: false,
          allowNodeModulesSuffixMatch: true,
        },
        'next/dist/compiled/react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: false,
          allowNodeModulesSuffixMatch: true,
        },
      },
    }),
  ],
};
