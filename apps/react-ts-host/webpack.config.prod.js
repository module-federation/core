const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

registerPluginTSTranspiler();
const { withModuleFederation } = require('@nx/react/module-federation');
const { FederatedTypesPlugin } = require('@module-federation/typescript');

const baseConfig = require('./module-federation.config');

/**
 * @type {import('@nx/react/module-federation').ModuleFederationConfig}
 **/
const defaultConfig = {
  ...baseConfig,
};

module.exports = async (config, context) => {
  const mf = await withModuleFederation(defaultConfig);

  /** @type {import('webpack').Configuration} */
  const parsedConfig = mf(config, context);

  const remotes = baseConfig.remotes.reduce((remotes, remote) => {
    const [name, url] = remote;
    remotes[name] = url;
    return remotes;
  }, {});

  parsedConfig.plugins.forEach((plugin) => {
    if (plugin.constructor.name === 'ModuleFederationPlugin') {
      // todo: what kinda of hack is this? :)
      plugin._options.library = undefined;
    }
  });

  parsedConfig.plugins.push(
    new FederatedTypesPlugin({
      federationConfig: {
        ...baseConfig,
        filename: 'remoteEntry.js',
        remotes,
      },
    }),
  );

  parsedConfig.infrastructureLogging = {
    level: 'verbose',
    colors: true,
  };

  //Temporary workaround - https://github.com/nrwl/nx/issues/16983
  parsedConfig.experiments = { outputModule: false };

  parsedConfig.output = {
    ...parsedConfig.output,
    scriptType: 'text/javascript',
  };

  return parsedConfig;
};
