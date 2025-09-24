const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/next/dist/compiled/react'),
      'react-dom/client': path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react-dom/client.js',
      ),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'consume-with-aliases-generic-provider',
      experiments: { asyncStartup: false, aliasConsumption: true },
      shared: {
        'next/dist/compiled/react': {
          singleton: true,
          eager: true,
          requiredVersion: false,
          // Provide an alternate implementation to prove share precedence
          import: path.resolve(
            __dirname,
            'node_modules/provided/react/index.js',
          ),
        },
        'next/dist/compiled/react-dom/client': {
          singleton: true,
          eager: true,
          requiredVersion: false,
          import: path.resolve(
            __dirname,
            'node_modules/provided/react-dom/client.js',
          ),
        },
      },
    }),
  ],
};
