const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  output: { uniqueName: 'composed-shared-only' },
  plugins: [
    new ModuleFederationPlugin({
      name: 'composed_shared_only',
      shared: {
        'shared-lib': {
          singleton: true,
          version: '1.0.0',
          requiredVersion: '^1.0.0',
        },
      },
      experiments: {
        optimization: {
          disableRemote: true,
          disableSnapshot: true,
          target: 'node',
        },
      },
    }),
  ],
};
