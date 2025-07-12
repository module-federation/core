const { ConsumeSharedPlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ConsumeSharedPlugin({
      consumes: {
        // Version filtering tests
        'version-include': {
          requiredVersion: '^1.0.0',
          include: {
            version: '^1.0.0',
          },
        },
        'version-exclude': {
          requiredVersion: '^1.0.0',
          exclude: {
            version: '^2.0.0',
          },
        },
        'version-include-fail': {
          requiredVersion: '^1.0.0',
          include: {
            version: '^2.0.0',
          },
        },
        'version-exclude-fail': {
          requiredVersion: '^2.0.0',
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
          singleton: true,
          include: {
            version: '^1.0.0',
          },
        },
      },
    }),
  ],
};
