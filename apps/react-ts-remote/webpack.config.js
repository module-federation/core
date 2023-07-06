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

  let moduleFederationPlugin;

  const plugins = parsedConfig.plugins?.filter((p) => {
    if (p.constructor.name === 'ModuleFederationPlugin') {
      moduleFederationPlugin = p;
      return false;
    }
    return true;
  });

  parsedConfig.plugins = [
    ...(plugins || []),
    new FederatedTypesPlugin({
      federationConfig: moduleFederationPlugin._options,
    }),
  ];

  parsedConfig.infrastructureLogging = {
    level: 'verbose',
    colors: true,
  };

  return parsedConfig;
};
