const ModuleFederationPlugin =
  require('../../../../dist/src/lib/container/ModuleFederationPlugin').default;

module.exports = {
  mode: 'development',
  entry: './index.js',
  devtool: false,
  output: {
    publicPath: 'http://localhost:3000/',
  },
  optimization: {
    minimize: false,
  },
  stats: 'none',
  plugins: [
    new ModuleFederationPlugin({
      name: 'build_version_test',
      library: { type: 'commonjs-module' },
      filename: 'remoteEntry.js',
      exposes: {
        './a test module': './test.js',
        './test': './test.js',
      },
      manifest: true,
    }),
  ],
};
