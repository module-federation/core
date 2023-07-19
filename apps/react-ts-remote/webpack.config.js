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

  parsedConfig.plugins = [
    ...(parsedConfig.plugins || []),
    new FederatedTypesPlugin({
      federationConfig: defaultConfig,
    }),
  ];

  parsedConfig.infrastructureLogging = {
    level: 'verbose',
    colors: true,
  };

  return parsedConfig;
};
