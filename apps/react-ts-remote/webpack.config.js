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

  if (!parsedConfig.plugins) {
    parsedConfig.plugins = [];
  }

  parsedConfig.plugins.push(
    new FederatedTypesPlugin({
      federationConfig: {
        ...baseConfig,
        filename: 'remoteEntry.js',
      },
    })
  );

  parsedConfig.infrastructureLogging = {
    level: 'verbose',
    colors: true,
  };

  parsedConfig.devServer = {
    ...(parsedConfig.devServer || {}),
    historyApiFallback: {
      disableDotRule: true,
    },
  };

  return parsedConfig;
};
