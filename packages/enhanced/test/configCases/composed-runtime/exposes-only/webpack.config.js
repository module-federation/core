const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = [
  {
    entry: './noop.js',
    output: {
      filename: 'remote/[name].js',
      uniqueName: 'composed-exposes-only-remote',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'exposes_only_remote',
        filename: 'remote/remoteEntry.js',
        library: { type: 'commonjs-module' },
        exposes: { './Button': './Button' },
        experiments: {
          composedRuntime: true,
          optimization: { disableRemote: true, disableShared: true },
        },
      }),
    ],
  },
  {
    output: { filename: '[name].js', uniqueName: 'composed-exposes-only-host' },
    plugins: [
      new ModuleFederationPlugin({
        name: 'exposes_only_host',
        library: { type: 'commonjs-module' },
        remotes: { remote: './remote/remoteEntry.js' },
        experiments: { composedRuntime: true },
      }),
    ],
  },
];
