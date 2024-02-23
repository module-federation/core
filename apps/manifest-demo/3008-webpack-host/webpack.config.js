const path = require('path');
const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
registerPluginTSTranspiler();
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'manifest_host',
      remotes: {
        remote1: 'webpack_provider@http://localhost:3009/mf-manifest.json',
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
  return config;
});
