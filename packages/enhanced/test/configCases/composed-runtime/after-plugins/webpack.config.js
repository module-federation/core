const {
  ModuleFederationPlugin,
  ContainerReferencePlugin,
} = require('../../../../dist/src');

class AfterPluginsRemotesPlugin {
  apply(compiler) {
    compiler.hooks.afterPlugins.tap('AfterPluginsRemotesPlugin', () => {
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
    new AfterPluginsRemotesPlugin(),
    new ModuleFederationPlugin({
      name: 'composed_after_plugins',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      exposes: { './Button': './Button' },
      experiments: { composedRuntime: true },
    }),
  ],
};
