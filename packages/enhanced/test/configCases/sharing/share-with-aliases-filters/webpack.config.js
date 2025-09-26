const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  resolve: {
    alias: {
      // Alias bare imports to compiled targets (simulating Next.js-style aliases)
      react: path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react.js',
      ),
      'react-allowed': path.resolve(
        __dirname,
        'node_modules/next/dist/compiled/react-allowed.js',
      ),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'share-with-aliases-filters',
      experiments: { asyncStartup: false, aliasConsumption: true },
      shared: {
        // Exclude 18.x: alias 'react' -> should load fallback (direct compiled stub) via import
        'next/dist/compiled/react': {
          import: 'next/dist/compiled/react',
          requiredVersion: false,
          exclude: { version: '^18.0.0' },
        },
        // Include 18.x: alias 'react-allowed' -> should be shared
        'next/dist/compiled/react-allowed': {
          import: 'next/dist/compiled/react-allowed',
          requiredVersion: false,
          include: { version: '^18.0.0' },
        },
      },
    }),
  ],
};
