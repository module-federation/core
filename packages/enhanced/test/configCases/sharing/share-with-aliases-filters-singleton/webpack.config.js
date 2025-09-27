const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  resolve: {
    alias: {
      'react-allowed': path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react-allowed.js',
      ),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'share-with-aliases-filters-singleton',
      experiments: { asyncStartup: false, aliasConsumption: true },
      shared: {
        // Include + singleton: expect singleton+filter warning
        'next/dist/compiled/react-allowed': {
          import: 'next/dist/compiled/react-allowed',
          requiredVersion: false,
          singleton: true,
          include: { version: '^18.0.0' },
        },
      },
    }),
  ],
};
