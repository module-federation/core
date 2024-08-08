const { SharePlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  context: `${__dirname}/app1`,
  plugins: [
    new SharePlugin({
      shared: {
        lib1: '^1.0.0',
        'lib-two': {
          import: 'lib2',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: true,
        },
        lib3: {
          shareScope: 'other',
        },
        lib4: '^1.0.0',
        'lib-five': {
          import: 'lib5',
          requiredVersion: '^1.0.0',
          version: '1.3.4',
          strictVersion: true,
          eager: true,
        },
        './relative1': {
          import: './relative1',
          version: false,
        },
        './relative2': {
          import: false,
          shareKey: 'store',
          version: '0',
          requiredVersion: false,
          strictVersion: true,
        },
        store: '0',
      },
    }),
  ],
};
