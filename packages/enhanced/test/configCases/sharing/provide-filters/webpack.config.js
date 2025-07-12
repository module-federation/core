const { ProvideSharedPlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ProvideSharedPlugin({
      provides: {
        // Version filtering tests
        'version-include': {
          version: '1.2.0',
          include: {
            version: '^1.0.0',
          },
        },
        'version-exclude': {
          version: '1.2.0',
          exclude: {
            version: '^2.0.0',
          },
        },
        'version-include-fail': {
          version: '1.2.0',
          include: {
            version: '^2.0.0',
          },
        },
        'version-exclude-fail': {
          version: '2.0.0',
          exclude: {
            version: '^2.0.0',
          },
        },
        // Request filtering tests
        'request-filter/': {
          include: {
            request: /components/,
          },
          exclude: {
            request: /Button/,
          },
        },
        // Singleton with filters
        'singleton-filter': {
          version: '1.0.0',
          singleton: true,
          include: {
            version: '^1.0.0',
          },
        },
      },
    }),
  ],
};
