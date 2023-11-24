const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
registerPluginTSTranspiler();

const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const path = require('path');
const baseConfig = require('./module-federation.config');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
/**
 * @type {import('@nx/react/module-federation').ModuleFederationConfig}
 **/
const defaultConfig = {
  ...baseConfig,
};

module.exports = composePlugins(
  withNx(),
  withReact(),
  async (config, context) => {
    config.plugins.push(new ModuleFederationPlugin(defaultConfig));
    config.plugins.forEach((p) => {
      if (p.constructor.name === 'ModuleFederationPlugin') {
        //Temporary workaround - https://github.com/nrwl/nx/issues/16983
        p._options.library = undefined;
      }
    });

    config.devServer = {
      ...(config.devServer || {}),
      //Needs to resolve static files from the dist folder (@mf-types)
      static: path.resolve(__dirname, '../../dist/apps/runtime-demo/remote1'),
    };

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
    };

    return config;
  },
);
