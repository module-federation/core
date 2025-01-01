const path = require('path');
// const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
// registerPluginTSTranspiler();
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
  config.watchOptions = {
    ignored: ['**/node_modules/**', '**/@mf-types/**'],
  };
  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'manifest_host',
      remotes: {
        remote1: 'webpack_provider@http://localhost:3009/mf-manifest.json',
        'manifest-provider':
          'rspack_manifest_provider@http://localhost:3011/mf-manifest.json',
        'js-entry-provider':
          'rspack_js_entry_provider@http://localhost:3012/remoteEntry.js',
        'modern-js-provider': 'app1@http://127.0.0.1:4001/mf-manifest.json',
      },
      filename: 'remoteEntry.js',
      shared: {
        lodash: {},
        antd: {},
        'react/': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        react: {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom/': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
      },
      dataPrefetch: true,
      // experiments: { federationRuntime: 'hoisted' },
      runtimePlugins: [path.join(__dirname, './runtimePlugin.ts')],
      experiments: {
        provideExternalRuntime: true,
        federationRuntime: 'hoisted',
      },
    }),
  );

  config.plugins.forEach((p) => {
    if (p.constructor.name === 'ModuleFederationPlugin') {
      //Temporary workaround - https://github.com/nrwl/nx/issues/16983
      p._options.library = undefined;
    }
  });
  if (config.devServer) {
    config.devServer.client.overlay = false;
  }
  config.entry = './src/index.tsx';
  //Temporary workaround - https://github.com/nrwl/nx/issues/16983
  config.experiments = { outputModule: false };

  config.output = {
    ...config.output,
    scriptType: 'text/javascript',
  };
  config.optimization = {
    ...config.optimization,
    runtimeChunk: 'single',
    minimize: false,
    moduleIds: 'named',
    chunkIds: 'named',
    splitChunks: false,
  };
  config.output.publicPath = 'http://localhost:3013/';
  return config;
});
