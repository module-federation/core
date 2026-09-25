const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = [
  {
    entry: './noop.js',
    output: {
      filename: 'remote/[name].js',
      uniqueName: 'composed-remotes-only-remote',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'remotes_only_remote',
        filename: 'remote/remoteEntry.js',
        library: { type: 'commonjs-module' },
        exposes: { './Button': './Button' },
      }),
    ],
  },
  {
    output: { filename: '[name].js', uniqueName: 'composed-remotes-only-host' },
    plugins: [
      new ModuleFederationPlugin({
        name: 'remotes_only_host',
        library: { type: 'commonjs-module' },
        remotes: { remote: './remote/remoteEntry.js' },
        experiments: {
          composedRuntime: true,
          optimization: {
            disableShared: true,
            disableSnapshot: true,
            target: 'web',
          },
        },
      }),
    ],
  },
];
