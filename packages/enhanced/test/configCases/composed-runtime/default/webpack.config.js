const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  output: {
    filename: '[name].js',
    uniqueName: 'composed-runtime-default',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'composed_default',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      exposes: { './Button': './Button' },
      remotes: { self: './container.js' },
      shared: {
        'shared-lib': {
          singleton: true,
          version: '1.0.0',
          requiredVersion: '^1.0.0',
        },
      },
      experiments: { composedRuntime: true },
    }),
  ],
};
