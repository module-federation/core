const {
  withModuleFederation,
} = require('./src/utils/with-module-federation-enhanced-rsbuild');

module.exports = {
  rsbuildFinal: (config, options) => {
    const { remotes, shared, name, shareStrategy } = options;

    return withModuleFederation(config, {
      name,
      remotes,
      shared,
      shareStrategy,
    });
  },
};
