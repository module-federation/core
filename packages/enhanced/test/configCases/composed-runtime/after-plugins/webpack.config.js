const {
  ModuleFederationPlugin,
  ContainerReferencePlugin,
} = require('../../../../dist/src');

// Applies a remote the way framework plugins do: from afterPlugins, outside the MFP options.
class LateRemotesPlugin {
  apply(compiler) {
    compiler.hooks.afterPlugins.tap('LateRemotesPlugin', () => {
      new ContainerReferencePlugin({
        remoteType: 'commonjs-module',
        remotes: { self: './container.js' },
      }).apply(compiler);
    });
  }
}

module.exports = {
  output: { filename: '[name].js', uniqueName: 'composed-after-plugins' },
  plugins: [
    new LateRemotesPlugin(),
    new ModuleFederationPlugin({
      name: 'composed_after_plugins',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      exposes: { './Button': './Button' },
      experiments: { composedRuntime: true },
    }),
  ],
};
