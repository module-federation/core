const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

registerPluginTSTranspiler();
const { withModuleFederation } = require('@nx/react/module-federation');
const { FederatedTypesPlugin } = require('@module-federation/typescript');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const baseConfig = require('./module-federation.config');

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
    config.plugins.push(
      new ModuleFederationPlugin({
        name: 'react_ts_host',
        filename: 'remoteEntry.js',
        remotes: [
          'react_ts_remote',
          'react_ts_remote@http://localhost:3004/remoteEntry.js',
        ],
      }),
    );
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

    // const mf = await withModuleFederation(defaultConfig);

    // /** @type {import('webpack').Configuration} */
    // const parsedConfig = mf(config, context);

    // const remotes = baseConfig.remotes.reduce((remotes, remote) => {
    //   const [name, url] = remote;
    //   remotes[name] = url;
    //   return remotes;
    // }, {});

    // parsedConfig.plugins.forEach((plugin) => {
    //   if (plugin.constructor.name === 'ModuleFederationPlugin') {
    //     //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    //     plugin._options.library = undefined;
    //   }
    // });

    // parsedConfig.plugins.push(
    //   new FederatedTypesPlugin({
    //     federationConfig: {
    //       ...baseConfig,
    //       filename: 'remoteEntry.js',
    //       remotes,
    //     },
    //   }),
    // );

    // parsedConfig.infrastructureLogging = {
    //   level: 'verbose',
    //   colors: true,
    // };

    // //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    // parsedConfig.experiments = { outputModule: false };

    // parsedConfig.output = {
    //   ...parsedConfig.output,
    //   scriptType: 'text/javascript',
    // };

    // return parsedConfig;
  },
);
