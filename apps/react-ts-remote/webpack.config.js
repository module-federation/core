const { withModuleFederation } = require('@nrwl/react/module-federation');
const { FederatedTypesPlugin } = require('../../dist/packages/typescript');

const baseConfig = require('./module-federation.config');

/**
 * @type {import('@nrwl/react/module-federation').ModuleFederationConfig}
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
