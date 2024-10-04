// const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
// registerPluginTSTranspiler();

const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const path = require('path');
// const { withModuleFederation } = require('@nx/react/module-federation');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');

module.exports = composePlugins(
  withNx(),
  withReact(),
  async (config, context) => {
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    };
    config.plugins.push(
      new ModuleFederationPlugin({
        name: 'runtime_remote2',
        // library: { type: 'var', name: 'runtime_remote' },
        filename: 'remoteEntry.js',
        exposes: {
          './ButtonOldAnt': './src/components/ButtonOldAnt',
        },
        shared: {
          lodash: {
            singleton: true,
            requiredVersion: '^4.0.0',
          },
          antd: {
            singleton: true,
            requiredVersion: '^4.0.0',
          },
          react: {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react/': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-dom/': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
        },
        shareStrategy: 'loaded-first',
        dev: {
          disableLiveReload: true,
        },
      }),
    );
    if (!config.devServer) {
      config.devServer = {};
    }
    config.devServer.host = '127.0.0.1';
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
      publicPath: 'http://127.0.0.1:3007/',
      scriptType: 'text/javascript',
    };
    config.optimization = {
      ...config.optimization,
      runtimeChunk: false,
      minimize: false,
    };
    // const mf = await withModuleFederation(defaultConfig);
    return config;
  },
);
