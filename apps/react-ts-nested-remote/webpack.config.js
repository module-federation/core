//const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

//registerPluginTSTranspiler();
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
process.env.FEDERATION_DEBUG = true;
module.exports = composePlugins(
  withNx(),
  withReact(),
  async (config, context) => {
    if (!config.devServer) {
      config.devServer = {};
    }
    config.devServer.host = '127.0.0.1';
    config.output.publicPath = 'http://localhost:3005/';
    // prevent cyclic updates
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };
    const baseConfig = {
      name: 'react_ts_nested_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './src/app/nx-welcome.tsx',
        './utils': './src/app/utils.ts',
      },
      remotes: {
        // react_ts_remote: 'react_ts_remote@http://localhost:3004/remoteEntry.js',
        react_ts_remote:
          'react_ts_remote@http://localhost:3004/mf-manifest.json',
      },
    };

    config.plugins.push(new ModuleFederationPlugin(baseConfig));

    config.optimization.runtimeChunk = false;
    config.plugins.forEach((p) => {
      if (p.constructor.name === 'ModuleFederationPlugin') {
        //Temporary workaround - https://github.com/nrwl/nx/issues/16983
        p._options.library = undefined;
      }
    });

    //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    config.experiments = { outputModule: false };

    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    config.output = {
      ...config.output,
      scriptType: 'text/javascript',
    };
    config.optimization = {
      runtimeChunk: false,
      minimize: false,
    };
    // const mf = await withModuleFederation(defaultConfig);
    return config;
  },
);
