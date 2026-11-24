const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = ['scalar', 'array', 'layered', 'consume-only'].map(
  (variant) => ({
    name: variant,
    mode: 'development',
    devtool: false,
    target: 'async-node',
    entry: variant === 'consume-only' ? './consume.js' : './index.js',
    output: { uniqueName: variant },
    experiments: { layers: true },
    externals: { './layered-container.js': 'commonjs ./layered-container.js' },
    plugins: [
      new (require('webpack').DefinePlugin)({
        VARIANT: JSON.stringify(variant),
      }),
      new ModuleFederationPlugin({
        name: variant.replace('-', '_'),
        dts: false,
        library: { type: 'commonjs-module' },
        filename: `${variant}-container.js`,
        remoteType: 'promise',
        exposes: { './widget': './provider.js' },
        remotes: {
          peer: {
            external: 'globalThis.declaredScopePeer',
            shareScope: variant === 'scalar' ? 'a' : ['a', 'b'],
          },
          unused: { external: 'undefined', shareScope: 'remote-only' },
        },
        shared: {
          ...(variant === 'layered' && {
            './extra.js': {
              shareKey: 'extraWidget',
              shareScope: 'extra',
              version: '1.0.0',
            },
          }),
          ...(variant === 'consume-only'
            ? {
                './provider.js': {
                  import: false,
                  shareKey: 'widget',
                  shareScope: 'extra',
                  layer: 'ui',
                },
              }
            : {
                './provider.js': {
                  shareKey: 'widget',
                  shareScope: 'extra',
                  version: '1.0.0',
                  ...(variant === 'layered' && { layer: 'ui' }),
                },
              }),
        },
      }),
    ],
  }),
);
