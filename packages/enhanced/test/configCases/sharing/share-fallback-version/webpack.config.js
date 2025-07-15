const { ConsumeSharedPlugin, ProvideSharedPlugin } = require('../../../../src');

module.exports = [
  {
    name: 'consumer-with-fallback',
    entry: './consumer.js',
    output: {
      filename: 'consumer.js',
    },
    plugins: [
      new ConsumeSharedPlugin({
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            include: {
              version: '^18.0.0',
              fallbackVersion: '18.2.0', // If fallbackVersion satisfies ^18.0.0, include the module
            },
            singleton: true,
            eager: false,
          },
          vue: {
            requiredVersion: '^2.0.0',
            exclude: {
              version: '^3.0.0',
              fallbackVersion: '3.0.0', // If fallbackVersion satisfies ^3.0.0, exclude the module
            },
          },
          lodash: {
            requiredVersion: '^4.0.0',
            include: {
              version: '^5.0.0',
              fallbackVersion: '4.17.0', // fallbackVersion doesn't satisfy ^5.0.0, so exclude
            },
          },
        },
      }),
    ],
  },
  {
    name: 'provider-with-fallback',
    entry: './provider.js',
    output: {
      filename: 'provider.js',
    },
    plugins: [
      new ProvideSharedPlugin({
        provides: {
          react: {
            version: '17.0.0', // Actual version from package.json
            include: {
              version: '^18.0.0',
              fallbackVersion: '18.2.0', // fallbackVersion satisfies ^18.0.0, so include despite actual version
            },
          },
          vue: {
            version: '2.6.0', // Actual version
            exclude: {
              version: '^2.0.0',
              fallbackVersion: '2.6.0', // fallbackVersion satisfies ^2.0.0, so exclude
            },
          },
          lodash: {
            version: '4.17.21',
            include: {
              version: '^4.0.0',
              fallbackVersion: '3.0.0', // fallbackVersion doesn't satisfy ^4.0.0, so exclude
            },
          },
        },
      }),
    ],
  },
];
