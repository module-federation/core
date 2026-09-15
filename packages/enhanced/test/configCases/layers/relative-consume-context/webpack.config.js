const { ModuleFederationPlugin } = require('../../../../dist/src');
const ConsumeSharedPlugin =
  require('../../../../dist/src/lib/sharing/ConsumeSharedPlugin').default;

module.exports = {
  output: { publicPath: '/' },
  experiments: { layers: true },
  module: { rules: [{ test: /consumer\.js$/, layer: 'server' }] },
  plugins: [
    new ModuleFederationPlugin({
      name: 'relative_context',
      filename: 'container.js',
      manifest: true,
      exposes: {
        './consumer': { import: './nested/consumer', layer: 'server' },
      },
    }),
    new ConsumeSharedPlugin({
      consumes: {
        './shared': {
          import: './shared',
          shareKey: 'relative-shared',
          requiredVersion: false,
          issuerLayer: 'server',
          layer: 'server',
        },
      },
    }),
  ],
};
