const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  resolve: {
    alias: {
      // Map bare 'react' import to the compiled target path
      react: path.resolve(__dirname, 'node_modules/next/dist/compiled/react'),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'share-with-aliases-provide-only',
      experiments: {
        // Force sync startup for test harness to pick up exported tests
        asyncStartup: false,
        aliasConsumption: true,
      },
      shared: {
        // Only provide the aliased target; do not share 'react' by name
        'next/dist/compiled/react': {
          singleton: true,
          requiredVersion: '^18.0.0',
          eager: true,
        },
      },
    }),
  ],
};
