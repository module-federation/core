const {
  ConsumeSharedPlugin,
  ProvideSharedPlugin,
} = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ProvideSharedPlugin({
      provides: {
        'shared-esm-pkg': {
          shareKey: 'shared-esm-pkg',
          version: '1.0.0',
          eager: true,
        },
      },
    }),
    new ConsumeSharedPlugin({
      consumes: {
        'shared-esm-pkg': {
          shareKey: 'shared-esm-pkg',
          requiredVersion: '^1.0.0',
          strictVersion: false,
          eager: true,
        },
      },
    }),
  ],
};
