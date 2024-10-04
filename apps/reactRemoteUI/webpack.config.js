//const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

//registerPluginTSTranspiler();
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { withModuleFederation } = require('@module-federation/storybook-addon');
const baseConfig = require('./module-federation.config');

const config = {
  ...baseConfig,
};

// Nx plugins for webpack to build config object from Nx options and context.
module.exports = composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(config, { dts: false }),
);
