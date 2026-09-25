const { ModuleFederationPlugin, SharePlugin } = require('../../../../dist/src');

module.exports = {
  output: { filename: '[name].js', uniqueName: 'composed-standalone-share' },
  plugins: [
    new ModuleFederationPlugin({
      name: 'composed_standalone_share',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      exposes: { './Button': './Button' },
      remotes: { self: './container.js' },
      experiments: { composedRuntime: true },
    }),
    new SharePlugin({
      shared: {
        'shared-lib': {
          singleton: true,
          version: '1.0.0',
          requiredVersion: '^1.0.0',
        },
      },
    }),
  ],
};
