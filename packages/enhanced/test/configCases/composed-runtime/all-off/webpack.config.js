const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  output: { uniqueName: 'composed-all-off' },
  plugins: [
    new ModuleFederationPlugin({
      name: 'composed_all_off',
      experiments: {
        composedRuntime: true,
        optimization: {
          disableRemote: true,
          disableShared: true,
          disableSnapshot: true,
          target: 'web',
        },
      },
    }),
  ],
};
