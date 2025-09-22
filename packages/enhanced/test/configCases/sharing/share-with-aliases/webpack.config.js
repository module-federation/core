const { ModuleFederationPlugin } = require('../../../../dist/src');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  resolve: {
    alias: {
      // Global resolve.alias pattern (Next.js style)
      // 'react' imports are aliased to the Next.js compiled version
      react: path.resolve(__dirname, 'node_modules/next/dist/compiled/react'),
    },
  },
  module: {
    rules: [
      // Module rule-based alias pattern (like Next.js conditional layer aliases)
      // This demonstrates how aliases can be applied at the module rule level
      {
        test: /\.js$/,
        // Only apply to files in this test directory
        include: path.resolve(__dirname),
        resolve: {
          alias: {
            // Rule-specific alias for a different library
            // 'lib-b' imports are aliased to 'lib-b-vendor'
            'lib-b': path.resolve(__dirname, 'node_modules/lib-b-vendor'),
          },
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'share-with-aliases-test',
      experiments: {
        // Force sync startup for test harness to pick up exported tests
        asyncStartup: false,
        aliasConsumption: true,
      },
      shared: {
        // CRITICAL: Only share the aliased/vendor versions
        // Regular 'react' and 'lib-b' are NOT directly shared - they use aliases
        'next/dist/compiled/react': {
          singleton: true,
          requiredVersion: '^18.0.0',
          eager: true,
        },
        'lib-b-vendor': {
          singleton: true,
          requiredVersion: '^1.0.0',
          eager: true,
        },
      },
    }),
  ],
};
