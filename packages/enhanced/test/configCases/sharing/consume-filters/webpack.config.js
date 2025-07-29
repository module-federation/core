const { ConsumeSharedPlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        // Version filtering tests
        'version-include': {
          shareKey: 'version-include',
          requiredVersion: '^1.2.0',
          include: {
            version: '^1.0.0',
          },
        },
        'version-exclude': {
          shareKey: 'version-exclude',
          requiredVersion: '^1.2.0',
          exclude: {
            version: '^2.0.0',
          },
        },
        'version-include-fail': {
          shareKey: 'version-include-fail',
          requiredVersion: '^1.2.0',
          include: {
            version: '^2.0.0',
          },
        },
        'version-exclude-fail': {
          shareKey: 'version-exclude-fail',
          requiredVersion: '^2.0.0',
          exclude: {
            version: '^2.0.0',
          },
        },
        // Request filtering tests
        'components/': {
          shareKey: 'components/',
          include: {
            request: /^Button/,
          },
        },
        'ui/': {
          shareKey: 'ui/',
          exclude: {
            request: 'internal',
          },
        },
        'libs/': {
          shareKey: 'libs/',
          include: {
            request: /utils/,
          },
          exclude: {
            request: /test/,
          },
        },
        // Singleton with filters
        'singleton-filter': {
          shareKey: 'singleton-filter',
          requiredVersion: '^1.0.0',
          singleton: true,
          include: {
            version: '^1.0.0',
          },
        },
      },
    }),
  ],
};
