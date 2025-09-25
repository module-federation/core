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
      name: 'consume-with-aliases-generic',
      experiments: { asyncStartup: true, aliasConsumption: true },
      shared: {
        // Provide the aliased targets; consumer will import bare specifiers
        'next/dist/compiled/react': {
          singleton: true,
          eager: true,
          allowNodeModulesSuffixMatch: true,
        },
        'next/dist/compiled/react-dom/client': {
          singleton: true,
          eager: true,
          allowNodeModulesSuffixMatch: true,
        },
      },
    }),
  ],
};
