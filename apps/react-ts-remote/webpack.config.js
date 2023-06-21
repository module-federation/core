const { withModuleFederation } = require('@nrwl/react/module-federation');
const { FederatedTypesPlugin } = require('@module-federation/typescript');
const path = require('path');

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
    //Needs to resolve static files from the dist folder (@mf-types)
    static: path.resolve(__dirname, '../../dist/apps/react-ts-remote'),
  };

  //Temporary workaround - https://github.com/nrwl/nx/issues/16983
  parsedConfig.experiments = { outputModule: false };

  parsedConfig.output = {
    ...parsedConfig.output,
    scriptType: 'text/javascript',
  };

  return parsedConfig;
};
