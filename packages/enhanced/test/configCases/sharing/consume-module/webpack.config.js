// eslint-disable-next-line node/no-unpublished-require
const { ConsumeSharedPlugin } = require('../../../../');

/** @type {import("../../../../").Configuration} */
module.exports = {
  mode: 'development',
  plugins: [
    new ConsumeSharedPlugin({
      shareScope: 'test-scope',
      consumes: [
        'package',
        '@scoped/package',
        'prefix/',
        './relative1',
        './relative2',
        {
          'advanced/': {
            import: false,
            requiredVersion: '^1.2.3',
            shareScope: 'other-scope',
            strictVersion: true,
          },
        },
      ],
    }),
    new ConsumeSharedPlugin({
      consumes: {
        strict0: {
          requiredVersion: '^1.0.0',
          strictVersion: true,
        },
        strict1: {
          requiredVersion: '>=1.2.0',
          strictVersion: true,
        },
        strict2: {
          requiredVersion: '1.1.0',
          strictVersion: true,
        },
        strict3: {
          requiredVersion: '~1.0.0',
          strictVersion: true,
        },
        strict4: {
          requiredVersion: '^2.2.3',
          strictVersion: true,
        },
        strict5: {
          import: false,
          requiredVersion: 'alpha',
          strictVersion: true,
        },
        singleton: {
          requiredVersion: '1.1.0',
          singleton: true,
          strictVersion: false,
        },
        singletonWithoutVersion: {
          requiredVersion: false,
          singleton: true,
        },
      },
    }),
    new ConsumeSharedPlugin({
      shareScope: 'exclude-scope',
      consumes: [
        {
          x: {
            filter: {
              version: '2.x',
              fallbackVersion: '2.0.0',
            },
            shareScope: 'exclude-scope',
          },
        },
        {
          '@abc/y': {
            filter: {
              version: '*',
            },
            shareScope: 'exclude-scope',
          },
        },
        {
          foo: {
            filter: {
              version: '1.x',
            },
            shareScope: 'exclude-scope',
          },
        },
        {
          bar: {
            filter: {
              version: '1.x',
              fallbackVersion: '2.0.0',
            },
            shareScope: 'exclude-scope',
          },
        },
      ],
    }),
  ],
};
