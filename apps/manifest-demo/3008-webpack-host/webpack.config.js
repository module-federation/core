const path = require('path');
const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
registerPluginTSTranspiler();
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
        'modern-js-provider': 'app1@http://localhost:4001/mf-manifest.json',
      },
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.tsx',
      },
      shared: {
        lodash: {},
        antd: {},
        react: {},
        'react/': {},
        'react-dom': {},
        'react-dom/': {},
      },
      runtimePlugins: [path.join(__dirname, './runtimePlugin.ts')],
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
  //Temporary workaround - https://github.com/nrwl/nx/issues/16983
  config.experiments = { outputModule: false };

  config.output = {
    ...config.output,
    scriptType: 'text/javascript',
  };
  config.optimization = {
    runtimeChunk: false,
    minimize: false,
  };
  config.output.publicPath = 'http://localhost:3008/';
  return config;
});
