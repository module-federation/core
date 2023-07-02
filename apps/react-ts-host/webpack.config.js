const { withModuleFederation } = require('@nrwl/react/module-federation');
const { FederatedTypesPlugin } = require('@module-federation/typescript');

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

  let moduleFederationPlugin;

  parsedConfig.plugins.forEach((p) => {
    if (p.constructor.name === 'ModuleFederationPlugin') {
      p._options.library = undefined;
    }
  });

  parsedConfig.plugins.push(
    new FederatedTypesPlugin({
      federationConfig: moduleFederationPlugin._options,
    })
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
